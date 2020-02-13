from youtube_transcript_api import YouTubeTranscriptApi
from my_cake.models import YoutubeDatas, ScriptsDatas
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.shortcuts import render
from my_cake.endic_daum import create_soup_with_query
import requests
import re


def home(request):

    # 그냥 간단하게 확인하기 쉽게하려고 maxResults 2로 했음
    URL = "https://www.googleapis.com/youtube/v3/search?"

    # defining a params dict for the parameters to be sent to the API
    PARAMS = {
        "q": "Kurzgesagt – In a Nutshell",
        "part": "snippet",
        "key": "AIzaSyCz7591PCd3P9fyzQ4ZXMfvkuvd8o38AfQ",
        "maxResults": "16"
    }

    # sending get request and saving the response as response object
    r = requests.get(url=URL, params=PARAMS)

    # extracting data in json format
    json_data = r.json()
    # youtube_results = json.loads(data)
    loading_data = []
    for number in range(1, 16):
        try:
            data = {}

            data['videoId'] = json_data['items'][number]['id']['videoId']
            data['title'] = json_data['items'][number]['snippet']['title']
            data['thumbnails_url'] = json_data['items'][number]['snippet']['thumbnails']['medium']['url']
            loading_data.append(data)
        except:
            continue
    stuff_for_frontend = {
        # 'contents': models.PopularThread.objects.all(),
        'contents': loading_data,
        'title': 'My Cake',
        'desc': 'leanring english using Kurzgesagt\'s videos'
    }

    return render(request, 'my_cake/home.html', stuff_for_frontend)


def learning_page(request, video_id):
    # print(selenium.__version__)
    youtube_id = video_id

    time_marks = YouTubeTranscriptApi.get_transcript(youtube_id)

    current_page_obj = None
    try:
        current_page_obj = YoutubeDatas.objects.get(pk=youtube_id)
    except YoutubeDatas.DoesNotExist:
        current_page_obj = None
        print("curr page is none")

    if current_page_obj is None:
        print("none")
        current_page_obj = YoutubeDatas(youtube_id=youtube_id)
        current_page_obj.save()
        for index, time_mark in enumerate(time_marks, start=1):
            script_data = ScriptsDatas(
                text=time_mark['text'], start=time_mark['start'], duration=time_mark['duration'], index=index)
            script_data.save()
            current_page_obj.scripts.add(script_data)
    else:
        print("not None")

    stuff_for_frontend = {
        # 'contents': models.PopularThread.objects.all(),
        'current_script_index': 1,
        'time_marks': time_marks[0],
        'length_of_scripts': len(time_marks),
        'youtube_id': youtube_id,
    }
#    print(len(time_marks))
#    print(time_marks[0]['text'])
#    print(time_marks[0]['start'])
#    print(time_marks[0]['duration'])
    return render(request, 'my_cake/learning_page.html', stuff_for_frontend)


@ensure_csrf_cookie
def get_meaning_of_word(request):

    if request.method == 'POST':
        # no need to do this
        # request_csrf_token = request.POST.get('csrfmiddlewaretoken', '')
        query = request.POST.get('query', None)
        print("this is result: ")
        soup = create_soup_with_query(query)
        refresh_meta = soup.find('meta', attrs={'property': 'og:description'})
        meaning = []
        meaning = re.split(r'\s*[0-9]\.', refresh_meta.get('content').strip())
        print(meaning)

        # posts_serialized = serializers.serialize('json', next_script)

        words_data = {
            'words': meaning,
        }
    return JsonResponse(words_data, safe=False)


@ensure_csrf_cookie
def get_next_script(request):

    if request.method == 'POST':
        # no need to do this
        # request_csrf_token = request.POST.get('csrfmiddlewaretoken', '')
        index = request.POST.get('index', None)
        youtube_id = request.POST.get('youtube_id', None)

        current_page_obj = None
        try:
            current_page_obj = YoutubeDatas.objects.get(pk=youtube_id)
        except YoutubeDatas.DoesNotExist:
            current_page_obj = None
            print("curr page is none")

        next_script = current_page_obj.scripts.get(index=int(index))
        # posts_serialized = serializers.serialize('json', next_script)
        script_data = {
            'index': next_script.index,
            'text':  next_script.text,
            'start': next_script.start,
            'duration': next_script.duration
        }
        print(script_data)
        return JsonResponse(script_data, safe=False)

    return JsonResponse(None)
