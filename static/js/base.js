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
const defaultLang = 'pl';
const forecast = new Forecast(openWeatherApiKey, defaultLang, units);

let language = defaultLang;
document.getElementById(`${forecast.language}-lang`).classList.add('btn-light');

function initForecast() {
    forecast.update()
}

function loadScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    document.getElementsByTagName("head")[0].appendChild(script);
}
const callbackFuncName = 'initForecast';
const GoogleApiKey = 'AIzaSyDgt4lnHWD2KYvENAMHgbdS1Kziq9UosNM'
loadScript('https://maps.googleapis.com/maps/api/js?key=' + GoogleApiKey + '&callback=' + callbackFuncName + '&libraries=&v=weekly');