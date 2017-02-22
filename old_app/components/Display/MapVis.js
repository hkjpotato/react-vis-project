var React = require('react');
var ReactDOM = require('react-dom');

//global data
var d3MapVis = {};
var pgObject = null;
var name2eleMap = {};


//testing result data
var badNoeName = [
  "1883137934",
  "1402466455"
];

var redInterval = 10;
var playInterval = null;
//data
var nodes = [];
var links = [];

//d3 selections
var vis = null;
var node = null;
var link = null;
//color scale

var dColor = "white";
var tColor = "white";
var MapStyles =require('./mapStyles');




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
d3MapVis.create = function(el, initProps) {
  if (initProps.dataChange) {
    // a trick to reduce unnessary data parsing
    d3MapVis.parseData(initProps.data);
  }

  //attach the initial callback here TODO
  // Create the Google Map…
  var lightStyle = new google.maps.StyledMapType(MapStyles['lightStyle']);
  var nightStyle = new google.maps.StyledMapType(MapStyles['nightStyle']);
  var plainStyle = new google.maps.StyledMapType(MapStyles['plainStyle']);
  var darkStyle = new google.maps.StyledMapType(MapStyles['darkStyle']);




  var map = new google.maps.Map(el, {
    zoom: initProps.mapProps.zoomLevel,
    center: initProps.mapProps.mapCenter,
    mapTypeControl: false
  });

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('light', lightStyle);
  map.mapTypes.set('dark', darkStyle);
  map.mapTypes.set('plain', plainStyle);
  map.mapTypes.set('night', nightStyle);



  this.map = map;
  // The custom MapVisOverlay object contains a reference to the map.
  this.overlay = new MapVisOverlay(map);
}
//for component unmount
d3MapVis.destroy = function() {
    this.overlay.setMap(null);
}

//update is where the data binding and general d3 update patterns happen
d3MapVis.update = function(props) {
    console.log("**********d3MapVIs update********")
    if (props.dataChange) {
      // a trick to reduce unnessary data parsing
      d3MapVis.parseData(props.data);
    }
    console.log('MapVis.update with props', props);
    //d3 general update pattern
    d3updatePatterns(props);
    d3MapVis.overlay.draw();
}

//GoogleMapOverlay Component
MapVisOverlay.prototype = new google.maps.OverlayView();
/** @constructor */
function MapVisOverlay(map) {
  console.log('*************new MapVisOverlay*************')
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
    d3MapVis.update(d3MapVis.initProps);
}
//this function is called every time the map is zoom in/out
//drawing is only in charge of relocation!!
MapVisOverlay.prototype.draw = function() {
    console.log('*****draw get called*****');
    // return;
    //try to get the zoom level
    var zoomLevel = d3MapVis.map.getZoom();
    var currZoom = d3MapVis.map.getZoom();
    var currCenter = d3MapVis.map.getCenter();
    d3MapVis.onViewChange({
      zoomLevel: currZoom,
      mapCenter: currCenter
    });

    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();
    // Turn the overlay projection into a d3 vis projection (notice the HUGE svg)
    var googleMapProjection = function (coordinates) {
        // console.log(coordinates)
        var googleCoordinates = new google.maps.LatLng(coordinates.lat, coordinates.lng);
        var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
        return {
          x : pixelCoordinates.x + 4000, 
          y : pixelCoordinates.y + 4000         
        };
    }
    //turn the pass in data to atlanta based
    // var atlanta = function(d) {
    //   return {
    //     x: d.lat,
    //     y: d.lng
    //   }
    // }
    var pgProjection = function(d) {
      return googleMapProjection(d);
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
    });
    //TODO: code can be improved!
    node.each(function(d) {
      var d = pgProjection(d);
      d3.select(this)
          .attr("transform", "translate(" + (d.x)+ "," + (d.y) + ")")
    });

    if (zoomLevel < 12) {
      node.filter(function(d) {
          return d.object === "t_node";
        })
        .selectAll('rect')
        .attr('width', 10)
        .attr('x', -5)
        .attr('height', 2)
      link.filter(function(d) {
          return d.object === "transmission_line";
        })
        .style('stroke-width', 1)
    } else {
      node.filter(function(d) {
          return d.object === "t_node";
        })
        .selectAll('rect')
        .attr('width', 20)
        .attr('x', -10)
        .attr('height', 5);
      link.filter(function(d) {
        return d.object === "transmission_line";
        })
        .style('stroke-width', 2)
    }




    if (zoomLevel < 14) {
      node.filter(function(d) {
          return d.object === "centroid" || d.object === "t_node";
        })
        .style('display', 'inline')
        .style('opacity', .8);

      link.filter(function(d) {
        return d.linkType === "parentChild";
      })
        .style('display', 'inline')
        .style('opacity', .8)

      node.filter(function(d) {
          return d.object ==="node";
        })
        .style('display', 'inline');
    } else if (zoomLevel > 14) {
      link.filter(function(d) {
        return d.linkType === "parentChild";
      })
        .style('display', 'none');

      node.filter(function(d) {
          return d.object === "centroid" || d.object === "t_node";
        })
        .style('display', "none");

      node.filter(function(d) {
          return d.object ==="node";
        })
        .style('display', 'inline');
    } else {
      //13
      node.filter(function(d) {
          return d.object === "centroid" || d.object === "t_node";
        })
        .style('display', 'inline')
        .style('opacity', function(d) {
          if (d.name === "circuit1_centroid") {
            return 0;
          }
          return 0.8;
        });

      link.filter(function(d) {
        return d.linkType === "parentChild";
      })
        .style('opacity', function(d) {
          if (d.source.name === "circuit1_centroid" || d.target.name === "circuit1_centroid") {
            return 0;
          }
          return 0.8;
        });

      node.filter(function(d) {
          return d.object ==="node";
        })
        .style('display', 'inline');
    }
    //


    if (zoomLevel === 15) {
      //TODO: ask roberts about that
      node.selectAll('.d_bus_title')
        .style("display", function() {
          // console.log(d3.select(this).text())
          return "inline";
        });
    } else {
      node.selectAll('.d_bus_title')
        .style("display", function() {
          // console.log(d3.select(this).text())
          return "none";
        });
    }
    //detail levle
    if (zoomLevel > 15) {
      //size of rect
      node.filter(function(d) {
          return d.object ==="node";
        })
        .selectAll('rect')
        .attr('width', function(d) {
          return 30;
        })
        .attr('x', function(d) {
          return -15;
        })
        .attr('height', function(d) {
          return 4;
        });
      //TODO: ask roberts about that
      node.selectAll('.elements')
        .style("display", function() {
          // console.log(d3.select(this).text())
          return "inline";
        });
    } else {
      node.filter(function(d) {
          return d.object ==="node";
        })
        .selectAll('rect')
        .attr('width', function(d) {
          return 10;
        })
        .attr('x', function(d) {
          return -5;
        })
        .attr('height', function(d) {
          return 2;
        });
      node.selectAll('.elements')
        .style("display", "none");
    }

    if (zoomLevel < 13) {
      node.filter(function(d) {
          return d.object === "centroid";
        })
        .style('display', 'none')
      link.filter(function(d) {
        return d.linkType === "parentChild";
      })
        .style('display', 'none')
    }

    // <= 13 transmission level
    if (zoomLevel < 1) {
      node.filter(function(d) {
        return d.object === "t_node";
      }).style('display', 'none');
    } else {
      node.filter(function(d) {
        return d.object === "t_node";
      }).style('display', 'inline');
    }

}
MapVisOverlay.prototype.onRemove = function() {
  console.log('remove overlay');
  this._div.parentNode.removeChild(this.div_);
  this._div = null;
}

//React Component
var MapVis = React.createClass({
    onViewChange: function(updateMapProps) {
        //no need to check here, pass it to the parent element
        this.props.onViewChange(updateMapProps);
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
    addElement: function(data) {
      this.props.addElement(data);
    },
    removeElement: function(data) {
 
    },
    updateElement: function(data) {
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
        // console.log('Mapvis didmount!');
        var el = ReactDOM.findDOMNode(this);
        //bind callback
        d3MapVis.clickCb = this.singleClick;
        d3MapVis.onViewChange = this.onViewChange;
        //TODO do we need addElement here????
        d3MapVis.addElement = this.addElement;

        //a go around for on Add
        d3MapVis.initProps = this.props;
        //create map with props
        d3MapVis.create(el, this.props);
    },
    componentDidUpdate: function() {
        dColor = this.props.dColor;
        tColor = this.props.tColor;
        d3MapVis.map.setMapTypeId(this.props.mapStyle);
        // console.log('MapVis didUpdate!!!');
        //update just update
        d3MapVis.update(this.props);
        //render line color
        if (this.props.process === "finished") {
            console.log('now finished!');
            var updateInterval = this.props.timeVal + 10;
            if (redInterval !== updateInterval) {
              //animate update
              redInterval = updateInterval;
              link.filter(function(d) {
                return d.linkType !== "parentChild";
              })
              .style('stroke', function(d, i) {
                if (i % 7 === 0) {
                  return 'yellow';
                } else if (i % redInterval === 0) {
                  return 'red';
                } else {
                  return '#00cd00';
                }
              })
              .style('stroke-width', function(d) {
                if (d.object === "transmission_line") {
                  return 5;
                } 
                return 3;
              })
              .transition()
              .duration(500)
              .style('stroke-width', function(d) {
                if (d.object === "transmission_line") {
                  return 2;
                } 
                return 1;
              });
            } else {
              //normal update
              link.filter(function(d) {
                return d.linkType !== "parentChild";
              })
              .style('stroke', function(d, i) {
                if (i % 7 === 0) {
                  return 'yellow';
                } else if (i % redInterval === 0) {
                  return 'red';
                } else {
                  return '#00cd00';
                }
              })
            }
        }
    },
    componentWillUnMount: function() {
        d3MapVis.destroy();
    },
    render: function() {
        // console.log('MapVis render');
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


//d3 update pattern
var d3updatePatterns = function(props) {
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
    _enterNodes(n);
    // exit node
    _exitNodes(n);

    //update + enter
    link = vis.select("#mapLinkLayer").selectAll(".link");
    node = vis.selectAll(".node");

    //descend go around
    node.select('rect');

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
            // return eleMap[d.object] * i - 15
            return 15 * i - 15

          })
          .attr("dy", 12)
          .attr('font-size', '1em')
          .attr('font-weight', 300)
          .attr("fill", function(d) {
            return eleColorMap[d.object]
          })
          .attr('font-family', 'FontAwesome')
          .text(function(d) {
            return eleTextCodeMap[d.object] }
          )
          .style("cursor", "pointer")
          .on('click', function(d) {
            var selectData = pgObject[d.pgIndex];
            d3MapVis.clickCb(selectData);
          });
        elements.exit().remove()
      });
    //render color
    node
    .style('fill', function(d) {
        if (d.object === "t_node"){
          return tColor;
        } 
        return dColor;
    });
    //render link color
    link
    .style('stroke', function(d, i) {
      if (d.object === "transmission_line") {
        return tColor;
      }
      return dColor;
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
          return dColor;
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
}

var _enterLinks = function(l) {
    l.enter()
        .append('line')
        .attr("class", "link")
        .style('stroke-opacity', 1)
        .style('stroke-width', function(d) {
            if (d.linkType == "fromTo") {
                if (d.object == "transmission_line") {
                    return 2;
                }
                return 1;
            }
            if (d.linkType == "parentChild") {
              return 1.5;
            }
            // return 1;
        })
        .style("stroke-dasharray", function(d) {
            if (d.linkType == "parentChild") {
                return ("3, 3");
            }
        });
}

var _exitLinks = function(l) {
    l.exit().remove();
}

var _enterNodes = function(n) {
    //for the enter
    var nodeG = n.enter()
        .append("g")
        .attr("class", "node")

    nodeG.filter(function(d) {
      return d.object === "centroid";
    }).append('circle')
      .attr('r', 4)
      .style("cursor", "pointer")
      .on('click', function(d) {
        d3MapVis.map.setZoom(14);
        d3MapVis.map.setCenter(new google.maps.LatLng(d.lat, d.lng));
      });

    nodeG.append("rect")
      .attr("y", 0)
      .style("cursor", "pointer")
      .on('click', function(d) {
           if (d.object === 't_node') {
            //really weird
            d3MapVis.map.setZoom(12);
            d3MapVis.map.setCenter(new google.maps.LatLng(d.x, d.y));
          } else if (d.object === "node") {
            console.log(this);
            console.log(d3.select(this));
            d3MapVis.clickCb(d);
          } else {
            var selectData = pgObject[d.pgIndex];
            d3MapVis.clickCb(selectData);
          }
      });

    //just attach the elements container here
    nodeG.append("g")
         .attr("class", "elements");

    nodeG.append("text")
     .attr("class", function(d) {
      if (d.object === "node") {
        return "d_bus_title";
      } else if (d.object === "t_node") {
        return "t_bus_title";
      } else if (d.object === "centroid") {
        return "centroid_title"
      }
    })
     .attr("x", function(d) {
        return d.object === "centroid" ? 0: -20;
     })
     .attr("dy", "-.3em")
     .style("font-size", function(d) {
      if (d.object == "t_node") {
        return "1.2em"
      }
      return "1em";
     })
     .text(function(d) {
      if (d.object === "node") {
        var str = d.name;
        return str.substring(0, 5);
      }
      return d.name;
    })
}

var _exitNodes = function(n) {
    n.exit().remove();
}


//data parsing function
//most important!: use to update the nodes and links data
d3MapVis.parseData = function(data) {
    //the passed in data is props, should not use them directly to make the link
    //have to create new nodes and links and elements from the props
    pgObject = data;
    console.log("^^^CRAZY PARSE DATA DUE TO DATA CHANGE^^^");
    //at this moment, we always clear the data
    nodes = [];
    links = [];
    // console.log('parseData', pgObject);
    //parse data into the nodes and links
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
                  lat: pgObject[x].lat,
                  lng: pgObject[x].lng,
                  elements: {}
              };
              Object.assign(newNode, pgObject[x]);

              //ATTENTION: this is anti-pattern, should not modify the props by children
              // pgObject[x].elements = {};
              // nodes.push(pgObject[x])
              // name2eleMap[nodeName] = pgObject[x];
              nodes.push(newNode)
              name2eleMap[nodeName] = newNode;
            }
            if (nodeObject === "centroid") {
              var newNode = {
                  name: nodeName,
                  pgIndex: parseInt(x),
                  object: nodeObject,
                  lat: pgObject[x].lat,
                  lng: pgObject[x].lng,
                  elements: {}
              };
              nodes.push(newNode);
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
                  //directly using the json data from server

                  var newEle = {
                    name: pgObject[x].name,
                    pgIndex: parseInt(x),
                    object: eleObject
                  }
                  Object.assign(newEle, pgObject[x]);
                  parentNode.elements[eleObject]
                    = newEle;
                }
            }
        }
    }
}