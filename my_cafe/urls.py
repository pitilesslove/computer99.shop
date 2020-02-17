from django.urls import path, include
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^my_cafe', views.home, name='my_cafe'),
    url(r'^my_cafe/thread', views.show_popular_thread, name='show_thread'),
]
