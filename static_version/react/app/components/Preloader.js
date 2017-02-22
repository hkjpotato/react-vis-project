var React = require('react');

var Preloader = React.createClass({
  render: function() {
    var inlineStyle = {
      display: 'block',
      margin: '200px auto'
    }
    return (
      <div style={inlineStyle} className="preloader-wrapper active">
        <div className="spinner-layer spinner-blue-only">
          <div className="circle-clipper left">
            <div className="circle"></div>
          </div><div className="gap-patch">
            <div className="circle"></div>
          </div><div className="circle-clipper right">
            <div className="circle"></div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Preloader;