/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */



var map;
var infowindow;

//LocalStorage items
var str = localStorage.getItem('placesChecked');
var searchRadius = localStorage.getItem('range');
var user_name = localStorage.getItem("user_name");
var logged_in = localStorage.getItem("logged_in");

//console.log(localStorage.getItem("logged_in"));
//console.log(localStorage.getItem("user_name"));

var placeType = str.split(",");

//Debug purposes
//console.log("What we are searching: " + placeType);
//console.log("What radius we are searching: " + searchRadius);


function initMap() {

    //Fallback coords, somewhere near hellsinki center
    var lat =  60.170014;
    var longi = 24.938466;
    var location = {lat: lat, lng: longi};
    map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        mapTypeControl: false,
        zoom: 16
    });

    
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

        //Set own position to localstorage, used to calculate distance between you <---> marker
        localStorage.setItem("ownLatPos", position.coords.latitude);
        localStorage.setItem("ownLongiPos", position.coords.longitude);
        //own position info-window, not in use. Found it useless.
        //var infoWindow = new google.maps.InfoWindow({map: map});
        //infoWindow.setPosition(pos);

        // Own-position marker
        var ownPositionPin = new google.maps.Marker({
            position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude), 
            map: map,
            icon: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
        });

        //infoWindow.setContent('Your location.');
        //setTimeout(function () { infoWindow.close(); }, 5000);

        map.setCenter(pos);
        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
            location: pos,
            openNow: true, // Do not show places that are currently closed
            radius: searchRadius,            
            types: placeType
            }, callback);   
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}


function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
        }
    }
}

//Create map-marker + add link to open googlemaps with venue for easy navigation
function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location

    });


    //When you open marker, do fancy stuff
    google.maps.event.addListener(marker, 'click', function() {

        var distance = calculateDistance(place.geometry.location);

        var rating = "<br>User rating not available";
        if (place.rating){
            rating = '<br>User rating: ' + place.rating;
        }
        
        // placeid for place, used to fetch more details from the place.
        var request = {
            placeId: place.place_id
          };

          service = new google.maps.places.PlacesService(map);
          service.getDetails(request, callback);       
        // Json muodossa yhden paikan tiedot
        // https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJVY9r-NQLkkYRsDf3XftSWoM&key=AIzaSyCKO21Z8YZ_bHId3PhuAOMRhXBVb08Qgu0   

        function callback(placeInfo, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {

            var date = new Date();

            // Remove one from weekday_text array to get opening for correct day if day is not sunday
            var weekday_text = placeInfo.opening_hours.weekday_text[date.getDay()-1];
            // Places weekday_text array goes from mon-sun, 0...6, add +6 if day is sunday
            if (date.getDay() == 0) {
                weekday_text = placeInfo.opening_hours.weekday_text[date.getDay()+6];
            }


            
            // Infowindow content
            var contentString = "<a href="+ placeInfo.url +"><h3>" + place.name + 
            "</h3></a>Distance: " + Math.round(distance) + "m" + rating +
            "<br>" + weekday_text +
            "<br><a href=" + placeInfo.website + ">Website</a><br>";

            infowindow.setContent(contentString);

            }   
        }
      
        infowindow.open(map, this);

    });
}

function calculateDistance(placeLocation) {

    var ownLocation = new google.maps.LatLng(localStorage.getItem("ownLatPos"), localStorage.getItem("ownLongiPos"));
    var markerLocation = new google.maps.LatLng(placeLocation.lat(), placeLocation.lng());
    var distance = google.maps.geometry.spherical.computeDistanceBetween (ownLocation, markerLocation);

    return distance;

}

/* Settings page javascripts */

// Populate settings based. Fetch data from localStorage
function populateSettings(){

    var str = localStorage.getItem('placesChecked');
    var placesCheckedLocalStorage = str.split(',');    
    var placesChecked = document.forms[0];
    var i;    
    var x;
    var search_range_value = localStorage.getItem('range');

    $("#search_range").attr("value", search_range_value);
    $("#search_range").slider("refresh");
    
    for (i = 0; i < placesChecked.length; i++) {
        for (x = 0; x < placesCheckedLocalStorage.length; x++) {
            if (placesCheckedLocalStorage[x] == placesChecked[i].value){
                //console.log('Found in localStorage: ' + placesCheckedLocalStorage[x]);                               
                $("#" + placesCheckedLocalStorage[x]).prop('checked', true);
                $("#" + placesCheckedLocalStorage[x]).checkboxradio("refresh");
            }
        }
    }
}


//Saves settings and go to start screen
function saveSettings(){ 
    
    var placesCheckedLocalStorage = []; 
    var oneCheckboxIsChecked = $("input[type='checkbox']").is(":checked");

    

    //If atleast one checkbox is checked, save settings and redirect to frontpage.
    if (oneCheckboxIsChecked){
        //Find all checkboxes that are checked, push them to array.
        var placesChecked = document.forms[0];
        for (var i = 0; i < placesChecked.length; i++) {
            if (placesChecked[i].checked) {
                placesCheckedLocalStorage.push(placesChecked[i].value);            
            }
        }

        //Save settings, redirect to frontpage
        if (typeof(Storage) !== 'undefined') {
            localStorage.setItem('placesChecked', placesCheckedLocalStorage);
            localStorage.setItem('range', document.getElementById('search_range').value);
        } else {
            alert("Can't save to local device, check storage settings");               
        }

        window.location='./index.html';

    } else {
        alert("Can't save settings, please select atleast one type of place you would like to have lunch");
    }

}


/* Index page stuff */

document.addEventListener("deviceready", function() {
   
    //Ohjelma crashaa ekassa launchissa jos navigator.geolocation ei ole devicereadyssä, syystä että: _________
    //console.log(device.uuid);
    navigator.geolocation.getCurrentPosition(onSuccess, onError);


}, false);


function firstRunSetup(){

    //Check if you can use localStorage.
    if (typeof(Storage) !== 'undefined') {
        //First time running app, place some settings.
            if (localStorage.getItem("firstRunSetup") != 1){
                localStorage.setItem("firstRunSetup", 1);
                localStorage.setItem("range", 500);
                localStorage.setItem("placesChecked", "restaurant");
                localStorage.setItem("logged_in", 0);
                localStorage.setItem("user_name", "Null");
                
                //Move user to modify settings at first run ONLY
                window.location='./settings.html';
             }
        
    } else {

        alert('Cant save settings, no web storage support');   

    } 
   
    
}

// Get location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
        return true;
    } else { 
        return false;
    }
}

function showPosition(position) {
    //console.log(position.coords.latitude + " " + position.coords.longitude);
    //Currently not in use, but maybe add as in fallback?
    if (typeof(Storage) !== 'undefined') {
        localStorage.setItem("lastKnownLat", position.coords.latitude);
        localStorage.setItem("lastKnownLongi", position.coords.longitude);
    }
}



$(document).on("pagecontainershow", function( event, ui ) { //Mikä tahansa sivu näytetään.    

    var toPage = ui.toPage[0].id;

    if(toPage=="homepage"){
        var logged_in = localStorage.getItem("logged_in");

        if (logged_in == 1) {
            $("#button_login_popup").hide();
            $("#user_window").html("<span class='tausta'>Welcome user: " + localStorage.getItem("user_name") + "</span>");
            $("#button_logout").show();
        }



    }

    //Save settings
    $("#button_save_settings").tap(function(){
        saveSettings();
    });

    //Redirect to map-page
    $("#button_show_map").tap(function(){
        window.location='./main.html';  
    });

    //Redirect to settings
    $("#button_settings").tap(function(){
        window.location='./settings.html';
    });

    //Redirect to register
    $("#button_register").tap(function(){
        window.location='./register.html';
    });
    //Redirect to front
    $("#button_back_to_main").tap(function(){
        window.location='./index.html';
    });





    $("#button_login").on("tap", function() {
        var username =$("#un").val();
        var password =$("#pw").val();
        if(username.length>0&&password.length>0){    
            $.ajax({                    
                url:"http://www.korpisoturit.com/backend/login.php?user=" + username+ "&pass="+password+"",
                        success:function(result){
                        var message = "";                        
                        var parsed_data = JSON.parse(result);     

                        //console.log(parsed_data);
                        if (parsed_data == "false"){
                             $("#error_message").html("<font color='red'>Check username and password</font>");
                        }  
                        else {
                            $.each(parsed_data, function (index, item) {
                                message = "<span class='tausta'>Welcome user: " + item.name + "</span>";
                                $("#user_window").html(message);
                                $("#error_message").html("");
                                $("#popupLogin").popup("close");
                                $("#button_login_popup").hide();
                                $("#button_logout").show();
                                var logged_in = 1;
                                user_name = item.name;
                                localStorage.setItem("logged_in", logged_in);
                                localStorage.setItem("user_name", user_name);
                                });
                           
                        }

                    }
            });

        }
    });

    $("#button_logout").tap(function(event){
        localStorage.setItem("logged_in", 0);
        localStorage.removeItem("user_name");
        $("#button_logout").hide();
        event.preventDefault();
        $("#button_login_popup").show();
        $("#user_window").html("");
    });
            
});


