//App.js
//our app js now become a glue code for django
var React = require('react');
var ReactDOM = require('react-dom');
var VisContainer = require('./components/Display/VisContainer');
var Filter = require('./components/Display/Filter');
var Preloader = require('./components/Display/Preloader');
var FilterableElementTable = require('./components/Display/FilterableElementTable');
var RunningLoader = require('./components/Display/RunningLoader');
var SideBar = require('./components/Display/SideBar');
var transmissionData = null;
var playInterval = null;
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
  onViewChange: function(updateMapProps) {
    console.log('VIEW INFO!!!!!!!', updateMapProps);
    // return;
    var updateZoomLevel = updateMapProps.zoomLevel;
    var updateMapCenter = updateMapProps.mapCenter;
    // return;
    // This is for demo purpose, in the real app, should make the query based on  zoomLevel
    var apiAddress = "";
    var shouldUpdateData = false;
    var updateViewLevel = (updateZoomLevel < 14 ) ? 'transmission' : 'distribution';
    if (updateViewLevel !== currViewLevel) {
        console.log('!!!!!!!--------VIEW LEVEL CHANGE--------!!!!!!!');
        //view level change, must fetch new data
        currViewLevel = updateViewLevel;
        shouldUpdateData = true;
        if (currViewLevel == "transmission") {
            // apiAddress = transmissionLevelHash["all"];
            apiAddress = "nyc_transmission.json";
        } else {
           // console.log('!!!!!!!--------INTO DISTRIBUTION--------!!!!!!!');
           // console.log(updateMapCenter.lat(), updateMapCenter.lng())
           // if (updateMapCenter.lng() < -84.3741392665842) {
           //  apiAddress = "feederATL12.json";
           //  currentFeeder = "feederATL12";

           // } else {
           //  apiAddress = "nyc2.json";
           //  currentFeeder = "nyc2";
           // }

           // var feederName = getDistributionHashKey(newBound);
           // currentFeeder = feederName;
           // // console.log('!!!!!!!--------ENTER Feeder BOUNDARY--------!!!!!!!', feederName);
           // apiAddress = distributionLevelAPIMap[feederName];
           apiAddress = "nycfull.json"
        }
    } else {
        console.log('!!!!!!!--------VIEW LEVEL NOT CHANGE--------!!!!!!!');
        // same level, check boundary
        // if (currViewLevel === "transmission") {
        //     //no need to check at this moment, it's always all
        // } else {
        //   var feederName = null;
        //    if (updateMapCenter.lng() < -84.3741392665842) {
        //     apiAddress = "feederATL12.json";
        //     feederName = "feederATL12";
        //    } else {
        //     apiAddress = "nyc2.json";
        //     feederName = "nyc2";
        //    }
        //     if (feederName !== currentFeeder) {
        //         console.log('!!!!!!!--------ENTER NEW BOUNDARY--------!!!!!!!', feederName);
                
        //         if (!feederName) {
        //             // console.log('!!!!!!!--------HOLY NO Feeder FOUND--------!!!!!!!');
        //             shouldUpdateData = false;
        //         } else {
        //             //new feeder, need to update
        //             shouldUpdateData = true;
        //             currentFeeder = feederName;
        //             apiAddress = feederName + ".json"
        //         }
        //     } else {
        //         //do nothing
        //         // console.log('!!!!!!!--------STAY IN OLD BOUNDARY--------!!!!!!!', currentFeeder);

        //     }
        // }
    }
    if (shouldUpdateData) {
        d3.json(apiAddress, function (json) {
        // d3.json("/feederData/?zoomLevel=10", function (json) {
          var pgObject = json;
          // console.log('-----get new data from server and rerender-----')
          this.setState({
            // mapProps: {
            //   zoomLevel: updateZoomLevel,
            //   mapCenter: updateMapCenter
            // },
            data: Object.assign(pgObject, transmissionData),
            dataChange: true,
          });
        }.bind(this));
    } else {
      // this.setState({
      //   mapProps: updateMapProps
      // });
    }
  },
  getInitialState: function() {
    return {
      data: null,
      selected: null,
      filter: null,
      viewMode: 'vis',
      process: 'ready',
      playing: false,
      timeVal: 1,
      tColor: 'black',
      dColor: 'white',
      mapStyle: 'satellite',
      mapProps: {
        zoomLevel: 12,
        // mapCenter: new google.maps.LatLng(33.7490, -84.3880)
        // mapCenter: new google.maps.LatLng(33.714380261152506, -84.3741392665842)
        mapCenter: new google.maps.LatLng(41.0699044, -71.909294)
      },
      dataChange: false
    }
  },
  onMapStyleChange: function(mapStyle) {
    this.setState({
      mapStyle: mapStyle
    });
  },
  onTColorChange: function(tColor) {
    this.setState({
      tColor: tColor
    });
  },
  onDColorChange: function(dColor) {
    this.setState({
      dColor: dColor
    });
  },
  onSelectChange: function(d) {
    if (d && d.object === "centroid") {
      console.log('NO WAY!')
    } else {
      console.log('DashBoard onSelectChange: ', d);
      this.setState({
        selected: d,
        dataChange: false
      });
    }
  },
  onTimeChange: function(timeVal) {
    this.setState({
      timeVal: timeVal
    });
  },
  addElement: function(data) {
    //ajax



    //update state
    var currpgObj = this.state.data;
    
    var nextIndex = Object.keys(currpgObj).reduce(function(prev, curr) {
      return Math.max(prev, curr);
    }, -Number.MAX_VALUE) + 1;

    var newEle = {
      pgIndex: nextIndex,
      object: data.eleObj,
      name: "hkjpotato",
      // name: data.eleObj + nextIndex,

      parent: data.parent,
    };

    currpgObj[nextIndex] = newEle;
    this.setState({
      data: currpgObj,
      dataChange: true,
      // selected: null
    });
  },
  removeElement: function(data) {
    //ajax

    //update state
    var newIndex = 2000;
    var newEle = {
      pgIndex: 2000,
      object: data.eleObj,
      name: "hkjpotato",
      parent: data.parent,
    };
    var currpgObj = this.state.data;
    currpgObj[newIndex] = newEle;
    this.setState({
      data: currpgObj,
      dataChange: true
    });
  },
  onPlayClick: function() {
    if (!this.state.playing) {

        clearInterval(playInterval);
        playInterval = setInterval(function() {
            var currValue = this.state.timeVal;
            this.setState({
                timeVal: (((currValue + 1) - 1) % 24 + 1)
            })
        }.bind(this), 2000);
    } else {
        clearInterval(playInterval);
    }
    this.setState({
        playing: !this.state.playing
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
    // console.log('DashBoard component did mount');
    // $(document).ready(function(){

    // });
    $('ul.tabs').tabs({
      onShow: function(event) {
        self.setState({
          viewMode: $(event).attr('id')
        });
      }
    });
    //for demo purpose
    var apiAddress = "nyc.json";
    // var apiAddress = "feederATL12.json"nyc_transmission
    d3.json("nyc_transmission.json", function(json) {
    transmissionData = json;
      d3.json(apiAddress, function (json) {
        var pgObject1 = json;
          d3.json("nyc_transmission.json", function (json) {
            var pgObject2 = json;
            var pgObject = {};
            Object.assign(pgObject, transmissionData);
            this.setState({
              data: pgObject,
              dataChange: true
            });
          }.bind(this));
        // console.log('-----get new data from server and rerender-----');
        // // console.log(this.state.zoomLevel, this.state.mapCenter);
        // this.setState({
        //   // mapProps: {
        //   //   zoomLevel: this.state.zoomLevel,
        //   //   mapCenter: this.state.mapCenter,
        //   // },
        //   data: pgObject,
        //   dataChange: true
        // });
      }.bind(this));
    }.bind(this));

    // var apiAddress = "/feederData/?zoomLevel=" + this.state.zoomLevel;
    // d3.json(apiAddress, function (json) {
    //   var pgObject = json;
    //   console.log('data read from server-----------------')
    //   console.log(pgObject)
    //   this.setState({
    //     data: pgObject,
    //     dataChange: true
    //     // mapProps: {
    //     //   mapCenter: this.state.mapCenter,
    //     //   zoomLevel: this.state.zoomLevel,
    //     // }
    //   });
    // }.bind(this));
  },
  runAnalysis: function() {
    if (this.state.process == "finished") {
      this.setState({
        process: 'ready'
      })
    } else {
      this.setState({
        process: 'running'
      });
      setTimeout(function() {
        this.setState({
          process: 'finished'
        });
        }.bind(this), 3000);
      }
  },
  render: function() {
    var status = this.state.process === "ready" ? "run" : this.state.process;
    return (
     <div className="row" style={{height: '100%'}}>
      <div className="col s2" style={{height: "100%"}}>
        <SideBar 
          tColor={this.state.tColor} 
          dColor={this.state.dColor}
          mapStyle={this.state.mapStyle}
          onMapStyleChange={this.onMapStyleChange} 
          onTColorChange={this.onTColorChange} 
          onDColorChange={this.onDColorChange} 
          status={status} 
          runAnalysis={this.runAnalysis}data={this.state.data} 
          onFilterChange={this.onFilterChange} 
          filter={this.state.filter} />
      </div>
      <div className="col s10" style={{height: '100%'}}> 
         <div className="row" style={{height: '100%', position: 'relative'}}>
            <div className="col s4">
              <ul className="tabs">
                <li className="tab col s2"><a href="#vis" className="active">Vis</a></li>
                <li className="tab col s2"><a href="#table">Table</a></li>
              </ul>
            </div>
            {this.state.process === "running" ?  
              <RunningLoader /> : null
            }
            <div id="vis" style={{height: '90%'}} className="col s12">
              <VisContainer 
                mapStyle={this.state.mapStyle} 
                tColor={this.state.tColor} 
                dColor={this.state.dColor} 
                addElement={this.addElement} 
                onPlayClick={this.onPlayClick} 
                onTimeChange={this.onTimeChange} 
                timeVal={this.state.timeVal} 
                playing={this.state.playing} 
                process={this.state.process} 
                dataChange={this.state.dataChange} 
                mapProps={this.state.mapProps} 
                data={this.state.data} 
                height={'100%'} 
                onSelectChange={this.onSelectChange}  
                onViewChange={this.onViewChange}  
                onFilterChange={this.onFilterChange} 
                selected={this.state.selected} 
                filter={this.state.filter} />
              </div>
            <div id="table"  style={{height: '90%'}} className="col s12">
              <FilterableElementTable 
                data={this.state.data} 
                height={'100%'} 
                selected={this.state.selected} 
                filter={this.state.filter} 
                viewMode={this.state.viewMode} 
                onSelectChange={this.onSelectChange} />
              </div>
          </div>
      </div>
    </div>
      )
  }
})

    //  <div className="row">
    //   <div className="col s2">
    //     {this.state.data ? <Filter onFilterChange={this.onFilterChange} currFilter={this.state.filter}/> : <Preloader />
    //     }
    //   </div>
    //   <div className="col s10"> 
    //      <div className="row">
    //         <div className="col s4">
    //           <ul className="tabs">
    //             <li className="tab col s2"><a href="#vis" className="active">Vis</a></li>
    //             <li className="tab col s2"><a href="#table">Table</a></li>
    //           </ul>
    //         </div>
    //         <div id="vis" className="col s12"><VisContainer dataChange={this.state.dataChange} mapProps={this.state.mapProps} data={this.state.data} height={'100%'} onSelectChange={this.onSelectChange}  onViewChange={this.onViewChange}  onFilterChange={this.onFilterChange} selected={this.state.selected} filter={this.state.filter} /></div>
    //         <div id="table" className="col s12"><FilterableElementTable data={this.state.data} height={'100%'} selected={this.state.selected} filter={this.state.filter} viewMode={this.state.viewMode} onSelectChange={this.onSelectChange} /></div>
    //       </div>
    //   </div>
    // </div>
//glue code with django template
window.MyApp = {
  init: function(data) {
    ReactDOM.render(
      <DashBoard style={{height: '100%'}}/>,
      document.getElementById('app')
    );
  }
}