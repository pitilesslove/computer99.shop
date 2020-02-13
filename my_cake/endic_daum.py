from urllib import request
from bs4 import BeautifulSoup


def craete_soup_with_url(url):
    handler = request.urlopen(url)
    source = handler.read().decode('utf-8')
    return BeautifulSoup(source, 'html.parser')


# http://dic.daum.net/search.do?q=hello&dic=eng
def create_soup_with_query(query):
    url = 'http://dic.daum.net/search.do?dic=eng&q=' + query
    return craete_soup_with_url(url)


def create_soup_with_wordid(wordid):
    url = 'http://dic.daum.net/word/view.do?wordid=' + wordid
    return craete_soup_with_url(url)
