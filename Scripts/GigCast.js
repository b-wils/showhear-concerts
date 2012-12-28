  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-36985604-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();


var lastFM_APIKey = "7921cb7aae6b8b280672b0fd74207d4b";
var songkick_APIKey = "bUMFhmMfaIpxiUgJ";

var g_startDate;
var g_endDate;

var shownArtists = 0;
var totalArtists = 0;

var headLinersOnlyEnabled;

var eventIndex = 0;
var artistIndex = 0;

window.onload = function () {

};

document.onclick = function () {
    // Only works once?
    //alert('anywhere click');
    //g_startDate.closeCalendar();
};


$(document).ready(function () {

//    alert(#{myVar});

    var startDateObj = new Date();
    var endDateObj = new Date();

    // $( "#datepicker" ).datepicker({
    //     showOtherMonths: true,
    //     selectOtherMonths: true
    // });

    $( "#from" ).datepicker({
        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "M-dd-yy",
        onClose: function( selectedDate ) {
            $( "#to" ).datepicker( "option", "minDate", selectedDate );
        }
    });
    $( "#from" ).datepicker( "setDate", "now" );

    $( "#to" ).datepicker({
        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "M-dd-yy",
        onClose: function( selectedDate ) {
            $( "#to" ).datepicker( "option", "minDate", selectedDate );
        }
    });
    $( "#to" ).datepicker( "setDate", "+1w" );

    // alert("date: " +  $( "#from" ).datepicker( "getDate" ).getDate());

    // alert("date: " +  $.datepicker.formatDate("yy-mm-dd", $( "#to" ).datepicker( "getDate" )));

    $( "#dialog" ).dialog({
        autoOpen: false,
        // show: "blind",
        // hide: "explode",
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        position: { my: "right top", at: "right bottom", of:"#locationChange" },
        buttons: [ { text: "Search", click: function() { updateLocation(); } } ]
    });

    $( "#locationChange" ).click(function() {
        $( "#dialog" ).dialog( "open" );
        return false;
    });

    $("#updLocationTxt").keyup(function(event){
        if(event.keyCode == 13){
            updateLocation();
        }
    });

    $( "#genreFilterDialog" ).dialog({
        autoOpen: false,
        // show: "blind",
        // hide: "explode",
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        position: { my: "right top", at: "right bottom", of:"#genreFilter" },
        buttons: [ { text: "Filter", click: function() { updateGenreFilter(); } } ]
    });

    $( "#genreFilter" ).click(function() {
        $( "#genreFilterDialog" ).dialog( "open" );
        return false;
    });

    $("#updateGenreText").keyup(function(event){
        if(event.keyCode == 13){
            updateGenreFilter();
        }
    });

    populateLocation();
    getSongkickEventPage(1);

    if ($.cookie('genreFilter')) {
        $("#genreFilter").html($.cookie('genreFilter'));
    }

});
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });


}

function updateGenreFilter() {
    // alert("cached? " + lfm_artistCache["STATUETTE"].artist.name)
    // alert("cached? " + lfm_artistCache["STATUETTE"])
    $("#genreFilter").html($("#updateGenreText").val());
    $.cookie('genreFilter', $("#updateGenreText").val());
    $( "#genreFilterDialog" ).dialog( "close" );
}

function updateLocation() {

    // alert($("#updLocationTxt").val());

    if ($("#updLocationTxt").val()) {

        $.getJSON("http://api.songkick.com/api/3.0/search/locations.json?query="+$("#updLocationTxt").val() +"&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
        function (data) {

            if (data.resultsPage.totalEntries > 0) {
                // TODO if there are multiple results, we can try to cross reference with clientid to get the closest one
                $("#locationText").html(data.resultsPage.results.location[0].metroArea.displayName + " Area");
                //document.cookie
                $.cookie('sk_locationid', data.resultsPage.results.location[0].metroArea.id);
                $.cookie('sk_locationName', data.resultsPage.results.location[0].metroArea.displayName);
            } else {
                alert("Could not find location")
            }
        });
    }

    $( "#dialog" ).dialog( "close" );

    // alert(getLocationQueryString());
}

function getLocationQueryString() {
    if ($.cookie('sk_locationid')) {
        return "location=sk:" + $.cookie('sk_locationid');
    } else {
        return "location=clientip";
    }
}

function populateLocation() {
    if ($.cookie('sk_locationName')) {
        $("#locationText").html($.cookie('sk_locationName') + " Area");
    } else {

        $.getJSON("http://api.songkick.com/api/3.0/search/locations.json?location=clientip&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
        function (data) {
            $("#locationText").html(data.resultsPage.results.location[0].metroArea.displayName);
            
        });
    }
}

function updateClick() {
// alert("date: " + $.datepicker.formatDate('yy', $( "#to" ).datepicker( "getDate" )));

    //$("#playlistNav").empty();
    $("#button_container").empty();
    totalArtists = 0;
    shownArtists = 0;
    artistIndex = 0;
    eventIndex = 0;
    //document.getElementById("playlistInfo").innerHTML = "Loading...";
    getSongkickEventPage(1);
}

function headlinersClick() {
    if (headLinersOnlyEnabled) {
        disableHeadlinersOnly();
    } else {
        enableHeadlinersOnly();
    }
}

function enableHeadlinersOnly() {
    headLinersOnlyEnabled = true;
    document.getElementById("headlinersButton").value = "On";
}

function disableHeadlinersOnly() {
    headLinersOnlyEnabled = false;
    document.getElementById("headlinersButton").value = "Off";
}

function divScrollTo(element)
{
    element.parentNode.scrollTop = element.offsetTop - element.parentNode.offsetTop;
}

function selectPlaying(myDiv) {
    eventIndex = $(".media_item").index(myDiv.parentNode);

    artistIndex = $(".media_item:eq(" + eventIndex +") .artist_item").index(myDiv);

    var nowPlayingDiv = $(".artist_item.playing");

    if (nowPlayingDiv) {
        nowPlayingDiv.removeClass("playing");
    }

    // TODO this assumes this icon is only used once on the page
    var nowPlayingIcon = $(".ui-icon-volume-on");
    if (nowPlayingIcon) {
        nowPlayingIcon.removeClass("ui-icon-volume-on");
        nowPlayingIcon.addClass("ui-icon-play");
    }

    divScrollTo($(".media_item").get(eventIndex));

    myDiv.className += " playing";

    // var artistName = myDiv.innerHTML;

    var newPlayingIcon = $(myDiv).children(".ui-state-default").children(".ui-icon-play");
    // alert($(myDiv).children(".ui-state-default").children(".ui-icon-play").length + " test " + $(myDiv).children(".artist_name").length);
    newPlayingIcon.addClass("ui-icon-volume-on");
    newPlayingIcon.removeClass("ui-icon-play");

    var artistName = $(myDiv).children(".artist_name").get(0).innerHTML;

    //alert(artistName);

    $.getJSON("https://gdata.youtube.com/feeds/api/videos?q=" + artistName + "&category=Music&alt=json",
    function (data) {

        if (data.feed.entry) {

            for (var i = 0; i < data.feed.entry[0].media$group.media$content.length; i++) {
                if (data.feed.entry[0].media$group.media$content[i].yt$format == 5) {
                    var videoUrl = data.feed.entry[0].media$group.media$content[i].url;
                    // document.getElementById("blah").innerHTML = videoUrl;
                    player.loadVideoByUrl(videoUrl, 0, 'small');
                    break;
                }
            }
        } else {
            // document.getElementById("blah").innerHTML = "Could not find youtube for: " + playlist.options[playlist.selectedIndex].value;
        }
    });

    populateArtistInfo(artistName);
    populateLastFMInfo(artistName);
}

function artistDivClick(myDiv) {
    //alert(artistName);
    selectPlaying(myDiv);

    //alert("parent index = " + testindex1 + " this index = " + testindex2);

    //alert(myDiv.parentNode.className);
}

var MAX_GENRE_TAGS = 2;

// cache all the lastFM genre info client side so we aren't constantly querying when updating the filters
// TODO also check this when initially populating the list

var lfm_artistGenreMap = [];
var lfm_artistCache = [];

// assumes this has already been cached
function addArtistGenre(artistName, targetElement, lastfmLink) {
    var text = "";
    var artistNode = lfm_artistCache[artistName];
    //$("#lastFMInfo").html("artist not found");

    // TODO lets query our SK database here to see if mbid mathces/mis-matches. Could use mbid to improve results

    if (artistNode.artist) {
        targetElement.innerHTML = "";

        // if (artistNode.artist.name == "STATUETTE") {
        //     alert("our artist");
        // }

        // lfm_artistCache[artistNode.artist.name] = data;

        if (artistNode.artist.tags.tag) {
            text = " (";

            var genres = [];
            // TODO we should index with original search into the query instead of result returned from last.fm
            // TODO should we just cache the entire lastfm result instead of building our own mapping?
            lfm_artistGenreMap[artistNode.artist.name] = genres;

            if (artistNode.artist.tags.tag.length) {                    

                for (var i = 0; (i < artistNode.artist.tags.tag.length); i++) {

                    if (i < MAX_GENRE_TAGS) {

                        var genreSpan = document.createElement('span');
                        genreSpan.className = "genreTag";
                        genreSpan.innerHTML = artistNode.artist.tags.tag[i].name;
                        // genreSpan.setAttribute('onclick', 'artistDivClick(this.parentNode)');
                        targetElement.appendChild(genreSpan);

                        if (i > 0) {
                            text += ",&nbsp";
                        }
                        text += artistNode.artist.tags.tag[i].name;

                    }

                    if ($.cookie('genreFilter')) {
                        if (artistNode.artist.tags.tag[i].name == $.cookie('genreFilter')) {
                            targetElement.className += " badgenre";
                        }
                    }
                }
            } else {
                text += artistNode.artist.tags.tag.name
            }
            text += ")";

            // targetElement.innerHTML = text;
        } else {
            // genreSpan.innerHTML = " (no artist tags)";
            targetElement.innerHTML = "";
        }

        lastfmLink.href = artistNode.artist.url;

    } else {
        // genreSpan.innerHTML = " (no artist info)";
        // TODO remove lastfm link
        targetElement.innerHTML = "";
    }
}

var addLastFMInfoCallbackByMBID = function(searchString, targetELement, lastfmLink) {
    return function (data) {

        if (!(data.artist)) {
            alert("songkick mbid but no lastfm?");
        }

        // alert('mbid?');

        lfm_artistCache[searchString] = data;
        addArtistGenre(searchString, targetELement, lastfmLink);
    };
};


var addLastFMInfoCallback = function(searchString, targetELement, lastfmLink) {
    return function (data) {

        lfm_artistCache[searchString] = data;
        addArtistGenre(searchString, targetELement, lastfmLink);

        if ((data.artist)) {
            // console.log("found by manual lastfm - " + data.artist.name);
            // if(data.artist.tags.tag) {
            //    console.log("found by manual lastfm with tags! " + data.artist.name); 
            // }

            // if(data.artist.mbid != "") {
            //    console.log("found by manual lastfm with tags! " + data.artist.name); 
            // }
        }
    };
};


// TODO pass in element and automagically add there instead of returning string
function addArtistDivElement(artistName) {
    var divHtml = "<div class=\"artist_item\" onclick=\"artistDivClick(this)\"><span class=\"artist_name\">" + artistName +"</span> <span class=\"artist_genre\"> (Loading Genre...)</span></div>";
    return divHtml;
}

var numGenreAdd = 0;

function addArtistDivElement2(targetNode, sk_artistNode) {
    var artistName = sk_artistNode.displayName;

    var artistNode = document.createElement('div');
    artistNode.className = "artist_item";

// <div style="display: inline-block" class="ui-state-default">
//     <span class="ui-icon ui-icon-lightbulb"></span>
// </div> 
    var statusDiv = document.createElement('div');
    statusDiv.style.cssText = "display:inline-block";
    statusDiv.className = "ui-state-default";
    statusDiv.setAttribute('onclick', 'artistDivClick(this.parentNode)');

    var statusIcon = document.createElement('span');
    statusIcon.className = "ui-icon ui-icon-play";
    // artistNameNode.innerHTML = artistName;

    statusDiv.appendChild(statusIcon);
    artistNode.appendChild(statusDiv);
  

    var artistNameNode = document.createElement('span');
    artistNameNode.className = "artist_name";
    artistNameNode.innerHTML = artistName;
    artistNameNode.setAttribute('onclick', 'artistDivClick(this.parentNode)');
    artistNode.appendChild(artistNameNode);

    // targetNode.appendChild($('<a href=' + artistName + '> <img src="/images/SK_white_pink_icon.png" height="17" width="17"/> </a>').get());
    // targetNode.appendChild($('<div></div>').get());

    var songkickLink = document.createElement('a');
    songkickLink.href = sk_artistNode.artist.uri;
    songkickLink.target = "_blank";

    var songkickIcon = document.createElement('img');
    songkickIcon.className = 'songkick_icon';
    songkickIcon.height = '17';
    songkickIcon.width = '17';
    songkickIcon.src = "/images/sk_white_pink_icon.png";
    songkickLink.appendChild(songkickIcon);
    artistNode.appendChild(songkickLink);

    var lastFMLink = document.createElement('a');
    lastFMLink.href = "dummylink";
    lastFMLink.target = "_blank";
    var lastFMIcon = document.createElement('img');
    lastFMIcon.className = 'lastfm_icon';
    lastFMIcon.src = "/images/lastfm_red_17px.png";
    lastFMLink.appendChild(lastFMIcon);
    artistNode.appendChild(lastFMLink);

    var artistGenreNode = document.createElement('span');
    artistGenreNode.className = "artist_genre";
    artistGenreNode.innerHTML = " (Loading Genre...)";

    artistNode.appendChild(artistGenreNode);

    if (lfm_artistCache[artistName]) {
        // alert(artistName + ' cached!');
        addArtistGenre(artistName, artistGenreNode, lastFMLink);
    } else {

        if (sk_artistNode.artist.identifier.length > 0) {
            $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=" + sk_artistNode.artist.identifier[0].mbid + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
                addLastFMInfoCallbackByMBID(artistName, artistGenreNode, lastFMLink)
            );
        } else {
            // TODO we can query by musicbrainz id instead of searching by artist name. this could give slightly better results but we will still
            // likely need the fallback
            $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
                addLastFMInfoCallback(artistName, artistGenreNode, lastFMLink)
            );
        }
    }

    targetNode.appendChild(artistNode);
}

function addEventDivElement(sk_eventNode, targetNode) {

    // adding elements instead of html
    if (sk_eventNode.performance.length < 1) {
        return;
    }

    if (sk_eventNode.status == "cancelled") {
        return;
    }

    var eventNode = document.createElement('div');
    eventNode.className = "media_item";

    for (var j = 0; j < sk_eventNode.performance.length; j++) {
        addArtistDivElement2(eventNode, sk_eventNode.performance[j]);
    }

    var detailsNode = document.createElement('div');
    detailsNode.innerHTML = sk_eventNode.start.date + " @ " + sk_eventNode.venue.displayName;


    var songkickLink = document.createElement('a');
    songkickLink.href = sk_eventNode.uri;
    songkickLink.target = "_blank";

    var songkickIcon = document.createElement('img');
    songkickIcon.className = 'songkick_icon';
    songkickIcon.height = '17';
    songkickIcon.width = '17';
    songkickIcon.src = "/images/sk_white_pink_icon.png";
    songkickLink.appendChild(songkickIcon);
    detailsNode.appendChild(songkickLink);

    eventNode.appendChild(detailsNode);

    // root item
    // $(".button_container").get(0).appendChild(eventNode);
    targetNode.appendChild(eventNode);
}
function testClick() {
    alert("artist is: " + $(".media_item:eq(" + eventIndex + ") .artist_item").get(artistIndex).innerHTML);
    //alert("artist is: " + $(".media_item:eq(1) .artist_item").length);

    artistIndex++;

    if (artistIndex >= $(".media_item:eq(" + eventIndex + ") .artist_item").length) {
        //alert("name over")
        artistIndex = 0;
        eventIndex ++;
    }

    selectPlaying($(".media_item:eq(" + eventIndex + ") .artist_item").get(artistIndex));
}

function getSongkickEventPage(pageNumber) {
    
    // TODO create divs for each result page so that the order is deterministic/chronological

    // $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&location=clientip&page=" + pageNumber + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
    // location hardcoded to austin 9179
    $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&"+getLocationQueryString()+"&page=" + pageNumber + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
    function (data) {
        var text = "Event name: ";
        //alert('get event');
        // data is JSON response object
        //alert(text + );

        if (data.resultsPage.totalEntries == 0) {
            alert("no data");
            return;
        }

        if (pageNumber == 1) {

            var totalPages = data.resultsPage.totalEntries / data.resultsPage.perPage;

            if ((data.resultsPage.totalEntries % data.resultsPage.perPage) > 0) {
                totalPages++;
            }

            // create a container for each page
            // result page indexes start at 1
            for (var i = 1; i <= totalPages; i++) {
                var containerNode = document.createElement('div');
                containerNode.className = "sk_page_container_" + i;

                $(".button_container").get(0).appendChild(containerNode);
            }

            if (totalPages > 1) {

                // We have more results to query
                // TODO this does not preserve page ordering, do we need it?

                for (var i = 2; i <= totalPages; i++) {
                    getSongkickEventPage(i);
                }
            }
        }

        //var playlistNav = document.getElementById("playlistNav");

        for (var i = 0; i < data.resultsPage.results.event.length; i++) {

            //checkAndAddEvent(data.resultsPage.results.event[i]);

            // $(".button_container").get(0).innerHTML += addEventDivElement(data.resultsPage.results.event[i]);
            addEventDivElement(data.resultsPage.results.event[i], $(".sk_page_container_" + pageNumber).get(0));

        }

        // document.getElementById("playlistInfo").innerHTML = "Showing " + shownArtists + " of " + totalArtists + " artists";
        //alert('end json');
    });
}

function checkAndAddEvent(eventNode) {

    if (eventNode.performance.length < 1) {
        return;
    }

    if (eventNode.status == "cancelled") {
        return;
    }

    for (var j = 0; j < eventNode.performance.length; j++) {
        checkAndAddArtist(eventNode.performance[j]);
    }
}

function checkAndAddArtist(artistNode) {
    totalArtists++;

    var playlistNav = document.getElementById("playlistNav");
    var option = document.createElement("option");

    if (artistNode.billing == "headline") {
        option.text = "*";
    } else {
        option.text = "-";
    }

    option.text += " " + artistNode.displayName;
    option.value = artistNode.displayName;
    //option.value = data.resultsPage.results.event[i].performance[j]
    try {
        // for IE earlier than version 8
        playlistNav.add(option, playlistNav.options[null]);
    }
    catch (e) {
        playlistNav.add(option, null);
    }

    shownArtists++;

}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    //event.target.playVideo();

}

function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}

function getMinDate() {
    // var myDate = g_startDate.getSelectedDay();
    // var formatdate = myDate.year + "-" + zeroFill(myDate.month, 2) + "-" + zeroFill(myDate.day, 2);

    // var myDate = $( "#from" ).datepicker( "getDate" );
    // var formatDate = $.datePicker.formatDate("yy-mm-dd", myDate);

    return $.datepicker.formatDate("yy-mm-dd", $( "#from" ).datepicker( "getDate" ));

}

function getMaxDate() {
    // var myDate = g_endDate.getSelectedDay();
    // var formatdate = myDate.year + "-" + zeroFill(myDate.month, 2) + "-" + zeroFill(myDate.day, 2);
    return $.datepicker.formatDate("yy-mm-dd", $( "#to" ).datepicker( "getDate" ));
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    // document.getElementById("blah").innerHTML = event.data;
    if (event.data == YT.PlayerState.PLAYING && !done) {
        //setTimeout(stopVideo, 6000);
        done = true;
    }

    if (event.data == YT.PlayerState.ENDED) {
        nextVideo();
    }
}

function stopVideo() {
    player.stopVideo();
}

function playVideo() {
    player.playVideo();
}

function pauseVideo() {
    player.pauseVideo();
}

function myLoadVideo(videoUrl) {
    player.loadVideoByUrl(videoUrl, 0, 'small');
}

function OnSucceeded() {
    // Dispaly "thank you."

    alert('success');

}

function OnFailed(error) {
    // Alert user to the error.
    alert('error');
}

function favorite() {
    //player.loadVideoByUrl("https://www.youtube.com/v/yOFxb0F2F2A?version=3&amp;f=videos&amp;app=youtube_gdata", 0, 'small');
    //            alert(id);

    //            alert("favorite");

    //            if (button) {
    //                alert("a button!");
    //                button.click();
    //            } else {
    //                alert("no button!");
    //                        }

    //__doPostBack("songended", "songended");
}

function nextVideoClick() {
    _gaq.push(['_trackEvent', 'Click', 'Next Video']);
    nextVideo();
}

function nextVideo() {
    // var playlist = document.getElementById("playlistNav");
    // var index = playlist.selectedIndex;

    // document.getElementById("blah").innerHTML = "ended";

    // index++;

    // if (index < playlist.length) {
    //     playlist.selectedIndex = index;
    //     playlistChange();
    // } else {
    //     document.getElementById("blah").innerHTML = "playlist end index: " + index + "size: " + playlist.length;
    // }

    //alert("artist is: " + $(".media_item:eq(" + eventIndex + ") .artist_item").get(artistIndex).innerHTML);
    //alert("artist is: " + $(".media_item:eq(1) .artist_item").length);

    artistIndex++;

    if (artistIndex >= $(".media_item:eq(" + eventIndex + ") .artist_item").length) {
        //alert("name over")
        artistIndex = 0;
        eventIndex ++;
    }

    selectPlaying($(".media_item:eq(" + eventIndex + ") .artist_item").get(artistIndex));

}

function playlistChange() {
    //var playlist = document.getElementById("playlistNav");
    // document.getElementById("blah").innerHTML = "change!sdfa";
    //document.getElementById("blah").innerHTML = playlist.options[playlist.selectedIndex].value;

    //var artistName = playlist.options[playlist.selectedIndex].value;

    $.getJSON("https://gdata.youtube.com/feeds/api/videos?q=" + artistName + "&category=Music&alt=json",
    function (data) {

        if (data.feed.entry) {

            for (var i = 0; i < data.feed.entry[0].media$group.media$content.length; i++) {
                if (data.feed.entry[0].media$group.media$content[i].yt$format == 5) {
                    var videoUrl = data.feed.entry[0].media$group.media$content[i].url;
                    // document.getElementById("blah").innerHTML = videoUrl;
                    player.loadVideoByUrl(videoUrl, 0, 'small');
                    break;
                }
            }
        } else {
            //document.getElementById("blah").innerHTML = "Could not find youtube for: " + playlist.options[playlist.selectedIndex].value;
            //alert
        }
    });

    populateArtistInfo(artistName);
    populateLastFMInfo(artistName);
}

function populateArtistInfo(artistName) {
    // location hardcoded to austin id:9179
    $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&"+getLocationQueryString()+"&artist_name=" + artistName + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
    // $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&location=sk:9179&artist_name=" + artistName + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",        
    function (data) {
        //var text = "<b>Events:</b>";
        var text = "";
        // data is JSON response object
        //alert(text + );

        for (var i = 0; i < data.resultsPage.results.event.length; i++) {
            text += "<br/>" + data.resultsPage.results.event[i].displayName + "<br/>";
            for (var j = 0; j < data.resultsPage.results.event[i].performance.length; j++) {
                var iartistName = data.resultsPage.results.event[i].performance[j].displayName

                //text += iartistName + "&nbsp;";
            }

            //text = text + data.resultsPage.results.event[i].displayName + " NEXT: ";

        }

        $("#playingInfo").html(text);

    });
}

function populateLastFMInfo(artistName) {
    $("#lastFMInfo").html("before query");
    // TODO .getJSON looks bugged in IE9
    $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
    function (data) {
        $("#lastFMInfo").html("after query");
        var text = "";
        //$("#lastFMInfo").html("artist not found");
        if (data.artist) {
            $("#lastFMInfo").html("an artist!");
            // Todo how do we get down this code path??
            text += "Artist Name: " + artistName;
            text += "<br/>Listeners: " + data.artist.stats.listeners;
            text += "<br/>Play Count: " + data.artist.stats.playcount;
            text += "<br/>Tags:"

            if (data.artist.tags.tag) {
                if (data.artist.tags.tag.length) {
                    // multiple tags
                    //text += "some tags: " + data.artist.tags.tag.length;
                    for (var i = 0; i < data.artist.tags.tag.length; i++) {
                        text += ",&nbsp" + data.artist.tags.tag[i].name;
                    }  
                } else {
                    // single tag
                    text += data.artist.tags.tag.name;
                }

            } else {
                text += "&nbspNo Tags";
            }
        } else {
            text = "Artist not found good path!";
        }

        $("#lastFMInfo").html(text);
    });
}