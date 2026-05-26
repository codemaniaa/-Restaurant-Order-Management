from django.contrib import admin
from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'description', 'created_at']
    search_fields = ['name']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display   = ['name', 'category', 'price', 'is_available', 'created_at']
    list_filter    = ['category', 'is_available']
    search_fields  = ['name', 'description']
    list_editable  = ['is_available', 'price']
    ordering       = ['category', 'name']
