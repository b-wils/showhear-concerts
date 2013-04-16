
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

var headerDateFormatString = "D, M dd"

var queryId = "";
var pagesProcessed = 0;

var venueId = "";
var venueList = [];


window.onload = function () {

};


function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

$(window).resize(function(){
    $('#dialog').dialog('option', 'position', $("#dialog").dialog('option','position'));
    $('#genreFilterDialog').dialog('option', 'position', $("#genreFilterDialog").dialog('option','position'));
    $('#songkickUserDialog').dialog('option', 'position', $("#songkickUserDialog").dialog('option','position'));
});


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

function ExpandInput(obj){
    console.log("expanding input");
 if (!obj.savesize) obj.savesize=obj.size;
 obj.size=Math.max(obj.savesize,obj.value.length);

}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    // console.log('Query variable %s not found', variable);
}

window.onerror = function (msg, url, line)
{
    // console.log("in the error thing");
    var message = "Error in "+url+" on line "+line+": "+msg;
    $.post("/logerror", { "msg" : message }); 
}

function resizeFrom() {
$('#from').each(function(){
    console.log("resize from");
    var value = $(this).val();
    var size  = value.length;
    // playing with the size attribute
    //$(this).attr('size',size);
    
    // playing css width
    size = size*2;
    $(this).css('width',size*3);
    
    })
}

function setDialogPositions() {


    // $( "#from" ).position({
    //         my: "left top",
    //         at: "left bottom",
    //         collision: "fit fit",
    //     of: $("#dateSearch")
    // });

    // $( "#to" ).position({
    //         my: "right top",
    //         at: "right bottom",
    //         collision: "fit fit",
    //     of: $("#dateSearch")
    // });
}

var pathArea;

function populateGenreAutoComplete() {
    JSONQuery("http://ws.audioscrobbler.com/2.0/?method=tag.getTopTags&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
        function (data) {
            var genreList = [];
            for (var i = 0; i < data.toptags.tag.length; i++) {
                genreList.push(data.toptags.tag[i].name);
            }

            $( "#updateGenreText" ).autocomplete({
              source: genreList
            });
        }


    );
}

function initDialogs() {


    // $( "#video-issue-dialog" ).dialog({
    //     autoOpen: false,
    //     // show: "blind",
    //     // hide: "explode",
    //     width:244,
    //     height:120,
    //     closeOnEscape: true,
    //     draggable: false,
    //     resizable: false,
    //     position: { my: "left top", at: "left bottom", of:"#locationChange", collision:"none none" },
    //     buttons: [ { text: "Search", click: function() { updateLocation(); } } ]
    // }).show();
$( "#video-issue-dialog" ).dialog({
      autoOpen: false,
      height: 235,
      width: 400,
      modal: true,
    closeOnEscape: true,
    draggable: false,
    resizable: false,
      // position: { my: "right top", at: "right bottom", of:"#tabs-1", collision:"none none" },//clearGenreFilter
      buttons: {
        "Send Report": function() {
            submitVideoIssue();
          // var bValid = true;
          // allFields.removeClass( "ui-state-error" );
 
          // bValid = bValid && checkLength( name, "username", 3, 16 );
          // bValid = bValid && checkLength( email, "email", 6, 80 );
          // bValid = bValid && checkLength( password, "password", 5, 16 );
 
          // bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
          // // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
          // bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
          // bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
 
          // if ( bValid ) {
          //   $( "#users tbody" ).append( "<tr>" +
          //     "<td>" + name.val() + "</td>" +
          //     "<td>" + email.val() + "</td>" +
          //     "<td>" + password.val() + "</td>" +
          //   "</tr>" );
          //   $( this ).dialog( "close" );
          // }
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
      // ,
      // close: function() {
      //   allFields.val( "" ).removeClass( "ui-state-error" );
      // }
    });

    $("#reportVideoButton").click(function() {
        $( "#video-issue-dialog" ).dialog("open");
    })

$( "#alertDialog" ).dialog({
      autoOpen: false,
      height: 150,
      width: 350,
      modal: true,
    closeOnEscape: true,
    draggable: false,
    resizable: false,
      // position: { my: "right top", at: "right bottom", of:"#tabs-1", collision:"none none" },//clearGenreFilter
      buttons: {

        Close: function() {
          $( this ).dialog( "close" );
        }
      }
      // ,
      // close: function() {
      //   allFields.val( "" ).removeClass( "ui-state-error" );
      // }
    });

    // $( "#locationSelector" ).click(function() {
    //     ($("#dialog").dialog("isOpen") == false) ? $("#dialog").dialog("open") : $("#dialog").dialog("close") ;
    //     return false;
    // });

$( "#inlineDatepicker" ).datepicker({
        showOtherMonths: true,
        selectOtherMonths: false,
        altField: "#inlineDate",
        altFormat: "DD, d MM, yy",
        onSelect: function(date, ui){
            $("#inlineDate").html(date);
            $("#inlineDatepicker").hide();
        }

    }).hide();

    $( "#from" ).datepicker({
        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: headerDateFormatString,
        // onClose: function( selectedDate ) {
        //     $( "#to" ).datepicker( "option", "minDate", selectedDate );
        // },
        dayNamesMin: [ "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT" ],
        onSelect: function(dateText) {
            $("#fromText").html(dateText);
            $("#from").hide();
            _gaq.push(['_trackEvent', 'Click', 'FromDate']);
            updateClick();
        }
    }).hide();

    $( "#from" ).datepicker( "setDate", "now" );
    var tempDate = $.datepicker.formatDate(headerDateFormatString, $( "#from" ).datepicker( "getDate" ));
    $("#fromText").html(tempDate);


    $( "#to" ).datepicker({
        numberOfMonths: 1,
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: headerDateFormatString,
        // onClose: function( selectedDate ) {
        //     $( "#to" ).datepicker( "option", "minDate", selectedDate );
        // },
        dayNamesMin: [ "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT" ],
        onSelect: function(dateText) {
            $("#toText").html(dateText);
            $("#to").hide();
            _gaq.push(['_trackEvent', 'Click', 'ToDate']);
            updateClick();
        }
    }).hide();

    $( "#to" ).datepicker( "setDate", "+1w" );
    tempDate = $.datepicker.formatDate(headerDateFormatString, $( "#to" ).datepicker( "getDate" ));
    $("#toText").html(tempDate);


    $( "#to" ).bind('clickoutside',function(){
        // $( "#to" ).hide();
    });

    // alert("date: " +  $( "#from" ).datepicker( "getDate" ).getDate());

    // alert("date: " +  $.datepicker.formatDate("yy-mm-dd", $( "#to" ).datepicker( "getDate" )));

    $( "#dialog" ).dialog({
        autoOpen: false,
        // show: "blind",
        // hide: "explode",
        width:244,
        height:120,
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        position: { my: "left top", at: "left bottom", of:"#locationChange", collision:"none none" },
        buttons: [ { text: "Search", click: function() { updateLocation(); } } ]
    }).show();

    $( "#dialog" ).bind('clickoutside',function(){
        $( "#dialog" ).dialog('close');
    });

    $( "#locationSelector" ).click(function() {
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
        width:335,
        height:120,
        // maxHeight:170,
        // show: "blind",
        // hide: "explode",
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        position: { my: "right top", at: "right bottom", of:"#tabs-1", collision:"none none" },//clearGenreFilter
        buttons: [ { text: "Clear", click: function() { clearGenreFilter(); } }, { text: "Filter", click: function() { updateGenreFilter(); } }]
    });

    $( "#genreFilterDialog" ).bind('clickoutside',function(){
        $( "#genreFilterDialog" ).dialog('close');
    });

    $( "#genreSelector" ).click(function() {
        ($("#genreFilterDialog").dialog("isOpen") == false) ? $("#genreFilterDialog").dialog("open") : $("#genreFilterDialog").dialog("close") ;
        return false;
    });

    $("#updateGenreText").keyup(function(event){
        if(event.keyCode == 13){
            updateGenreFilter();
        }
    });

    $( "#songkickUserDialog" ).dialog({
        autoOpen: false,
        width:325,
        height:120,
        // show: "blind",
        // hide: "explode",
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        position: { my: "left top", at: "left bottom", of:"#t2-a1", collision:"none none" },//clearGenreFilter
        buttons: [ { text: "Search", click: function() { updateSongkickQueryClick(); } }]
    });

    $( "#songkickUserDialog" ).bind('clickoutside',function(){
        $( "#songkickUserDialog" ).dialog('close');
    });

    $( "#songkickUserSelector" ).click(function() {
        ($("#songkickUserDialog").dialog("isOpen") == false) ? $("#songkickUserDialog").dialog("open") : $("#songkickUserDialog").dialog("close") ;
        return false;
    });

    $("#updateSongkickText").keyup(function(event){
        if(event.keyCode == 13){
            updateSongkickQueryClick();
        }
    });


    $( "#venueFilterDialog" ).dialog({
        autoOpen: false,
        width:335,
        height:120,
        // maxHeight:170,
        // show: "blind",
        // hide: "explode",
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        position: { my: "right top", at: "right bottom", of:"#tabs-1", collision:"none none" },//clearGenreFilter
        buttons: [ { text: "Clear", click: function() { clearVenueFilter(); } }, 
        // { text: "Filter", click: function() { updateVenueFilter(); } }
        ]
    });

    $( "#venueFilterDialog" ).bind('clickoutside',function(){
        $( "#venueFilterDialog" ).dialog('close');
    });

    $( "#venueSelector" ).click(function() {
        ($("#venueFilterDialog").dialog("isOpen") == false) ? $("#venueFilterDialog").dialog("open") : $("#venueFilterDialog").dialog("close") ;
        return false;
    });

    $("#updateVenueText").keyup(function(event){
        if(event.keyCode == 13){
            // updateVenueFilter();
        }
    });

}

function testReNav() {
    document.title = "A NEW TITLE!";
    window.history.pushState("object or string", "Title", "/new-url");
}

$(document).ready(function () {
    // testReNav();
// $( ".positionable" ).position({
//         of: $( "#parent" ),
//         my: $( "#my_horizontal" ).val() + " " + $( "#my_vertical" ).val(),
//         at: $( "#at_horizontal" ).val() + " " + $( "#at_vertical" ).val(),
//         collision: $( "#collision_horizontal" ).val() + " " + $( "#collision_vertical" ).val()
//       });

  // nonexistfunction();

    // $( "#updateGenreText" ).autocomplete({
    //   source: availableGenreTags
    // });

    // $("#loading-more-results").hide();

    // pathArea = $("#pathVenueName2").get(0).value;

    populateGenreAutoComplete();

    jQuery.support.cors = true; 

    $.tubeplayer.defaults.afterReady
        = onPlayerReady2;

    jQuery("#youtube-player-container").tubeplayer({
        width: 640, // the width of the player
        height: 390, // the height of the player
        allowFullScreen: "true", // true by default, allow user to go full screen
        initialVideo: "", // the video that is loaded into the player
        preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
        showinfo: true, // if you want the player to include details about the video
        modestbranding: true, // specify to include/exclude the YouTube watermark
        wmode: "opaque", // note: transparent maintains z-index, but disables GPU acceleratio
        theme: "dark", // possible options: "dark" or "light"
        color: "red", // possible options: "red" or "white"
        onPlayerEnded: function(){videoEnded()},
        onPlay: function(id){}, // after the play method is called
        onPause: function(){}, // after the pause method is called
        onStop: function(){}, // after the player is stopped
        onSeek: function(time){}, // after the video has been seeked to a defined point
        onMute: function(){}, // after the player is muted
        onUnMute: function(){} // after the player is unmuted
    });

    $("#venueFilter").tooltip();

$( "#updateVenueText" ).autocomplete({
  source: [ ],

    select: function( event, ui ) {

        setVenueText($("#updateVenueText").val());
        event.preventDefault();
        updateVenueFilter(ui.item.value);
    },

    focus: function( event, ui ) {
        $("#updateVenueText").val(ui.item.label);
        event.preventDefault();
    }

});

    initDialogs();

    populateLocation();




    preLoadEventSKID = getQueryVariable("skEventId");
    
    if (!preLoadEventSKID) {
        preLoadEventSKID = $("#server-eventid").get(0).value;
    }

    if (preLoadEventSKID) {
        setPreloadEvent();
    } else {
        // TODO this will execute before we get our location info
        // getSongkickEventPage(1);

        if (venueId) {
            console.log("venue query");
            getSongkickEventPageTemp("/venues/"+venueId+"/calendar.json?&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "",
                    1,songkickEventIterator, queryId, songkickEventErrorCallback);
        } else {
            populateVenueList();
            getSongkickEventPageTemp("/events.json?"+getLocationQueryString() +"&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "",
                    1,songkickEventIterator, queryId, songkickEventErrorCallback);
        }
    }

    if ($.cookie('genreFilter')) {
        $("#genreFilter").text($.cookie('genreFilter'));
    }

    if ($.cookie('songkickUser')) {
        // console.log("our user: " + $.cookie('songkickUser'));
        $("#songkickUser").text($.cookie('songkickUser'));
    }

    buildSongkickAreaDateQuery( );

    $('#fromSpan').click(function(event) {
        
        $("#to").hide();
        $('body').one('click',function() {
            $("#from").hide();
        });

      event.stopPropagation();
    });

    $('#toSpan').click(function(event) {
        
        $("#from").hide();
        $('body').one('click',function() {
            $("#to").hide();
        });

      event.stopPropagation();
    });

    $('#to').click(function(event) {
        // TODO this will hide the calendar if you click on it
        // $("#from").hide();
        // $('body').one('click',function() {
        //     $("#to").hide();
        // });

      event.stopPropagation();
    });    


    $('#from').click(function(event) {
        // TODO this will hide the calendar if you click on it
        // $("#from").hide();
        // $('body').one('click',function() {
        //     $("#to").hide();
        // });

      event.stopPropagation();
    });   

    $(".event-container").scroll(function() {
        // console.log("our window scrolled: " + $(".event-container").scrollTop() + " height: " + $(".event-container")[0].scrollHeight);
        checkScrollLoad();
    });


    setDialogPositions();
    setClickFunctions();
    $("#loading-more-results").hide();


    addthis.button('#infoShareLinkAddThis');
});

function setPreloadEvent() {
    // TODO this is a javascript error if a bad event id is passed in
    $.getJSON("http://api.songkick.com/api/3.0/events/" + preLoadEventSKID + ".json?apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
    function (data) {
        // alert(data.resultsPage.status);
        if (data.resultsPage.status != "ok") {
            console.log("bad event");
        } else {
            setLocationNoUrl(data.resultsPage.results.event.venue.metroArea.id, data.resultsPage.results.event.venue.metroArea.displayName);
            populateVenueList();
            // TODO won't really work if event is in the past
            // TODO should we have a bigger date range?
            $( "#from" ).datepicker( "setDate",  $.datepicker.parseDate("yy-mm-dd",  data.resultsPage.results.event.start.date));
            $( "#to" ).datepicker( "setDate",  $.datepicker.parseDate("yy-mm-dd",  data.resultsPage.results.event.start.date));

            var tempDate = $.datepicker.formatDate(headerDateFormatString, $( "#from" ).datepicker( "getDate" ));
            $("#fromText").html(tempDate);

            tempDate = $.datepicker.formatDate(headerDateFormatString, $( "#to" ).datepicker( "getDate" ));
            $("#toText").html(tempDate);
        }

        // need to get this no matter what
                getSongkickEventPageTemp("/events.json?"+getLocationQueryString() +"&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "",
                    1,songkickEventIterator, "", songkickEventErrorCallback);
    });

}
var playerLoaded = false;
var initialVideoId;

function updateGenreFilter() {
    // alert("cached? " + lfm_artistCache["STATUETTE"].artist.name)
    // alert("cached? " + lfm_artistCache["STATUETTE"])

    _gaq.push(['_trackEvent', 'Click', 'GenreChange']);

    $("#genreFilter").text($("#updateGenreText").val());

    if ($("#updateGenreText").val() != "") {
        $.cookie('genreFilter', $("#updateGenreText").val());
        $( "#genreFilterDialog" ).dialog( "close" );
        updateClick();
    } else {
        clearGenreFilter();
    }

}

function clearGenreFilter() {
    $.removeCookie('genreFilter');
    $("#genreFilter").text("(None)");
    $("#genreFilterDialog" ).dialog( "close" );
    updateClick();
}

function setVenueText(venue) {
    $("#venueFilter").text(venue);
    $("#venueFilter").attr("title", venue);


    while ($("#venueFilter").width() > 120) {
        var newText = $("#venueFilter").text();
        var index = newText.lastIndexOf(" ");
        newText = newText.substring(0, index) + "...";

        $("#venueFilter").text(newText);
        console.log(newText);
    }
}

function updateVenueFilter(id) {
    console.log("updatevenuefilter()");
    _gaq.push(['_trackEvent', 'Click', 'VenueChange']);


    if ($("#updateVenueText").val() != "") {
        // $.cookie('genreFilter', $("#updateGenreText").val());
        $( "#venueFilterDialog" ).dialog( "close" );
        setVenueText($("#updateVenueText").val())
        // $("#venueFilter").text();

        venueId = id;

        document.title = "Showhear - Concerts at " + $("#updateVenueText").val();

        var name = $("#updateVenueText").val();

        name = name.replace(/\//g,"");
        name = name.replace(/ /g,"-");
        name = name.replace(/--/g,"-");


        var urlString = "/venue/" + id +"-"+ name;
        // console.log("name: " + name + " url: " + urlString);

        window.history.pushState("teststate", "Showhear - Concerts in " + name, urlString);

        updateClick();
    } else {
        clearGenreFilter();
    }
}

function clearVenueFilter(update) {
    update = typeof update !== 'undefined' ? update : true;

    venueId = "";
    $("#venueFilter").text("(None)");
    $("#updateVenueText").text("");
    $("#venueFilterDialog" ).dialog( "close" );
    if (update) {
        updateClick();
    }

    setLocation($.cookie('sk_locationid'), $.cookie('sk_locationName'));

}


function populateVenueList() {
    venueList = [];
    $.getJSON("http://api.songkick.com/api/3.0/events.json?"+getLocationQueryString() +"&min_date=" + getMinDate() + "&max_date=" + getMaxDate() +"&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
        function (data) {

            var totalPages = Math.ceil(data.resultsPage.totalEntries / data.resultsPage.perPage);

            if (totalPages > 1) {
                for (var i = 2; i <= totalPages; i++) {
                    $.getJSON("http://api.songkick.com/api/3.0/events.json?"+getLocationQueryString() +"&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&page=" + i +"&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
                        function (data) {
                            for (var i = 0; i < data.resultsPage.results.event.length; i++) {
                                if (!checkVenueListById(data.resultsPage.results.event[i].venue.id)){
                                    venueList.push({label:data.resultsPage.results.event[i].venue.displayName, value: data.resultsPage.results.event[i].venue.id});
                                }
                            }
                            $( "#updateVenueText" ).autocomplete( "option", "source", venueList );
                    });
                }
            }

            for (var i = 0; i < data.resultsPage.results.event.length; i++) {
                if (!checkVenueListById(data.resultsPage.results.event[i].venue.id)){
                    venueList.push({label:data.resultsPage.results.event[i].venue.displayName, value: data.resultsPage.results.event[i].venue.id});
                }
            }
            $( "#updateVenueText" ).autocomplete( "option", "source", venueList );
    });
}

// we may not want to always store this in cookie
function setLocationWithUrl(id, name, url) {

    $("#locationText").text(name);
    $.cookie('sk_locationid', id);
    $.cookie('sk_locationName', name);
    document.title = "Showhear - Concerts in " + name;

    name = name.replace(/\//g,"");
    name = name.replace(/ /g,"-");
    name = name.replace(/--/g,"-");


    var urlString = "/area/" + id +"-"+ name;
    // console.log("name: " + name + " url: " + urlString);

    window.history.pushState("teststate", "Showhear - Concerts in " + name, url);
}

function setLocationNoUrl(id, name) {
    $("#locationText").text(name);
    $.cookie('sk_locationid', id);
    $.cookie('sk_locationName', name);
}

function setLocation(id, name) {

    var urlName = name;

    urlName = urlName.replace(/\//g,"");
    urlName = urlName.replace(/ /g,"-");
    urlName = urlName.replace(/--/g,"-");


    var urlString = "/area/" + id +"-"+ urlName;

    setLocationWithUrl(id, name, urlString)
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function updateLocationCallback(data) {
    if (data.resultsPage.totalEntries > 0) {

        setLocation(data.resultsPage.results.location[0].metroArea.id, data.resultsPage.results.location[0].metroArea.displayName);

        updateClick();
    } else {
        dialogAlert("Could not find location: " + $("#updLocationTxt").val());
    }
}

function updateLocationByString(updateString) {
    _gaq.push(['_trackEvent', 'Click', 'LocationChange']);

    // alert($("#updLocationTxt").val());
    // var updateString = $("#updLocationTxt").val();

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
            searchQuery = "query="+updateString;
            $.getJSON("http://api.songkick.com/api/3.0/search/locations.json?"+ searchQuery+"&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
            function (data) {
                updateLocationCallback(data);
            });
        }
    }

    $( "#dialog" ).dialog( "close" );

    // alert(getLocationQueryString());
}

function updateLocation() {
    clearVenueFilter(false);
    updateLocationByString($("#updLocationTxt").val());
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

    if ($("#server-venueid").get(0).value) {
        console.log("preset venue");
        venueId = $("#server-venueid").get(0).value;

        // TODO will this error out if there are no events?
        $.getJSON('http://api.songkick.com/api/3.0/venues/'+venueId+'/calendar.json?apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?',
            function (data) {
                setVenueText(data.resultsPage.results.event[0].venue.displayName)
                // $("#venueFilter").text(data.resultsPage.results.event[0].venue.displayName);
                $("#locationText").text(data.resultsPage.results.event[0].venue.metroArea.displayName);
                $.cookie('sk_locationid', data.resultsPage.results.event[0].venue.metroArea.id);
                $.cookie('sk_locationName', data.resultsPage.results.event[0].venue.metroArea.displayName);

                populateVenueList();
               
        });
        return;
    }

    if ($("#server-AreaId").get(0).value) {
        var name = $("#server-Area").get(0).value;
        var dashPos = name.indexOf("-");
        name = name.substring(dashPos + 1);

        // console.log("the name " + name);
        // var locString = $("#server-AreaId").get(0).value
        setLocationWithUrl($("#server-AreaId").get(0).value, name, $("#server-Area").get(0).value);
        return;
    }


    if ($("#server-Area").get(0).value) {
        updateLocationByString($("#server-Area").get(0).value);
        // updateLocationByString("seattle");
        return;
    }


    // console.log("url lookup loc");
    $.getJSON("http://api.songkick.com/api/3.0/search/locations.json?location=clientip&apikey=bUMFhmMfaIpxiUgJ&jsoncallback=?",
    function (data) {
        $("#locationText").html();
        setLocationWithUrl(data.resultsPage.results.location[0].metroArea.id, data.resultsPage.results.location[0].metroArea.displayName, "");
    });
}

function updateClick() {
// alert("date: " + $.datepicker.formatDate('yy', $( "#to" ).datepicker( "getDate" )));
    useGenreFilter();
    // venueId = "";
    //$("#playlistNav").empty();
    setLoadingEvents();
    preLoadEventSKID = null;
    totalArtists = 0;
    shownArtists = 0;
    artistIndex = 0;
    eventIndex = 0;
    //document.getElementById("playlistInfo").innerHTML = "Loading...";
    queryId = s4();
    pagesProcessed = 0;
    songkickQueryInfo.nextPage = 2;
    // $("#loading-results-message").show();

    if (venueId) {
        console.log("venue query");
        getSongkickEventPageTemp("/venues/"+venueId+"/calendar.json?&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "",
                1,songkickEventIterator, queryId, songkickEventErrorCallback);
    } else {
        populateVenueList();
        getSongkickEventPageTemp("/events.json?"+getLocationQueryString() +"&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "",
                1,songkickEventIterator, queryId, songkickEventErrorCallback);
    }
}

function songkickUpdateClick() {

    //document.getElementById("playlistInfo").innerHTML = "Loading...";

    if ( $.cookie('songkickUser')) {
        useGenreFilter();
        //$("#playlistNav").empty();
        setLoadingEvents();
        preLoadEventSKID = null;
        totalArtists = 0;
        shownArtists = 0;
        artistIndex = 0;
        eventIndex = 0;
        queryId = s4();
        pagesProcessed = 0;
        songkickQueryInfo.nextPage = 2;
        getSongkickEventPageTemp(buildSongkickUserQuery($.cookie('songkickUser')), 1, songkickUserIterator, queryId, songkickUserErrorCallback);
    } else {
        console.log("no songkick user");
    }
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
    // TODO BUG Giving errors, possibly because it is called before completely loaded?
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
    var nowPlayingIcon = $(".sprite-icons-Speaker-Square");
    if (nowPlayingIcon) {
        nowPlayingIcon.removeClass("sprite-icons-Speaker-Square");
        nowPlayingIcon.addClass("sprite-icons-Play-Button");
    }

    divScrollTo($(".media_item").get(eventIndex));

    myDiv.className += " playing";

    // var artistName = myDiv.innerHTML;

    var newPlayingIcon = $(myDiv).children(".sprite-icons-Play-Button");
    // alert($(myDiv).children(".ui-state-default").children(".ui-icon-play").length + " test " + $(myDiv).children(".artist_name").length);
    newPlayingIcon.addClass("sprite-icons-Speaker-Square");
    newPlayingIcon.removeClass("sprite-icons-Play-Button");

    var artistName = $(myDiv).children(".artist_name").get(0).innerHTML;
    var artistURI = $(myDiv).children(".artistURI").get(0).value;
    var artistID = $(myDiv).children(".songkickID").get(0).value;
    var showVenue = $(myDiv).children(".venue").get(0).value;
    var showDate = $(myDiv).children(".playing-Date").get(0).value;
    var showDayWeek = $(myDiv).children(".playing-Day-Week").get(0).value;

    var myYoutubeID = $(myDiv).children(".artistYoutubeID").get(0).value;

    var songkickEventURI = $(myDiv).children(".songkickEventURI").get(0).value;
    var showHotlinkURI = $(myDiv).children(".showHotlinkURI").get(0).value;

    // console.log("ytlink= " + myYoutubeID +"!");

    $("#issue-artist-name").val(artistName);
    $("#issue-artist-video-id").val(myYoutubeID);

    //alert(artistName);

    if (playerLoaded) {
        if (autoStart) {
            console.log("play video");
            // player.loadVideoById(myYoutubeID, 0, 'small');
            jQuery("#youtube-player-container")
               .tubeplayer("play", myYoutubeID);
        } else {
            // player.cueVideoById(myYoutubeID, 0, 'small');
            jQuery("#youtube-player-container")
               .tubeplayer("cue", myYoutubeID);
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

    updatePlayingInfo(artistName, artistURI, artistID, showVenue, showDate, showDayWeek, showHotlinkURI, songkickEventURI);

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

function useGenreFilter() {
    if ($.cookie('genreFilter')) {
        
        if ($(".searchToggleActive").attr('id') == "areaDateTab") {
            // console.log("use genre filter");
            return true;
        }
    }

    // console.log("don't use genre filter");
    return false;
}

var lfm_artistCache = [];

// assumes this has already been cached
function addLastFMInfo(artistName, targetElement, targetEvent, targetContainer) {
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
                            if (artistNode.artist.tags.tag[i].name.indexOf($.cookie('genreFilter')) != -1) {
                                // targetElement.className += " badgenre";

                                // TODO if we add here this will not preserve ordering. should probably create a dummy div for these to reside in
                                // if (!targetElemnt.parent.parent.parent) {
                                if ($(targetElement).parents('.upcoming-events').length) {
                                } else {
                                    targetEvent.appendTo(targetContainer);
                                    $(".artist_item:nth-child(even)").addClass('artist_alternate');
                                    $("#no-events-message").hide();
                                }
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
                        if (artistNode.artist.tags.tag.name.indexOf($.cookie('genreFilter')) != -1) {
                            // targetElement.className += " badgenre";

                            // TODO if we add here this will not preserve ordering. should probably create a dummy div for these to reside in
                            // if (!targetElemnt.parent.parent.parent) {

                            // } 
                            if ($(targetElement).parents('.upcoming-events').length) {
                            } else {
                                targetEvent.appendTo(targetContainer);
                                $(".artist_item:nth-child(even)").addClass('artist_alternate');
                            }              
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

var addLastFMInfoCallbackByMBID = function(searchString, targetELement, targetEvent, targetContainer) {
    return function (data) {

        if (!(data.artist)) {
            console.log("songkick mbid but no lastfm?");
        }

        // alert('mbid?');

        lfm_artistCache[searchString] = data;
        addLastFMInfo(searchString, targetELement, targetEvent, targetContainer);
    };
};


var addLastFMInfoCallback = function(searchString, targetELement, targetEvent, targetContainer) {
    return function (data) {

        lfm_artistCache[searchString] = data;
        addLastFMInfo(searchString, targetELement, targetEvent, targetContainer);

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

// function buildEventHotlink()

var numGenreAdd = 0;
// dummy comment is this working?
function addArtistDivElement(targetNode, sk_artistNode, targetEvent, targetContainer, sk_eventNode) {
    var artistName = sk_artistNode.displayName;

    var dateString = $.datepicker.formatDate("MM dd", $.datepicker.parseDate("yy-mm-dd", sk_eventNode.start.date));
    var dayWeekString = $.datepicker.formatDate("DD", $.datepicker.parseDate("yy-mm-dd", sk_eventNode.start.date));

    if (sk_eventNode.start.time) {
        // console.log("time is: " + Date.parse(sk_eventNode.start.time).toString("hh:mm tt"));
        dayWeekString += " " + Date.parse(sk_eventNode.start.time).toString("h:mm tt");
    }

    var hotlinkText = sk_eventNode.displayName;
    hotlinkText = hotlinkText.replace(/\//g,"");
    hotlinkText = hotlinkText.replace(/ /g,"-");
    hotlinkText = hotlinkText.replace(/--/g,"-");

    var hotlink = "event/" + sk_eventNode.id + "-" + hotlinkText;

    var artists = [
    {
        artistName: sk_artistNode.displayName, 
        songkickID: sk_artistNode.artist.id,
        artistURI: sk_artistNode.artist.uri,
        youtubeID: sk_artistNode.artist.youtubeID,
        showVenue: sk_eventNode.venue.displayName,
        showDayOfWeek: dayWeekString,
        showDate: dateString,
        showHotlinkURI: hotlink,
        songkickEventURI: sk_eventNode.uri
    }
    ];

    var myArtistTmpl;

    if (sk_artistNode.artist.youtubeID) {
        myArtistTmpl = $('#artist_item_template').tmpl(artists);
    } else {
        myArtistTmpl = $('#artist_item_no_vid_template').tmpl(artists);
    }

    myArtistTmpl.appendTo(targetNode)

    var artistGenreTmpl = myArtistTmpl.children(".artist_genre").get(0);

    if (lfm_artistCache[artistName]) {
        // alert(artistName + ' cached!');
        addLastFMInfo(artistName, artistGenreTmpl, targetEvent, targetContainer);
    } else {

        if (sk_artistNode.artist.identifier.length > 0) {
            JSONQuery("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=" + sk_artistNode.artist.identifier[0].mbid + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
                addLastFMInfoCallbackByMBID(artistName, artistGenreTmpl, targetEvent, targetContainer)
            );
        } else {
            // TODO we can query by musicbrainz id instead of searching by artist name. this could give slightly better results but we will still
            // likely need the fallback
            JSONQuery("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + encodeLastFMParam(artistName) + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
                addLastFMInfoCallback(artistName, artistGenreTmpl, targetEvent, targetContainer)
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
    var dateString = $.datepicker.formatDate("DD, MM dd", $.datepicker.parseDate("yy-mm-dd", sk_eventNode.start.date));

    var eventInfo = [
    {   date: dateString,
        venue: sk_eventNode.venue.displayName,
        eventPermalink:"event2/" + sk_eventNode.id,
        skEventURI: sk_eventNode.uri }
    ];

    var myEventTmpl = $('#event_item').tmpl(eventInfo);

    var MAX_ARTISTS = 10;

    for (var j = 0; (j < sk_eventNode.performance.length) && (j<MAX_ARTISTS); j++) {
        addArtistDivElement(myEventTmpl.children(".event_artist_list").get(0), sk_eventNode.performance[j], myEventTmpl, targetNode, sk_eventNode);
    }

    if (sk_eventNode.performance.length >= MAX_ARTISTS) {

    }

    // root item
    // $(".upcoming-events").get(0).appendChild(eventNode);
    // targetNode.appendChild(eventNode);

    // TODO this assumes that the event is within the users area and default date range
    // we should check the event info first and then build our initial SK query based on that
    if (preLoadEventSKID && (sk_eventNode.id == preLoadEventSKID)) {
        // alert('our event: ' + myEventTmpl.html());
        myEventTmpl.prependTo($(".sk_page_container_1"));
        // alert("found our event" + myEventTmpl.find(".artist_item").get(0).innerHTML );
        // alert($(eventNode).children(".artist_item").get(0).innerHTML);
        selectPlaying(myEventTmpl.find(".valid_video").get(0), false);
        // selectPlaying()
    } else {

        if (useGenreFilter() == false) {
            myEventTmpl.appendTo(targetNode);
        }
    }

    $(".artist_item:nth-child(even)").addClass('artist_alternate');
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

function buildSongkickUserQuery(user) {

    var userTrackType = $(".songkick-Toggle-Active").children(".queryType").get(0).value;
    // console.log("songkick radio= " + userTrackType);

    var userTrackValue;

    if (userTrackType == "artist") {
        userTrackValue = "tracked_artist";
    } else if (userTrackType == "event") {
        userTrackValue = "attendance";
    } else {
        userTrackValue = "tracked_artist";
        console.log("invalid usertracktype");
    }

    var url = "/users/"+user+"/calendar.json"

    var parameters = {
        apikey : "bUMFhmMfaIpxiUgJ",
        reason: userTrackValue,
        jsoncallback: "?"
    };

    return url + "?" + $.param(parameters);
}

function getVenueId() {

}

function checkVenueListById(id) {
    for (var i = 0; i< venueList.length; i++) {
        if (venueList[i].value == id) {
            return true;
        }
    }
    return false;
}

function songkickEventIterator(data, pageNumber) {

    for (var i = 0; i < data.resultsPage.results.event.length; i++) {

        // if (!(venueList[data.resultsPage.results.event[i].venue.metroArea.id])) {
        //     venueList[data.resultsPage.results.event[i].venue.metroArea.id] = {};
        // }

        // if (!(venueList[data.resultsPage.results.event[i].venue.metroArea.id][data.resultsPage.results.event[i].venue.id])) {

        // }

        // TODO venues are only pulled in as the result set is called up leaving some venues missing
        // ideal would be to check all results and then get venues from those
        // if (!checkVenueListById(data.resultsPage.results.event[i].venue.id)){
        //     venueList.push({label:data.resultsPage.results.event[i].venue.displayName, value: data.resultsPage.results.event[i].venue.id});
        // }

        if (venueId != "") {
            // TODO is probably more efficient to get the venue calendar and fitler by date
            if (venueId == data.resultsPage.results.event[i].venue.id) {
                addEventDivElement(data.resultsPage.results.event[i], $(".sk_page_container_" + pageNumber).get(0));
            }
        } else {
            addEventDivElement(data.resultsPage.results.event[i], $(".sk_page_container_" + pageNumber).get(0));
        }
    }

    // $( "#updateVenueText" ).autocomplete( "option", "source", venueList );

}

function songkickUserIterator(data, pageNumber) {

    for (var i = 0; i < data.resultsPage.results.calendarEntry.length; i++) {
        addEventDivElement(data.resultsPage.results.calendarEntry[i].event, $(".sk_page_container_" + pageNumber).get(0));
    }    
}

function songkickEventErrorCallback(data, myQueryId) {
    clearLoadingEvents();
    console.log("no data");
    // $("#no-events-message").show();
    displayErrorMessage("No concerts found in that area and date range.");
}

function songkickUserErrorCallback(data, myQueryId) {
    clearLoadingEvents();
    console.log("no data");
    var userTrackType = $(".songkick-Toggle-Active").children(".queryType").get(0).value;
    // console.log("songkick radio= " + userTrackType);

    if (myQueryId != queryId) {
        console.log("query expired, this: " + myQueryId + " global: " + queryId);
        return;
    }

    // TODO will this cause issues if they change tabs/actions midclick?
    if (userTrackType == "artist") {
        displayErrorMessage("No tracked artists or locations found for selected user.");
    } else if (userTrackType == "event") {
        displayErrorMessage("No events found for selected user.");
    } else {
        displayErrorMessage("Unknown error.");
    }
    // $("#no-events-message").show();
}

var songkickQueryInfo = {
    query: "",
    nextPage: 2,
    loadedPage: "",
    maxPages: "",
    myQueryId: "",
    eventIterator: "",
    errorCallback: ""
}

function checkScrollLoad() {
    if ($(".event-container")[0].scrollHeight - $(".event-container").height() - $(".event-container").scrollTop()  < 800) {
        // console.log("scroll to bottm next: " + songkickQueryInfo.nextPage + " loaded " + songkickQueryInfo.loadedPage + " max " + songkickQueryInfo.maxPages);
        if ((songkickQueryInfo.nextPage - 1 == songkickQueryInfo.loadedPage) 
            && (songkickQueryInfo.nextPage <= songkickQueryInfo.maxPages)) {
            console.log("load next page");
            getSongkickEventPageTemp(songkickQueryInfo.query, songkickQueryInfo.nextPage, 
                songkickQueryInfo.eventIterator, songkickQueryInfo.myQueryId, songkickQueryInfo.errorCallback);
            songkickQueryInfo.nextPage++;
        }
    }
}

function getSongkickEventPageTemp(query, pageNumber, eventIterator, myQueryId, errorCallback) {

    // TODO create divs for each result page so that the order is deterministic/chronological

    // location hardcoded to austin 9179
    // $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&"+getLocationQueryString()+"&page=" + pageNumber + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
    $.getJSON(query + "&page=" + pageNumber,
    function (data) {

        songkickQueryInfo.query = query;
        songkickQueryInfo.myQueryId = myQueryId;
        songkickQueryInfo.eventIterator = eventIterator;
        songkickQueryInfo.errorCallback = errorCallback;
        songkickQueryInfo.loadedPage = pageNumber;

        if (myQueryId != queryId) {
            console.log("query expired, this: " + myQueryId + " global: " + queryId);
            return;
        }
        // $("#loading-results-message").hide();

        // console.log("result: " + data.resultsPage.status);

        if (data.resultsPage.status === "error") {

            if (data.resultsPage.error.message === "User not found") {
                console.log("no user");
                displayErrorMessage("Could not find a user by that name");
            } else if (data.resultsPage.error.message === "Parameter 'min_date' must be less than or equal to 'max_date'.") {
                displayErrorMessage("Invalid date range");
            } else {
                displayErrorMessage("Unknown Error.");
            }
            return;
        }

        if (data.resultsPage.totalEntries == 0) {
            errorCallback(data, myQueryId);

            return;
        }

        pagesProcessed++;

        var totalPages = Math.ceil(data.resultsPage.totalEntries / data.resultsPage.perPage);
        songkickQueryInfo.maxPages = totalPages;
        // console.log("entries: "+ data.resultsPage.totalEntries + ", pages: " + totalPages );

        if (pageNumber == 1) {
            clearLoadingEvents();

            // create a container for each page
            // result page indexes start at 1
            for (var i = 1; i <= totalPages; i++) {
                var containerNode = document.createElement('div');
                containerNode.className = "sk_page_container_" + i;

                $(".upcoming-events").get(0).appendChild(containerNode);
            }

            if (totalPages > 1) {

                // We have more results to query
                // TODO this does not preserve page ordering, do we need it?

                for (var i = 2; i <= totalPages; i++) {
                    // getSongkickEventPageTemp(query, i, eventIterator, myQueryId, errorCallback);
                }
            }

            // 
        }


        //var playlistNav = document.getElementById("playlistNav");
        eventIterator(data, pageNumber);

        // TOOD this may have intersting behavior with genre filtering
        checkScrollLoad();

        // TODO this should be done after all of our lastfm queries return
        if (pagesProcessed == totalPages) {
            $("#loading-more-results").hide();
            $("#loading-results-message").hide();

            // TODO BUG this should wait for all lastfm queries to return
            // TODO different message for when it doesn't pass genre filter?
            if ($(".media_item").length == 0) {
                console.log("no items in list!");
                
                displayErrorMessage("Nothing matched your genre search.");
            } 

        } else {
            if ($(".media_item").length > 0) {
                $("#loading-results-message").hide();
                $("#loading-more-results").show();
            } else {
                $("#loading-results-message").show();
                $("#loading-more-results").hide();
            }
        }

        // TODO this should be cued and done in a better location and shouild only cue the video
        if (!preLoadEventSKID) {
            if(loadVideoOnUpdate) {
                if ($(".valid_video").get(0)) {
                    // console.log("set initial playing");
                    loadVideoOnUpdate = false;
                    selectPlaying($(".valid_video").get(0), false);
                }
            }
        }
        

        // TODO bug- for some reason the preload event isn't scrolling properly, this will mostly fix, though 
        // incoming lastfm info will push the data slightly past. not a huge issue for smaller resultsets

        // divScrollTo($(".media_item").get(eventIndex));

        // document.getElementById("playlistInfo").innerHTML = "Showing " + shownArtists + " of " + totalArtists + " artists";
        //alert('end json');
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    //event.target.playVideo();
    playerLoaded = true;
    // loadVideoOnUpdate = true;

    if (initialVideoId) {
        // TODO should autostart on load be toggleable?
        // player.cueVideoById(initialVideoId, 0, 'small');
        jQuery("#youtube-player-container")
       .tubeplayer("cue", initialVideoId);
    }
}


function onPlayerReady2() {
    //event.target.playVideo();
    playerLoaded = true;
    // loadVideoOnUpdate = true;

    if (initialVideoId) {
        // TODO should autostart on load be toggleable?
        // player.cueVideoById(initialVideoId, 0, 'small');
        jQuery("#youtube-player-container")
       .tubeplayer("cue", initialVideoId);
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
        videoEnded();
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

var autoplayCount = 0;

function videoEnded() {
    _gaq.push(['_trackEvent', 'Auto', '1 play']);

    // autoplayCount++;

    // if (autoplayCount >=10) {
    //     autoplayCount -= 10;
    //     _gaq.push(['_trackEvent', 'Auto', '10 plays']);
    // }
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

    var nowPlayingDiv = $(".artist_item.playing");

    if (nowPlayingDiv) {



        nextDiv = $(nowPlayingDiv).next(".valid_video").get(0);
        // console.log(nextDiv.innerHTML);

        console.log($(".valid_video").index(nowPlayingDiv));

        var myIndex = $(".valid_video").index(nowPlayingDiv);

        $(".valid_video").get(myIndex + 1);

        selectPlaying($(".valid_video").get(myIndex + 1), true);
    } else {
        selectPlaying($(".valid_video").get(0), true);
    }

    // selectPlaying($(".media_item:eq(" + eventIndex + ") .event_artist_list .artist_item").get(artistIndex), true);

}

function populateArtistInfo(artistName) {
    // location hardcoded to austin id:9179
    // TODO can we encode this better?
//     artistName = artistName.replace("&amp;","%26");
//     // console.log("our artist after replace: " + artistName);

//     $('#info_shows').empty();
//     $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&"+getLocationQueryString()+"&artist_name=" + artistName + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",
//     // $.getJSON("http://api.songkick.com/api/3.0/events.json?apikey=bUMFhmMfaIpxiUgJ&location=sk:9179&artist_name=" + artistName + "&min_date=" + getMinDate() + "&max_date=" + getMaxDate() + "&jsoncallback=?",        
//     function (data) {
//         //var text = "<b>Events:</b>";
//         var eventItems = [];
//         // data is JSON response object
//         //alert(text + );

//         for (var i = 0; i < data.resultsPage.results.event.length; i++) {
//             var eventNode = data.resultsPage.results.event[i];
//             // text += "<br/>" + data.resultsPage.results.event[i].displayName + "<br/>";
//             // for (var j = 0; j < data.resultsPage.results.event[i].performance.length; j++) {
//             //     var iartistName = data.resultsPage.results.event[i].performance[j].displayName;

//             //     eventItems

//             //     //text += iartistName + "&nbsp;";
//             // }

//             eventItems[i] = { eventName: eventNode.displayName
//                             , songkickURI: eventNode.uri
//                             , eventPermalink:"?skEventId=" + eventNode.id};
//             //text = text + data.resultsPage.results.event[i].displayName + " NEXT: ";

//         }

// // eventItems = [
// //             {eventName: "test1"},
// //             {eventName: "test1"},
// //             ];

//         var myGenreTmpl = $('#info_event').tmpl(eventItems);
//         myGenreTmpl.appendTo($('#info_shows'));

//     });
}

function encodeLastFMParam(param) {
    var returnParam = param;
    returnParam = returnParam.replace(/amp;/g,"and");
    returnParam = returnParam.replace(/&/g,"and");
    returnParam = returnParam.replace(/#/g,"%23");
    return returnParam;
}

function populateLastFMInfo(artistNode) {
    var targetElement = $("#info_lastfm").get(0);

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

                        if (i < 3) {
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

            // TODO we could do this for all tags at once if we build the array first
            // var myLinkTmpl = $('#artist_lastfm_link').tmpl(linkInfo);
            // $("#info_artist").append(myLinkTmpl);
        } else {
            console.log("no last.fm tags for artist");
        }

        if (artistNode.artist.image) {
            // assume our size is the 2nd index
            if (artistNode.artist.image[1].size != "medium") {
                console.log("warning last.fm image index assertion false!");
            }

            
            $("#info_image").attr("src", artistNode.artist.image[1]["#text"]);

        } else {
            console.log("no lastfm image!");
            $("#info_image").attr("src", "/images/missing_artist.png");
        }
        // var myLinkTmpl = $('#artist_lastfm_link').tmpl(linkInfo);
        // $("#info_artist").append(myLinkTmpl);
        $('#infoLastfmLink').get(0).href = artistNode.artist.url;
        $('#infoLastfmLink').removeClass("missingLink");
    } else {
        // if ()
        $('#infoLastfmLink').removeAttr("href");
        $('#infoLastfmLink').addClass("missingLink");
        // $('#infoLastfmLink').removeClass().addClass()
    }
}


function updatePlayingInfo(artistName, artistURI, artistID, showVenue, showDate, showDayWeek, showHotlinkURI, songkickEventURI ) {
    // alert(artistName);
    $("#info_artist").html(artistName);
    var targetElement = $("#info_lastfm").get(0);
    $("#info_lastfm").empty();

    // TODO we should find a better placeholder image
    $("#info_image").attr("src", "/images/missing_artist.png");
    // $("#info_image").css("visibility", "hidden");

    $("#info_artist").empty();
    var myArtistInfo = { artistName: artistName, songkickURI: artistURI, hotlinkURI: showHotlinkURI}

    var myGenreTmpl = $('#info_artist_tmpl').tmpl(myArtistInfo);
    myGenreTmpl.appendTo($('#info_artist'));

    var eventinfo = {
        eventURI: songkickEventURI,
        eventName: showVenue
    }
    $("#playing-Info-Venue").empty();
    var myEventTmpl = $('#info-event-tmpl').tmpl(eventinfo);
    myEventTmpl.appendTo($('#playing-Info-Venue'));

    $("#playing-Info-Day").html(showDayWeek);
    $("#playing-Info-Date").html(showDate);

    $("#infoSongkickLink").get(0).href = artistURI;

    updateAddThisLink(showHotlinkURI, "I found a concert on ShowHear.com - " + artistName + " is playing at " + showVenue);

//     console.log("st: " + $("#share-This-Link").attr("st_url"));

//     $("#share-This-Link").attr("st_url", "www.showhear.com");

//     console.log("st: " + $("#share-This-Link").attr("st_url"));

//     stButtons.locateElements();

// $.ajax({  
//     url: 'http://w.sharethis.com/button/buttons.js',  
//     dataType: 'script',  
//     success: function(){  
//     stLight.options({  
//     publisher: 'd49b6181-578c-46bc-970d-0b490763df23',  
//     onhover: false  
//     });  
//     },  
//     cache: true  
// });  

    // populateArtistInfo(artistName);

    // TODO bug, artist doesn't seem to be cached if there is an amperstand ("&") in their name
    var artistNode = lfm_artistCache[artistName];


    // Edge case- our initial artist loaded will not have the last.fm info by the time we get here
    // we could somehow wait for that to complete or just update it here
    if (!artistNode) {
        console.log("artist not cached");

        // TODO ideally we should query this by MBID first
        JSONQuery("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + encodeLastFMParam(artistName) + "&api_key=7921cb7aae6b8b280672b0fd74207d4b&format=json",
            function (data) {
                populateLastFMInfo(data);
            }
        );
        return;
    } else {
        populateLastFMInfo(artistNode);
    }


}

function clickAreaDateSearch() {
    $("#songkickTab").removeClass("searchToggleActive");
    $("#songkickTabIcon").removeClass("sprite-icons-SongKick-Nav-Logo-White").addClass("sprite-icons-SongKick-Nav-Logo-Gray");
    $("#songkickTabArrow").css('visibility', 'hidden');

    $("#areaDateTab").addClass("searchToggleActive");
    $("#areaDateTabIcon").removeClass("sprite-icons-Nav-Button-Calendar-Gray").addClass("sprite-icons-Calendar---White");
    $("#areaDateTabArrow").css('visibility', 'visible');

    $("#tabs-1").show();
    $("#tabs-2").hide();
    
    updateClick()

    // updateSongkickTabClick();
}

function clickSongkickSearch() {
    $("#areaDateTab").removeClass("searchToggleActive");
    $("#areaDateTabIcon").addClass("sprite-icons-Nav-Button-Calendar-Gray").removeClass("sprite-icons-Calendar---White");
    $("#areaDateTabArrow").css('visibility', 'hidden');

    $("#songkickTab").addClass("searchToggleActive");
    $("#songkickTabIcon").addClass("sprite-icons-SongKick-Nav-Logo-White").removeClass("sprite-icons-SongKick-Nav-Logo-Gray");
    $("#songkickTabArrow").css('visibility', 'visible');

    $("#tabs-1").hide();
    $("#tabs-2").show();


    songkickUpdateClick();
    // updateSongkickTabClick();
}

function skqSelectArtist() {
    $("#skqEvent").removeClass("songkick-Toggle-Active");
    $("#skqArtist").addClass("songkick-Toggle-Active");
    updateSongkickTabClick();
}

function skqSelectEvent() {
    $("#skqArtist").removeClass("songkick-Toggle-Active");
    $("#skqEvent").addClass("songkick-Toggle-Active");
    updateSongkickTabClick();
}

function updateSongkickQueryClick() {
    var queryType = $(".songkick-Toggle-Active").children(".queryType").get(0).value;
    console.log("updateSongkickQuery: " + queryType);
    $("#songkickUser").text($("#updateSongkickText").val());
    $("#genreFilter").text($("#updateGenreText").val());

    if ($("#updateSongkickText").val() != "") {
        $.cookie('songkickUser', $("#updateSongkickText").val());
        $( "#songkickUserDialog" ).dialog( "close" );
        songkickUpdateClick();
    } else {
        clearSongkickUser();
    }

}

function clearSongkickUser() {
    $.removeCookie('songkickUser');
    $("#songkickUser").text("(None)");
}

function updateSongkickTabClick() {
    songkickUpdateClick();
}

function setLoadingEvents() {
    $(".upcoming-events").empty();
    $("#no-events-message").hide();
    // $(".upcoming-events").html("Loading...");
    $("#loading-results-message").show();
    $("#loading-more-results").hide();
}

function clearLoadingEvents() {
    $(".upcoming-events").empty();
    $("#loading-results-message").hide();
}


function dateTestClick() {
    console.log("test clicker");
    $("#from").toggle();
}

function dateFromSpanClick() {
    $("#from").toggle();
    setDialogPositions();
    // if ($("#from").is(":visible")) {
    //     console.log("from visible");

    //     $( "#from" ).bind('clickoutside',function() {
    //         $( "#from" ).hide();
    //     });

    //     $( "#from" ).show();
    // } else 
    // {
    //     console.log("from invisible");
    //     $( "#from" ).unbind('clickoutside');
    // }

    
}

function dateToSpanClick() {
    $("#to").toggle();
}

function setClickFunctions() {
    $("#fromSpan").click(dateFromSpanClick);
    $("#toSpan").click(dateToSpanClick);
}

function displayErrorMessage(message) {
    $("#no-events-message").show();
    $("#loading-results-message").hide();
    $("#loading-more-results").hide();
    $("#error-message-details").text(message);

}

function updateAddThisLink(url, title) {
    addthis.update('share', 'url', document.location.hostname +'/' + url); // new url
    addthis.update('share', 'title', title); // new url
    // addthis.update();
    addthis.ready();
}

function submitVideoIssue() {
    var url = "/artistissue?artist=" + $("#issue-artist-name").val() + "&videoid=" + $("#issue-artist-video-id").val();
    if ($("#issue-artist-message").val()) {
        url += "&msg=" + $("#issue-artist-message").val();
    }
    $.post( url, {}); 

    $("#video-issue-dialog").dialog("close");
    dialogAlert("Thank you for your feedback!");
}

function dialogAlert(message) {
    $("#dialog-alert-message").html(message);
    $("#alertDialog").dialog("open");
}