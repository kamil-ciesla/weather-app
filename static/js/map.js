class GoogleMap {
    constructor(forecast) {

        this.forecast = forecast;
    }
    initMap() {
        window.addEventListener("load", async() => {
            // Try HTML5 geolocation.
            this.geocoder = new google.maps.Geocoder();
            const coords = await this.getCurrentPosition();
            const locationName = await this.getLocationName(this.geocoder, coords);
            this.forecast.update(coords, locationName);
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
                const locationName = await this.getLocationName(this.geocoder, coords);
                this.forecast.update(coords, locationName);
                this.forecast.updateCurrentWeather();
            });
            map.setCenter(this.forecast.coords);
            marker.setPosition(this.forecast.coords);
        });
    }

    getLocationName(geocoder, coords) {
        /** Perform reverse geocoding using given coordinates */
        let locationName;
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

    getCurrentPosition() {
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
                    () => reject(undefined));
            } else {
                reject(undefined);
            }
        })
    }
}

const apiKey = 'b8801437aa00cae409040174e8dadb7c';
const language = 'pl';
const units = 'metric';
const forecast = new Forecast(apiKey, language, units);

forecast.updateCurrentWeather()
const map = new GoogleMap(forecast);

function loadScript(src, callback) {

    var script = document.createElement("script");
    script.type = "text/javascript";
    if (callback) script.onload = callback;
    document.getElementsByTagName("head")[0].appendChild(script);
    script.src = src;
}

loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCuaCF5f_8RVyuJjZxr5O9xWSX8VKGan5E&callback=initialize&libraries=&v=weekly');

function initialize() {
    map.initMap();
}