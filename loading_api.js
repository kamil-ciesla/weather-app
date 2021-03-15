function loadPage() {
    const apiKey = 'b8801437aa00cae409040174e8dadb7c';
    const language = 'pl';
    const units = 'metric';
    const forecast = new Forecast(apiKey, language, units);
    const map = new GoogleMap(forecast);
    map.initMap();
}