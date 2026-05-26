from django.contrib import admin
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model   = OrderItem
    extra   = 0
    readonly_fields = ['unit_price', 'subtotal']


class OrderStatusHistoryInline(admin.TabularInline):
    model   = OrderStatusHistory
    extra   = 0
    readonly_fields = ['old_status', 'new_status', 'changed_by', 'note', 'changed_at']
    can_delete      = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ['id', 'customer_name', 'customer_phone', 'status', 'payment_status', 'total_price', 'created_at']
    list_filter    = ['status', 'payment_status']
    search_fields  = ['customer_name', 'customer_phone']
    readonly_fields = ['total_price', 'created_at', 'updated_at', 'completed_at', 'created_by']
    inlines        = [OrderItemInline, OrderStatusHistoryInline]
    ordering       = ['-created_at']


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display   = ['order', 'old_status', 'new_status', 'changed_by', 'changed_at']
    list_filter    = ['new_status']
    readonly_fields = ['order', 'old_status', 'new_status', 'changed_by', 'note', 'changed_at']
