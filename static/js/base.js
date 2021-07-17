
const plButton = document.getElementById('pl-lang');
const engButton = document.getElementById('eng-lang');

plButton.addEventListener('click', function () {
    this.classList.add('btn-light');
    engButton.classList.remove('btn-light');
    forecast.changeLang('pl');
});
engButton.addEventListener('click', function () {
    this.classList.add('btn-light');
    plButton.classList.remove('btn-light');
    forecast.changeLang('eng');
});

const imperialUnitsButton = document.getElementById('imperial-button');
const metricUnitsButton = document.getElementById('metric-button');
const standardlUnitsButton = document.getElementById('standard-button');

imperialUnitsButton.addEventListener('click', function () {
    this.classList.add('btn-light');
    metricUnitsButton.classList.remove('btn-light');
    standardlUnitsButton.classList.remove('btn-light');
    forecast.changeUnits('imperial');
});
metricUnitsButton.addEventListener('click', function () {
    this.classList.add('btn-light');
    imperialUnitsButton.classList.remove('btn-light');
    standardlUnitsButton.classList.remove('btn-light');
    forecast.changeUnits('metric');
});
standardlUnitsButton.addEventListener('click', function () {
    this.classList.add('btn-light');
    metricUnitsButton.classList.remove('btn-light');
    imperialUnitsButton.classList.remove('btn-light');
    forecast.changeUnits('standard');
});

const openWeatherApiKey = 'b8801437aa00cae409040174e8dadb7c';

const lang = (countryCode=="PL")? 'pl':'eng';
const forecast = new Forecast(openWeatherApiKey, lang);
document.getElementById(`${forecast.currentLang}-lang`).classList.add('btn-light');
document.getElementById(`${forecast.units}-button`).classList.add('btn-light');

function initForecast() {
    forecast.update()
}

const callbackFuncName = 'initForecast';
const GoogleApiKey = 'AIzaSyDgt4lnHWD2KYvENAMHgbdS1Kziq9UosNM';
const GoogleApiLang = (forecast.currentLang == "eng") ? 'en' : 'pl';
function loadGoogleMapApi() {
    loadScript('https://maps.googleapis.com/maps/api/js?key=' + GoogleApiKey + '&language=' + GoogleApiLang + '&callback=' + callbackFuncName + '&libraries=&v=weekly');
}
loadGoogleMapApi();
