//App.js
//our app js now become a glue code for django
var React = require('react');
var ReactDOM = require('react-dom');
var VisContainer = require('./components/Display/VisContainer');
var Filter = require('./components/Display/Filter');
var Preloader = require('./components/Display/Preloader');
var FilterableElementTable = require('./components/Display/FilterableElementTable');

var DashBoard = React.createClass({
  onViewChange: function(zoomLevel) {
    // This is for demo purpose, in the real app, should make the query based on  zoomLevel
    var apiAddress = "";
    if (zoomLevel <= 9) {
      apiAddress = "transmission.json";
    } else {
      apiAddress = "all.json";
    }
    d3.json(apiAddress, function (json) {
      var pgObject = json;
      console.log('-----get new data from server and rerender-----')
      this.setState({
        zoomLevel: zoomLevel,
        data: pgObject
      });
    }.bind(this));
    // var apiAddress = "/feederData/?zoomLevel=" + zoomLevel;
    // d3.json(apiAddress, function (json) {
    //   var pgObject = json['tree'];
    //   console.log('-----get new data from server and rerender-----')
    //   console.log(pgObject)
    //   this.setState({
    //     zoomLevel: zoomLevel,
    //     data: pgObject
    //   });
    // }.bind(this));
  },
  getInitialState: function() {
    return {
      data: null,
      selected: null,
      filter: null,
      viewMode: 'vis',
      zoomLevel: 9,
    }
  },
  onSelectChange: function(d) {
    console.log('DashBoard onSelectChange: ', d);
    this.setState({
      selected: d
    });
  },
  onFilterChange: function(d) {
    console.log('DashBoard onFilterChange: ', d)
    this.setState({
      filter: d
    });
  },
  componentDidMount: function() {
    self = this;
    console.log('DashBoard component did mount');
    $(document).ready(function(){
      $('ul.tabs').tabs({
        onShow: function(event) {
          console.log("preseesed", $(event).attr('id'));
          self.setState({
            viewMode: $(event).attr('id')
          });
        }
      });
    });
    //for demo purpose
    var apiAddress = "transmission.json";
    d3.json(apiAddress, function (json) {
      var pgObject = json;
      console.log('-----get new data from server and rerender-----')
      this.setState({
        zoomLevel: this.state.zoomLevel,
        data: pgObject
      });
    }.bind(this));
    // var apiAddress = "/feederData/?zoomLevel=9";
    // d3.json(apiAddress, function (json) {
    //   var pgObject = json['tree'];
    //   console.log('data read from server-----------------')
    //   console.log(pgObject)
    //   this.setState({
    //     data: pgObject,
    //     zoomLevel: this.state.zoomLevel,
    //   });
    // }.bind(this));
  },
  render: function() {
    console.log('App render');
    return (
     <div className="row">
      <div className="col s2">
        {this.state.data ? <Filter onFilterChange={this.onFilterChange} currFilter={this.state.filter}/> : <Preloader />
        }
      </div>
      <div className="col s10"> 
         <div className="row">
            <div className="col s4">
              <ul className="tabs">
                <li className="tab col s2"><a href="#vis" className="active">Vis</a></li>
                <li className="tab col s2"><a href="#table">Table</a></li>
              </ul>
            </div>
            <div id="vis" className="col s12"><VisContainer zoomLevel={this.state.zoomLevel} data={this.state.data} height={600} onSelectChange={this.onSelectChange}  onViewChange={this.onViewChange}  onFilterChange={this.onFilterChange} selected={this.state.selected} filter={this.state.filter} /></div>
            <div id="table" className="col s12"><FilterableElementTable data={this.state.data} height={600} selected={this.state.selected} filter={this.state.filter} viewMode={this.state.viewMode} onSelectChange={this.onSelectChange} /></div>
          </div>
      </div>
    </div>
      )
  }
})
//glue code with django template
window.MyApp = {
  init: function(data) {
    ReactDOM.render(
      <DashBoard />,
      document.getElementById('app')
    );
  }
}