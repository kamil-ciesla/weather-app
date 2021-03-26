function loadScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    document.getElementsByTagName("head")[0].appendChild(script);
}
const callbackFuncName = 'initForecast';
loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCuaCF5f_8RVyuJjZxr5O9xWSX8VKGan5E&callback=' + callbackFuncName + '&libraries=&v=weekly');