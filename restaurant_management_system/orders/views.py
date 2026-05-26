"""
Order management views for Admin and Chef roles.
"""

from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdminOrChef, IsAdminUser, IsChefUser
from .filters import OrderFilter
from .models import Order, OrderStatusHistory
from .serializers import ( OrderCreateSerializer, OrderDetailSerializer, OrderListSerializer, OrderStatusUpdateSerializer, OrderUpdateSerializer, PaymentStatusUpdateSerializer,
)
from rest_framework.parsers import MultiPartParser, FormParser

class OrderViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for orders.

    Admin  : create, read, update, delete, filter, search
    Chef   : read + status update only (enforced in get_permissions)
    """
    parser_classes = [MultiPartParser, FormParser]
    
    queryset = Order.objects.select_related(
        'created_by', 'delivered_by'
    ).prefetch_related('items__menu_item', 'status_history__changed_by').all()

    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = OrderFilter
    search_fields    = ['customer_name', 'customer_phone']
    ordering_fields  = ['created_at', 'total_price', 'status']
    ordering         = ['-created_at']

    # ── Permission routing ────────────────────────────────────────────────────

    def get_permissions(self):
        """
        Admin  : all actions
        Chef   : retrieve, list, update_status, kitchen_queue only
        """
        chef_actions = ['retrieve', 'list', 'update_status', 'kitchen_queue']
        if self.action in chef_actions:
            return [IsAdminOrChef()]
        return [IsAdminUser()]

    # ── Serializer routing ────────────────────────────────────────────────────

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer

    # ── Standard actions ──────────────────────────────────────────────────────

    def retrieve(self, request, *args, **kwargs):
        """GET /api/orders/<id>/ — Full order detail."""
        instance   = self.get_object()
        serializer = OrderDetailSerializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """DELETE /api/orders/<id>/ — Only allow cancellation, not hard delete."""
        order = self.get_object()
        if order.status in [Order.Status.DELIVERED, Order.Status.CANCELLED]:
            return Response(
                {'error': 'Cannot delete a delivered or cancelled order.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status'])
        OrderStatusHistory.objects.create(
            order=order,
            old_status=order.status,
            new_status=Order.Status.CANCELLED,
            changed_by=request.user,
            note='Order deleted/cancelled by admin',
        )
        return Response({'message': 'Order cancelled.'}, status=status.HTTP_200_OK)

    # ── Custom actions ────────────────────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        PATCH /api/orders/<id>/update-status/
        Validates the transition, updates status, logs history.
        Accessible by both Admin and Chef.
        """
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(
            data=request.data,
            context={'order': order}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        old_status = order.status
        new_status = serializer.validated_data['status']
        note       = serializer.validated_data.get('note', '')

        # If transitioning to delivered, stamp the completion time and track chef
        if new_status == Order.Status.DELIVERED:
            order.completed_at = timezone.now()
            if request.user.is_chef:
                order.delivered_by = request.user

        order.status = new_status
        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            note=note,
        )

        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['patch'], url_path='update-payment',
            permission_classes=[IsAdminUser])
    def update_payment(self, request, pk=None):
        """
        PATCH /api/orders/<id>/update-payment/
        Admin-only: update payment status.
        """
        order = self.get_object()
        serializer = PaymentStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order.payment_status = serializer.validated_data['payment_status']
        order.save(update_fields=['payment_status', 'updated_at'])
        return Response({'id': order.id, 'payment_status': order.payment_status})

    @action(detail=False, methods=['get'], url_path='kitchen-queue',
            permission_classes=[IsAdminOrChef])
    
    def kitchen_queue(self, request):
        """
        GET /api/orders/kitchen-queue/
        Returns ALL orders for kitchen view.
        """
        orders = Order.objects.select_related(
            'created_by', 'delivered_by'
        ).prefetch_related(
            'items__menu_item', 'status_history__changed_by'
        ).order_by('-created_at')   # newest first

        serializer = OrderDetailSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='delivered',
            permission_classes=[IsAdminUser])
    def delivered_orders(self, request):
        """
        GET /api/orders/delivered/
        Admin view of all completed (delivered) orders with filtering.
        """
        orders = self.filter_queryset(
            self.get_queryset().filter(status=Order.Status.DELIVERED)
        )
        page = self.paginate_queryset(orders)
        if page is not None:
            return self.get_paginated_response(OrderListSerializer(page, many=True).data)
        return Response(OrderListSerializer(orders, many=True).data)

    @action(detail=False, methods=['get'], url_path='history',
            permission_classes=[IsAdminUser])
    def order_history(self, request):
        """
        GET /api/orders/history/
        Full order history with date filtering and search.
        """
        orders = self.filter_queryset(self.get_queryset())
        page   = self.paginate_queryset(orders)
        if page is not None:
            return self.get_paginated_response(OrderListSerializer(page, many=True).data)
        return Response(OrderListSerializer(orders, many=True).data)

    @action(detail=False, methods=['get'], url_path='pending',
            permission_classes=[IsAdminOrChef])
    def pending_orders(self, request):
        """
        GET /api/orders/pending/
        All pending orders waiting to be confirmed.
        """
        orders = self.get_queryset().filter(status=Order.Status.PENDING).order_by('created_at')
        return Response(OrderListSerializer(orders, many=True).data)

    @action(detail=True, methods=['get'], url_path='status-history',
            permission_classes=[IsAdminOrChef])
    def status_history(self, request, pk=None):
        """
        GET /api/orders/<id>/status-history/
        Full audit trail of status changes for one order.
        """
        order = self.get_object()
        from .serializers import OrderStatusHistorySerializer
        history = order.status_history.all()
        return Response(OrderStatusHistorySerializer(history, many=True).data)
