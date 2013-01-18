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

var shownArtists = 0;
var totalArtists = 0;

var headLinersOnlyEnabled;

var eventIndex = 0;
var artistIndex = 0;

var preLoadEventSKID;

window.onload = function () {

};

// IE workaround
function JSONQuery(url, callback) {
   if ($.browser.msie && window.XDomainRequest) {

        // alert('ie');    
        // var url =  "http://gdata.youtube.com/feeds/api/videos?q=cher&category=Music&alt=json";

        // Use Microsoft XDR
        var xdr = new XDomainRequest();
        xdr.open("get", url);

    xdr.onerror = function () {
        console.log('we have an error!');
    }
    xdr.onprogress = function () {
        // console.log('this sucks!');
    };
    xdr.ontimeout = function () {
        console.log('it timed out!');
    };
    xdr.onopen = function () {
        console.log('we open the xdomainrequest');
    };
        xdr.onload = function() {
            // XDomainRequest doesn't provide responseXml, so if you need it:
            var dom = new ActiveXObject("Microsoft.XMLDOM");
            dom.async = true;
            dom.loadXML(xdr.responseText);
            // alert(xdr.responseText);

            callback(jQuery.parseJSON( xdr.responseText ));
            // alert(data.feed.entry[0].media$group.media$content[0].url);
            // alert("ie");
        };

        xdr.send();
        
    } else {
        $.getJSON(url, callback);
    }
};

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

window.onerror = function (msg, url, line)
{
    // console.log("in the error thing");
    var message = "Error in "+url+" on line "+line+": "+msg;
    $.post("logerror", { "msg" : message }); 
}

$(document).ready(function () {

    // $( "#datepicker" ).datepicker({
    //     showOtherMonths: true,
    //     selectOtherMonths: true
    // });

  // nonexistfunction();

jQuery.support.cors = true; 

  $(function() {
    $( "#tabs" ).tabs( { heightStyle: "auto" });
  });

// JSONQueryTest("http://gdata.youtube.com/feeds/api/videos?q=cher&category=Music&alt=json",
//         function(data) {alert("success! " + data.feed.entry[0].media$group.media$content[0].url)});

    // $.post("logerror", { "msg" : "a test error" });

    $( "#from" ).datepicker({
        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "M dd, yy",
        onClose: function( selectedDate ) {
            $( "#to" ).datepicker( "option", "minDate", selectedDate );
        }
        // onSelect: function(dateText) {
        //     updateClick();
        // }
    });

    $( "#from" ).datepicker( "setDate", "now" );

    $( "#to" ).datepicker({
        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: "M dd, yy",
        onClose: function( selectedDate ) {
            $( "#to" ).datepicker( "option", "minDate", selectedDate );
        },
        onSelect: function(dateText) {
            updateClick();
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
        position: { my: "left top", at: "left bottom", of:"#locationChange" },
        buttons: [ { text: "Search", click: function() { updateLocation(); } } ]
    });

    $( "#dialog" ).bind('clickoutside',function(){
        $( "#dialog" ).dialog('close');
    });

    $( "#locationChange" ).click(function() {
        ($("#dialog").dialog("isOpen") == false) ? $("#dialog").dialog("open") : $("#dialog").dialog("close") ;
        return false;
    });

    $("#updLocationTxt").keyup(function(event){
        if(event.keyCode == 13){
            updateLocation();
        }
    });

    $("#songkickUserTxt").keyup(function(event){
        if(event.keyCode == 13){
            songkickUpdateClick();
        }
    });

    $( "#genreFilterDialog" ).dialog({
        autoOpen: false,
        // show: "blind",
        // hide: "explode",
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        position: { my: "left top", at: "left bottom", of:"#genreChange" },//clearGenreFilter
        buttons: [ { text: "Clear", click: function() { clearGenreFilter(); } }, { text: "Filter", click: function() { updateGenreFilter(); } }]
    });

    $( "#genreFilterDialog" ).bind('clickoutside',function(){
        $( "#genreFilterDialog" ).dialog('close');
    });

    $( "#genreChange" ).click(function() {
        ($("#genreFilterDialog").dialog("isOpen") == false) ? $("#genreFilterDialog").dialog("open") : $("#genreFilterDialog").dialog("close") ;
        return false;
    });

    $("#updateGenreText").keyup(function(event){
        if(event.keyCode == 13){
            updateGenreFilter();
        }
    });

    populateLocation();

    preLoadEventSKID = getQueryVariable("skEventId");
    
    if (preLoadEventSKID) {
        setPreloadEvent();
    } else {
        // TODO this will execute before we get our location info
        getSongkickEventPage(1);
    }

    if ($.cookie('genreFilter')) {
        $("#genreFilter").html($.cookie('genreFilter'));
    }

buildSongkickAreaDateQuery( );

// $.getJSON("/test",
//         function (data) {
//             alert('test response: ' + data.testvar);
//         });

// $( "#testbutton" ).button({
//       icons: {
//         primary: "ui-icon-circle-triangle-s"
//       },
//       text: false
//     })

});

function setPreloadEvent() {
    // TODO this is a javascript error if a bad event id is passed in
    $.getJSON("http://api.songkick.com/api/3.0/events/" + preLoadEventSKID + ".json?apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
    function (data) {
        // alert(data.resultsPage.status);
        if (data.resultsPage.status != "ok") {
            console.log("bad event");
        } else {
            setLocation(data.resultsPage.results.event.venue.metroArea.id, data.resultsPage.results.event.venue.metroArea.displayName);
            // TODO won't really work if event is in the past
            // TODO should we have a bigger date range?
            $( "#from" ).datepicker( "setDate",  $.datepicker.parseDate("yy-mm-dd",  data.resultsPage.results.event.start.date));
            $( "#to" ).datepicker( "setDate",  $.datepicker.parseDate("yy-mm-dd",  data.resultsPage.results.event.start.date));
        }

        // need to get this no matter what
        getSongkickEventPage(1);
    });

}

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api?wmode=opaque";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
var playerLoaded = false;
var initialVideoId;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        wmode: 'opaque',
        height: '390',
        width: '640',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    // selectPlaying($(".artist_item").get(0));
    var pos = $("#player").position();
    // alert("iframe pos= " + pos);
}

function updateGenreFilter() {
    // alert("cached? " + lfm_artistCache["STATUETTE"].artist.name)
    // alert("cached? " + lfm_artistCache["STATUETTE"])
    $("#genreFilter").html($("#updateGenreText").val());

    if ($("#updateGenreText").val() != "") {
        $.cookie('genreFilter', $("#updateGenreText").val());
        $( "#genreFilterDialog" ).dialog( "close" );
    } else {
        clearGenreFilter();
    }

}

function clearGenreFilter() {
    $.removeCookie('genreFilter');
    $("#genreFilter").html("(None)");
    $("#genreFilterDialog" ).dialog( "close" );
}

// we may not want to always store this in cookie
function setLocation(id, name) {
    $("#locationText").html(name + " Area");
    $.cookie('sk_locationid', id);
    $.cookie('sk_locationName', name);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function updateLocationCallback(data) {
    if (data.resultsPage.totalEntries > 0) {
        // TODO if there are multiple results, we can try to cross reference with clientid to get the closest one
        $("#locationText").html(data.resultsPage.results.location[0].metroArea.displayName + " Area");
        //document.cookie
        $.cookie('sk_locationid', data.resultsPage.results.location[0].metroArea.id);
        $.cookie('sk_locationName', data.resultsPage.results.location[0].metroArea.displayName);
        updateClick();
    } else {
        alert("Could not find location: " + $("#updLocationTxt").val());
    }
}

function updateLocation() {

    // alert($("#updLocationTxt").val());
    var updateString = $("#updLocationTxt").val();

    if (updateString) {
        var searchQuery;
        if (isNumeric(updateString)) {
            // TODO should we filter all search requests through google first?
            JSONQuery("http://maps.googleapis.com/maps/api/geocode/json?address="+updateString+"&sensor=false",
                function (data) {
                    if (data.status == "OK")
                    {
                        var myLocation = data.results[0].geometry.location;
                        searchQuery = "location=geo:"+myLocation.lat+","+myLocation.lng;
                        $.getJSON("http://api.songkick.com/api/3.0/search/locations.json?"+searchQuery+"&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
                        function (data) {
                            updateLocationCallback(data);
                        });
                    } else {
                        alert("Could not locate " + updateString);
                    }
                });
            // return;
        } else {
            searchQuery = "query="+$("#updLocationTxt").val();
            $.getJSON("http://api.songkick.com/api/3.0/search/locations.json?"+ searchQuery+"&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
            function (data) {
                updateLocationCallback(data);
            });
        }
    }

    $( "#dialog" ).dialog( "close" );

    // alert(getLocationQueryString());
}

function getLocationQueryString() {
    if ($.cookie('sk_locationid')) {
        return "location=sk:" + $.cookie('sk_locationid');
    } else {
        console.log("using client ip!");
        return "location=clientip";
    }
}

function getLocationQueryVal() {
    if ($.cookie('sk_locationid')) {
        return "sk:" + $.cookie('sk_locationid');
    } else {
        return "clientip";
    }
}

function populateLocation() {
    if ($.cookie('sk_locationName')) {
           $("#locationText").html($.cookie('sk_locationName') + " Area");
    } else {

        $.getJSON("http://api.songkick.com/api/3.0/search/locations.json?location=clientip&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
        function (data) {
            $("#locationText").html();
            setLocation(data.resultsPage.results.location[0].metroArea.id, data.resultsPage.results.location[0].metroArea.displayName);
        });
    }
}

function updateClick() {
// alert("date: " + $.datepicker.formatDate('yy', $( "#to" ).datepicker( "getDate" )));

    //$("#playlistNav").empty();
    $(".button_container").empty();
    $(".button_container").html("Loading...")
    preLoadEventSKID = null;
    totalArtists = 0;
    shownArtists = 0;
    artistIndex = 0;
    eventIndex = 0;
    //document.getElementById("playlistInfo").innerHTML = "Loading...";
    getSongkickEventPage(1);
}

function songkickUpdateClick() {

    //$("#playlistNav").empty();
    $(".button_container").empty();
    $(".button_container").html("Loading...")
    preLoadEventSKID = null;
    totalArtists = 0;
    shownArtists = 0;
    artistIndex = 0;
    eventIndex = 0;
    //document.getElementById("playlistInfo").innerHTML = "Loading...";
    getSongkickEventPageByUser($("#songkickUserTxt").val(), 1);
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
    element.parentNode.parentNode.scrollTop = element.offsetTop - element.parentNode.parentNode.offsetTop;
}

function selectPlaying(myDiv, autoStart) {
    eventIndex = $(".media_item").index(myDiv.parentNode.parentNode);

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
    var artistURI = $(myDiv).children(".artistURI").get(0).value;
    var artistID = $(myDiv).children(".songkickID").get(0).value;

    var myYoutubeID = $(myDiv).children(".artistYoutubeID").get(0).value;

    // console.log("ytlink= " + myYoutubeID +"!");

    //alert(artistName);

    if (playerLoaded) {
        if (autoStart) {
            player.loadVideoById(myYoutubeID, 0, 'small');
        } else {
            player.cueVideoById(myYoutubeID, 0, 'small');
        }
    } else {
        initialVideoId = myYoutubeID;
    }

    // JSONQuery("http://gdata.youtube.com/feeds/api/videos?q=" + artistName + "&category=Music&alt=json",
    // function (data) {
    //     // alert("ytquery");
    //     if (data.feed.entry) {

    //         for (var i = 0; i < data.feed.entry[0].media$group.media$content.length; i++) {
    //             if (data.feed.entry[0].media$group.media$content[i].yt$format == 5) {
    //                 var videoUrl = data.feed.entry[0].media$group.media$content[i].url;
    //                 // document.getElementById("blah").innerHTML = videoUrl;
    //                 if (playerLoaded) {
    //                     if (autoStart) {
    //                         player.loadVideoById(myYoutubeID, 0, 'small');
    //                     } else {
    //                         player.cueVideoById(myYoutubeID, 0, 'small');
    //                     }
    //                 } else {
    //                     initialVideoId = myYoutubeID;
    //                 }
    //                 break;
    //             }
    //         }
    //     } else {
    //         // document.getElementById("blah").innerHTML = "Could not find youtube for: " + playlist.options[playlist.selectedIndex].value;
    //     }
    // });

    updatePlayingInfo(artistName, artistURI, artistID);

    // populateArtistInfo(artistName);
    // populateLastFMInfo(artistName);
}

function artistDivClick(myDiv) {
    //alert(artistName);
    selectPlaying(myDiv, true);

    //alert("parent index = " + testindex1 + " this index = " + testindex2);

    //alert(myDiv.parentNode.className);
}

var MAX_GENRE_TAGS = 2;

// cache all the lastFM genre info client side so we aren't constantly querying when updating the filters
// TODO also check this when initially populating the list

var lfm_artistCache = [];

// assumes this has already been cached
function addLastFMInfo(artistName, targetElement) {
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
        if (artistNode.artist.tags) {
            if (artistNode.artist.tags.tag) {
                // var genres = [];
                // TODO we should index with original search into the query instead of result returned from last.fm
                // TODO should we just cache the entire lastfm result instead of building our own mapping?
                // lfm_artistGenreMap[artistNode.artist.name] = genres;

                // Inconsistency in lastfm data format, a single tag will not be nested in an array. lets just add it here
                // if (artistNode.artist.tags.tag.name) {
                //     alert("artist has single tag: " + artistNode.artist.name);
                //     artistNode.artist.tags.tag[0] = {};
                //     artistNode.artist.tags.tag[0].name = artistNode.artist.tags.tag.name;
                // }

                if (artistNode.artist.tags.tag.length) {                    

                    for (var i = 0; (i < artistNode.artist.tags.tag.length); i++) {

                        if (i < MAX_GENRE_TAGS) {
                            var genresList = [
                            {genreName: artistNode.artist.tags.tag[i].name}
                            ];

                            // TODO we could do this for all tags at once if we build the array first
                            var myGenreTmpl = $('#artist_genre_tag').tmpl(genresList);
                            myGenreTmpl.appendTo(targetElement);
                        }

                        if ($.cookie('genreFilter')) {
                            if (artistNode.artist.tags.tag[i].name == $.cookie('genreFilter')) {
                                targetElement.className += " badgenre";

                                // TODO if we add here this will not preserve ordering. should probably create a dummy div for these to reside in
                                // if (!targetElemnt.parent.parent.parent) {

                                // }                     
                            }
                        }
                    }
                } else {
                    var genresList = [
                        {genreName: artistNode.artist.tags.tag.name}
                    ];

                    // TODO we could do this for all tags at once if we build the array first
                    var myGenreTmpl = $('#artist_genre_tag').tmpl(genresList);
                    myGenreTmpl.appendTo(targetElement);

                    if ($.cookie('genreFilter')) {
                        if (artistNode.artist.tags.tag.name == $.cookie('genreFilter')) {
                            targetElement.className += " badgenre";

                            // TODO if we add here this will not preserve ordering. should probably create a dummy div for these to reside in
                            // if (!targetElemnt.parent.parent.parent) {

                            // }                     
                        }
                    }
                }

                // targetElement.innerHTML = text;
            } else {
                // genreSpan.innerHTML = " (no artist tags)";
                targetElement.innerHTML = "";
            }

                        // var linkInfo = [
                        //     {lastfmURI: artistNode.artist.url}
                        // ];

                        // // TODO we could do this for all tags at once if we build the array first
                        // var myLinkTmpl = $('#artist_lastfm_link').tmpl(linkInfo);
                        // myLinkTmpl.appendTo(targetElement);

            // var mylastFMLink = document.createElement('a');
            // mylastFMLink.href = artistNode.artist.url;
            // mylastFMLink.target = "_blank";
            // var lastFMIcon = document.createElement('img');
            // lastFMIcon.className = 'lastfm_icon';
            // lastFMIcon.src = "/images/lastfm_red_17px.png";
            // mylastFMLink.appendChild(lastFMIcon);
            // targetElement.appendChild(mylastFMLink);
        } else {
        // genreSpan.innerHTML = " (no artist info)";
        // TODO remove lastfm link
        targetElement.innerHTML = "";
        }

        // lastfmLink.href = artistNode.artist.url;

    } else {
        // genreSpan.innerHTML = " (no artist info)";
        // TODO remove lastfm link
        targetElement.innerHTML = "";
    }
}

var addLastFMInfoCallbackByMBID = function(searchString, targetELement) {
    return function (data) {

        if (!(data.artist)) {
            console.log("songkick mbid but no lastfm?");
        }

        // alert('mbid?');

        lfm_artistCache[searchString] = data;
        addLastFMInfo(searchString, targetELement);
    };
};


var addLastFMInfoCallback = function(searchString, targetELement) {
    return function (data) {

        lfm_artistCache[searchString] = data;
        addLastFMInfo(searchString, targetELement);

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

var numGenreAdd = 0;
// dummy comment is this working?
function addArtistDivElement(targetNode, sk_artistNode) {
    var artistName = sk_artistNode.displayName;

    var artists = [
    {artistName: sk_artistNode.displayName, songkickID: sk_artistNode.artist.id, artistURI: sk_artistNode.artist.uri, youtubeID: sk_artistNode.artist.youtubeID}
    ];

    var myArtistTmpl = $('#artist_item_template').tmpl(artists);

    myArtistTmpl.appendTo(targetNode)

    var artistGenreTmpl = myArtistTmpl.children(".artist_genre").get(0);

    if (lfm_artistCache[artistName]) {
        // alert(artistName + ' cached!');
        addLastFMInfo(artistName, artistGenreTmpl);
    } else {

        if (sk_artistNode.artist.identifier.length > 0) {
            JSONQuery("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=" + sk_artistNode.artist.identifier[0].mbid + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
                addLastFMInfoCallbackByMBID(artistName, artistGenreTmpl)
            );
        } else {
            // TODO we can query by musicbrainz id instead of searching by artist name. this could give slightly better results but we will still
            // likely need the fallback
            JSONQuery("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
                addLastFMInfoCallback(artistName, artistGenreTmpl)
            );
        }
    }

    // targetNode.appendChild(artistNode);
}

function addEventDivElement(sk_eventNode, targetNode) {

    // adding elements instead of html
    if (sk_eventNode.performance.length < 1) {
        return;
    }

    if (sk_eventNode.status == "cancelled") {
        return;
    }
// return $.datepicker.formatDate("yy-mm-dd", $( "#from" ).datepicker( "getDate" ));
    var dateString = $.datepicker.formatDate("DD MM dd", $.datepicker.parseDate("yy-mm-dd", sk_eventNode.start.date));

    var eventInfo = [
    {   date: dateString,
        venue: sk_eventNode.venue.displayName,
        eventPermalink:"?skEventId=" + sk_eventNode.id,
        skEventURI: sk_eventNode.uri }
    ];

    var myEventTmpl = $('#event_item').tmpl(eventInfo);

    for (var j = 0; j < sk_eventNode.performance.length; j++) {
        addArtistDivElement(myEventTmpl.children(".event_artist_list").get(0), sk_eventNode.performance[j]);
    }

    // root item
    // $(".button_container").get(0).appendChild(eventNode);
    // targetNode.appendChild(eventNode);

    // TODO this assumes that the event is within the users area and default date range
    // we should check the event info first and then build our initial SK query based on that
    if (preLoadEventSKID && (sk_eventNode.id == preLoadEventSKID)) {
        // alert('our event: ' + myEventTmpl.html());
        myEventTmpl.prependTo($(".sk_page_container_1"));
        // alert("found our event" + myEventTmpl.find(".artist_item").get(0).innerHTML );
        // alert($(eventNode).children(".artist_item").get(0).innerHTML);
        selectPlaying(myEventTmpl.find(".artist_item").get(0), false);
        // selectPlaying()
    } else {
        myEventTmpl.appendTo(targetNode);
    }
}
function testClick() {
    // alert("artist is: " + $(".media_item:eq(" + eventIndex + ") .artist_item").get(artistIndex).innerHTML);
    //alert("artist is: " + $(".media_item:eq(1) .artist_item").length);

    artistIndex++;

    if (artistIndex >= $(".media_item:eq(" + eventIndex + ") .artist_item").length) {
        //alert("name over")
        artistIndex = 0;
        eventIndex ++;
    }

    selectPlaying($(".media_item:eq(" + eventIndex + ") .artist_item").get(artistIndex), false);
}

var loadVideoOnUpdate = true;

function buildSongkickAreaDateQuery(pageNumber) {
    var url = "http://api.songkick.com/api/3.0/events.json"

    var parameters = {
        apikey : "bUMFhmMfaIpxiUgJ",
        location: getLocationQueryVal(),
        min_date:  getMinDate(),
        max_date: getMaxDate(),
        page: pageNumber,
        jsoncallback: "?"
    };

    return url + "?" + $.param(parameters);
}

function buildSongkickUserQuery(user, pageNumber) {
    var url = "http://api.songkick.com/api/3.0/users/"+user+"/calendar.json"

    var parameters = {
        apikey : "bUMFhmMfaIpxiUgJ",
        reason: "tracked_artist",
        page: pageNumber,
        jsoncallback: "?"
    };

    return url + "?" + $.param(parameters) + "&jsoncallback=?";
}

function getSongkickEventPage(pageNumber) {
    
    // TODO create divs for each result page so that the order is deterministic/chronological

    // location hardcoded to austin 9179
    // $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&"+getLocationQueryString()+"&page=" + pageNumber + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
    $.getJSON("/events.json?"+getLocationQueryString()+"&page=" + pageNumber + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "",
    function (data) {
        var text = "Event name: ";
        //alert('get event');
        // data is JSON response object
        //alert(text + );

        if (data.resultsPage.totalEntries == 0) {
            console.log("no data");
            return;
        }

        if (pageNumber == 1) {
            $(".button_container").empty();

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

            // 
        }

        //var playlistNav = document.getElementById("playlistNav");

        for (var i = 0; i < data.resultsPage.results.event.length; i++) {

            //checkAndAddEvent(data.resultsPage.results.event[i]);

            // $(".button_container").get(0).innerHTML += addEventDivElement(data.resultsPage.results.event[i]);
            addEventDivElement(data.resultsPage.results.event[i], $(".sk_page_container_" + pageNumber).get(0));

        }

        if (pageNumber == 1) {
            // TODO this should be cued and done in a better location and shouild only cue the video
            if (!preLoadEventSKID) {
                if(loadVideoOnUpdate) {
                    loadVideoOnUpdate = false;
                    selectPlaying($(".media_item:eq(0) .artist_item").get(0), false);
                }
            }
        }

        // TODO bug- for some reason the preload event isn't scrolling properly, this will mostly fix, though 
        // incoming lastfm info will push the data slightly past. not a huge issue for smaller resultsets

        divScrollTo($(".media_item").get(eventIndex));
        // document.getElementById("playlistInfo").innerHTML = "Showing " + shownArtists + " of " + totalArtists + " artists";
        //alert('end json');
    });
}

// We should try and refactor with the above code
function getSongkickEventPageByUser(user, pageNumber) {
    $.getJSON(buildSongkickUserQuery(user, pageNumber),
    function (data) {

        if (data.resultsPage.totalEntries == 0) {
            console.log("no data");
            return;
        }

        if (pageNumber == 1) {
            $(".button_container").empty();

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

                for (var i = 2; i <= totalPages; i++) {
                    getSongkickEventPage(i);
                }
            }

            // 
        }

        //var playlistNav = document.getElementById("playlistNav");

        for (var i = 0; i < data.resultsPage.results.calendarEntry.length; i++) {

            //checkAndAddEvent(data.resultsPage.results.event[i]);

            // $(".button_container").get(0).innerHTML += addEventDivElement(data.resultsPage.results.event[i]);
            addEventDivElement(data.resultsPage.results.calendarEntry[i].event, $(".sk_page_container_" + pageNumber).get(0));

        }

        if (pageNumber == 1) {
            // TODO this should be cued and done in a better location and shouild only cue the video
            if (!preLoadEventSKID) {
                if(loadVideoOnUpdate) {
                    loadVideoOnUpdate = false;
                    selectPlaying($(".media_item:eq(0) .artist_item").get(0), false);
                }
            }
        }

        // TODO bug- for some reason the preload event isn't scrolling properly, this will mostly fix, though 
        // incoming lastfm info will push the data slightly past. not a huge issue for smaller resultsets

        divScrollTo($(".media_item").get(eventIndex));
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
    playerLoaded = true;
    // loadVideoOnUpdate = true;

    if (initialVideoId) {
        // TODO should autostart on load be toggleable?
        player.cueVideoById(initialVideoId, 0, 'small');
    }
}

function getMinDate() {
    return $.datepicker.formatDate("yy-mm-dd", $( "#from" ).datepicker( "getDate" ));
}

function getMaxDate() {
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

    if (artistIndex >= $(".media_item:eq(" + eventIndex + ") .event_artist_list .artist_item").length) {
        //alert("name over")
        artistIndex = 0;
        eventIndex ++;
    }

    selectPlaying($(".media_item:eq(" + eventIndex + ") .event_artist_list .artist_item").get(artistIndex), true);

}

function playlistChange() {
    //var playlist = document.getElementById("playlistNav");
    // document.getElementById("blah").innerHTML = "change!sdfa";
    //document.getElementById("blah").innerHTML = playlist.options[playlist.selectedIndex].value;

    //var artistName = playlist.options[playlist.selectedIndex].value;

    JSONQuery("http://gdata.youtube.com/feeds/api/videos?q=" + artistName + "&category=Music&alt=json",
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

    // populateArtistInfo(artistName);
    // populateLastFMInfo(artistName);
}

function populateArtistInfo(artistName) {
    // location hardcoded to austin id:9179
    // TODO can we encode this better?
    artistName = artistName.replace("&amp;","%26");
    console.log("our artist after replace: " + artistName);

    $('#info_shows').empty();
    $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&"+getLocationQueryString()+"&artist_name=" + artistName + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
    // $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&location=sk:9179&artist_name=" + artistName + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",        
    function (data) {
        //var text = "<b>Events:</b>";
        var eventItems = [];
        // data is JSON response object
        //alert(text + );

        for (var i = 0; i < data.resultsPage.results.event.length; i++) {
            var eventNode = data.resultsPage.results.event[i];
            // text += "<br/>" + data.resultsPage.results.event[i].displayName + "<br/>";
            // for (var j = 0; j < data.resultsPage.results.event[i].performance.length; j++) {
            //     var iartistName = data.resultsPage.results.event[i].performance[j].displayName;

            //     eventItems

            //     //text += iartistName + "&nbsp;";
            // }

            eventItems[i] = { eventName: eventNode.displayName
                            , songkickURI: eventNode.uri
                            , eventPermalink:"?skEventId=" + eventNode.id};
            //text = text + data.resultsPage.results.event[i].displayName + " NEXT: ";

        }

// eventItems = [
//             {eventName: "test1"},
//             {eventName: "test1"},
//             ];

        var myGenreTmpl = $('#info_event').tmpl(eventItems);
        myGenreTmpl.appendTo($('#info_shows'));

    });
}

function populateLastFMInfo(artistName) {
    $("#lastFMInfo").html("before query");
    // TODO .getJSON looks bugged in IE9
    JSONQuery("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
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


function updatePlayingInfo(artistName, artistURI, artistID) {
    // alert(artistName);
    $("#info_artist").html(artistName);
    var targetElement = $("#info_lastfm").get(0);
    $("#info_lastfm").empty();
    $("#info_image").attr("src", "");

    $("#info_artist").empty();
    var myArtistInfo = { artistName: artistName, songkickURI: artistURI}

    var myGenreTmpl = $('#info_artist_tmpl').tmpl(myArtistInfo);
    myGenreTmpl.appendTo($('#info_artist'));

    populateArtistInfo(artistName);

    // TODO bug, artist doesn't seem to be cached if there is an amperstand ("&") in their name
    var artistNode = lfm_artistCache[artistName];
    if (!artistNode) {
        console.log("artist not cached");
        return;
    }

    if (artistNode.artist) {
        if (artistNode.artist.tags) {
            if (artistNode.artist.tags.tag) {
                
                // var genres = [];
                // TODO we should index with original search into the query instead of result returned from last.fm
                // TODO should we just cache the entire lastfm result instead of building our own mapping?
                // lfm_artistGenreMap[artistNode.artist.name] = genres;

                // Inconsistency in lastfm data format, a single tag will not be nested in an array. lets just add it here
                // if (artistNode.artist.tags.tag.name) {
                //     alert("artist has single tag: " + artistNode.artist.name);
                //     artistNode.artist.tags.tag[0] = {};
                //     artistNode.artist.tags.tag[0].name = artistNode.artist.tags.tag.name;
                // }

                if (artistNode.artist.tags.tag.length) {                    

                    for (var i = 0; (i < artistNode.artist.tags.tag.length); i++) {

                        if (i < MAX_GENRE_TAGS) {
                            var genresList = [
                                {genreName: artistNode.artist.tags.tag[i].name}
                            ];

                            // TODO we could do this for all tags at once if we build the array first
                            var myGenreTmpl = $('#artist_genre_tag').tmpl(genresList);
                            myGenreTmpl.appendTo(targetElement);
                        }
                    }
                } else {
                    var genresList = [
                        {genreName: artistNode.artist.tags.tag.name}
                    ];

                    // TODO we could do this for all tags at once if we build the array first
                    var myGenreTmpl = $('#artist_genre_tag').tmpl(genresList);
                    myGenreTmpl.appendTo(targetElement);
                }

                // targetElement.innerHTML = text;
            } else {
                // genreSpan.innerHTML = " (no artist tags)";
                console.log("no last.fm tags for artist");
            }

            var linkInfo = [
                {lastfmURI: artistNode.artist.url}
            ];

            // TODO we could do this for all tags at once if we build the array first
            // var myLinkTmpl = $('#artist_lastfm_link').tmpl(linkInfo);
            // $("#info_artist").append(myLinkTmpl);
        } else {
            console.log("no last.fm tags for artist");
        }

        if (artistNode.artist.image) {
            // assume our size is the 2nd index
            if (artistNode.artist.image[2].size != "large") {
                console.log("warning last.fm image index assertion false!");
            }

            $("#info_image").attr("src", artistNode.artist.image[2]["#text"]);
        } else {
            console.log("no lastfm image!");
        }
        var myLinkTmpl = $('#artist_lastfm_link').tmpl(linkInfo);
        $("#info_artist").append(myLinkTmpl);
    } else {
        // console.log("lastfm info not cached for currently playing artist");
    }
}