var React = require('react');
var Filter = require('./Filter');
var Preloader = require('./Preloader');
var ColorSelect = require('./ColorSelect');

var ColorSelect = React.createClass({
    onTColorChange: function(event) {
        // console.log(event.target.value);
        event.preventDefault();
        this.props.onTColorChange(event.target.value);
    },
    onDColorChange: function(event) {
        // console.log(event.target.value);
        event.preventDefault();
        this.props.onDColorChange(event.target.value);
    },
    onMapStyleChange: function(event) {
        // console.log(event.target.value);
        event.preventDefault();
        this.props.onMapStyleChange(event.target.value);
    },
    componentDidMount: function() {
        $('select').material_select();
        $('#selectCotainer').on('change', '#t_color_select', this.onTColorChange);
        $('#selectCotainer').on('change', '#d_color_select', this.onDColorChange);
        $('#selectCotainer').on('change', '#map_style_select', this.onMapStyleChange);
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

        var options = colorOptions.map(function(d) {
          return (<option key={d} value={d}>{d}</option>);
        })
        return (
            <div className="row" id="selectCotainer" style={{fontSize: ".9em"}}>
              <div className="input-field col s12">
                <select id="map_style_select" value={this.props.mapStyleId}>
                  <option value="satellite">satellite</option>
                  <option value="roadmap">roadmap</option>
                  <option value="hybrid">hybrid</option>
                  <option value="terrain">terrain</option>
                  <option value="light">light</option>
                  <option value="plain">plain</option>
                  <option value="dark">dark</option>
                  <option value="night">night</option>

                </select>
                <label>{"Map Style"}</label>
              </div>
              <div className="input-field col s12">
                <select id="t_color_select" value={this.props.tColor}>
                  {options}
                </select>
                <label>Transmission Color</label>
              </div>
              <div className="input-field col s12">
                <select id="d_color_select" value={this.props.dColor}>
                  {options}
                </select>
                <label>Distribution Color</label>
              </div>
            </div>
        )
    }
});


module.exports = ColorSelect;

