function changeLangState(button) {
    if (button.classList.contains('btn-light')) {
        button.classList.remove('btn-light');
    }
    else {
        button.classList.add('btn-light');
    }
}

const plButton = document.getElementById('pl-lang');
const engButton = document.getElementById('eng-lang');

plButton.addEventListener('click', function () {
    changeLangState(this);
    changeLangState(engButton);
    forecast.changeLang('pl');
});
engButton.addEventListener('click', function () {
    changeLangState(this);
    changeLangState(plButton);
    forecast.changeLang('eng');
});

const openWeatherApiKey = 'b8801437aa00cae409040174e8dadb7c';
const units = 'metric';

const lang = (countryCode=="PL")? 'pl':'eng';
const forecast = new Forecast(openWeatherApiKey, lang, units);

document.getElementById(`${forecast.currentLang}-lang`).classList.add('btn-light');

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
