"""
Custom DRF permissions for role-based access control.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUser(BasePermission):
    """Only users with role='admin' are allowed."""

    message = 'Access restricted to Admin users only.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsChefUser(BasePermission):
    """Only users with role='chef' are allowed."""

    message = 'Access restricted to Chef users only.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_chef)


class IsAdminOrChef(BasePermission):
    """Any authenticated user (admin or chef)."""

    message = 'Authentication required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdminOrReadOnly(BasePermission):
    """
    Read-only access for chefs; full access for admins.
    Useful for menu endpoints where chefs need to read but not modify.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin
