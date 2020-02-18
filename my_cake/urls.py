from django.urls import path, include
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^my_cake/home', views.home, name='my_cake'),
    url(r'^my_cake/video=(?P<video_id>[0-9a-zA-Z_-]+)$',
        views.learning_page, name='learning_page'),
    url(r'^my_cake/api/scripts/$',
        views.get_next_script, name='get_next_script'),
    url(r'^my_cake/api/word/$', views.get_meaning_of_word,
        name='get_meaning_of_word'),
]
