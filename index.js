function updateLocation(newCoords, name) {
    coords = newCoords;
    locationName = name;
    $('#location').text(locationName + ' ' + coords.lat.toPrecision(4) + ', ' + coords.lng.toPrecision(4));
}

function addWidgetButton(buttonName, widgetName) {
    /**Important: CurrentWidget has to be predeclared in the outter scope. */
    $(buttonName).click(function() {
        if (currentWidget !== null) {
            currentWidget.hide();
        }
        $(widgetName).show();
        currentWidget = $(widgetName);
    });
}