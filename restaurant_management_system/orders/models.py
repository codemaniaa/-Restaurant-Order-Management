"""
Order models: Order, OrderItem, OrderStatusHistory.
"""

from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator

from menu.models import MenuItem


class Order(models.Model):
    """
    Represents a customer order placed at the restaurant.
    """

    class Status(models.TextChoices):
        PENDING    = 'pending',    'Pending'
        CONFIRMED  = 'confirmed',  'Confirmed'
        PREPARING  = 'preparing',  'Preparing'
        READY      = 'ready',      'Ready'
        DELIVERED  = 'delivered',  'Delivered'
        CANCELLED  = 'cancelled',  'Cancelled'

    class PaymentStatus(models.TextChoices):
        UNPAID          = 'unpaid',          'Unpaid'
        PAID            = 'paid',            'Paid'
        PARTIALLY_PAID  = 'partially_paid',  'Partially Paid'

    # ── Customer info ──────────────────────────────────────────────────────────
    customer_name   = models.CharField(max_length=200)
    customer_phone  = models.CharField(max_length=20)

    # ── Order details ──────────────────────────────────────────────────────────
    notes           = models.TextField(blank=True, help_text='Special instructions or notes')
    total_price     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(
    upload_to='orders/',
    null=True,
    blank=True)       
    # ── Statuses ───────────────────────────────────────────────────────────────
    status          = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status  = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)

    # ── Staff tracking ─────────────────────────────────────────────────────────
    created_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='orders_created'
    )
    delivered_by    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='orders_delivered'
    )

    # ── Timestamps ─────────────────────────────────────────────────────────────
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)
    completed_at    = models.DateTimeField(null=True, blank=True)  # Set when status → delivered

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} — {self.customer_name} [{self.status}]'

    def recalculate_total(self):
        """Recalculates and saves the total from all order items."""
        total = sum(item.subtotal for item in self.items.all())
        self.total_price = total
        self.save(update_fields=['total_price'])


class OrderItem(models.Model):
    """
    A single line item within an order (menu item + quantity).
    """
    order       = models.ForeignKey(Order,    on_delete=models.CASCADE, related_name='items')
    menu_item   = models.ForeignKey(MenuItem, on_delete=models.PROTECT, related_name='order_items')
    quantity    = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price  = models.DecimalField(max_digits=8, decimal_places=2)   # Snapshot of price at order time
    subtotal    = models.DecimalField(max_digits=10, decimal_places=2)  # unit_price × quantity

    class Meta:
        db_table = 'order_items'

    def save(self, *args, **kwargs):
        # Always snapshot the current menu price and compute subtotal
        self.unit_price = self.menu_item.price
        self.subtotal   = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.quantity}× {self.menu_item.name} @ ${self.unit_price}'


class OrderStatusHistory(models.Model):
    """
    Immutable log of every status change on an order.
    Provides a full audit trail for the order lifecycle.
    """
    order       = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    old_status  = models.CharField(max_length=20, blank=True)
    new_status  = models.CharField(max_length=20)
    changed_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True
    )
    note        = models.CharField(max_length=500, blank=True)
    changed_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_status_history'
        ordering = ['-changed_at']

    def __str__(self):
        return f'Order #{self.order_id}: {self.old_status} → {self.new_status}'
