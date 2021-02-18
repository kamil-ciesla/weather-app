const userLocation = {
    lat: 50.0647,
    lon: 19.945
}

// Fill the menu with subsequent dates
fillForecastMenu()

// Init with a forecast of a current today
getForecast(0, userLocation, language, apiKey)

function fillForecastMenu() {
    const date = new Date()

    // Get a number of a current day
    const today = date.getDay()
    let weekday = Array(7)
    weekday[0] = 'Sunday'
    weekday[1] = 'Monday'
    weekday[2] = 'Tuesday'
    weekday[3] = 'Wednesday'
    weekday[4] = 'Thursday'
    weekday[5] = 'Friday'
    weekday[6] = 'Saturday'

    // Array is extended * 2 to avoid " index out of range"
    weekday = [...weekday, ...weekday]

}

async function getForecast(menuDaysState, loc, language) {
    const response = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${loc.lat}&lon=${loc.lon}&lang=${language}&appid=${apiKey}`
        )
        // Fetched data
    const data = await response.json()
    const KELVIN = 273.15

    if (menuDaysState == 0) {
        document.getElementById('forecast-hourly-chart').style.visibility =
            'visible'
            // Data used to make a chart
        const hoursX = []
        const tempsY = []

        //   Apply hourly forecast for the first day
        for (let i = 0; i < 24; i++) {
            tempsY.push((data.hourly[i].temp - KELVIN).toFixed(2))
            hoursX.push(i)
        }
        createChart(hoursX, tempsY)
    } else {
        document.getElementById('forecast-hourly-chart').style.visibility =
            'hidden'
    }

    // Daily forecast depends on the user's choice - menuDaysState
    const dayAccess = data.daily[menuDaysState]

    const temp = (dayAccess.temp.day - KELVIN).toFixed(2)
    const iconURL = `http://openweathermap.org/img/wn/${dayAccess.weather[0].icon}@2x.png`
    const iconAlt = dayAccess.weather[0].description

    document.getElementById('forecast-temperature').innerHTML = temp + '°C'
    document.getElementById('forecast-icon').src = iconURL
    document.getElementById('forecast-icon').alt = iconAlt
    document.getElementById('forecast-pressure').innerHTML =
        dayAccess.pressure + ' hPa'
    document.getElementById('forecast-humidity').innerHTML =
        dayAccess.humidity + '%'
    document.getElementById('forecast-wind-speed').innerHTML =
        dayAccess.wind_speed + ' mph'
}

function createChart(hoursX, tempsY) {
    const ctx = document
        .getElementById('forecast-hourly-chart')
        .getContext('2d')
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hoursX,
            datasets: [{
                label: 'Temperature [°C]',
                data: tempsY,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
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
    return myChart
}