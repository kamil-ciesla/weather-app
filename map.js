var latitude = null;
var longitude = null;
let marker
var city_name = null

// Initialize and add the map
function initMap() {
    const geocoder = new google.maps.Geocoder();
    // The location of User
    const user = {
        lat: 50.064651,
        lng: 19.944981
    };
    // The map, centered at User
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: user,
    });

    marker = new google.maps.Marker({
        draggable: true,
        animation: google.maps.Animation.DROP,
        position: user,
        map: map,
    });

    google.maps.event.addListener(marker, "dragstart", function(ev) {
        marker.setAnimation(3); // raise
    });

    google.maps.event.addListener(marker, 'dragend', async function(ev) {
        marker.setAnimation(4); // fall
        latitude = marker.getPosition().lat();
        longitude = marker.getPosition().lng();
        let locationName = await getLocationName(geocoder);
        console.log(locationName);
        updateLocation(latitude, longitude, locationName);
    });


    infoWindow = new google.maps.InfoWindow(); // what for?
    window.addEventListener("load", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    infoWindow.open(map);
                    map.setCenter(pos);


                    marker.setPosition(pos)
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                }
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
}

function getLocationName(geocoder) { //reverse geocoding
    city_name = null;
    const latlng = { //coordinates
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
    };
    return new Promise(resolve => {
        geocoder.geocode({ location: latlng },
            (results, status) => {
                if (status === "OK") {
                    if (results[0]) {
                        if (results[0].address_components[2].types[0] == "locality") { //different types of cities
                            city_name = results[0].address_components[2].long_name
                        } else if (results[0].address_components[1].types[0] == "locality") {
                            city_name = results[0].address_components[1].long_name
                        } else if (results[0].address_components[3].types[0] == "locality") {
                            city_name = results[0].address_components[3].long_name
                        } else if (results[0].address_components[4].types[0] == "locality") {
                            city_name = results[0].address_components[4].long_name
                        } else if (results[0].address_components[2].types[0] == "postal_town") {
                            city_name = results[0].address_components[2].long_name
                        } else if (results[0].address_components[3].types[0] == "postal_town") {
                            city_name = results[0].address_components[3].long_name
                        }
                    } else {
                        //console.log("No results found");
                    }
                } else {
                    //conslole.log("Geocoder failed due to: " + status);
                }
                resolve(city_name);
            }
        );
    })
}