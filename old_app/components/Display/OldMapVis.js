var React = require('react');
var ReactDOM = require('react-dom');

//global data
var d3MapVis = {};
var pgObject = null;
var name2eleMap = {};

//data
var nodes = [];
var links = [];

//d3 selections
var vis = null;
var node = null;
var link = null;
//color scale
var color = d3.scale.category20();

var eleColorMap = {
  "load": '#ff6d6d',
  "generator": '#ffca6d',
  "storage": '#6dcaff',
  "solar": '#FFFF00 ',
  "capacitor": '#00c26d',
}
var eleMap = {
  "load": 0,
  "generator": 1,
  "storage": 2,
  "solar": 3,
  "capacitor": 4,
}
var eleTextCodeMap = {
  "load": '\uf063',
  "generator": '\uf0e7',
  "storage": '\uf241',
  "solar": '\uf005',
  "capacitor": '\uf187',
}


// D3 Component
d3MapVis.overlay = null;
d3MapVis.create = function(el, initProps, clickCb, onViewChange) {
  //attach the initial props here
  this.initProps = initProps;
  this.clickCb = clickCb;
  this.onViewChange = onViewChange;

  // Create the Google Map…
  var map = new google.maps.Map(el, {
    zoom: initProps.zoomLevel,
    center: new google.maps.LatLng(initProps.mapCenter.lat, initProps.mapCenter.lng),
    // mapTypeId: google.maps.MapTypeId.ROADMAP,
    // disableDefaultUI: true,
    styles: mapStyles
  });

  this._map = map;
  // The custom MapVisOverlay object contains a reference to the map.
  //
  this.overlay = new MapVisOverlay(map);
}
//for component unmount
d3MapVis.destroy = function() {
    this.overlay.setMap(null);
}

//update is where the data binding and general d3 update patterns happen
d3MapVis.update = function(props, clickCb) {
    console.log("**********d2MapVIs update********")
    // if (props.dataChange) {
    // this._map.setCenter(new google.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng));
    // return;
    // var zoomCurr = 12;
    // setInterval(function() {
    //   console.log('hi');
    //   // this._map.setZoom(zoomCurr--);
    // }.bind(this), 2000)
    // }

    console.log('MapVis.update with props', props);
    var selected = props.selected;
    var filter = props.filter;

    // console.log('d3Map update');
    //up to now, the data should be update by parseData already
    var l = vis.select("#mapLinkLayer").selectAll(".link").data(links, function(d) {
            return d.source.pgIndex + "-" +  d.target.pgIndex;
        });
    var n = vis.selectAll('.node').data(nodes, function(d) {
        return d.pgIndex
    });
    // enter link
    _enterLinks(l);
    // exit link
    _exitLinks(l);
    // enter node, should attach event listener
    _enterNodes(n, clickCb);
    // exit node
    _exitNodes(n);

    //update + enter
    link = vis.select("#mapLinkLayer").selectAll(".link");
    node = vis.selectAll(".node");

    // //update elements for both update & enter, as well as do update pattern
    node
      .each(function(d) {
        var elementsData = Object.keys(d.elements).map(function(key) {
          return d.elements[key];
        })
        var elements = d3.select(this)
          .select(".elements")
          .selectAll('text')
          .data(elementsData, function(ele) {
            return ele.object
          });
        elements.enter()
          .append('text')
          .attr("x", function(d, i) { 
            //arrange them in order of load/generator/storage/solar/capacitor
            return eleMap[d.object] * 10})
          .attr("dy", 15)
          .attr('font-size', '1.2em')
          .attr("fill", function(d) {
            return eleColorMap[d.object]
          })
          .attr('font-family', 'FontAwesome')
          .text(function(d) {
            return eleTextCodeMap[d.object] }
          )
          .style("cursor", "pointer")
          .on('click', function(d) {
            console.log('circle click cb', d);
            clickCb(d);
          });

        elements.exit().remove()
      });
    //render color
    node
    .style('fill', function(d) {
        if (d.object=="node") {
          return "#4c4c4c";
        } else if (d.object=="t_node"){
          return "#0073E5"
        }
        return color(d.object);
    });

    // highlight select, might be no efficiency
    var selectedName = selected ? selected.name : null;
    node.selectAll('.elements').selectAll('text')
      .style('stroke-width', function(d) {
          if (d.name === selectedName) return 1;
          return 0;
      })
      .style('stroke', function(d) {
          if (d.name === selectedName) return 'lime';
          return 'black';
      });

    //render filter
    if (filter) {
        node.selectAll('.elements').selectAll('text')
          .style('opacity', function(d) {
            if (d.object == filter) {
                return 1;
            } else {
                return 0.1;
            }
        });
        link.style('opacity', 0.1);
    } else {
        node.select('.elements').selectAll('text').style('opacity', 1);  
        link.style('opacity', 1);
    }
    //call draw function after data binding to rearrange the location
    // this.overlay.draw();
}

var _enterLinks = function(l) {
    l.enter()
        .append('line')
        .attr("class", "link")
        .style('stroke', function(d) {
            if (d.linkType == "parentChild") {
              return "black";
            }
          return color(d.object)
        })
        .style('stroke-opacity', 1)
        .style('stroke-width', function(d) {
            if (d.linkType == "fromTo") {
                if (d.object == "transmission_line") {
                    return 3;
                }
                return 2;
            }
            if (d.linkType == "parentChild") {
              return 2;
            }
            return 1;
        })
        .style("stroke-dasharray", function(d) {
            if (d.linkType == "parentChild") {
                return ("3, 3");
            }
        })
        // .attr("marker-end", function(d) {
        //     if (d.linkType === "parentChild") {
        //         return "url(#end)";
        //     }
        // });
}

var _exitLinks = function(l) {
    l.exit().remove();
}

var _enterNodes = function(n, clickCb) {
    //for the enter
    var nodeG = n.enter()
        .append("g")
        .attr("class", "node")
    nodeG.append("rect")
      .attr("x", function(d) {
        // return d.object === "t_node" ? -15 : 0;
        return -15;
      })
      .attr("y", 0)
      .attr("width", function(d) {
        return d.object === "centroid" ? 10 : 20;
      })
      .attr("height", function(d) {
        return d.object === "centroid" ? 10 : 2;
      })
      .style("cursor", "pointer")
      .style("opacity", function(d) {
         return d.object === "centroid" ? 1 : 1;
      })
      .on('click', function(d) {
          // if (d.object === 'centroid') {
          //   // d3MapVis._map.setZoom(12);
          //   // return;
          // }
          console.log('circle click cb', d);
          clickCb(d);
      })

    //just attach the elements container here
    nodeG.append("g")
         .attr("class", "elements");

    nodeG.append("text")
     .attr("x", function(d) {
        return "0em";
     })
     .attr("dy", "-.3em")
     .style("font-size", ".8em")
     .text(function(d) {
      if (d.object === "node") {
        var str = d.name;
        // str.length
        return str.substring(0, str.length - 10);
      }
      return d.name;
    })
}

var _exitNodes = function(n) {
    n.exit().remove();
}

//most important!: use to update the nodes and links data
d3MapVis.parseData = function(data) {

    pgObject = data;
    console.log("^^^CRAZY PARSE DATA DUE TO DATA CHANGE^^^");
    //at this moment, we always clear the data
    nodes = [];
    links = [];
    // console.log('parseData', pgObject);
    //parse data into the nodes and links
    if (nodes.length == 0) {
        for (var x in pgObject) {
            //in a tree, if an element has either name or module but from is undefined, it must be a node
            if ((pgObject[x].name != undefined || pgObject[x].module != undefined) && pgObject[x].from == undefined) {
                var nodeName = pgObject[x].name;
                var nodeObject = pgObject[x].object;
                //only regard d_bus as a node
                if (nodeObject === "node" || nodeObject === "t_node") {
                  var newNode = {
                      name: nodeName,
                      pgIndex: parseInt(x),
                      object: nodeObject,
                      x: pgObject[x].lat,
                      y: pgObject[x].lng,
                      elements: {}
                  };
                  nodes.push(newNode)
                  name2eleMap[nodeName] = newNode;
                }
                if (nodeObject === "centroid") {
                  var newNode = {
                      name: nodeName,
                      pgIndex: parseInt(x),
                      object: nodeObject,
                      x: pgObject[x].lat,
                      y: pgObject[x].lng,
                      elements: {}
                  };
                  nodes.push(newNode)
                  name2eleMap[nodeName] = newNode;
                }
            }
        }
        // Go through a second time and set up the links:
        for (var x in pgObject) {
            // in a pgObject, if an element has name
            if (pgObject[x].name != undefined) {
                //then if it has from to, it is a fromto link
                if (pgObject[x].from != undefined && pgObject[x].to != undefined) {
                    links.push({
                        source: name2eleMap[pgObject[x].from],
                        target: name2eleMap[pgObject[x].to],
                        object: pgObject[x].object,
                        linkType: 'fromTo'
                    })
                } 
                else if (pgObject[x].parent != undefined) {
                    if (pgObject[x].object == "centroid") {
                      //else if it has parent, it is a parentChild link
                      links.push({
                          source: name2eleMap[pgObject[x].parent],
                          target: name2eleMap[pgObject[x].name],
                          linkType: 'parentChild'
                      });
                    } else {
                      //it is an element, attach the data to the right element
                      var parentNode = name2eleMap[pgObject[x].parent];
                      // var nodeName = pgObject[x].name;
                      var eleObject = pgObject[x].object;

                      parentNode.elements[eleObject]
                        = pgObject[x];
                    }
                }
            }
        }
    }
}

//GoogleMapOverlay Component
MapVisOverlay.prototype = new google.maps.OverlayView();
/** @constructor */
function MapVisOverlay(map) {
  console.log('*************new MapVisOverlay*************')
  this._map = map;
  // Define a property to hold the vis div. We'll
  // actually create this div upon receipt of the onAdd()
  // method so we'll leave it null for now.
  this._div = null;
  // Explicitly call setMap on this overlay.
  this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
MapVisOverlay.prototype.onAdd = function() {
    console.log('*************Map on Add*************')
    //when the overlay is added, get the pane
    var panes = d3.select(this.getPanes().overlayMouseTarget);
    // Add the layer div, relative position to the "overlayLayer" panes.
    var div = panes.append("div")
        .attr("class", "layerDiv")
        .style({
          width: '100%',
          height: '100%',
          position: 'relative',
          // outline: '2px solid green'
        });
    //update the div
    this._div = div;
    //on the layer div, attach the absolute & HUGE svg
    var mapSvgContainer = div.append("svg")
        .attr('id', 'mapSvgContainer')
        .style({
          position: 'absolute',
          width: '8000px',
          height: '8000px',
          left: '-4000px',
          top: '-4000px',
        })
        .on('click', function() {
            if (window.event.target.tagName == 'svg') {
                // props.itemClick(null);
                d3MapVis.clickCb(null);
            }
        });

    //attach the actuall global vis
    vis = mapSvgContainer.append("g")
        .attr("id", "mapPowerGrid");
    vis.append('g').attr('id','mapLinkLayer');
    // build the arrow.
    vis.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
    //call MapVis.update to do data binding before drawing
    d3MapVis.update(d3MapVis.initProps, d3MapVis.clickCb);
}
//this function is called every time the map is zoom in/out
//drawing is only in charge of relocation!!
MapVisOverlay.prototype.draw = function() {
    console.log('*****draw get called*****');
    // return;
    //try to get the zoom level
    var zoomLevel = this._map.getZoom();

    var lat0 = this._map.getBounds().getNorthEast().lat();
    var lng0 = this._map.getBounds().getNorthEast().lng();
    var lat1 = this._map.getBounds().getSouthWest().lat();
    var lng1 = this._map.getBounds().getSouthWest().lng();

    var bound = {
      lat0: lat0,
      lng0: lng0,
      lat1: lat1,
      lng1: lng1
    }
    // console.log('----zoom-----', zoomLevel);
    // console.log('---new bound-----',bound);

    d3MapVis.onViewChange(zoomLevel, bound);
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();
    // Turn the overlay projection into a d3 vis projection (notice the HUGE svg)
    var googleMapProjection = function (coordinates) {
        // console.log(coordinates)
        var googleCoordinates = new google.maps.LatLng(coordinates.x, coordinates.y);
        var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
        return {
          x : pixelCoordinates.x + 4000, 
          y : pixelCoordinates.y + 4000         
        };
    }
    //turn the pass in data to atlanta based
    var atlanta = function(d) {
      return {
        x: d.x,
        y: d.y
      }
    }
    var pgProjection = function(d) {
      return googleMapProjection(atlanta(d));
    }
    //project location
    link.each(function(d) {
      var source = d.source, target = d.target;
      source = pgProjection(source); 
      target = pgProjection(target);
       d3.select(this)
          .attr('x1', source.x)
          .attr('y1', source.y)
          .attr('x2', target.x)
          .attr('y2', target.y)
          .style("opacity", function(d) {
            if ((d.object === "transmission_line") && zoomLevel > 10) {
              return 0.5;
            }
            if ((d.linkType === "parentChild") && zoomLevel > 10) {
              return 0;
            }
            return 1;
          });
    });
    //TODO: code can be improved!
    node.each(function(d) {
      var d = pgProjection(d);
      d3.select(this)
          .attr("transform", "translate(" + (d.x)+ "," + (d.y) + ")")
          .style("display", function(d) {
            if ((d.object === "centroid" || d.object === "t_node") && (zoomLevel > 10 || zoomLevel <= 7)) {
              return "none";
            }
            return "block";
          })
    });
    node.selectAll('text')
      .style("display", function(d) {
        if (d.object === "node" && zoomLevel <= 11) {
          return "none";
        }
        return "block";
      });
    node.selectAll('.elements')
      .style("display", function(d) {
        return zoomLevel > 12 ? 'block' : 'none';
      });
}
MapVisOverlay.prototype.onRemove = function() {
  console.log('remove overlay');
  this._div.parentNode.removeChild(this.div_);
  this._div = null;
}

//React Component
var MapVis = React.createClass({
    onViewChange: function(zoomLevel, newBound) {
        //no need to check here, pass it to the parent element
        this.props.onViewChange(zoomLevel, newBound);
    },
    singleClick: function(data) {
        //two cases, 1.select change 2.filterchange
        if (data !== null) {
            this.props.onSelectChange(data);
        } else {
            console.log('single click on null');
            this.props.onSelectChange(null);
            this.props.onFilterChange(null);
        }
    },
    componentDidMount: function() {
        console.log('Mapvis didmount!');
        var el = ReactDOM.findDOMNode(this);
        d3MapVis.parseData(this.props.data);
        d3MapVis.create(el, this.props, this.singleClick, this.onViewChange);
    },
    componentDidUpdate: function() {
        console.log('MapVis didUpdate!!!');
        if (this.props.dataChange) {
          // a trick to reduce unnessary data parsing
          d3MapVis.parseData(this.props.data);
        }

        //update data binding
        d3MapVis.update(this.props, this.singleClick);

        //update map view
        d3MapVis._map.setZoom(this.props.zoomLevel);
    },
    componentWillUnMount: function() {
        d3MapVis.destroy();
    },
    render: function() {
        console.log('MapVis render');
        var inlineStyle = {
            width: '100%',
            height: '100%',
        }
        return (
            <div style={inlineStyle} className="mapvis">
            </div>
        )
    }
});

module.exports = MapVis;

var mapStyles = [
    {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "weight": "0.01"
            },
            {
                "gamma": "0.00"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "weight": "0.01"
            },
            {
                "invert_lightness": true
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#dce5e8"
            },
            {
                "visibility": "on"
            }
        ]
    }
]
