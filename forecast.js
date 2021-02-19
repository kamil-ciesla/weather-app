class Forecast {
    constructor(apiKey, language, units) {
        this.apiKey = apiKey;
        this.language = language;
        this.units = units;
        this.currentWidget = $('#weather-today');
        this.coords;
    }

    updateLocationDiv() {
        $('#location').text(locationName + ' ' + this.coords.lat.toPrecision(4) + ', ' + this.coords.lng.toPrecision(4));
    }

    addWidgetButton(buttonName, widgetName) {
        $(buttonName).click(() => {
            if (this.currentWidget !== null) {
                this.currentWidget.hide();
            }
            $(widgetName).show();
            this.currentWidget = $(widgetName);
        });
    }
    async update(coords, locationName) {
        this.coords = coords;
        this.locationName = locationName;
        this.updateLocationDiv();
        fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${this.coords.lat}&lon=${this.coords.lng}&lang=${this.language}&units=${this.units}&appid=${this.apiKey}`
        ).then(response => {
            return response.json();
        }).then(data => {
            this.displayCurrentWeather(data);
            this.createHourlyChart(data);
        })
    }
    async displayCurrentWeather(data) {
        const temp = data.current.temp.toFixed(1);
        const iconURL = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
        const iconAlt = data.current.weather[0].description

        $('#forecast-temperature').text(temp + '°C');
        $('#forecast-icon').src = iconURL;
        $('#forecast-icon').alt = iconAlt
        $('#forecast-pressure').text(data.current.pressure + ' hPa');
        $('#forecast-humidity').text(data.current.humidity + '%');
        $('#forecast-wind-speed').text(data.current.wind_speed + ' mph');
    }

    createHourlyChart(data) {
        const hoursX = [];
        const tempsY = [];
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        for (let i = 0; i < 24; i++) {
            tempsY.push(data.hourly[i].temp.toFixed(2));
            // REPAIR: hour after 24 should turn into 0
            hoursX.push(i + currentHour);
        }
        const ctx = document
            .getElementById('forecast-hourly-chart')
            .getContext('2d');
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
                scales: {
                    yAxes: [{
                        ticks: {
                            callback: function(value, index, values) {
                                return value + '°C'
                            },
                        },
                    }, ],
                },
            },
        })
        return chart;
    }
}