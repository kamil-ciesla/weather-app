    var latitude = null;
    var longitude = null;

    // Initialize and add the map
    function initMap(position) {
        // The location of Uluru
        const uluru = { lat: 50.064651, lng: 19.944981 };
        // The map, centered at Uluru
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: uluru,
        });

        marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: uluru,
            map: map,
        });

        google.maps.event.addListener(marker, "dragstart", function(ev) {
            marker.setAnimation(3); // raise
        });

        google.maps.event.addListener(marker, 'dragend', function(ev) {
            marker.setAnimation(4); // fall
            latitude = marker.getPosition().lat();
            longitude = marker.getPosition().lng();
            console.log(latitude + '   ' + longitude);
        });


        infoWindow = new google.maps.InfoWindow();
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
                        latitude = position.coords.latitude;
                        longitude = position.coords.longitude;
                        console.log(latitude + '   ' + longitude);
                        marker.setPosition(pos)
                    },
                    () => {
                        // is it working?
                        handleLocationError(true, infoWindow, map.getCenter());
                    }
                );
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }
        });
    }