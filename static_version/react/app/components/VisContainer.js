var React = require('react');
var ForceVis = require('./ForceVis');
var MapVis = require('./MapVis');
var NewSelect = require('./NewSelect');
var TimeSlider = require('./TimeSlider');


var EditForm = require('./EditForm');


var MapSwitch = React.createClass({
    onSwitchChange: function(event) {
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
        mapOn: true,
        contouring: true,
        timeAttribute: 'marginal'
    }
  },
  onContourChange: function(e) {
    console.info('contour change', e.target.checked);
    this.setState({
        contouring: e.target.checked
    });
  },
  onTimeAttributeChange: function(e) {
    this.setState({
      timeAttribute: e.target.value
    })
  },
  onSwitchChange: function(mapOn) {
    this.setState({
        mapOn: mapOn
    });
  },
  render: function() { 
    var inlineStyle = {
        height: this.props.height,
        border: '.5px dotted lightgray',
        position: 'relative',
    }

    if (this.props.selected) {
        var selectedInfo = this.props.selected;
    }

    return (
        <div style={inlineStyle}> 
            <MapVis 
              loadFeederData={this.props.loadFeederData}
              loadTransData={this.props.loadTransData}
              timeAttribute={this.state.timeAttribute}
              contouring={this.state.contouring}
              outputdata={this.props.outputdata}
              hovering={this.props.hovering}
              multiSelectMap={this.props.multiSelectMap}
              mapStyle={this.props.mapStyle} 
              tColor={this.props.tColor} 
              dColor={this.props.dColor} 
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
            {(!this.props.selected || this.props.popUp) ? null : (
                <NewSelect 
                  outputdata={this.props.outputdata}
                  addElement={this.props.addElement} 
                  selectedInfo={selectedInfo} 
                  onSelectChange={this.props.onSelectChange}
                  editStateChange={this.props.editStateChange} />
            )}
            {this.props.process === 'finished' ? 
              <TimeSlider 
                onPlayClick={this.props.onPlayClick} 
                onTimeChange={this.props.onTimeChange} 
                timeVal={this.props.timeVal} 
                playing={this.props.playing}
                contouring={this.state.contouring}
                onContourChange={this.onContourChange}
                onTimeAttributeChange={this.onTimeAttributeChange} /> : 
              null}
        </div>
    );
  }
});

module.exports = VisContainer;

