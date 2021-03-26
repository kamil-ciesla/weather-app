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
        const data = await this.getAirPollutionData();
        $('#index').html(`Air quality index: ${data.list[0].main.aqi}`);
        $('#description').html(`(1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor)`);
        $('#co').html(`Сoncentration of CO (Carbon monoxide): <b>${data.list[0].components.co}</b> μg/m3`);
        $('#no').html(`Сoncentration of NO (Nitrogen monoxide): <b>${data.list[0].components.no}</b> μg/m3`);
        $('#no2').html(`Сoncentration of NO<sub>2</sub> (Nitrogen dioxide): <b>${data.list[0].components.no2}</b> μg/m3`);
        $('#o3').html(`Сoncentration of O<sub>3</sub> (Ozone): <b>${data.list[0].components.o3}</b> μg/m3`);
        $('#so2').html(`Сoncentration of SO<sub>2</sub> (Sulphur dioxide): <b>${data.list[0].components.so2}</b> μg/m3`);
        $('#pm2_5').html(`Сoncentration of PM<sub>2.5</sub> (Fine particles matter): <b>${data.list[0].components.pm2_5}</b> μg/m3`);
        $('#pm10').html(`Сoncentration of PM<sub>10</sub> (Coarse particulate matter): <b>${data.list[0].components.pm10}</b> μg/m3`);
        $('#nh3').html(`Сoncentration of NH<sub>3</sub> (Ammonia): <b>${data.list[0].components.nh3}</b> μg/m3`);
    }
    async displaySevenDays() {
        if (this.coords == null) {
            await this.getCurrentPosition();
        }
        const data = await this.getOneCallData();
        console.log(data);
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