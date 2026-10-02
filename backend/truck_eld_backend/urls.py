"""
URL configuration for truck_eld_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse, FileResponse
from django.conf import settings

def serve_react_app(request):
    index_file = settings.BASE_DIR.parent / 'frontend' / 'dist' / 'index.html'
    if index_file.exists():
        return HttpResponse(index_file.read_text(encoding='utf-8'), content_type='text/html')
    return HttpResponse("Frontend dist not found. Please build frontend with 'npm run build'.", status=404)

def serve_react_asset(request, path):
    asset_file = settings.BASE_DIR.parent / 'frontend' / 'dist' / 'assets' / path
    if asset_file.exists():
        content_type = 'application/javascript' if path.endswith('.js') else ('text/css' if path.endswith('.css') else None)
        return FileResponse(open(asset_file, 'rb'), content_type=content_type)
    return HttpResponse("Asset not found", status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('trips.urls')),
    re_path(r'^assets/(?P<path>.*)$', serve_react_asset),
    re_path(r'^(?!api|admin).*$', serve_react_app),
]
