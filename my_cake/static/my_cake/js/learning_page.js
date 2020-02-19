window.addEventListener('load', handleLoad);

var youtube_object = null;
var current_script = {
    index: 1,
    text: "",
    start: 0,
    duration: 0,
}
var speed_table = [0.5, 0.75, 1, 1.25, 1.5];
var current_speed_index = 2;
var loop_table = [true, false];
var current_loop_index = 0;
var current_loop_size = 0;

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
        if (loop_table[current_loop_index] == true)
            current_timeout = setTimeout(replayVideo, duration_time * (1000 / speed_table[current_speed_index]));
    } else if (event.data == YT.PlayerState.PAUSED) {
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

function setYoutubeSpeed() {
    if (++current_speed_index >= speed_table.length)
        current_speed_index = 0;
    var set_speed_value = speed_table[current_speed_index];
    player.setPlaybackRate(set_speed_value);
    $("#set_speed").text(set_speed_value + "x");
    replayVideo();
}

function setYoutubeLoop() {
    var loop_text = "";

    if (++current_loop_index >= loop_table.length)
        current_loop_index = 0;

    if (loop_table[current_loop_index] == true)
        loop_text = "Loop on";
    else
        loop_text = "Loop off";
    $("#set_loop").text(loop_text);
    replayVideo();
}

function refreshIndexInputBox() {
    if (current_loop_size == 0) {
        $("#current_script_index").val(current_script.index);
    }
    else {
        $("#current_script_index").val(current_script.index + " ~ " + (current_script.index + current_loop_size));
    }
    $("#current_script_index").css("width", ($("#current_script_index").val().length + 1) * 8) + 'px';
}

function setLoopSize(value) {

    if (current_loop_size + value < 0)
        return;

    current_loop_size += value;
    refreshIndexInputBox();
    getScripts(0);

}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function handleLoad() {
    $("#length_script").prop('disabled', true);

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
            case 38:
                setLoopSize(1)
                break;
            case 39:
                getScripts(1);
                break;
            case 40:
                setLoopSize(-1);
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

function contains(target, pattern) {
    var value = 0;
    pattern.forEach(function (word) {
        value = value + target.includes(word);
    });
    return (value === 1)
}

function getScripts(plus_minus) {

    var currentScriptIndex = document.querySelector('#current_script_index').value.split(' ')[0];
    var youtube_id = $('#videoContainer').attr('youtube_id')
    var next_index = (parseInt(currentScriptIndex) + plus_minus)
    // Do a PATCH request with the completed data.
    $.ajax({
        url: 'api/scripts/',
        method: "POST",
        data: { index: next_index, mounts_of_scripts: current_loop_size, youtube_id: youtube_id },
        dataType: 'json',
        credentials: 'same-origin',
        success: function (data) {
            //$("#current_script").text(data.text);
            current_script.index = data.index;
            current_script.start = data.start;
            current_script.text = data.text;

            console.log(data.text);
            var words = data.text.split(/[\s]+/);
            var i, word;
            $("#current_script > span").remove();
            for (i = 0; i < words.length; i++) {
                if (words[i].endsWith('.')) {
                    word = "<span class='one_word_of_scripts'>" + words[i].split('.')[0] + "</span><span>.</span>";
                }
                else if (words[i].includes(',')) {
                    word = "<span class='one_word_of_scripts'>" + words[i].split(',')[0] + "</span><span>,</span>";
                } else {
                    word = "<span class='one_word_of_scripts'>" + words[i] + "</span>";
                }

                $("#current_script").append(word + "<span class='space'> </span>");
            }
            $(".subtitle_area .one_word_of_scripts").click(function () {
                query = $(this).text();
                $("#word_you_wana_know").text(query);
                $("#meaning_word_you_wana_know").text("loading");
                getMeaningOfWord(query);
            });
            current_script.duration = data.duration;
            refreshIndexInputBox(0);
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
            var viewed_text = "";
            for (text in data.words) {
                viewed_text += data.words[text] + "<br/>";
            }
            $("#meaning_word_you_wana_know").html(viewed_text);
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
