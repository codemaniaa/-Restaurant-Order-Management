"""
Custom User model with role-based access control.
Roles: admin, chef
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager for User model."""

    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is required.')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model.
    Roles determine what each user can see and do via custom permissions.
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        CHEF  = 'chef',  'Chef'

    username   = models.CharField(max_length=150, unique=True)
    full_name  = models.CharField(max_length=255, blank=True)
    role       = models.CharField(max_length=10, choices=Role.choices, default=Role.CHEF)
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)   # Required for Django admin access
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD  = 'username'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_chef(self):
        return self.role == self.Role.CHEF
