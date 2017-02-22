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
      background: 'rgba(0, 0, 0, .3)',
      textAlign: 'center',
      color: 'white',
    }

    let myLoaderStyle = {
      position: 'absolute',
      margin: 'auto',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 50,
      height: 50
    }
    return (
      <div style={inlineStyle}>
        <div className="myloader" style={myLoaderStyle}>
        <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
        <span>Loading...</span>
        </div>
      </div>
    );
  }
});

    // var progressStyle = {
    //   margin: '300px auto',
    //   position: 'relative',
    //   width: '80%',
    //   textAlign: 'center',
    //   outline: '1px solid red'
    //   // zIndex: 100,
    // }

        // <div style={progressStyle} className="progress">
        //   <div className="indeterminate"></div>
        // </div>
module.exports = RunningLoader;