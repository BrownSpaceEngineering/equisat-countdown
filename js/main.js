// hide everything at the beginning so there's no weird loading choppiness
$("#pre-launch").hide();
$("#pre-deployment").hide();
$("#deployed").hide();

const issIcon = "images/icons/iss-icon.png";

let pvd, map, marker;
let mapInited = false;
// will be called when the maps API is initialized
function initMap() {
    pvd = new google.maps.LatLng(41.826684, -71.398011);
    // create map, centered on PVD in case of failure
    map = new google.maps.Map(document.getElementById('map'), {
        center: pvd,
        zoom: 3
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
                <p>The station is currently ${Math.floor(res.altitude)} km above sea level, traveling at ${Math.floor(res.velocity)} kmph.</p>`
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
var endMINUTE = 0 
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
            $("#title").html("EQUISAT HAS LAUNCHED");
            $("#subtitle").html("EQUiSat has launched and is currently awaiting deployment on the International Space Station");
            $("#pre-deployment").show();
            $(".bg-img1")[0].style["background-image"] = "url('images/iss.jpg')";

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