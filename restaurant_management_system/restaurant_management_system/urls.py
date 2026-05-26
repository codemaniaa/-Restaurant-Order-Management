"""
Root URL configuration.
All API endpoints are prefixed with /api/
"""
from django.conf import settings 
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/',       admin.site.urls),
    path('api/auth/',    include('accounts.urls')),
    path('api/menu/',    include('menu.urls')),
    path('api/orders/',  include('orders.urls')),
]
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
