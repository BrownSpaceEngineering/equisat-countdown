// hide everything at the beginning so there's no weird loading choppiness
$("#pre-launch").hide();
$("#pre-deployment").hide();
$("#deployed").hide();

const issIcon = "images/icons/iss-icon_white.png";

let pvd, map, marker;
let mapInited = false;

var prevLatlng;

function drawISSPath(latlng, map) {
    if(prevLatlng == undefined) {
        prevLatlng = latlng;
    }
    issPath = new google.maps.Polyline({
        path: [prevLatlng, latlng],
        strokeColor: "#a6c8de",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    prevLatlng = latlng;
    issPath.setMap(map);
};

// will be called when the maps API is initialized
function initMap() {    

    pvd = new google.maps.LatLng(41.826684, -71.398011);
    // create map, centered on PVD in case of failure
    map = new google.maps.Map(document.getElementById('map'), {
        center: pvd,
        zoom: 4,   
        minZoom: 3,
        streetViewControl: false,
        zoomControl: true,
        fullscreenControl: false,
        draggable: false,        
        mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        draggableCursor:'',
        styles: [{"featureType":"all","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"},{"saturation":"-100"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40},{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#19222a"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#2b343e"}]},{"featureType":"landscape","elementType":"geometry.stroke","stylers":[{"color":"#2b343e"}]},{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"color":"#2b343e"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"lightness":21}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#2b343e"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#257bcb"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#d7dee5"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#d7dee5"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#2b343e"},{"lightness":"52"},{"weight":"1"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#2b343e"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#2b343e"},{"lightness":"14"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#2b343e"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#2b343e"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#2b343e"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#19222a"},{"lightness":19}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#2b3638"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#2b3638"},{"lightness":17}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#19222a"}]},{"featureType":"water","elementType":"geometry.stroke","stylers":[{"color":"#24282b"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.icon","stylers":[{"visibility":"off"}]}]
    });
    // get ISS altitude and velocity
    $.get("https://api.wheretheiss.at/v1/satellites/25544", (res) => {
        let infowindow;
        // set up ISS marker on map
        if (!res || res.name !== "iss" || !res.altitude || !res.velocity) {
            console.log("something went wrong: " + JSON.stringify(res, null, 2));
            infowindow = new google.maps.InfoWindow({
                content: `<p>This is the current location of the International Space Station.</p>
                <p>EQUiSat is on board, awaiting deployment sometime early this summer.</p>`
            });
        } else {
            infowindow = new google.maps.InfoWindow({
                content: `<p>This is the current location of the International Space Station.</p>
                <p>EQUiSat is on board, awaiting deployment sometime early this summer.</p>
                <p>The station is currently ${Math.floor(res.altitude)} km above sea level, traveling at ${Math.floor(res.velocity)} km/hr.</p>`
            });
        }
        marker = new google.maps.Marker({
            position: pvd,
            icon: issIcon,
            map: map
        });
        marker.addListener('mouseover', function() {
            infowindow.open(map, marker);
        });
        marker.addListener('mouseout', function () {
            infowindow.close();
        });
        mapInited = true;
    });
}

// Start the countdown here
var endYEAR = 2018
var endMONTH = 5
var endDAY = 20
var endHOUR = 5
var endMINUTE = 4
var endSECOND = 0

var now = new Date();
var endDate = new Date(endYEAR, endMONTH-1, endDAY, endHOUR, endMINUTE, endSECOND);

var delta = (endDate.getTime() - now.getTime())/ 1000;
var days = Math.floor(delta / (60*60*24));
var hours = Math.floor((delta - (days*24*60*60))/(60*60));
var minutes = Math.floor((delta - (days*24*60 *60) - (hours*60*60))/60);		
var seconds = Math.floor(delta - (days*24*60 *60) - (hours*60*60) - (minutes * 60));

$('.cd100').countdown100({
    /*Set Endtime here*/
    /*Endtime must be > current time*/
    endtimeYear: 0,
    endtimeMonth: 0,
    endtimeDate: days,
    endtimeHours: hours,
    endtimeMinutes: minutes,
    endtimeSeconds: seconds,
    timeZone: ""
    // ex:  timeZone: "America/New_York"
    //go to " http://momentjs.com/timezone/ " to get timezone
});

$('.js-tilt').tilt({
    scale: 1.1
});

$(document).ready(() => {
    let launch = new Date("2018-05-20T09:04:00");    

    // to see what the post-launch page will look like, uncomment the line below
    //launch = new Date("2018-04-03T00:00:01");
    let deployment = new Date("2018-06-20T09:04:00");

    // preiodically check if it's launched or deployed
    setInterval(() => {
        let now = new Date();
        if (now < launch) {
            // pre-launch, hide everything other than the countdown
            $("#pre-launch").show();
        } else if (now >= launch && now < deployment) {
            // pre-deployment, hide the countdown and the webapp            
            $("#pre-deployment").show();            

            // now continually update the location of the ISS on the map
            $.get("http://api.open-notify.org/iss-now.json", (res) => {
                if (!res.message || res.message !== "success") {
                    console.log("something went wrong: " + res.message);
                    if (!mapInited) {
                        $("#map").html("<p>Something went wrong tracking the ISS. Please reload this page.</p>");
                    }
                } else {
                    let lat = parseFloat(res.iss_position.latitude);
                    let lng = parseFloat(res.iss_position.longitude);
                    let pos = new google.maps.LatLng(lat, lng);
                    // adjust map
                    if (mapInited) {
                        marker.setPosition(pos);
                        map.setCenter(pos);
                        drawISSPath(pos, map)
                    }
                }
            });
        } else {
            // post-deployment, TODO: redirect to the webapp
            $("#titles").hide();
            $("#deployed").show();
        }
    }, 1000);
});