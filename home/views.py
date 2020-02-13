from django.shortcuts import render


def main(request):
    stuff_for_frontend = {
        # 'contents': models.PopularThread.objects.all(),
        'title': 'computer99.shop',
        'desc': 'Home'
    }
    return render(request, 'home/main.html', stuff_for_frontend)
