from django.db import models
from django.db.models import Model

# Create your models here.


class ScriptsDatas(models.Model):
    index = models.IntegerField()
    text = models.CharField(max_length=200)
    start = models.DecimalField(decimal_places=3, max_digits=6)
    duration = models.DecimalField(decimal_places=3, max_digits=6)
    # 'text': 'For most of our history, the human population grew slowly,', 'start': 0.725, 'duration': 3.29

    def __str__(self):
        return self.text


class YoutubeDatas(models.Model):
    youtube_id = models.CharField(max_length=16, primary_key=True)
    scripts = models.ManyToManyField(ScriptsDatas)

    def __str__(self):
        return self.youtube_id
