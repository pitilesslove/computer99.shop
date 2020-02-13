window.addEventListener('load', handleLoad);

var youtube_object = null;
var current_script = {
    index: 1,
    text: "",
    start: 0,
    duration: 0,
}
var current_timeout = null;
$(document).ready(function () {
    $(".subtitle_area .one_word_of_scripts").one("mouseenter", function () {
        query = $(this).text();
        $(".subtitle_area .word_you_wana_know").text(query);
        $(this).text("loading");
        getMeaningOfWord(query);
    });
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function onYouTubeIframeAPIReady() {
    $("#yt").youTubeAPI({
        videoId: $('#videoContainer').attr('youtube_id'),
    });

};

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    youtube_object = event.target;
    youtube_object.playVideo();
    console.log(event.target)
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// time mark

// youtube playing function
function onPlayerStateChange(event) {
    duration_time = current_script.duration;
    if (event.data == YT.PlayerState.PLAYING) {
        clearTimeout(current_timeout);
        current_timeout = setTimeout(replayVideo, duration_time * 1000);
    } else if (event.data == 2) {
        clearTimeout(current_timeout);
    }
}

function seekToPlay(seek_time) {
    //youtube_object.pauseVideo();
    youtube_object.seekTo(seek_time);
    youtube_object.playVideo();

}
function replayVideo() {
    // youtube_object.pauseVideo();
    player.seekTo(current_script.start);
    player.playVideo();
}

function replay() {
    player.playVideo();
    done = true;
}

function nextPlay() {
    player.seekTo(50);
    player.playVideo();
    done = false;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function handleLoad() {
    var csrftoken = getCookie('csrftoken');

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    getScripts(0);
    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 37:
                getScripts(-1);
                break;
            case 39:
                getScripts(1);
                break;
        }
    };
    var messages = document.querySelector('.messages');

    if (messages) {
        console.log('Message will be hidden after 5 seconds.');
        setTimeout(hideMessages, 5000);
    }
}
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



function getScripts(plus_minus) {

    var currentScriptIndex = document.querySelector('#current_script_index').value.trim();
    var youtube_id = $('#videoContainer').attr('youtube_id')
    var next_index = (parseInt(currentScriptIndex) + plus_minus)
    // Do a PATCH request with the completed data.

    $.ajax({
        url: 'api/scripts/',
        method: "POST",
        data: { index: next_index, youtube_id: youtube_id },
        dataType: 'json',
        credentials: 'same-origin',
        success: function (data) {
            //$("#current_script").text(data.text);
            $("#current_script_index").val(data.index);
            console.log(data.start);
            console.log(data.duration);
            current_script.index = data.index;
            current_script.start = data.start;
            current_script.text = data.text;

            var words = data.text.split(' ');
            var i;
            $("#current_script > span").remove();
            for (i = 0; i < words.length; i++) {
                var word = "<span class='one_word_of_scripts'>" + words[i] + "</span>";
                $("#current_script").append(word + "<span class='space'> </span>");
            }
            $(".subtitle_area .one_word_of_scripts").click(function () {
                query = $(this).text();
                $(".subtitle_area .word_you_wana_know").text(query);
                $("#meaning_word_you_wana_know").text("loading");
                getMeaningOfWord(query);
            });
            current_script.duration = data.duration;
            seekToPlay(current_script.start);
        }
    });

}
function getMeaningOfWord(query) {

    console.log(query)
    // Do a PATCH request with the completed data.

    $.ajax({
        url: 'api/word/',
        method: "POST",
        data: { query: query },
        dataType: 'json',
        success: function (data) {
            $("#meaning_word_you_wana_know").text(data.words);
        }
    });

}

function hideMessages() {
    var messages = document.querySelector('.messages');
    messages.style.display = 'none';
}

function isAlreadyHidden(element) {
    return (
        element.style.display === 'none'
    );
}

function disappear(selector, duration = 1000) {
    var element = document.querySelector(selector);

    if (isAlreadyHidden(element)) {
        return;
    }

    var parts = 10;
    var changeInterval = duration / parts;
    var opacity = 1.0;

    var interval = setInterval(function () {
        opacity = opacity - (1 / parts);
        element.style.opacity = opacity;

        if (opacity === 0) {
            element.style.display = 'none';
            clearInterval(interval);
        }
    }, changeInterval);
}

function handleFormSubmit(e) {
    // Frontend Validation here.
    var titleInput = document.querySelector('#input-todo-title');
    var title = titleInput.value.trim();

    if (!title || title === '') {
        alert('Please enter the title.');
        titleInput.focus();
        e.preventDefault();
    }
}

function handleTodoCheckChange(e) {
    var checkbox = e.target;
    var checked = checkbox.checked;
    var todoId = checkbox.getAttribute('data-id');
    var body = { 'completed': checked };

    console.log('todo: ', todoId, checked);

    // Do a PATCH request with the completed data.
    console.log('Sending a PATCH request');

    checkbox.disabled = true;

    axios.patch('/api/todos/' + todoId, body)
        .then(function (response) {
            console.log('Response received', response.statusText, response.data);
            checkbox.disabled = false;

            var listItem = checkbox.closest('li.list-group-item');

            if (listItem && checked) {
                listItem.classList.add('completed')
            } else if (listItem) {
                listItem.classList.remove('completed')
            }
        })
        .catch(function () {
            checkbox.disabled = false;
        });
    e.preventDefault();
}
