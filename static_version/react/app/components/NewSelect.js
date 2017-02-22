var React = require('react');
var TimeSeriesGraph = require('./TimeSeriesGraph');

var NewSelect = React.createClass({
 shouldComponentUpdate: function(nextProps, nextState) {
    if (this.props.selectedInfo['name'] !== nextProps.selectedInfo['name']) {
      console.info('different name need to re-render');
      return true;
    }
    console.info('same object same same no need to re-render');
    return false;
  },
  render: function() {
    var inlineStyle = {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 320,
        maxHeight: 500,
        border: '1px solid #009688',
        overflow: 'auto',
        background: 'white'
    }
    var selectedInfo = this.props.selectedInfo;
    let timesSeriesKeys = Object.keys(selectedInfo).filter((key)=>(
      Array.isArray(selectedInfo[key]) && key !== 'elements'
    ));

    let notTimesSeriesKeys = Object.keys(selectedInfo).filter((key)=>(
      !Array.isArray(selectedInfo[key])
    ));

    let timeSeries = {};

    timesSeriesKeys.forEach((key)=>{
      timeSeries[key] = selectedInfo[key];
    })

    var rows = notTimesSeriesKeys.map(function(key) {
        return (
            <tr key={key} style={{height: 5}}>
                <td>{key}</td>
                <td>{selectedInfo[key]}</td>
            </tr>
        )
    });


    var outputtimeseries = null;
    if (this.props.outputdata) {
      // //also need to show output data
      let currObject = selectedInfo['object'];
      currObject = currObject == 'node' ? 'bus' : currObject;
      let outputdata = this.props.outputdata;
      if (currObject in outputdata) {
        var outputtimeseries = outputdata[currObject][selectedInfo['name']]
      }
    }

    return (
        <div className="z-depth-3" style={inlineStyle}>
          <table className="mui-table mui-table--bordered">
            <thead>
                <tr>
                    <th>Object</th>
                    <th>{selectedInfo.object}</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
          {
            timesSeriesKeys.length > 0 ?
            <div>
              <h4>Input</h4>
              <TimeSeriesGraph timeSeries={timeSeries} />
            </div> :
            null
          }
          {
            outputtimeseries ?
            <div>
              <h4>Output</h4>
              <TimeSeriesGraph timeSeries={outputtimeseries} />
            </div> :
            null
          }
        </div>
    )
  }
})


module.exports = NewSelect;

