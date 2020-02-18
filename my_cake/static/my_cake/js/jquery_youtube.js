$.getScript("https://www.youtube.com/iframe_api", function (data, textStatus, jqxhr) {

});

(function ($) {

    $.youTubeAPI = function (element, config) {

        var $element = $(element),
            element = element;
        var plugin = this;
        var defaults = {
            video_id: config.videoId,
            ytplayer: $element.find("div"), //the player object - div is replaced with an iframe by the AP
            events: { // https://developers.google.com/youtube/iframe_api_reference#Events
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        };
        //true is used for deep recursive merge
        var config = $.extend(true, defaults, config);
        var init = function () {
            //set initial video to be defaultly the first in the array incase the hash is incorect
            var initialVideo = config.videoId;

            player = new YT.Player(config.ytplayer.attr("id"), {
                height: '400',
                width: '711',
                events: config.events,
                videoId: initialVideo,
                playerVars: { 'autoplay': 1, 'controls': 0, 'cc_lang_pref': 'ko', 'cc_load_policy': 1, 'rel': 0 },
            });
        };
        init(); //initilize
    };

    $.fn.youTubeAPI = function (config) {
        return this.each(function () {
            if (undefined == $(this).data('youTubeAPI')) {
                var plugin = new $.youTubeAPI(this, config);
                $(this).data('youTubeAPI', plugin);
            }
        });
    };

})(jQuery)