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
var color = d3.scale.category10();

d3MapVis.overlay = null;

d3MapVis.create = function(el, initProps, clickCb, onViewChange) {
  //attach the initial props here
  this.initProps = initProps;
  this.clickCb = clickCb;
  this.onViewChange = onViewChange;

  // Create the Google Map…
  var map = new google.maps.Map(el, {
    zoom: initProps.zoomLevel,
    center: new google.maps.LatLng(33.7490, -84.3880),
    // mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    styles: mapStyles
  });
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
    console.log('MapVis.update');
    var selected = props.selected;
    var filter = props.filter;
    console.log('current vis', vis);

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

    //render color
    node
    .style('fill', function(d) {
        return color(d.objectType);
    });
    // highlight select, might be no efficiency
    var selectedName = selected ? selected.name : null;
    node.selectAll('circle')
        .transition()
        .duration(300)
        .attr('r', function(d) {
            // console.log(d);
            if (d.name === selectedName) return 10;
            if (d.objectType == "t_node") return 12;
            if (d.objectType == "node") return 5;
            return 4;
        })
        .style('stroke-width', function(d) {
            if (d.name === selectedName) return 2;
            return 1;
        })
        .style('stroke', function(d) {
            if (d.name === selectedName) return 'lime';
            return 'black';
        });;
    node.selectAll('text')
        .transition()
        .duration(300)
        .style('display', function(d) {
            if (d.name === selectedName) return "inline";
            return "none";
        });
    //render filter
    if (filter) {
        node.style('opacity', function(d) {
            if (d.objectType == filter) {
                return 1;
            } else {
                return 0.1;
            }
        });
        link.style('opacity', 0.1);
    } else {
        node.style('opacity', 1);  
        link.style('opacity', 1);
    }

    //call draw function after data binding to rearrange the location
    this.overlay.draw();
}

var _enterLinks = function(l) {
    l.enter()
        .append('line')
        .attr("class", "link")
        .style('stroke', '#999999')
        .style('stroke-opacity', 1)
        .style('stroke-width', function(d) {
            // return 1;
            if (d.objectType == "fromTo") {
                if (d.linkType == "transmission_line") {
                    return 5;
                }
                return 3;
            }
            return 1;
        })
        .style("stroke-dasharray", function(d) {
            if (d.objectType == "parentChild") {
                return ("2, 1")
            }
            if (d.linkType == "transmission_line") {
                return ("5, 5");
            }
        })
        .attr("marker-end", function(d) {
            if (d.objectType === "parentChild") {
                return "url(#end)";
            }
        });
}

var _exitLinks = function(l) {
    l.exit().remove();
}

var _enterNodes = function(n, clickCb) {
    //for the enter
    var nodeG = n.enter()
        .append("g")
        .attr("class", "node")
        .on("mouseover", function(d) {
            d3.select(this).select('circle')
              .style({"opacity": 0.5});
            d3.select(this).select('text')
              .style({"display": "inline"});
        })
        .on("mouseout", function(d) {
            d3.select(this).select('circle')
              .style({"opacity": 1});
            d3.select(this).select('text')
              .style({"display": "none"});
        })

    nodeG.append("circle")
     .attr("cx", 0)
     .attr("cy", 0)
    .style("cursor", "pointer")
    .on('click', function(d) {
        console.log('circle click cb', d);
        clickCb(d);
    });

    nodeG.append("text")
     .attr("x", function(d) {
        return "1em";
     })
     .attr("dy", ".35em")
     .style("font-size", "1.2em")
     .text(function(d) {return d.objectType + " : " + d.name})
}

var _exitNodes = function(n) {
    n.exit().remove();
}

//most important!: use to update the nodes and links data
d3MapVis.parseData = function(data) {
    pgObject = data;
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
                var newNode = {
                    name: nodeName,
                    pgIndex: parseInt(x),
                    objectType: nodeObject,
                    x: pgObject[x].lat,
                    y: pgObject[x].lon
                };
                nodes.push(newNode)
                name2eleMap[nodeName] = newNode
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
                        objectType: 'fromTo',
                        linkType: pgObject[x].object
                    })
                } else if (pgObject[x].parent != undefined) {
                    //else if it has parent, it is a parentChild link
                    links.push({
                        source: name2eleMap[pgObject[x].parent],
                        target: name2eleMap[pgObject[x].name],
                        objectType: 'parentChild'
                    })
                }
            }
        }
    }
    // console.log(links);
    // console.log(nodes);
}

MapVisOverlay.prototype = new google.maps.OverlayView();
/** @constructor */
function MapVisOverlay(map) {
  console.log('new MapVisOverlay')
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
    console.log('on add');
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
            console.log('svg click event tagname', window.event.target.tagName)
            if (window.event.target.tagName == 'svg') {
                // props.itemClick(null);
                d3MapVis.clickCb(null);
            }
        });

    //attach the actuall global vis
    vis = mapSvgContainer.append("g")
        .attr("id", "mapPowerGrid");
    console.log('current vis onadd is ', vis)
    vis.append('g').attr('id','mapLinkLayer');
    // build the arrow.
    vis.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
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
    //try to get the zoom level
    var zoomLevel = this._map.getZoom();
    console.log('----zoom-----', zoomLevel)
    // var lat0 = this._map.getBounds().getNorthEast().lat();
    // var lng0 = this._map.getBounds().getNorthEast().lng();
    // var lat1 = this._map.getBounds().getSouthWest().lat();
    // var lng1 = this._map.getBounds().getSouthWest().lng();
    // console.log('---bound-----',lat0,lng0,lat1,lng1);
    d3MapVis.onViewChange(zoomLevel)
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
        x: (33.5490 + (+d.x / 2000)),
        y:  (-84.1880 - (+d.y / 2000))
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
      return d3.select(this)
                .attr('x1', source.x)
                .attr('y1', source.y)
                .attr('x2', target.x)
                .attr('y2', target.y)
    });
    node.each(function(d) {
      var d = pgProjection(d);
      return d3.select(this)
              .attr("transform", "translate(" + (d.x)+ "," + (d.y) + ")");
    });

}

MapVisOverlay.prototype.onRemove = function() {
  console.log('remove overlay');
  this._div.parentNode.removeChild(this.div_);
  this._div = null;
}

var focus = "transimission"
var MapVis = React.createClass({
    onViewChange: function(zoomLevel) {
        if (zoomLevel !== this.props.zoomLevel) {
            if (zoomLevel <= 9) {
                var currFocus = "transimission";
            } else {
                var currFocus = "distribution";
            }
            if (currFocus !== focus) {
                focus = currFocus;
                console.log('----------focus level change, ready to reset, using new zoomLevel to fetech data--------')
                this.props.onViewChange(zoomLevel);
            }
        }
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
        console.log('MapVis didUpdate! with data!!!', this.props.data);
        d3MapVis.parseData(this.props.data);
        d3MapVis.update(this.props, this.singleClick);
    },
    componentWillUnMount: function() {
        d3MapVis.destroy();
    },
    render: function() {
        console.log('MapVis render');
        var inlineStyle = {
            width: '100%',
            height: '100%',
            // zIndex: -1
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
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
]
