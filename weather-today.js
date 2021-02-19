async function getTodayWeather(coords, languague, units, apiKey) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lng}&lang=${language}&units=${units}&appid=${apiKey}`
    );
    return response.json();
}

async function displayCurrentWeather(data) {

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

function createChart(data) {
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