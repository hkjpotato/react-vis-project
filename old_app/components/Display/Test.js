var React = require('react');

var testCount = 0;
// var map = null;


/**
Define Overlay Class
*/
KJOverlay.prototype = new google.maps.OverlayView();
//constructor
function KJOverlay(map) {
    console.log('init Overlay, ready to add to Map');
    this.setMap(map);
}
KJOverlay.prototype.onAdd = function() {
    console.log('OverLay onAdd');
}

KJOverlay.prototype.draw = function() {
    console.log('OverLay drawing');
    var currZoom = MyDraw.map.getZoom();
    var currCenter = MyDraw.map.getCenter();
    MyDraw.onViewChange({
        zoomLevel: currZoom,
        mapCenter: currCenter
    });
}


var MyDraw = {};
MyDraw.create = function(mountPoint, props) {
    console.log('MyDraw create Map');
    var mapProps = props.mapProps;
    this.map = new google.maps.Map(mountPoint, {
        zoom: mapProps.zoomLevel,
        center: mapProps.mapCenter
    });

    this.overlay = new KJOverlay(this.map);
    this.onViewChange = props.onViewChange;
}


var Test = React.createClass({
    componentDidMount: function() {
        console.log('testmount');
        var props = this.props;
        // this.props.data = null;

        var data = this.props.data;
        data.val = 1000;
        // setInterval(function() {
        //     console.log('ha', data)
        //     data.val = data.val + 100;
        // }, 1000);

        // console.log("testmount", this.props);
        // MyDraw.create(this.refs.mapvis, props);
    },
    componentDidUpdate: function() {
        console.log("testupdate", testCount++);
        //update databinding

        // //update map
        // MyDraw.map.setZoom(this.props.mapProps.zoomLevel);
        // MyDraw.map.setCenter(this.props.mapProps.mapCenter);
    },
    render: function() {
        console.log("test render", testCount++);
        var inlineStyle = {
            marginTop: 100,
            width: '1000px',
            height: '500px',
            background: 'red'
        }
        return (
            <div style={inlineStyle} ref="mapvis">
            </div>
        );
    }
});
module.exports = Test;
