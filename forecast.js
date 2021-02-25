class Forecast {
    constructor(apiKey, language, units) {
        this.apiKey = apiKey;
        this.language = language;
        this.units = units;
        this.coords;
        this.locationName;
        this.currentContent = '#hourly-chart';
        $(this.currentContent).show();
        $('#hourly-chart-button').click(() => this._switchContent('#hourly-chart'));
        $('#air-pollution-button').click(() => this._switchContent('#air-pollution'));
		$('#map-button').click(() => this._switchContent('#map'));
        $('#language-button-pl').click(() => this.changeLanguage('pl'));
        $('#language-button-en').click(() => this.changeLanguage('en'));
        $('#language-button-de').click(() => this.changeLanguage('de'));
        $('#language-button-ru').click(() => this.changeLanguage('ru'));
        $('#units-button-metric').click(() => this.changeUnits('metric'));
        $('#units-button-imperial').click(() => this.changeUnits('imperial'));


        
    }
    _switchContent(target) {
        $(this.currentContent).hide();
        $(target).show();
        this.currentContent = target;
    }

    async update(coords = this.coords, locationName = this.locationName) {
        this.coords = coords;
        this.locationName = locationName;
        fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${this.coords.lat}&lon=${this.coords.lng}&lang=${this.language}&units=${this.units}&appid=${this.apiKey}`
        ).then(response => {
            return response.json();
        }).then(data => {
            this.displayCurrentWeather(data);
            this.createHourlyChart(data);
            this.displayAirPollution();
        })

        fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${this.coords.lat}&lon=${this.coords.lng}&lang=${this.language}&appid=${this.apiKey}`
            ).then(response => {
                return response.json();
            }).then(data1 => {
                console.log(data1)
        })

    }


    changeLanguage(lan) {
        this.language = lan;
        console.log(this.language);
        this.update();

    }

    changeUnits(unit) {
        this.units = unit;
        console.log(this.unit);
        this.update();

    }

    async displayCurrentWeather(data) {
        const temp = data.current.temp.toFixed(1);
        const iconURL = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`
        const iconAlt = data.current.weather[0].description
        $('#location-name').text(this.locationName);
        $('#coords').text(this.coords.lat.toPrecision(4) + ', ' + this.coords.lng.toPrecision(4));
        $('#forecast-temperature').text(temp + '°C');
        $('#forecast-icon').src = iconURL;
        $('#forecast-icon').alt = iconAlt
        $('#forecast-pressure').text(data.current.pressure + ' hPa');
        $('#forecast-humidity').text(data.current.humidity + '%');
        $('#forecast-wind-speed').text(data.current.wind_speed + ' mph');
    }
    displayAirPollution() {
        fetch(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${this.coords.lat}&lon=${this.coords.lng}&appid=${this.apiKey}`
        ).then(response => {
            return response.json()
        }).then(d => {
            //console.log(d);
            $('#index').html(`Air quality index: ${d.list[0].main.aqi}`);
            $('#description').html(`(1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor)`);
            $('#co').html(`Сoncentration of CO (Carbon monoxide): <b>${d.list[0].components.co}</b> μg/m3`);
            $('#no').html(`Сoncentration of NO (Nitrogen monoxide): <b>${d.list[0].components.no}</b> μg/m3`);
            $('#no2').html(`Сoncentration of NO<sub>2</sub> (Nitrogen dioxide): <b>${d.list[0].components.no2}</b> μg/m3`);
            $('#o3').html(`Сoncentration of O<sub>3</sub> (Ozone): <b>${d.list[0].components.o3}</b> μg/m3`);
            $('#so2').html(`Сoncentration of SO<sub>2</sub> (Sulphur dioxide): <b>${d.list[0].components.so2}</b> μg/m3`);
            $('#pm2_5').html(`Сoncentration of PM<sub>2.5</sub> (Fine particles matter): <b>${d.list[0].components.pm2_5}</b> μg/m3`);
            $('#pm10').html(`Сoncentration of PM<sub>10</sub> (Coarse particulate matter): <b>${d.list[0].components.pm10}</b> μg/m3`);
            $('#nh3').html(`Сoncentration of NH<sub>3</sub> (Ammonia): <b>${d.list[0].components.nh3}</b> μg/m3`);
        })
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
            .getElementById('hourly-chart-canvas')
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
                                return value + '°C';
                            },
                        },
                    }, ],
                },
            },
        })
        return chart;
    }
}