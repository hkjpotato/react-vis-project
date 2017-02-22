//App.js
//our app js now become a glue code for django
var React = require('react');
var ReactDOM = require('react-dom');
// var Test = require('./components/Display/Test');
var appCount = 0;
var MyReact = React.createClass({
  onChange: function(reactevent) {
    // console.log(event);
    // console.log(reactevent);
    // console.log(reactevent.nativeEvent);
    // reactevent.stopPropagation();
    this.setState({
      value: reactevent.target.value
    });
  },
  onReset: function() {
    this.setState({
      value: ""
    });
  },
  handleSubmit: function(reactevent) {
    console.log(reactevent.target);
    reactevent.preventDefault();
    console.log('submit');
  },
  bubble: function(event) {
    // event.stopPropagation();
    console.log('bubbling',event.currentTarget);
  },
  getInitialState: function() {
    console.log("app init", appCount++);
    return {
      value: "1",
      unctrl: ''
    }
  },
  componentDidMount: function() {
    console.log("app mount", appCount++);
    // setTimeout(function() {
    //   this.refs.myForm.submit();
    // }.bind(this), 2000);
  },
  componentDidUpdate: function() {
      console.log("app update", appCount++);
  },
  render: function() {
    console.log("app render", appCount++);
    return (
      <div className="container" onChange={this.bubble}>
        <div className="row" onChange={this.bubble}>
          <div className="col s6">
            <input
              type="text"
              value={this.state.value}
              onChange={this.onChange}
            />
          </div>
          <div className="col s6">
            <a 
              className="waves-effect waves-light btn red darken-1" 
              onClick={this.onReset}>
              Reset
            </a>
          </div>
          <div className="col s12">
            <form ref="myForm">
              <input
                type="text"
                value={this.state.value}
                onChange={this.onChange}
              />
            </form>
          </div>
        </div>
      </div>
    )

  }
})
//glue code with django template
window.MyApp = {
  init: function(data) {
    var inlineStyle = {
      width: '1000px',
      height: '500px'
    }
    ReactDOM.render(
      <MyReact style={inlineStyle} />,
      document.getElementById('app')
    );
  }
}