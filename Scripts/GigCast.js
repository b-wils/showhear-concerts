
var lastFM_APIKey = "7921cb7aae6b8b280672b0fd74207d4b";
var songkick_APIKey = "bUMFhmMfaIpxiUgJ";

var g_startDate;
var g_endDate;

var shownArtists = 0;
var totalArtists = 0;

var headLinersOnlyEnabled;

window.onload = function () {

};

document.onclick = function () {
    // Only works once?
    //alert('anywhere click');
    //g_startDate.closeCalendar();
};


$(document).ready(function () {

    var startDateObj = new Date();
    var endDateObj = new Date();

$( "#accordion" ).accordion();

    disableHeadlinersOnly();

    endDateObj.setDate(endDateObj.getDate() + 7);


    g_startDate = new JsDatePick({
        useMode: 2,
        target: "StartDateText",
        selectedDate: {
            day: startDateObj.getDate(),
            month: startDateObj.getMonth() + 1,
            year: startDateObj.getFullYear()
        },
        weekStartDay: 0,
        //imgPath: "jsdatepick-calendar/img/",
        dateFormat: "%M-%d-%Y"
        /*
        yearsRange:[1978,2020],
        limitToToday:false,
        cellColorScheme:"beige",
        dateFormat:"%m-%d-%Y",
        
        */
    });

    g_endDate = new JsDatePick({
        useMode: 2,
        target: "EndDateText",
        selectedDate: {
            day: endDateObj.getDate(),
            month: endDateObj.getMonth() + 1,
            year: endDateObj.getFullYear()
        },
        weekStartDay: 0,
        cellColorScheme: "armygreen",
        //imgPath: "jsdatepick-calendar/img/",
        dateFormat: "%M-%d-%Y"
        /*selectedDate:{				This is an example of what the full configuration offers.
        day:5,						For full documentation about these settings please see the full version of the code.
        month:9,
        year:2006
        },
        yearsRange:[1978,2020],
        limitToToday:false,
        dateFormat:"%m-%d-%Y",
        imgPath:"img/",
        weekStartDay:1*/
    });

    // TODO we should get this moved into the date constructor
    g_startDate.setSelectedDay({
        day: startDateObj.getDate(),
        month: startDateObj.getMonth() + 1,
        year: startDateObj.getFullYear()
    });

    g_startDate.populateFieldWithSelectedDate();

    g_endDate.setSelectedDay({
        day: endDateObj.getDate(),
        month: endDateObj.getMonth() + 1,
        year: endDateObj.getFullYear()
    });

    g_endDate.populateFieldWithSelectedDate();

    getSongkickEventPage(1);
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

function updateClick() {
    $("#playlistNav").empty();
    totalArtists = 0;
    shownArtists = 0;
    document.getElementById("playlistInfo").innerHTML = "Loading...";
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

function testClick() {
    alert('test date');
    var myDate = g_startDate.getSelectedDay();
    var formatdate = myDate.day + "-date";
    alert(formatdate);
}

function getSongkickEventPage(pageNumber) {

    $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&location=clientip&page=" + pageNumber + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
    function (data) {
        var text = "Event name: ";
        //alert('get event');
        // data is JSON response object
        //alert(text + );

        if (pageNumber == 1 && data.resultsPage.totalEntries > 50) {
            // We have more results to query
            // TODO this does not preserve page ordering, do we need it?
            var totalPages = data.resultsPage.totalEntries / data.resultsPage.perPage;

            if ((data.resultsPage.totalEntries % data.resultsPage.perPage) > 0) {
                totalPages++;
            }

            for (var i = 2; i <= totalPages; i++) {
                getSongkickEventPage(i);
            }
        }

        var playlistNav = document.getElementById("playlistNav");

        for (var i = 0; i < data.resultsPage.results.event.length; i++) {

            checkAndAddEvent(data.resultsPage.results.event[i]);

        }

        document.getElementById("playlistInfo").innerHTML = "Showing " + shownArtists + " of " + totalArtists + " artists";
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
    var myDate = g_startDate.getSelectedDay();
    var formatdate = myDate.year + "-" + zeroFill(myDate.month, 2) + "-" + zeroFill(myDate.day, 2);
    return formatdate;

}

function getMaxDate() {
    var myDate = g_endDate.getSelectedDay();
    var formatdate = myDate.year + "-" + zeroFill(myDate.month, 2) + "-" + zeroFill(myDate.day, 2);
    return formatdate;
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    document.getElementById("blah").innerHTML = event.data;
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

function nextVideo() {
    var playlist = document.getElementById("playlistNav");
    var index = playlist.selectedIndex;

    document.getElementById("blah").innerHTML = "ended";

    index++;

    if (index < playlist.length) {
        playlist.selectedIndex = index;
        playlistChange();
    } else {
        document.getElementById("blah").innerHTML = "playlist end index: " + index + "size: " + playlist.length;
    }


}

function playlistChange() {
    var playlist = document.getElementById("playlistNav");
    document.getElementById("blah").innerHTML = "change!sdfa";
    document.getElementById("blah").innerHTML = playlist.options[playlist.selectedIndex].value;

    var artistName = playlist.options[playlist.selectedIndex].value;

    $.getJSON("https://gdata.youtube.com/feeds/api/videos?q=" + artistName + "&category=Music&alt=json",
    function (data) {

        if (data.feed.entry) {

            for (var i = 0; i < data.feed.entry[0].media$group.media$content.length; i++) {
                if (data.feed.entry[0].media$group.media$content[i].yt$format == 5) {
                    var videoUrl = data.feed.entry[0].media$group.media$content[i].url;
                    document.getElementById("blah").innerHTML = videoUrl;
                    player.loadVideoByUrl(videoUrl, 0, 'small');
                    break;
                }
            }
        } else {
            document.getElementById("blah").innerHTML = "Could not find youtube for: " + playlist.options[playlist.selectedIndex].value;
        }
    });

    populateArtistInfo(artistName);
    populateLastFMInfo(artistName);
}

function populateArtistInfo(artistName) {
    $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&location=clientip&artist_name=" + artistName + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
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
    $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
    function (data) {
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
                $("#lastFMInfo").html("i can has tags?");
                for (var i = 0; i < data.artist.tags.tag.length; i++) {
                    text += ",&nbsp" + data.artist.tags.tag[i].name;
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