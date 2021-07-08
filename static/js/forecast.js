class Forecast {
    constructor(apiKey, lang, units) {
        this.apiKey = apiKey;
        const langFromSession = this.restoreLangFromSession();
        this.currentLang = langFromSession ? langFromSession : lang;

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
        this.langsData = {
            "pl": {
                "hourly": "24 godziny",
                "sevenDays": "7 dni",
                "search": "Szukaj",
                "airPollution": "Czystość powietrza",
                "map": "Mapa",
                "pressure": "Ciśnienie:",
                "wind": "Wiatr:",
                "humidity": "Wilgotność:",
                "sunrise": "Wschód:",
                "sunset": "Zachód:",
                "weekdays": ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
                "day": "Dzień",
                "night": 'Noc',
                "airQuality": "Jakość powietrza",
                "airQualityIndex": ['Bardzo wysoka', 'Wysoka', 'Średnia', 'Niska', 'Bardzo niska'],
                "particlesLongNames": {
                    "co": "Tlenek węgla",
                    "no": "Tlenek azotu",
                    "no2": "Dwutlenek azotu",
                    "o3": "Ozon",
                    "so2": "Dwutlenek siarki",
                    "pm2_5": "Pyły drobne",
                    "pm10": "Pyły gruboziarniste",
                    "nh3": "Amoniak",
                },
                "locationUnknown": "Nieznana lokalizacja",
                "pop": "Szansa opadów",


            },
            "eng": {
                "hourly": "Hourly",
                "sevenDays": "7 days",
                "search": "Search",
                "airPollution": "Air Pollution",
                "map": "Map",
                "pressure": "Pressure:",
                "wind": "Wind:",
                "humidity": "Humidity:",
                "sunrise": "Sunrise:",
                "sunset": "Sunset:",
                "weekdays": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                "day": "Day",
                "night": 'Night',
                "airQuality": "Air quality",
                "airQualityIndex": ['Good', 'Fair', 'Moderate', 'Poor', 'Very poor'],
                "particlesLongNames": {
                    "co": "Carbon monoxide",
                    "no": "Nitrogen monoxide",
                    "no2": "Nitrogen dioxide",
                    "o3": "Ozone",
                    "so2": "Sulphur dioxide",
                    "pm2_5": "Fine particles matter",
                    "pm10": "Coarse particulate matter",
                    "nh3": "Ammonia",
                },
                "locationUnknown": "Location unknown",
                "pop": "Probability of precipation",

            }
        }
        this.currentLangData = this.langsData[this.currentLang];


    }
    changeLang(lang) {
        this.currentLang = lang;
        this.saveLangInSession();
        this.currentLangData = this.langsData[this.currentLang];
        const pageName = $('#page_name').attr('data');
        if(pageName=="map"){
            location.reload();
        }
        this.update();

    }
    saveLangInSession() {
        window.sessionStorage.setItem('lang', this.currentLang);
    }
    restoreLangFromSession() {
        return window.sessionStorage.getItem('lang');
    }

    displayLangComponents() {
        const data = this.currentLangData;
        //menu 
        $('#hourly-chart-button').children('a').eq(0).text(data['hourly']);
        $('#seven-days-button').children('a').eq(0).text(data['sevenDays']);
        $('#search-button').text(data['search']);
        $('#air-pollution-button').children('a').eq(0).text(data['airPollution']);
        $('#map-button').children('a').eq(0).text(data['map']);
        //current weather 
        $('.forecast-pressure-col').eq(0).children('.data-name').eq(0).text(data['pressure']);
        $('.forecast-wind-speed-col').eq(0).children('.data-name').eq(0).text(data['wind']);
        $('.forecast-humidity-col').eq(0).children('.data-name').eq(0).text(data['humidity']);
        $('.sunrise-col').eq(0).children('.data-name').eq(0).text(data['sunrise']);
        $('.sunset-col').eq(0).children('.data-name').eq(0).text(data['sunset']);

    }
    async getOneCallData(coords) {
        const oneCallLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lng}&lang=${this.currentLang}&units=${this.units}&appid=${this.apiKey}`;
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
        this.displayLangComponents();
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
            $('#location-name').text(this.currentLangData['locationUnknown']);
        }
        $('#forecast-icon').src = iconURL;
        $('#coords').text(`${coords.lat.toPrecision(4)}, ${coords.lng.toPrecision(4)}`);
        $('#forecast-temperature').text(`${Math.round(temp)}°C`);
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
        const weekdays = this.currentLangData['weekdays'];
        for (let i = 1; i <= 7; i++) {
            const dayName = $('<div></div>');
            dayName.addClass("day-name");
            dayName.html(`${weekdays[(today + i) % 7]}`);

            const dayTemp = $('<div></div>');
            dayTemp.addClass("day-temp");
            dayTemp.html(`${this.currentLangData['day']}: ${Math.round(forecastDays[i].temp.day)}°C`);

            const nightTemp = $('<div></div>');
            nightTemp.addClass("night-temp ");
            nightTemp.html(`${this.currentLangData['night']}: ${Math.round(forecastDays[i].temp.night)}°C`);

            const pop = $('<div></div>');
            pop.addClass("pop");
            pop.html(`${this.currentLangData['pop']}: ${Math.round(forecastDays[i].pop * 100)}%`);

            const precipation = $('<div></div>');
            precipation.addClass("precipation");
            if (forecastDays[i].rain) {
                precipation.html(`${forecastDays[i].rain} mm`);
            } else {
                precipation.html(`---`);
            }

            const icon = $('<img>');
            icon.addClass("forecast-icon img-responsive");
            const iconURL = `http://openweathermap.org/img/wn/${forecastDays[i].weather[0].icon}@2x.png`;
            icon.attr('src', iconURL);

            const day = $(`#day-${i}`);
            day.html('');//reset day html
            day.append(icon);
            day.append(dayName);
            day.append(dayTemp);
            day.append(nightTemp);
            day.append(pop);
            day.append(precipation);

        }
    }
    async displayAirPollution(coords) {
        const data = await this.getAirPollutionData(coords);
        const airQualityIndex = this.currentLangData['airQualityIndex'];
        const airQuality = airQualityIndex[data.list[0].main.aqi];
        $('#air-quality').html(`${this.currentLangData['airQuality']}: ${airQuality}`);

        $('#co').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['co']);
        $('#no').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['no']);
        $('#no2').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['no2']);
        $('#o3').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['o3']);
        $('#so2').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['so2']);
        $('#pm2_5').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['pm2_5']);
        $('#pm10').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['pm10']);
        $('#nh3').children('.particle-long-name').text(this.currentLangData['particlesLongNames']['nh3']);

        $('#co').children('.particle-value').html(`${data.list[0].components.co} μg/m3`);
        $('#no').children('.particle-value').html(`${data.list[0].components.no} μg/m3`);
        $('#no2').children('.particle-value').html(`${data.list[0].components.no2} μg/m3`);
        $('#o3').children('.particle-value').html(`${data.list[0].components.o3} μg/m3`);
        $('#so2').children('.particle-value').html(`${data.list[0].components.so2} μg/m3`);
        $('#pm2_5').children('.particle-value').html(`${data.list[0].components.pm2_5} μg/m3`);
        $('#pm10').children('.particle-value').html(`${data.list[0].components.pm10} μg/m3`);
        $('#nh3').children('.particle-value').html(`${data.list[0].components.nh3} μg/m3`);
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
            tempsY.push(Math.round(data.hourly[i].temp));
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