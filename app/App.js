//App.js
//our app js now become a glue code for django
var React = require('react');
var ReactDOM = require('react-dom');
var VisContainer = require('./components/Display/VisContainer');
var Filter = require('./components/Display/Filter');
var Preloader = require('./components/Display/Preloader');
var FilterableElementTable = require('./components/Display/FilterableElementTable');

var feeder0bound =
{lat0: 33.988123534791015, 
lng0: -83.92063938426975, 
lat1: 33.53298252904022, 
lng1: -84.85264622020725
}

var feeder1bound = 
{
lat0: 33.988123534791015,
lng0: -82.98863254833225,
lat1: 33.53298252904022, 
lng1: -83.92063938426975
}
var feeder2bound =  {
lat0: 33.988123534791015,
 lng0: -84.852646220207258, 
lat1: 33.53298252904022, 
lng1: -85.78465305614475
}

var inBound = function(curr, target) {
    if (curr.lat0 < target.lat0 
        && curr.lng0 < target.lng0 
        && curr.lat1 > target.lat1
        && curr.lng1 > target.lng1) {
        return true;
    }
    return false;
}

var getDistributionHashKey = function(newBound) {
    if (inBound(newBound, feeder0bound)) {
        return "feeder0";
    } else if (inBound(newBound, feeder1bound)) {
        return "feeder1";
    } else if (inBound(newBound, feeder2bound)) {
        return "feeder2";
    } else {
        return "test";
    }
}

var currentFeeder = "null";
var currViewLevel = 'transmission';

var transmissionLevelHash = {
    "all": "transmission.json"
}
var distributionLevelAPIMap = {
    "feeder0": "feeder0.json",
    "feeder1": "feeder1.json",
    "feeder2": "feeder2.json",
    "test": "transmission.json"
}

var DashBoard = React.createClass({
  onViewChange: function(zoomLevel, newBound) {
    console.log('VIEW INFO', zoomLevel, newBound);
    // This is for demo purpose, in the real app, should make the query based on  zoomLevel
    var apiAddress = "";
    var shouldUpdate = false;
    var updateViewLevel = (zoomLevel <= 10 ) ? 'transmission' : 'distribution';
    if (updateViewLevel !== currViewLevel) {
        console.log('!!!!!!!--------VIEW LEVEL CHANGE--------!!!!!!!');
        //view level change, must fetch new data
        currViewLevel = updateViewLevel;
        shouldUpdate = true;
        if (currViewLevel == "transmission") {
            apiAddress = transmissionLevelHash["all"];
        } else {
           // console.log('!!!!!!!--------INTO DISTRIBUTION--------!!!!!!!');
           var feederName = getDistributionHashKey(newBound);
           currentFeeder = feederName;
           // console.log('!!!!!!!--------ENTER Feeder BOUNDARY--------!!!!!!!', feederName);
           apiAddress = distributionLevelAPIMap[feederName];
        }
    } else {
        // console.log('!!!!!!!--------VIEW LEVEL NOT CHANGE--------!!!!!!!');
        //same level, check boundary
        if (currViewLevel === "transmission") {
            //no need to check at this moment, it's always all
        } else {
            var feederName = getDistributionHashKey(newBound);
            if (feederName !== currentFeeder) {
                console.log('!!!!!!!--------ENTER NEW BOUNDARY--------!!!!!!!', feederName);
                
                if (!feederName) {
                    // console.log('!!!!!!!--------HOLY NO Feeder FOUND--------!!!!!!!');
                    shouldUpdate = false;
                } else {
                    //new feeder, need to update
                    shouldUpdate = true;
                    currentFeeder = feederName;
                    apiAddress = distributionLevelAPIMap[currentFeeder];
                }
            } else {
                //do nothing
                // console.log('!!!!!!!--------STAY IN OLD BOUNDARY--------!!!!!!!', currentFeeder);

            }
        }
    }
    if (shouldUpdate) {
        d3.json(apiAddress, function (json) {
        // d3.json("/feederData/?zoomLevel=10", function (json) {
          var pgObject = json;
          console.log('-----get new data from server and rerender-----')
          this.setState({
            zoomLevel: zoomLevel,
            data: pgObject,
            dataChange: true,
            mapCenter: {
              //only affect when the map is created, will not affect map update
              lat: (newBound.lat0 + newBound.lat1) / 2,
              lng: (newBound.lng0 + newBound.lng1) / 2
            }
          });
        }.bind(this));
    }
  },
  getInitialState: function() {
    return {
      data: null,
      selected: null,
      filter: null,
      viewMode: 'vis',
      zoomLevel: 9,
      mapCenter: {
        lat: 33.7490, 
        lng: -84.3880
      },
      dataChange: true
    }
  },
  onSelectChange: function(d) {
    console.log('DashBoard onSelectChange: ', d);
    this.setState({
      selected: d,
      dataChange: false
    });
  },
  onFilterChange: function(d) {
    console.log('DashBoard onFilterChange: ', d)
    this.setState({
      filter: d,
      dataChange: false
    });
  },
  componentDidMount: function() {
    self = this;
    console.log('DashBoard component did mount');
    $(document).ready(function(){
      $('ul.tabs').tabs({
        onShow: function(event) {
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
      console.log('-----get new data from server and rerender-----', pgObject)
      this.setState({
        zoomLevel: this.state.zoomLevel,
        mapCenter: this.state.mapCenter,
        data: pgObject
      });
    }.bind(this));
    // var apiAddress = "/feederData/?zoomLevel=9";
    // d3.json(apiAddress, function (json) {
    //   var pgObject = json;
    //   console.log('data read from server-----------------')
    //   console.log(pgObject)
    //   this.setState({
    //     data: pgObject,
    //     mapCenter: this.state.mapCenter,
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
            <div id="vis" className="col s12"><VisContainer dataChange={this.state.dataChange} zoomLevel={this.state.zoomLevel} mapCenter={this.state.mapCenter} data={this.state.data} height={600} onSelectChange={this.onSelectChange}  onViewChange={this.onViewChange}  onFilterChange={this.onFilterChange} selected={this.state.selected} filter={this.state.filter} /></div>
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