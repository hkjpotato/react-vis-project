var React = require('react');

var RunningLoader = React.createClass({
  render: function() {
    var inlineStyle = {
      marginTop: '50px',
      position: 'absolute',
      width: '98%',
      left: '1%',
      height: '90%',
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.1)'
    }
    var progressStyle = {
      margin: '300px auto',
      position: 'relative',
      width: '80%',
      // zIndex: 100,
    }
    return (
      <div style={inlineStyle}>
        <div style={progressStyle} className="progress">
          <div className="indeterminate"></div>
        </div>
      </div>
    );
  }
});
      // <div style={inlineStyle} className="progress">
      //   <div className="indeterminate"></div>
      // </div>
module.exports = RunningLoader;