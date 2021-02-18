async function getTodayWeather(coords, language) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lng}&lang=${language}&units=${units}&appid=${apiKey}`
    );
    // Fetched data
    const data = await response.json();
    console.log(data);

    document.getElementById('forecast-hourly-chart').style.visibility = 'visible'
        // Data used to make a chart
    const hoursX = [];
    const tempsY = [];

    for (let i = 1; i <= 24; i++) {
        tempsY.push(data.hourly[i].temp.toFixed(2));
        hoursX.push(i);
    }
    createChart(hoursX, tempsY);

    const currentData = data.current;

    const temp = currentData.temp.toFixed(1);
    const iconURL = `http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`
    const iconAlt = currentData.weather[0].description

    $('#forecast-temperature').text(temp + '°C');
    $('#forecast-icon').src = iconURL;
    $('#forecast-icon').alt = iconAlt
    $('#forecast-pressure').text(currentData.pressure + ' hPa');
    $('#forecast-humidity').text(currentData.humidity + '%');
    $('#forecast-wind-speed').text(currentData.wind_speed + ' mph');
}

function createChart(hoursX, tempsY) {
    const ctx = document
        .getElementById('forecast-hourly-chart')
        .getContext('2d');
    const myChart = new Chart(ctx, {
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
    return myChart;
}