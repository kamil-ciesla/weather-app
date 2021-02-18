var latitude = null;
var longitude = null;
let marker
var placeName = null

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
        coordinates = {
            lat: latitude,
            lon: longitude
        }
        let locationName = await getLocationName(geocoder);
        updateLocation(coordinates, locationName);

    });
    window.addEventListener("load", async() => {
        // Try HTML5 geolocation.
        newCoordinates = await getCurrentPosition();
        if (newCoordinates !== null) {
            coordinates = newCoordinates;
        } else {
            console.log("Browser doesn't support Geolocation ");
        }

        map.setCenter(coordinates);
        marker.setPosition(coordinates);
        console.log(coordinates);
        // issues with two lines below
        let locationName = await getLocationName(geocoder, coordinates);
        updateLocation(coordinates, locationName);
    });
}

function getCurrentPosition() {
    return new Promise(function(resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coordinates = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    resolve(coordinates);
                },
                () => reject(null));
        } else
            reject(null);
    })
}

function getLocationName(geocoder, coordinates) { //reverse geocoding
    placeName = null;
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
                            placeName = results[0].address_components[2].long_name
                        } else if (results[0].address_components[1].types[0] == "locality") {
                            placeName = results[0].address_components[1].long_name
                        } else if (results[0].address_components[3].types[0] == "locality") {
                            placeName = results[0].address_components[3].long_name
                        } else if (results[0].address_components[4].types[0] == "locality") {
                            placeName = results[0].address_components[4].long_name
                        } else if (results[0].address_components[2].types[0] == "postal_town") {
                            placeName = results[0].address_components[2].long_name
                        } else if (results[0].address_components[3].types[0] == "postal_town") {
                            placeName = results[0].address_components[3].long_name
                        }
                    } else {
                        //console.log("No results found");
                    }
                } else {
                    //conslole.log("Geocoder failed due to: " + status);
                }
                resolve(placeName);
            }
        );
    })
}