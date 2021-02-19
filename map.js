class GoogleMap {
    constructor() {
        this.geocoder = new google.maps.Geocoder();
    }
}
// Initialize and add the map
function initMap() {
    const geocoder = new google.maps.Geocoder();
    window.addEventListener("load", async() => {
        // Try HTML5 geolocation.
        const coords = await getCurrentPosition();
        const locationName = await getLocationName(geocoder, coords);
        forecast.update(coords, locationName);

        // The map, centered at User
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: forecast.coords,
        });

        const marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: forecast.coords,
            map: map,
        });
        google.maps.event.addListener(marker, "dragstart", function(ev) {
            marker.setAnimation(3); // raise
        });

        google.maps.event.addListener(marker, 'dragend', async function(ev) {
            marker.setAnimation(4); // fall
            const coords = {
                lat: marker.getPosition().lat(),
                lng: marker.getPosition().lng()
            }
            const locationName = await getLocationName(geocoder, coords);
            forecast.update(coords, locationName);
        });
        map.setCenter(forecast.coords);
        marker.setPosition(forecast.coords);
    });
}

//reverse geocoding
function getLocationName(geocoder, coords) {
    const latlng = { //coordinates
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.lng),
    };
    return new Promise(resolve => {
        geocoder.geocode({ location: latlng },
            (results, status) => {
                if (status === "OK") {
                    if (results[0]) {
                        if (results[0].address_components[2].types[0] == "locality") { //different types of cities
                            locationName = results[0].address_components[2].long_name
                        } else if (results[0].address_components[1].types[0] == "locality") {
                            locationName = results[0].address_components[1].long_name
                        } else if (results[0].address_components[3].types[0] == "locality") {
                            locationName = results[0].address_components[3].long_name
                        } else if (results[0].address_components[4].types[0] == "locality") {
                            locationName = results[0].address_components[4].long_name
                        } else if (results[0].address_components[2].types[0] == "postal_town") {
                            locationName = results[0].address_components[2].long_name
                        } else if (results[0].address_components[3].types[0] == "postal_town") {
                            locationName = results[0].address_components[3].long_name
                        }
                    } else {
                        //console.log("No results found");
                    }
                } else {
                    //conslole.log("Geocoder failed due to: " + status);
                }
                resolve(locationName);
            }
        );
    })
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