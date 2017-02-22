var React = require('react');
var ReactDOM = require('react-dom');
var MapVisManager = require('./MapVisUsage/MapVisManager')

//React Component
var MapVis = React.createClass({
    componentDidMount: function() {
        console.debug('MapVis didmount');
        MapVisManager.init(this.refs.mapcontainer, this.props);
    },
    // shouldComponentUpdate: function(nextProps, nextState) {
    //   console.log(nextProps, nextState);
    //   return true;
    // },
    componentDidUpdate: function() {
        //in the initial render, ajax call might rigger this function before overlay ready
        console.debug('MapVis didUpdate');
        MapVisManager.update(this.props);
    },
    componentWillUnMount: function() {
        console.debug('MapVis componentWillUnMount');
        MapVisManager.destroy();
    },
    render: function() {
        console.debug('MapVis render');
        var inlineStyle = {
            width: '100%',
            height: '100%',
        }
        return (
            <div style={inlineStyle} className="mapvis" ref="mapcontainer">
            </div>
        )
    }
});

module.exports = MapVis;
