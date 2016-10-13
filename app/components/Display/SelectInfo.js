var React = require('react');

var SelectInfo = React.createClass({
  render: function() {
    var inlineStyle = {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 300,
        // height: 500,
        border: '1px solid #009688',
        overflow: 'auto',
        background: 'white'
    }

    var selectedInfo = this.props.selectedInfo;
    var keys = Object.keys(selectedInfo);
    keys = keys.filter(function(d) {
        return (d !== "object" && d !== "elements");
    });

    var rows = keys.map(function(key) {
        return (
            <tr key={key} style={{height: 10}}>
                <td>{key}</td>
                <td>{selectedInfo[key]}</td>
            </tr>
        )
    });

    return (
        <div className="z-depth-3" style={inlineStyle}>
          <table className="highlight bordered striped">
            <thead>
                <tr>
                    <th>Object</th>
                    <th>{selectedInfo.object}</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
    )
  }
})

module.exports = SelectInfo;
