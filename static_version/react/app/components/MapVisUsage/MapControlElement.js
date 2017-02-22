function CenterControl(controlDiv, map) {
    // Set CSS for the wrapper
    var controlWrapper = document.createElement('div');
    controlWrapper.style.backgroundColor = 'rgba(255, 255, 255, .8)';
    controlWrapper.style.border = '2px solid #fff';
    controlWrapper.style.marginLeft = '12px';
    controlWrapper.style.textAlign = 'center';
    controlWrapper.style.width = '60px';
    // controlWrapper.style.padding = '1px'
    controlWrapper.style.height = '275px';
    controlWrapper.title = 'Click to recenter the map';
    controlDiv.appendChild(controlWrapper);

    // Set CSS for the zoomInBtn
    var zoomInBtn = document.createElement('div');
    zoomInBtn.style.backgroundColor = '#fff';

    zoomInBtn.style.width = '32px';
    zoomInBtn.style.height = '32px';
    zoomInBtn.style.margin = '10px auto';
    zoomInBtn.style.borderRadius = '3px';
    zoomInBtn.style.border = '2px solid #fff';
    zoomInBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    zoomInBtn.style.cursor = 'pointer';
    controlWrapper.appendChild(zoomInBtn);

    // Set Text for zoomInBtn
    var zoomInText = document.createElement('div');
    zoomInText.style.fontSize = '16px';
    zoomInText.style.lineHeight = '32px';
    zoomInText.innerHTML = '+';
    zoomInText.style.userSelect = 'none';
    zoomInBtn.appendChild(zoomInText);

    // Set CSS for the scaleDisplay
    var scaleDisplay = document.createElement('div');
    scaleDisplay.style.backgroundColor = '#fff';

    scaleDisplay.style.width = '32px';
    scaleDisplay.style.height = '165px';
    scaleDisplay.style.margin = '10px auto';
    scaleDisplay.style.borderRadius = '3px';
    scaleDisplay.style.border = '2px solid #fff';
    scaleDisplay.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    // scaleDisplay.style.cursor = 'pointer';
    scaleDisplay.style.position ='relative';

    controlWrapper.appendChild(scaleDisplay);

    //set scaleText element
    var scaleTextHigh = document.createElement('div');
    // scaleTextHigh.style.fontSize = '12px';
    // scaleTextHigh.style.lineHeight = '32px';
    scaleTextHigh.style.width = '100%';
    scaleTextHigh.id = 'scaleTextHigh';
    scaleTextHigh.style.position = 'absolute';
    scaleTextHigh.style.top = '0px';
    scaleTextHigh.innerHTML = 'high';
    scaleDisplay.appendChild(scaleTextHigh);

    var scaleHorizontal = document.createElement('div');
    scaleHorizontal.style.backgroundColor = '#00bfa5 ';
    scaleHorizontal.style.width = '100%';
    scaleHorizontal.id = 'scaleHorizontal';
    scaleHorizontal.style.position = 'absolute';
    scaleHorizontal.style.height = '3px';
    scaleHorizontal.style.top = '20px';
    scaleDisplay.appendChild(scaleHorizontal);

    var scaleMiddle = document.createElement('div');
    scaleMiddle.style.borderBottom = '2px dotted lightGray';
    scaleMiddle.style.width = '100%';
    scaleMiddle.id = 'scaleMiddle';
    scaleMiddle.style.position = 'absolute';
    scaleMiddle.style.height = '0px';
    scaleMiddle.style.top = '80px';
    scaleDisplay.appendChild(scaleMiddle);

    var scaleDetail = document.createElement('div');
    scaleDetail.style.borderTop = '1px dashed #00b8d4';
    scaleDetail.style.width = '100%';
    scaleDetail.id = 'scaleDetail';
    scaleDetail.style.position = 'absolute';
    scaleDetail.style.height = '0px';
    scaleDetail.style.top = '120px';
    scaleDetail.style.color = '#00b8d4';
    scaleDetail.style.fontSize = '80%';
    scaleDetail.innerHTML = 'details';
    scaleDisplay.appendChild(scaleDetail);


    var scaleTextLow = document.createElement('div');
    scaleTextLow.style.width = '100%';
    scaleTextLow.id = 'scaleTextLow';
    scaleTextLow.style.position = 'absolute';
    scaleTextLow.style.top = '145px';
    scaleTextLow.innerHTML = 'low';
    scaleDisplay.appendChild(scaleTextLow);


    // Set CSS for the zoomOutBtn
    var zoomOutBtn = document.createElement('div');
    zoomOutBtn.style.backgroundColor = '#fff';

    zoomOutBtn.style.width = '32px';
    zoomOutBtn.style.height = '32px';
    zoomOutBtn.style.margin = 'auto';
    zoomOutBtn.style.borderRadius = '3px';
    zoomOutBtn.style.border = '2px solid #fff';
    zoomOutBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    zoomOutBtn.style.cursor = 'pointer';
    controlWrapper.appendChild(zoomOutBtn);

    // Set Text for zoomOutBtn
    var zoomOutText = document.createElement('div');
    zoomOutText.style.fontSize = '34px';
    zoomOutText.style.fontWeight = 300;
    zoomOutText.style.lineHeight = '30px';
    zoomOutText.style.userSelect = 'none';
    zoomOutText.innerHTML = '&#45;'
    zoomOutBtn.appendChild(zoomOutText);

    // Setup the click event listener - zoomIn
    google.maps.event.addDomListener(zoomInBtn, 'click', function() {
        var currZoom = map.getZoom();
        map.setZoom(currZoom >= 17 ? 17 : currZoom + 1);
    });

    // Setup the click event listener - zoomOut
    google.maps.event.addDomListener(zoomOutBtn, 'click', function() {
        var currZoom = map.getZoom();
        map.setZoom(currZoom <= 11 ? 11 : currZoom - 1);
    });
}


CenterControl.prototype.setZoom = function(zoomLevel) {
    var top = [(zoomLevel - 12 + 1)] * 20 + 20;
    document.getElementById('scaleHorizontal').style.top = top + 'px';
}

exports = module.exports = CenterControl