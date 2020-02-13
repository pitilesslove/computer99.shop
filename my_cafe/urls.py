from django.urls import path, include
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^my_cafe', views.home, name='my_cafe'),
]
