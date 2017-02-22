var React = require('react');
var Filter = require('./Filter');
var Preloader = require('./Preloader');
var ColorSelect = require('./ColorSelect');

var SideBar = React.createClass({
    getInitialState: function() {
        return {
            t_color: 'black',
            d_color: 'black'
        }
    },

    onAnalysisTypeChange: function() {
      return;
    },
    render: function() {
        if (!this.props.data) {
            return <Preloader />
        } else {
            return (
                <div style={{height: "100%"}}>
                    <div>
                        <h4>Explorator</h4>
                    </div>
                    <div>
                        <Filter onFilterChange={this.props.onFilterChange} currFilter={this.props.filter} />
                    </div>
                    <div>
                        <ColorSelect 
                            tColor={this.props.tColor} 
                            dColor={this.props.dColor}
                            mapStyle={this.props.mapStyle}
                            onMapStyleChange={this.props.onMapStyleChange} 
                            onTColorChange={this.props.onTColorChange} 
                            onDColorChange={this.props.onDColorChange}/>
                    </div>
                    <div style={{padding: 10}}>
                      <label htmlFor="analysis type">Analysis Type</label>
                      &nbsp;&nbsp;
                      <select className="form-control" id="analysis type" defaultValue="Power Flow" onChange={this.onAnalysisTypeChange}>
                        <option value="Power Flow">Power Flow</option>
                        <option value="Time Series Power Flow">Time Series Power Flow</option>
                        <option value="DER Scheduling">DER Scheduling</option>
                      </select>
                    </div>
                    <div>
                        <button className="mui-btn mui-btn--danger" onClick={this.props.runAnalysis}>{this.props.status}</button>
                    </div>
                </div>
            )
        }
    }
});

module.exports = SideBar;