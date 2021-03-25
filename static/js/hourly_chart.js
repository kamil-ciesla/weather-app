const apiKey = 'b8801437aa00cae409040174e8dadb7c';
const language = 'pl';
const units = 'metric';
const forecast = new Forecast(apiKey, language, units);
const testCords = {
    lat: 0,
    lng: 0
}
forecast.update(testCords);
forecast.updateCurrentWeather()
forecast.createHourlyChart();
//const map = new GoogleMap(forecast);
//map.initMap();