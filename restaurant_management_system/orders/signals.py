"""
Signals for the orders app.
Keeps the Order total_price in sync whenever an OrderItem is saved or deleted.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import OrderItem


@receiver(post_save, sender=OrderItem)
def recalculate_on_save(sender, instance, **kwargs):
    """Recalculate order total whenever an item is added or updated."""
    instance.order.recalculate_total()


@receiver(post_delete, sender=OrderItem)
def recalculate_on_delete(sender, instance, **kwargs):
    """Recalculate order total whenever an item is removed."""
    instance.order.recalculate_total()
