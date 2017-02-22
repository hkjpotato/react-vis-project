var React = require('react');
var Filter = require('./Filter');
var Preloader = require('./Preloader');
import { Select, Option } from 'muicss/react';

var ColorSelect = React.createClass({
    onTColorChange: function(event) {
        console.info('onTColorChange')
        event.preventDefault();
        this.props.onTColorChange(event.target.value);
    },
    onDColorChange: function(event) {
        console.info('onDColorChange')
        event.preventDefault();
        this.props.onDColorChange(event.target.value);
    },
    onMapStyleChange: function(event) {
        event.preventDefault();
        this.props.onMapStyleChange(event.target.value);
    },
    render: function() {
        var colorOptions = [
          "white",
          "black",
          "gray",
          "lightgray",
          "blue",
          "royalblue",   
          "lime",    
          "aqua"
        ];       
        // var options = colorOptions.map(function(d) {
        //   return (<option key={d} value={d}>{d}</option>);
        // })
        var options = colorOptions.map(function(d) {
          return (<Option key={d} value={d} label={d}></Option>);
        })

        return (
            <div 
              id="selectCotainer" 
              style={{
                // fontSize: ".9em",
                paddingLeft: '10px',  
                paddingRight: '10px',
                border: '1px solid lightgray',
                margin: '10px 0px',
              }}>
              <span 
                style={{
                  fontSize: '0.8em',
                  color: 'gray',
                  fontWeight: 700,
                  lineHeight: '2px',
                }}>customization</span>
              <div className="mui-select">
                <Select id="map_style_select" defaultValue={this.props.mapStyle} onChange={this.onMapStyleChange}>
                  <Option value="satellite" label="satellite"></Option>
                  <Option value="roadmap" label="roadmap"></Option>
                  <Option value="hybrid" label="hybrid"></Option>
                  <Option value="terrain" label="terrain"></Option>
                  <Option value="light" label="light"></Option>
                  <Option value="plain" label="plain"></Option>
                  <Option value="dark" label="dark"></Option>
                  <Option value="night" label="night"></Option>
                </Select>
                <label>{"Map Style"}</label>
              </div>
              <div className="mui-select">
                <Select id="t_color_select" value={this.props.tColor} onChange={this.onTColorChange}>
                  {options}
                </Select>
                <label>Transmission Color</label>
              </div>
              <div className="mui-select">
                <Select id="d_color_select" value={this.props.dColor} onChange={this.onDColorChange}>
                  {options}
                </Select>
                <label>Distribution Color</label>
              </div>
            </div>
        )
    }
});

                // <select id="map_style_select" value={this.props.mapStyle} onChange={console.log('haha')}>
                //   <option value="satellite">satellite</option>
                //   <option value="roadmap">roadmap</option>
                //   <option value="hybrid">hybrid</option>
                //   <option value="terrain">terrain</option>
                //   <option value="light">light</option>
                //   <option value="plain">plain</option>
                //   <option value="dark">dark</option>
                //   <option value="night">night</option>
                // </select>
module.exports = ColorSelect;

