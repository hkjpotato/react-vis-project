var React = require('react');
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, Crosshair, VerticalBarSeries} from 'react-vis';

var TimeSeriesGraph = React.createClass({
    getInitialState:function() {
      let defaultSelect = Object.keys(this.props.timeSeries)[0];
      if ('load value' in this.props.timeSeries) {
        defaultSelect = 'load value';
      }

      if ('PS' in this.props.timeSeries) {
        defaultSelect = 'PS';
      }
      return {
          selected: defaultSelect
      }
    },
    componentWillReceiveProps: function(nextProps) {
      console.info('time series will receive new props');
      let defaultSelect = Object.keys(nextProps.timeSeries)[0];
      if ('load value' in nextProps.timeSeries) {
        defaultSelect = 'load value';
      }

      if ('PS' in nextProps.timeSeries) {
        defaultSelect = 'PS';
      }
      this.setState({
        selected: defaultSelect
      });
    },
    selectChange: function(e) {
        this.setState({
            selected: e.target.value
        })
    },
    render: function() {
        console.info('time series render..');
        let options = Object.keys(this.props.timeSeries).map((d)=>(
            <option key={d} value={d}>{d}</option>
            ));
        let mydata = this.props.timeSeries[this.state.selected].map((d, i)=>({x: i + 1, y: d}));
        
        console.info('curr selected', this.state.selected);

        return (
            <div>
                <div className="form-group row">
                  <label htmlFor="sel1">Time Series Attributes</label>
                  <select className="form-control" id="sel1" value={this.state.selected} onChange={this.selectChange}>
                    {options}
                  </select>
                </div>
                <div className="input-graph">
                    <XYPlot
                      animation={true}
                      width={300}
                      height={200}>
                      <VerticalBarSeries data={mydata} />
                      <XAxis />
                      <YAxis />
                    </XYPlot>
                </div>
            </div>
        )
    }
})


module.exports = TimeSeriesGraph;