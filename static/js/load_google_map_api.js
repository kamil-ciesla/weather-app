function loadScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    document.getElementsByTagName("head")[0].appendChild(script);
}
const callbackFuncName = 'initForecast';
loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDgt4lnHWD2KYvENAMHgbdS1Kziq9UosNM&callback=' + callbackFuncName + '&libraries=&v=weekly');