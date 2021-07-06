class Forecast {
    constructor(apiKey, language, units) {
        this.apiKey = apiKey;
        const langFromSession = this.restoreLangFromSession();
        this.language = langFromSession ? langFromSession : language;

        this.units = units;
        this.defaultCoords = {
            lat: 0,
            lng: 0
        }
        this.locationName;
        this.hourlyChart;
        this.oneCallData;
        this.airPollutionData;
        this.map;

    }
    changeLang(language) {
        this.language = language;
        this.saveLangInSession();
        this.update();
    }
    saveLangInSession() {
        window.sessionStorage.setItem('lang', this.language);
    }
    restoreLangFromSession() {
        return window.sessionStorage.getItem('lang');
    }
    async getOneCallData(coords) {
        const oneCallLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lng}&lang=${this.language}&units=${this.units}&appid=${this.apiKey}`;
        const oneCallResponse = await fetch(oneCallLink);
        const oneCallData = await oneCallResponse.json();
        return oneCallData;
    }
    async getAirPollutionData(coords) {
        const airPollutionLink = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lng}&appid=${this.apiKey}`;
        const airPollutionResponse = await fetch(airPollutionLink);
        const airPollutionData = await airPollutionResponse.json();
        return airPollutionData;
    }
    saveCoordsInSession(coords) {
        window.sessionStorage.setItem('coords', coords.lat + ',' + coords.lng);
    }
    async geolocateByName(locationName) {
        const apiLink = `http://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${this.apiKey}`;
        const apiResponse = await fetch(apiLink);
        const apiData = await apiResponse.json();
        const coords = {
            "lat": apiData['coord']['lat'],
            'lng': apiData['coord']['lon']
        }
        return coords;
    }
    getCoordsFromSession() {
        const sessionCords = window.sessionStorage.getItem('coords');
        if (sessionCords) {
            const splittedCoords = (sessionCords.split(','));
            const coords = {
                lat: parseFloat(splittedCoords[0]),
                lng: parseFloat(splittedCoords[1]),
            }
            return coords;
        } else {
            throw new Error("No coordinates saved on session");
        }
    }
    async getUserCoords() {
        const coords = await GoogleMap.getUserCoords();
        if (coords) {
            return coords;
        } else {
            throw new Error("Could not get user's position.");
        }
    }
    getDefaultCoords() {
        return this.defaultCoords;
    }
    async getCoords() {
        let coords;
        const locationName = $('#location_name').attr('data');
        if (locationName) {
            coords = await this.geolocateByName(locationName);
            this.saveCoordsInSession(coords);
        } else {
            try {
                coords = this.getCoordsFromSession();
            } catch (error) {
                try {
                    coords = await this.getUserCoords();
                    this.saveCoordsInSession(coords);
                } catch (error) {
                    coords = this.getDefaultCoords();
                    this.saveCoordsInSession(coords);
                }
            }
        }
        return coords;
    }
    async update() {
        const coords = await this.getCoords();
        this.displayCurrentWeather(coords);
        const pageName = $('#page_name').attr('data');
        switch (pageName) {
            case 'hourly':
                this.displayHourlyChart(coords);
                break;
            case 'seven-days':
                this.displaySevenDays(coords);
                break;
            case 'air-pollution':
                this.displayAirPollution(coords);
                break;
            case 'map':
                if (this.map == null) {
                    this.displayMap(coords);
                }
                break;
        }
    }
    async displayCurrentWeather(coords) {
        const data = await this.getOneCallData(coords);
        const temp = data.current.temp.toFixed(1);
        const iconURL = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
        const description = data.current.weather[0].description;
        const sunrise = new Date(data.current.sunrise * 1000);
        const sunset = new Date(data.current.sunset * 1000);
        let locationName = await GoogleMap.getLocationName(coords);
        if (locationName) {
            $('#location-name').text(locationName);
        } else {
            $('#location-name').text('Name undefined');
        }
        $('#forecast-icon').src = iconURL;
        $('#coords').text(`${coords.lat.toPrecision(4)}, ${coords.lng.toPrecision(4)}`);
        $('#forecast-temperature').text(`${temp}°C`);
        $('#description').text(description);
        $('#forecast-pressure').text(data.current.pressure);
        $('#forecast-wind-speed').text(data.current.wind_speed);
        $('#forecast-humidity').text(`${data.current.humidity}%`);
        $('#sunrise').text(`${('0' + sunrise.getHours()).slice(-2)}:${('0' + sunrise.getMinutes()).slice(-2)}`);
        $('#sunset').text(`${('0' + sunset.getHours()).slice(-2)}:${('0' + sunset.getMinutes()).slice(-2)}`);
    }
    async displaySevenDays(coords) {
        const data = await this.getOneCallData(coords);
        console.log(data);
        const forecastDays = data.daily;
        const date = new Date();
        const today = date.getDay();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        for (let i = 1; i <= 7; i++) {
            const dayName = $('<div></div>');
            dayName.addClass("day-name");
            dayName.html(`${weekdays[(today + i) % 7]}`);

            const dayTemp = $('<div></div>');
            dayTemp.addClass("day-temp");
            dayTemp.html(`Day: ${forecastDays[i].temp.day}°C`);

            const nightTemp = $('<div></div>');
            nightTemp.addClass("night-temp ");
            nightTemp.html(`Night: ${forecastDays[i].temp.night}°C`);

            const icon = $('<img>');
            icon.addClass("forecast-icon img-responsive");
            const iconURL = `http://openweathermap.org/img/wn/${forecastDays[i].weather[0].icon}@2x.png`;
            icon.attr('src', iconURL);

            const day = $(`#day-${i}`);
            day.append(dayName);
            day.append(icon);
            day.append(dayTemp);
            day.append(nightTemp);
        }
    }
    async displayAirPollution(coords) {
        const data = await this.getAirPollutionData(coords);
        const airQualityIndex = ['Good', 'Fair', 'Moderate', 'Poor', 'Very poor'];
        const airQuality = airQualityIndex[data.list[0].main.aqi];
        $('#air-quality').html(`Air quality: ${airQuality}`);
        $('#co').html(`${data.list[0].components.co} μg/m3`);
        $('#no').html(`${data.list[0].components.no} μg/m3`);
        $('#no2').html(`${data.list[0].components.no2} μg/m3`);
        $('#o3').html(`${data.list[0].components.o3} μg/m3`);
        $('#so2').html(`${data.list[0].components.so2} μg/m3`);
        $('#pm2_5').html(`${data.list[0].components.pm2_5} μg/m3`);
        $('#pm10').html(`${data.list[0].components.pm10} μg/m3`);
        $('#nh3').html(`${data.list[0].components.nh3} μg/m3`);
    }
    async displayHourlyChart(coords) {
        const data = await this.getOneCallData(coords);
        if (this.hourlyChart) {
            this.hourlyChart.destroy();
        }
        const hoursX = [];
        const tempsY = [];
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        for (let i = 0; i < 24; i++) {
            tempsY.push(data.hourly[i].temp.toFixed(2));
            if (i + currentHour <= 24) {
                hoursX.push(i + currentHour);
            } else {
                hoursX.push(i + currentHour - 24);
            }
        }
        const ctx = document.getElementById('hourly-chart-canvas').getContext('2d');
        Chart.defaults.global.defaultFontColor = "#fff";
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hoursX,
                datasets: [{
                    label: 'Temperature [°C]',
                    data: tempsY,
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                    borderColor: 'rgba(199, 62, 99, 1)',
                    borderWidth: 1,
                },],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return value + '°C';
                            },
                        },
                    },],
                },
            },
        })
    }
    async displayMap(coords) {
        this.map = new GoogleMap(this);
        this.map.display(coords);
    }
}