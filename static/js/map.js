class GoogleMap {
    constructor(forecast) {
        this.forecast = forecast;
    }
    display(coords) {
        window.addEventListener("load", async() => {
            this.map = this.createMap();
            this.marker = this.createMarker();
            this.setMarkerEvents();
            this.marker.setPosition(coords);
            this.map.setCenter(coords);
        });
    }
    createMap() {
        return new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
        });
    }
    createMarker() {
        return new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            map: this.map,
        });
    }
    setMarkerEvents() {
        google.maps.event.addListener(this.marker, "dragstart", async() => {
            this.marker.setAnimation(3); // raise
        });
        google.maps.event.addListener(this.marker, 'dragend', async() => {
            this.marker.setAnimation(4); // fall
            const coords = {
                lat: this.marker.getPosition().lat(),
                lng: this.marker.getPosition().lng()
            }
            window.sessionStorage.setItem('coords', coords.lat + ',' + coords.lng);
            this.forecast.update();
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
                        try {
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
                            }
                        } catch {
                            resolve(undefined);
                        }
                        resolve(locationName);
                    }
                }
            );
        })
        return response;
    }

    static getUserCoords() {
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