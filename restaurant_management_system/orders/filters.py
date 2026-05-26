"""
Custom filters for the Order model.
"""

import django_filters
from .models import Order


class OrderFilter(django_filters.FilterSet):
    # Date range filters
    date_from = django_filters.DateFilter(field_name='created_at__date', lookup_expr='gte')
    date_to   = django_filters.DateFilter(field_name='created_at__date', lookup_expr='lte')

    # Status filters
    status         = django_filters.ChoiceFilter(choices=Order.Status.choices)
    payment_status = django_filters.ChoiceFilter(choices=Order.PaymentStatus.choices)

    class Meta:
        model  = Order
        fields = ['status', 'payment_status', 'date_from', 'date_to']
