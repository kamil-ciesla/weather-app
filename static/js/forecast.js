class Forecast {
    constructor(apiKey, language, units) {
        this.apiKey = apiKey;
        this.language = language;
        this.units = units;
        this.coords;
        this.locationName;
        this.hourlyChart;
        this.oneCallData;
        this.airPollutionData;
    }

    async getOneCallData() {
        if (this.coords == null) {
            await this.getCurrentPosition();
        }
        const oneCallLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${this.coords.lat}&lon=${this.coords.lng}&lang=${this.language}&units=${this.units}&appid=${this.apiKey}`;
        const oneCallResponse = await fetch(oneCallLink);
        const oneCallData = await oneCallResponse.json();
        return oneCallData;
    }

    async getAirPollutionData() {
        if (this.coords == null) {
            await this.getCurrentPosition();
        }
        const airPollutionLink = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${this.coords.lat}&lon=${this.coords.lng}&appid=${this.apiKey}`;
        const airPollutionResponse = await fetch(airPollutionLink);
        const airPollutionData = await airPollutionResponse.json();
        return airPollutionData;
    }
    async update(coords, locationName = false) {
        this.coords = coords;
        this.locationName = locationName ? locationName : 'Unknown location';
    }
    async getCurrentPosition() {
        if (this.coords == null) {
            this.coords = await GoogleMap.getCurrentPosition();
            if (this.coords == null) {
                console.log('NOT FOUND')
                this.coords = {
                    lat: 0,
                    lng: 0
                }
            }
        }
    }
    async updateCurrentWeather() {
        if (this.coords == null) {
            await this.getCurrentPosition();
        }
        const data = await this.getOneCallData();
        const temp = data.current.temp.toFixed(1);
        const iconURL = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
        const iconAlt = data.current.weather[0].description;
        const sunrise = new Date(data.current.sunrise * 1000);
        const sunset = new Date(data.current.sunset * 1000);
        const locationName = await GoogleMap.getLocationName(this.coords);
        $('#forecast-icon').src = iconURL;
        $('#forecast-icon').alt = iconAlt;
        $('#location-name').text(locationName);
        $('#coords').text(`${this.coords.lat.toPrecision(4)}, ${this.coords.lng.toPrecision(4)}`);
        $('#forecast-temperature').text(`${temp}°C`);
        $('#forecast-pressure').text(`Pressure: ${data.current.pressure} hPa`);
        $('#forecast-humidity').text(`Humidity: ${data.current.humidity}%`);
        $('#forecast-wind-speed').text(`Wind: ${data.current.wind_speed} mph`);
        $('#sunrise').text(`Sunrise at ${('0'+sunrise.getHours()).slice(-2)}:${('0'+sunrise.getMinutes()).slice(-2)}`);
        $('#sunset').text(`Sunset at ${('0'+sunset.getHours()).slice(-2)}:${('0'+sunset.getMinutes()).slice(-2)}`);
    }
    async displayAirPollution() {
        //concetration
        const data = await this.getAirPollutionData();
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
    async displaySevenDays() {
        if (this.coords == null) {
            await this.getCurrentPosition();
        }
        const data = await this.getOneCallData();
        const forecastDays = data.daily;
        console.log(forecastDays);
        const date = new Date();
        const today = date.getDay();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        for (let i = 1; i <= 7; i++) {
            const dayName = $('<div></div>');
            dayName.addClass("day-name col-2");
            dayName.html(`${weekdays[(today + i) % 7]}`);

            const dayTemp = $('<div></div>');
            dayTemp.addClass("day-temp col");
            dayTemp.html(`Day: ${forecastDays[i].temp.day}°C`);

            const nightTemp = $('<div></div>');
            nightTemp.addClass("night-temp col text-end");
            nightTemp.html(`Night: ${forecastDays[i].temp.night}°C`);

            const icon = $('<img>');
            icon.addClass("forecast-icon img-fluid col-1");
            const iconURL = `http://openweathermap.org/img/wn/${forecastDays[i].weather[0].icon}@2x.png`;
            icon.attr('src', iconURL);

            const day = $(`#day-${i}`);
            day.append(dayName);
            day.append(icon);
            day.append(dayTemp);
            day.append(nightTemp);

        }
    }
    async createHourlyChart() {
        const data = await this.getOneCallData();
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
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hoursX,
                datasets: [{
                    label: 'Temperature [°C]',
                    data: tempsY,
                    backgroundColor: 'rgba(255, 193, 99, 0.329)',
                    borderColor: 'rgba(255, 172, 49, 1)',
                    borderWidth: 1,
                }, ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function(value, index, values) {
                                return value + '°C';
                            },
                        },
                    }, ],
                },
            },
        })
    }
}