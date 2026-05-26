"""
Menu models: Category and MenuItem.
"""

from django.db import models
from django.core.validators import MinValueValidator


class Category(models.Model):
    """
    Groups menu items (e.g. Starters, Mains, Desserts, Drinks).
    """
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'categories'
        verbose_name    = 'Category'
        verbose_name_plural = 'Categories'
        ordering        = ['name']

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """
    A single dish or drink on the menu.
    """
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='items')
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price       = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    image       = models.ImageField(upload_to='menu_images/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'menu_items'
        ordering = ['category', 'name']

    def __str__(self):
        status = '✓' if self.is_available else '✗'
        return f'[{status}] {self.name} — ${self.price}'
