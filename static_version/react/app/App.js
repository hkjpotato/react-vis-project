//App.js
//our app js now become a glue code for django
var React = require('react');
var ReactDOM = require('react-dom');
var VisContainer = require('./components/VisContainer');
var Filter = require('./components/Filter');
var Preloader = require('./components/Preloader');
var FilterableElementTable = require('./components/FilterableElementTable');
var PopTable = require('./components/PopTable');

var RunningLoader = require('./components/RunningLoader');
var SideBar = require('./components/SideBar');
var SearchBar = require('./components/SearchBar');

var transmissionData = null;
var playInterval = null;


var DashBoard = React.createClass({
  onViewChange: function(updateMapProps) {
    console.info('App onViewChange called');
    var updateZoomLevel = updateMapProps.zoomLevel;
    var updateMapCenter = updateMapProps.mapCenter;
    if (updateZoomLevel < 14 && this.state.mapProps.zoomLevel >= 14) {
      console.info('remove distribution data');
      this.setState({
        mapProps: {
          zoomLevel: updateZoomLevel,
          mapCenter: updateMapCenter,
        },
       data: {
          transmission: this.state.data.transmission,
          distribution: null
        },
        dataChange: 'distribution'
      });
    } else {
      this.setState({
        mapProps: {
          zoomLevel: updateZoomLevel,
          mapCenter: updateMapCenter,
        },
        dataChange: false
      });
    }
    return;
  },
  getInitialState: function() {
    return {
      caseName: 'newyork',
      editing: false,
      data: {
        distribution: null,
        transmission: null
      },
      outputdata: null,
      selected: null,
      filter: null,
      viewMode: 'vis',
      process: 'ready',
      playing: false,
      timeVal: 1,
      tColor: 'aqua',
      dColor: 'white',
      mapStyle: 'satellite',
      mapProps: {
        zoomLevel: 11,
        mapCenter: new google.maps.LatLng(41.0699044, -71.909294)
      },
      dataChange: false,
      multiSelectMap: null,
      hovering: null,
      popUp: false
    }
  },
  onMapStyleChange: function(mapStyle) {
    this.setState({
      mapStyle: mapStyle,
      dataChange: false
    });
  },
  onTColorChange: function(tColor) {
    this.setState({
      tColor: tColor,
      dataChange: false
    });
  },
  onDColorChange: function(dColor) {
    this.setState({
      dColor: dColor,
      dataChange: false
    });
  },
  hoverCb: function(d) {
    this.setState({
      hovering: d
    })
  },
  loadFeederData: function(d, MapVisManager) {
    if (d.name !== 'f6_centroid') {
      alert('feeder data not available, click f6_centroid instead :)');
      return;
    }

    // var apiAddress = "/feeder/distributionData/?caseName=" + this.state.caseName +  "&feederName=" + "ders_IEEE123";
    var apiAddress = "./distribution.json";
    //which will trigger another update based on zoom level change & trigger draw function
    // setTimeout(function() { //for testing time event
      d3.json(apiAddress, function (json) {
        console.info('feeder data ajax call finish, reset state')
        this.setState({
          data: {
            transmission: this.state.data.transmission,
            distribution: json
          },
          dataChange: 'distribution'
        });

        //trigger another update based on zoom level change & trigger draw function
        MapVisManager.map.setZoom(14);

        //just to ensure the draw function is get called, but it will make it weird...
        // MapVisManager.overlay.draw();
      }.bind(this)); 
    // }.bind(this), 2000)
  },
  loadTransData: function(MapVisManager) {
    //this function will be called when map is available
    console.info('loadTransData - ajax call - get the transmission data')
    var apiAddress = "./transmission.json";
    // var apiAddress = "/feeder/transmissionData/?caseName=" + this.state.caseName +  "&transmissionName=" + "transmission";
    // var apiAddress = "/feeder/distributionData/?caseName=" + this.state.caseName +  "&feederName=" + "ders_IEEE123";
    // var apiAddress = "/feeder/feederData/?zoomLevel=" + this.state.mapProps.zoomLevel;
    // setTimeout(function() {
      d3.json(apiAddress, function (json) {
        console.info('loadTransData - ajax call finish, reset state')
        this.setState({
          data: {
            distribution: this.state.data.distribution,
            transmission: json
          },
          dataChange: 'transmission'
        });
        //call draw function
        MapVisManager.overlay.draw();
      }.bind(this));
    // }.bind(this), 3000);
  },
  onSelectChange: function(d) {
    console.info('app on SelectChange ', d)
    if (!d) {
      this.setState({
        selected: null,
        dataChange: false,
        editing: false
      });
      return;
    } else {
      this.setState({
        selected: d,
        dataChange: false,
        editing: false
      })
    }
  },
  onTimeChange: function(timeVal) {
    this.setState({
      timeVal: timeVal
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
        }.bind(this), 1000);
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
    console.debug('app didMount')
    //dont make the ajax before the map is available
    // self = this;
    // //for demo purpose
    // console.debug('app didMount - ajax call - get the transmission data')
    // var apiAddress = "/feeder/transmissionData/?caseName=" + this.state.caseName +  "&transmissionName=" + "transmission";
    // // var apiAddress = "/feeder/distributionData/?caseName=" + this.state.caseName +  "&feederName=" + "ders_IEEE123";
    // // var apiAddress = "/feeder/feederData/?zoomLevel=" + this.state.mapProps.zoomLevel;
    

    // setTimeout(function() {
    //   d3.json(apiAddress, function (json) {
    //     console.debug('app didMount - ajax call finish, reset state')
    //     this.setState({
    //       data: {
    //         distribution: this.state.data.distribution,
    //         transmission: json
    //       },
    //       dataChange: 'transmission'
    //     });
    //   }.bind(this));
    // }.bind(this), 2000)
  },
  runAnalysis: function() {
    if (this.state.process == "finished") {
      this.setState({
        process: 'ready',
        outputdata: null,
        dataChange: false
      })
    } else {
      this.setState({
        process: 'running'
      });
      setTimeout(function() {
        // var apiAddress = "/feeder/distributionOutputData/?caseName=" + this.state.caseName +  "&feederName=" + "ders_IEEE123";
        var apiAddress = "./output.json";
        d3.json(apiAddress, function (json) {
          this.setState({
            outputdata: json,
            process: 'finished',
            dataChange: false
          });
        }.bind(this));
        }.bind(this), 2000);
      }
  },
  render: function() {
    console.debug('app render')
    var status = this.state.process === "ready" ? "run" : this.state.process;
    return (
     <div className="mui-row" style={{height: '100%', padding: '10px'}}>
      <div className="mui-col-md-2" style={{height: "100%"}}>
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
      <div className="mui-col-md-10" style={{height: '100%'}}> 
         <div className="mui-row" style={{height: '100%', position: 'relative'}}>
            <div className="mui-col-md-4">
              <ul className="mui-tabs__bar">
                <li className="mui-col-md-2"><a data-mui-toggle="tab" data-mui-controls="vis">Vis</a></li>
                <li className="mui-col-md-2"><a data-mui-toggle="tab" data-mui-controls="table">Table</a></li>
              </ul>
            </div>
            {this.state.process === "running" ?  
              <RunningLoader /> : null
            }
            <div id="vis" style={{height: '90%', position: 'relative'}} className="mui-col-md-12 mui-tabs__pane mui--is-active">
              <VisContainer 
                  loadFeederData={this.loadFeederData}
                  loadTransData={this.loadTransData}
                  popUp={this.state.popUp}
                  height={this.state.popUp ? '60%' : '100%'} 
                  hovering={this.state.hovering}
                  multiSelectMap={this.state.multiSelectMap}
                  mapStyle={this.state.mapStyle} 
                  tColor={this.state.tColor} 
                  dColor={this.state.dColor} 
                  updateElement={this.updateElement}
                  editStateChange={this.editStateChange} 
                  onPlayClick={this.onPlayClick} 
                  onTimeChange={this.onTimeChange} 
                  timeVal={this.state.timeVal} 
                  playing={this.state.playing} 
                  process={this.state.process} 
                  dataChange={this.state.dataChange} 
                  mapProps={this.state.mapProps} 
                  data={this.state.data} 
                  outputdata={this.state.outputdata} 
                  onSelectChange={this.onSelectChange}  
                  onViewChange={this.onViewChange}  
                  onFilterChange={this.onFilterChange} 
                  selected={this.state.selected}
                  editing={this.state.editing} 
                filter={this.state.filter} />
            </div>
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
      <DashBoard style={{height: '100%'}}/>,
      document.getElementById('app')
    );
  }
}