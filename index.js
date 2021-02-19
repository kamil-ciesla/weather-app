function updateLocation(newCoords, locationName) {
    coords = newCoords;
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