var React = require('react');
var Chart = require('./KjChart');
var options = require('./Helpers/ChartOptions').options;


var TimeSlider = React.createClass({
  onChange: function(event) {
    this.props.onTimeChange(+event.target.value);
  },
  onPlayClick: function(event) {
    this.props.onPlayClick();

  },
  render: function() {
    var inlineStyle = {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 540,
        // height: 120,
        border: '1px solid #009688',
        borderRadius: '1%',
        overflow: 'auto',
        background: 'white',
        padding: '0 5px',
        zIndex: 3,
        padding: 10,
    };
    var playButtonStyle = {
        display: 'inline-block',
        marginTop: 20,
        cursor: "pointer",
        fontSize: '200%',
        float: 'left'
    }
    var sliderStyle = {
        display: 'block-block',
        margin: 10,
        float: 'left',
        // outline: '1px solid red',
        width: 480
    }

    var playing = this.props.playing;
    var timeVal = this.props.timeVal;


    let inlineListStyle = {
        paddingLeft: 0,
        marginLeft: 0,
        listStyle: 'none',
        marginTop: -10,
    }

    let listItemStyle = {
        display: 'inline-block',
        // outline: '1px solid red',
        color: 'lightgray',
        textAlign: 'center',
        width: 20,
    }
    return (
        <div style={inlineStyle} className="kj_panel">
            <div id="timeAttribute-section">
                <div className="form-group row">
                  <label htmlFor="timeAttribute">Bus</label>&nbsp;
                  <select className="form-control" id="timeAttribute" defaultValue="marginal" onChange={this.props.onTimeAttributeChange}>
                    <option value="marginal">marginal price</option>
                    <option value="injection">net injection</option>
                  </select>
                  &nbsp;&nbsp;&nbsp;
                  <label>
                    Show contour&nbsp;
                    <input
                     type="checkbox"
                     checked={this.props.contouring}
                     onChange={this.props.onContourChange} />
                  </label>
                </div>
            </div>
            <div id="timeslider-section">
            <a style ={playButtonStyle} onClick={this.onPlayClick} className="">
                <i className={"fa fa-" + (playing ? "pause" : "play") + "-circle-o"} aria-hidden="true"></i>
            </a>
            <div style ={sliderStyle}>
              <div id="timeControl" style={{zIndex: 10}}>
                <input type="range" id="test5" step="1" min="1" max="24" value={timeVal} onChange={this.onChange}/>
                <ul style={inlineListStyle}>
                    <li style={listItemStyle}>1</li>
                    <li style={listItemStyle}>2</li>
                    <li style={listItemStyle}>3</li>
                    <li style={listItemStyle}>4</li>
                    <li style={listItemStyle}>5</li>
                    <li style={listItemStyle}>6</li>
                    <li style={listItemStyle}>7</li>
                    <li style={listItemStyle}>8</li>
                    <li style={listItemStyle}>9</li>
                    <li style={listItemStyle}>10</li>
                    <li style={listItemStyle}>11</li>
                    <li style={listItemStyle}>12</li>
                    <li style={listItemStyle}>13</li>
                    <li style={listItemStyle}>14</li>
                    <li style={listItemStyle}>15</li>
                    <li style={listItemStyle}>16</li>
                    <li style={listItemStyle}>17</li>
                    <li style={listItemStyle}>18</li>
                    <li style={listItemStyle}>19</li>
                    <li style={listItemStyle}>20</li>
                    <li style={listItemStyle}>21</li>
                    <li style={listItemStyle}>22</li>
                    <li style={listItemStyle}>23</li>
                    <li style={listItemStyle}>24</li>
                </ul>
              </div>
            </div>
            </div>
        </div>
    )
  }
});



module.exports = TimeSlider;