"""
Serializers for Category and MenuItem.
"""

from rest_framework import serializers
from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ['id', 'name', 'description', 'item_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()


class MenuItemSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all()
    )

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'image',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]


class MenuItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer used when embedding items in order responses."""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = MenuItem
        fields = ['id', 'name', 'category_name', 'price', 'is_available']
