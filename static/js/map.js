class GoogleMap {
    constructor(forecast) {
        this.forecast = forecast;
    }
    display() {
        window.addEventListener("load", async() => {
            const geocoder = new google.maps.Geocoder();
            // Try HTML5 geolocation.
            const coords = await GoogleMap.getCurrentPosition();
            this.forecast.update(coords);
            // The map, centered at User
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 10,
                center: this.forecast.coords,
            });
            const marker = new google.maps.Marker({
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: this.forecast.coords,
                map: map,
            });
            google.maps.event.addListener(marker, "dragstart", async() => {
                marker.setAnimation(3); // raise
            });
            google.maps.event.addListener(marker, 'dragend', async() => {
                marker.setAnimation(4); // fall
                const coords = {
                    lat: marker.getPosition().lat(),
                    lng: marker.getPosition().lng()
                }
                this.forecast.update(coords);
                this.forecast.updateCurrentWeather();
            });
            map.setCenter(this.forecast.coords);
            marker.setPosition(this.forecast.coords);

        });
    }

    static getLocationName(coords) {
        /** Perform reverse geocoding using given coordinates */
        let locationName;
        const geocoder = new google.maps.Geocoder();
        const response = new Promise(resolve => {
            geocoder.geocode({ location: coords },
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
        return response;
    }

    static getCurrentPosition() {
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
                    () => reject('Error: Could not get current postion.'));
            } else {
                reject('Error: Could not get current postion.');
            }
        })
    }
}