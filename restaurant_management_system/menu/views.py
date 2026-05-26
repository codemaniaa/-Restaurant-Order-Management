"""
Menu CRUD views. Admin has full access; chefs have read-only access.
"""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdminOrReadOnly
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD for menu categories.

    Admin  : full CRUD
    Chef   : read-only
    """
    queryset         = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['name']
    ordering_fields  = ['name', 'created_at']


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    CRUD for menu items.

    Admin  : full CRUD + toggle availability
    Chef   : read-only
    """
    queryset = MenuItem.objects.select_related('category').all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_available']
    search_fields    = ['name', 'description', 'category__name']
    ordering_fields  = ['name', 'price', 'created_at']

    @action(detail=True, methods=['patch'], url_path='toggle-availability')
    def toggle_availability(self, request, pk=None):
        """
        PATCH /api/menu/items/<id>/toggle-availability/
        Flips the is_available flag. Admin only (enforced by IsAdminOrReadOnly).
        """
        item = self.get_object()
        item.is_available = not item.is_available
        item.save(update_fields=['is_available'])
        return Response(
            {'id': item.id, 'is_available': item.is_available},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='available')
    def available_items(self, request):
        """
        GET /api/menu/items/available/
        Returns only currently available items — useful for order creation.
        """
        items = self.queryset.filter(is_available=True)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
