"""
Serializers for orders, order items, and status history.
"""

from django.utils import timezone
from rest_framework import serializers
import json
from menu.models import MenuItem
from menu.serializers import MenuItemListSerializer
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemReadSerializer(serializers.ModelSerializer):
    """Used when reading an order — shows full item details."""
    menu_item = MenuItemListSerializer(read_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'menu_item', 'quantity', 'unit_price', 'subtotal']


class OrderItemWriteSerializer(serializers.ModelSerializer):
    """Used when creating/updating an order — accepts menu_item ID."""
    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.filter(is_available=True))

    class Meta:
        model  = OrderItem
        fields = ['menu_item', 'quantity']

    def validate_menu_item(self, value):
        if not value.is_available:
            raise serializers.ValidationError(f'"{value.name}" is currently unavailable.')
        return value


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model  = OrderStatusHistory
        fields = ['id', 'old_status', 'new_status', 'changed_by_name', 'note', 'changed_at']


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the orders list view."""
    created_by_name  = serializers.CharField(source='created_by.username', read_only=True)
    delivered_by_name = serializers.CharField(source='delivered_by.username', read_only=True)
    item_count        = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = [ 'id', 'customer_name', 'customer_phone', 'status', 'payment_status', 'total_price', 'image', 'item_count', 'created_by_name', 'delivered_by_name', 'created_at', 'completed_at',
]

    def get_item_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full order serializer with nested items and status history."""
    items        = OrderItemReadSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    created_by_name  = serializers.CharField(source='created_by.username', read_only=True)
    delivered_by_name = serializers.CharField(source='delivered_by.username', read_only=True)

    class Meta:
        model  = Order
        fields = [ 'id', 'customer_name', 'customer_phone', 'notes', 'status', 'payment_status', 'total_price', 'image', 'items', 'status_history', 'created_by_name', 'delivered_by_name', 'created_at', 'updated_at', 'completed_at',
]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new order with line items."""
    items = OrderItemWriteSerializer(many=True)
    
    class Meta:
        model  = Order
        fields = [
            'customer_name', 'customer_phone', 'notes',
            'payment_status', 'items','image'
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('An order must have at least one item.')
        return value

    def create(self, validated_data):
        items_data   = validated_data.pop('items')
        request_user = self.context['request'].user

        order = Order.objects.create(created_by=request_user, **validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        order.recalculate_total()

        # Log the initial status
        OrderStatusHistory.objects.create(
            order=order,
            old_status='',
            new_status=order.status,
            changed_by=request_user,
            note='Order created',
        )
        return order
    def to_internal_value(self, data):
        data = data.copy()

        items = data.get("items")

        if isinstance(items, str):
            try:
                data.setlist("items", json.loads(items))
            except:
                pass

        return super().to_internal_value(data)

class OrderUpdateSerializer(serializers.ModelSerializer):
    """Allows updating customer info and notes on an existing order."""

    class Meta:
        model  = Order
        fields = ['customer_name', 'customer_phone', 'notes', 'payment_status']


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Validates a status transition request."""

    # Allowed transitions map: current_status → [allowed next statuses]
    ALLOWED_TRANSITIONS = {
        'pending':   ['confirmed', 'cancelled'],
        'confirmed': ['preparing', 'cancelled'],
        'preparing': ['ready'],
        'ready':     ['delivered'],
        'delivered': [],
        'cancelled': [],
    }

    status = serializers.ChoiceField(choices=Order.Status.choices)
    note   = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        order = self.context['order']
        new_status = attrs['status']
        allowed = self.ALLOWED_TRANSITIONS.get(order.status, [])

        if new_status not in allowed:
            raise serializers.ValidationError(
                f'Cannot transition from "{order.status}" to "{new_status}". '
                f'Allowed: {allowed or "none (terminal state)"}'
            )
        return attrs


class PaymentStatusUpdateSerializer(serializers.Serializer):
    """Validates a payment status update (admin only)."""
    payment_status = serializers.ChoiceField(choices=Order.PaymentStatus.choices)
