var React = require('react');
var ForceVis = require('./ForceVis');
var MapVis = require('./MapVis');
var SelectInfo = require('./SelectInfo');
var TimeSlider = require('./TimeSlider');

var EditForm = require('./EditForm');


var MapSwitch = React.createClass({
    onSwitchChange: function(event) {
        // console.log('checked on Change detected!!!!')
        // console.log(event.target.checked);
        this.props.onSwitchChange(event.target.checked);
    },
    render: function() {
        var inlineStyle = {
            position: 'absolute',
            zIndex: 100,
            top: '5px',
            left: '5px'
        }
        return (
        <div style={inlineStyle}>
          <div className="switch">
            <label>
              Map Off
              <input type="checkbox" onChange={this.onSwitchChange} checked={this.props.mapOn}/>
              <span className="lever"></span>
              Map On
            </label>
          </div>
        </div>
        )
    }
})


var VisContainer = React.createClass({
  getInitialState: function() {
    return {
        mapOn: true
    }
  },
  onSwitchChange: function(mapOn) {
    this.setState({
        mapOn: mapOn
    });
  },
  render: function() { 
    var inlineStyle = {
        height: '100%',
        border: '.5px dotted lightgray',
        position: 'relative',
    }
    if (this.props.selected) {
        var selectedInfo = this.props.selected;
    }
    return (
        <div style={inlineStyle}> 
            <MapVis 
              mapStyle={this.props.mapStyle} 
              tColor={this.props.tColor} 
              dColor={this.props.dColor} 
              style={{height: '100%'}} 
              addElement={this.props.addElement} 
              timeVal={this.props.timeVal} 
              process={this.props.process} 
              dataChange={this.props.dataChange} 
              mapProps={this.props.mapProps} 
              onViewChange={this.props.onViewChange} 
              data={this.props.data} 
              onSelectChange={this.props.onSelectChange} 
              onFilterChange={this.props.onFilterChange} 
              selected={this.props.selected} 
              filter={this.props.filter}/>
            {this.props.selected ? <SelectInfo addElement={this.props.addElement} selectedInfo={selectedInfo} onSelectChange={this.props.onSelectChange} /> : null}
            {this.props.process === 'finished' ? <TimeSlider onPlayClick={this.props.onPlayClick} onTimeChange={this.props.onTimeChange} timeVal={this.props.timeVal} playing={this.props.playing} /> : null}
        </div>
    );
  }
});

        // <div style={inlineStyle}> 
        //     {!this.state.mapOn ?  (<ForceVis dataChange={this.props.dataChange} data={this.props.data} onSelectChange={this.props.onSelectChange} onFilterChange={this.props.onFilterChange} selected={this.props.selected} filter={this.props.filter} />) :
        //         (<MapVis dataChange={this.props.dataChange} mapProps={this.props.mapProps} onViewChange={this.props.onViewChange} data={this.props.data} onSelectChange={this.props.onSelectChange} onFilterChange={this.props.onFilterChange} selected={this.props.selected} filter={this.props.filter}/>)
        //     }
        //     <MapSwitch onSwitchChange={this.onSwitchChange} mapOn={this.state.mapOn}/>   
        //     {this.props.selected ? <SelectInfo selectedInfo={selectedInfo} /> : null}
        // </div>
module.exports = VisContainer;

