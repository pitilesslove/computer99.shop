from django.urls import path, include
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^my_cake', views.home, name='my_cake'),
    url(r'^video=(?P<video_id>[0-9a-zA-Z_-]+)$',
        views.learning_page, name='learning_page'),
    url(r'^api/scripts/$',
        views.get_next_script, name='get_next_script'),
    url(r'^api/word/$', views.get_meaning_of_word, name='get_meaning_of_word'),
]
