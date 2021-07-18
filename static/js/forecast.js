class Forecast {
    constructor(apiKey, lang) {
        this.apiKey = apiKey;
        const langFromSession = this.restoreLangFromSession();
        this.currentLang = langFromSession ? langFromSession : lang;
        const unitsFromSession = this.restoreUnitsFromSession();
        this.units = unitsFromSession ? unitsFromSession : 'metric';
        this.defaultCoords = {
            lat: 0,
            lng: 0
        }
        this.locationName;
        this.oneCallData;
        this.airPollutionData;
        this.map;
        this.currentHourlyChart = 'temp';
        this.langsData = {
            "pl": {
                "hourly": "24 godziny",
                "sevenDays": "7 dni",
                "search": "Szukaj",
                "airPollution": "Czystość powietrza",
                "map": "Mapa",
                "precipation": "Szansa opadów",
                "rain": "Ilość opadów",
                "pressure": "Ciśnienie",
                "wind": "Wiatr",
                "humidity": "Wilgotność",
                "sunrise": "Wschód",
                "sunset": "Zachód",
                'today': 'Dzisiaj',
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
                'temp': 'Temperatura',
                'tempToggleMsg': 'Kliknij na wykres aby wyświetlić dane o opadach deszczu',
                'rainToggleMsg': 'Kliknij na wykres aby wyświetlić dane o temperaturze',

            },
            "eng": {
                "hourly": "Hourly",
                "sevenDays": "Daily",
                "search": "Search",
                "airPollution": "Air Pollution",
                "map": "Map",
                "precipation": "Precipation",
                "rain": "Rainfall",
                "pressure": "Pressure",
                "wind": "Wind",
                "humidity": "Humidity",
                "sunrise": "Sunrise",
                "sunset": "Sunset",
                'today': 'Today',
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
                'temp': 'Temperature',
                'tempToggleMsg': 'Click on the chart to display rainfall data',
                'rainToggleMsg': 'Click on the chart to display temperature data',

            }
        }
        this.unitsData = {
            'imperial': {
                'temp': '°F',
                'windSpeed': 'm/h'
            },
            'metric': {
                'temp': '°C',
                'windSpeed': 'm/s'
            },
            'standard': {
                'temp': 'K',
                'windSpeed': 'm/s'
            },
        }
        this.currentLangData = this.langsData[this.currentLang];


    }
    changeUnits(units) {
        this.units = units;
        this.saveUnitsInSession();
        this.update();
    }
    saveUnitsInSession() {
        window.sessionStorage.setItem('units', this.units);
    }
    restoreUnitsFromSession() {
        return window.sessionStorage.getItem('units');
    }
    changeLang(lang) {
        this.currentLang = lang;
        this.saveLangInSession();
        this.currentLangData = this.langsData[this.currentLang];
        const pageName = $('#page_name').attr('data');
        if (pageName == "map") {
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

        $('.precipation').find('.description').html(`${data['precipation']}: `);
        $('.rain').find('.description').html(`${data['rain']}: `);
        $('.pressure').find('.description').html(`${data['pressure']}: `);
        $('.wind').find('.description').text(`${data['wind']}: `);
        $('.humidity').find('.description').text(`${data['humidity']}: `);
        $('.sunrise').find('.description').text(`${data['sunrise']}: `);
        $('.sunset').find('.description').text(`${data['sunset']}: `);

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
        const coords = await this.getCoords();
        await this.displayCurrentWeather(coords);
        this.displayLangComponents();
        const pageName = $('#page_name').attr('data');
        switch (pageName) {
            case 'hourly':
                this.displayHourlyTemp(coords);
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
    getDaysInThisMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), 2, 0).getDate();
    }
    async displayCurrentWeather(coords) {
        const data = await this.getOneCallData(coords);
        const iconURL = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
        let locationName = await GoogleMap.getLocationName(coords);
        locationName = locationName ? locationName : this.currentLangData['locationUnknown'];
        const date = this.currentLangData['today'];
        const tempUnit = this.unitsData[this.units]['temp']
        const temp = `${Math.round(data.daily[0].temp.day)} / ${Math.round(data.daily[0].temp.night)} ${tempUnit}`;
        const weatherDescription = data.current.weather[0].description;
        const precipation = `${Math.round(data.daily[0].pop * 100)} %`;
        const rain = data.current.rain ? `${data.current.rain['1h']} mm` : `--.-- mm`;
        const pressure = `${data.current.pressure} hPa`;
        const windSpeedUnit = this.unitsData[this.units]['windSpeed'];
        const wind = `${data.current.wind_speed} ${windSpeedUnit}`;
        const humidity = `${data.current.humidity} %`;
        const rawSunrise = new Date(data.current.sunrise * 1000);
        const rawSunset = new Date(data.current.sunset * 1000);
        const sunrise = `${('0' + rawSunrise.getHours()).slice(-2)}:${('0' + rawSunrise.getMinutes()).slice(-2)}`;
        const sunset = `${('0' + rawSunset.getHours()).slice(-2)}:${('0' + rawSunset.getMinutes()).slice(-2)}`;
        const currentWeather = $('#current-weather');

        currentWeather.children('.weather-icon').attr('src', iconURL);
        currentWeather.children('.location-name').find('.value').html(locationName);
        currentWeather.children('.date').find('.value').html(date);
        currentWeather.children('.temp').find('.value').html(temp);
        currentWeather.children('.weather-description').find('.value').html(weatherDescription);
        currentWeather.children('.precipation').find('.value').html(precipation);
        currentWeather.children('.rain').find('.value').html(rain);
        currentWeather.children('.pressure').find('.value').html(pressure);
        currentWeather.children('.wind').find('.value').html(wind);
        currentWeather.children('.humidity').find('.value').html(humidity);
        currentWeather.children('.sunrise').find('.value').html(sunrise);
        currentWeather.children('.sunset').find('.value').html(sunset);
    }
    async displaySevenDays(coords) {
        const data = await this.getOneCallData(coords);
        const rawDate = new Date();
        const weekdays = this.currentLangData['weekdays'];
        const daysInThisMonth = new Date(rawDate.getFullYear(), rawDate.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= 7; i++) {
            const iconURL = `http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`;
            const day = $(`#day-${i}`).html('');
            const dayName = weekdays[(rawDate.getDay() + i) % 7];
            let dayInMonth = (rawDate.getDate() + i);
            if (dayInMonth > daysInThisMonth) {
                dayInMonth -= daysInThisMonth;
            }
            const date = `${dayName} ${dayInMonth}`;
            const weatherDescription = data.daily[i].weather[0].description;
            const tempUnit = this.unitsData[this.units]['temp']
            const dayNightTemp = `${Math.round(data.daily[i].temp.day)} / ${Math.round(data.daily[i].temp.night)} ${tempUnit}`;
            const precipation = `${Math.round(data.daily[i].pop * 100)} %`;
            const rain = data.daily[i].rain ? `${data.daily[i].rain} mm` : `--.-- mm`;
            const pressure = `${data.daily[i].pressure} hPa`;
            const windSpeedUnit = this.unitsData[this.units]['windSpeed'];
            const windSpeed = `${data.daily[i].wind_speed} ${windSpeedUnit}`;
            const humidity = `${data.daily[i].humidity} %`;
            const rawSunrise = new Date(data.daily[i].sunrise * 1000);
            const rawSunset = new Date(data.daily[i].sunset * 1000);
            const sunrise = `${('0' + rawSunrise.getHours()).slice(-2)}:${('0' + rawSunrise.getMinutes()).slice(-2)}`;
            const sunset = `${('0' + rawSunset.getHours()).slice(-2)}:${('0' + rawSunset.getMinutes()).slice(-2)}`;

            day.append($('<img>').addClass("forecast-icon img-responsive").attr('src', iconURL));
            day.append($('<div></div>').addClass('date').html(date));
            day.append($('<div></div>').addClass('day-night-temp').html(dayNightTemp));
            day.append($('<div></div>').addClass('weather-description').html(weatherDescription));
            day.append($('<div></div>').addClass('precipation').html(precipation));
            day.append($('<div></div>').addClass('rain').html(rain));
            day.append($('<div></div>').addClass('pressure').html(pressure));
            day.append($('<div></div>').addClass('windSpeed').html(windSpeed));
            day.append($('<div></div>').addClass('humidity').html(humidity));
            day.append($('<div></div>').addClass('sunrise').html(sunrise));
            day.append($('<div></div>').addClass('sunset').html(sunset));
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
    async displayHourlyTemp(coords) {
        const data = await this.getOneCallData(coords);
        if (this.hourlyChart) {
            this.hourlyChart.destroy();
        }
        const hoursX = [];
        const tempsY = [];
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        for (let i = 0; i < 24; i++) {
            tempsY.push(data.hourly[i].temp);
            if (i + currentHour <= 24) {
                hoursX.push(i + currentHour);
            } else {
                hoursX.push(i + currentHour - 24);
            }
        }
        const ctx = document.getElementById('hourly-chart-canvas').getContext('2d');
        Chart.defaults.global.defaultFontColor = "#fff";
        this.hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hoursX,
                datasets: [{
                    label: `${this.currentLangData['temp']} [${this.unitsData[this.units]['temp']}] (${this.currentLangData['tempToggleMsg']})`,
                    data: tempsY,
                    backgroundColor: 'rgba(150, 57, 103, 0.25)',
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1,
                    tempUnit: this.unitsData[this.units]['temp'],
                },],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function (value, index, values) {
                                return value;
                            },
                        },
                    },],
                    xAxes:[{
                        ticks:{
                            callback:function(value){
                                return `${value}:00`;
                            }
                        }
                    },]
                },
                tooltips:{
                    callbacks:{
                        title: function() {
                            return '';
                          },
                        label: function() {
                            return '';
                          },
                        afterLabel: function(tooltipItem, data) {
                            const dataset = data['datasets'][0];
                            const temp = Math.round(dataset['data'][tooltipItem['index']]);
                            const tempUnit = dataset['tempUnit'];
                            return `${temp} ${tempUnit}`;
                          }
                    },
                    bodyFontSize:22,
                },
                legend:{
                    labels:{
                        fontSize:18,
                    },

                }
            },
        })
    }
    async displayHourlyRain(coords) {
        
        const data = await this.getOneCallData(coords);
        
        const hoursX = [];
        const rainY = [];
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        for (let i = 0; i < 24; i++) {
            const rain = data.hourly[i].rain ? data.hourly[i].rain['1h'] : 0;
            rainY.push(rain);
            if (i + currentHour <= 24) {
                hoursX.push(i + currentHour);
            } else {
                hoursX.push(i + currentHour - 24);
            }
        }
        const ctx = document.getElementById('hourly-chart-canvas').getContext('2d');
        Chart.defaults.global.defaultFontColor = "#fff";
         this.hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hoursX,
                datasets: [{
                    label: `${this.currentLangData['rain']} [mm] (${this.currentLangData['rainToggleMsg']})`,
                    data: rainY,
                    backgroundColor: 'rgba(39, 52, 99, 0.45)',
                    borderColor: 'rgba(255, 255, 255, 1)',
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
                                return value;
                            },
                        },
                    },],
                    xAxes:[{
                        ticks:{
                            callback:function(value){
                                return `${value}:00`;
                            }
                        }
                    },]
                },
                tooltips:{
                    callbacks:{
                        title: function() {
                            return '';
                          },
                        label: function() {
                            return '';
                          },
                        afterLabel: function(tooltipItem, data) {
                            const dataset = data['datasets'][0];
                            const temp = dataset['data'][tooltipItem['index']];
                            const rainUnit = dataset['rainUnit'];
                            return `${temp} mm`;
                          }
                    },
                    bodyFontSize:22,
                },
                legend:{
                    labels:{
                        fontSize:18,
                    },

                }
            },
        })
    }
    async toggleHourlyChart() {
        if (this.hourlyChart) {
            this.hourlyChart.destroy();
        }
        const coords = await this.getCoords();
        if(this.currentHourlyChart=='rain'){
            this.displayHourlyTemp(coords);
            this.currentHourlyChart = 'temp';
        }
        else if(this.currentHourlyChart=='temp'){
            this.displayHourlyRain(coords);
            this.currentHourlyChart = 'rain';
        }

    }

    async displayMap(coords) {
        this.map = new GoogleMap(this);
        this.map.display(coords);
    }
}
