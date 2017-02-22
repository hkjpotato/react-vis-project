var React = require('react');
var ReactDOM = require('react-dom');
var MapControl = require('./MapControl');
var parseData = require('./MapVisUsage/parseData');
var zoomScaling = require('./MapVisUsage/zoomScaling.js')

var name2eleMap = {}
//global data
var d3MapVis = {};
// var pgObject = null;
// var name2eleMap = {};


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
    parseData(initProps.data, nodes, links, name2eleMap);
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
    disableDefaultUI: true,
    draggable: false
  });

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('light', lightStyle);
  map.mapTypes.set('dark', darkStyle);
  map.mapTypes.set('plain', plainStyle);
  map.mapTypes.set('night', nightStyle);

  map.addListener('click', function() {
    // d3MapVis.clickCb(null);
    // console.log('for the timebeing stop click on map')
  });

  var zoomControlDiv = document.createElement('div');
  var zoomControl = new MapControl(zoomControlDiv, map);
  map.addListener('zoom_changed', function() {
    zoomControl.setZoom(map.getZoom());
  });
  zoomControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(zoomControlDiv);
  map.setOptions({ minZoom: 11, maxZoom: 17 });
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
      parseData(props.data, nodes, links, name2eleMap);
    }
    //d3 general update pattern
    d3updatePatterns(props);
    d3MapVis.overlay.draw();
}

//GoogleMapOverlay Component
MapVisOverlay.prototype = new google.maps.OverlayView();
/** @constructor */
function MapVisOverlay(map) {
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
        .style({
          // border: '2px solid red'
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

function pgProjection (coordinates, overlayProjection) {
    //get a google coordinates object from the input lat, lng
    var googleCoordinates = new google.maps.LatLng(coordinates.lat, coordinates.lng);
    //convert it to the pixel value on overlay
    var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
    //plus 4000 pixel shift because the centroid of our overlay is (-4000, -4000)
    return {
      x : pixelCoordinates.x + 4000, 
      y : pixelCoordinates.y + 4000         
    };
}

function projectToOverlay(overlayProjection) {
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = d3MapVis.overlay.getProjection();
    // Turn the overlay projection into a d3 vis projection (notice the HUGE svg)
    //use the data bind to the d3 selection to get the corresponding real x, y
    link.each(function(d) {
      var sourceCoord = {
        lat: d.source.lat,
        lng: d.source.lng
      };
      var targetCoord = {
        lat: d.target.lat,
        lng: d.target.lng
      };

      var source = pgProjection(sourceCoord, overlayProjection); 
      var target = pgProjection(targetCoord, overlayProjection);
       d3.select(this)
          .attr('x1', source.x)
          .attr('y1', source.y)
          .attr('x2', target.x)
          .attr('y2', target.y)
    });
    //TODO: code can be improved!
    node.each(function(d) {
      var d = pgProjection(d, overlayProjection); 
      d3.select(this)
          .attr("transform", "translate(" + (d.x)+ "," + (d.y) + ")")
    });

}




MapVisOverlay.prototype.draw = function(exlore) {
    console.log('*****draw get called*****');
    // return;
    //try to get the zoom level
    if (!exlore) {
      var zoomLevel = d3MapVis.map.getZoom();
      var currZoom = d3MapVis.map.getZoom();
      var currCenter = d3MapVis.map.getCenter();
      d3MapVis.onViewChange({
        zoomLevel: currZoom,
        mapCenter: currCenter
      });
    }

    // // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();
    projectToOverlay(overlayProjection);
    // // Turn the overlay projection into a d3 vis projection (notice the HUGE svg)
    // var googleMapProjection = function (coordinates) {
    //     // console.log(coordinates)
    //     var googleCoordinates = new google.maps.LatLng(coordinates.lat, coordinates.lng);
    //     var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
    //     return {
    //       x : pixelCoordinates.x + 4000, 
    //       y : pixelCoordinates.y + 4000         
    //     };
    // }
    // var pgProjection = function(d) {
    //   return googleMapProjection(d);
    // }
    // //project location
    // link.each(function(d) {
    //   var source = d.source, target = d.target;
    //   source = pgProjection(source); 
    //   target = pgProjection(target);
    //    d3.select(this)
    //       .attr('x1', source.x)
    //       .attr('y1', source.y)
    //       .attr('x2', target.x)
    //       .attr('y2', target.y)
    // });
    // //TODO: code can be improved!
    // node.each(function(d) {
    //   var d = pgProjection(d);
    //   d3.select(this)
    //       .attr("transform", "translate(" + (d.x)+ "," + (d.y) + ")")
    // });
    zoomScaling(zoomLevel, node, link);
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
    updateElement: function(data) {
      this.props.updateElement(data);
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
        //TODO do we need updateElement here????
        d3MapVis.updateElement = this.updateElement;

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
            var updateInterval;
            if (this.props.timeVal > 10 && this.props.timeVal < 15) {
              updateInterval = this.props.timeVal + 1000;
            } else {
              updateInterval = this.props.timeVal + 10;
            }

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
    var multiSelectMap = props.multiSelectMap;
    var hovering = props.hovering;

    // console.log('d3Map update');
    //up to now, the data should be update by parseData already
    var l = vis.select("#mapLinkLayer").selectAll(".link").data(links, function(d) {
            return d.source.gldIndex + "-" +  d.target.gldIndex;
        });
    var n = vis.selectAll('.visnode').data(nodes, function(d) {
        return d.gldIndex
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
    node = vis.selectAll(".visnode");

    //descend go around
    node.select('rect');

    // //update elements for both update & enter, as well as do update pattern
    node
      .each(function(d) {
        //get the element data for each node and bind them to elements g
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
          .attr('class', function(d) {
            return d.object;
          })
          .attr("x", function(d, i) { 
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
          .on('mouseover', function(d, i) {
            // console.log(d3.select(this))
            d3.select(this)
              .style('font-size', '2em')
              // .style('opacity', .8)
              .attr("dy", 20)
              .attr("x", 15 * i - 20)

          })
          .on('mouseout', function(d, i) {
            d3.select(this)
              .style('font-size', '1em')
              // .style('opacity', 1)
              .attr("dy", 12)
              .attr("x", 15 * i - 15)

          })
          .on('click', function(d) {
            //TODO
            d3.event.stopPropagation();
            // var selectData = pgObject[d.gldIndex];
            d3MapVis.clickCb(d);
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
    var selectedClass = selected ? selected.object: null;
    //clear previous selected & filter
    node
      .selectAll('.select_ring')
      .style('display', 'none')
      .style('stroke-width', '2px');

    node.selectAll('.elements')
      .selectAll('text')
      .style('stroke-width', 0);


    //render filter
    var isTime = props.process === 'finished';
    if (filter) {
        node.selectAll('text').style('opacity', .5);
        node.select('rect').style('opacity', .5);
        link.style('opacity', (isTime ? 1 : .1));
        if (filter === 'node') {
          console.log('do nothing');
        } else {
          var filterElement = node.selectAll('.' + filter)
          // var filterElement
          if (multiSelectMap) {
            filterElement = filterElement.filter(function(d) {
              return (d.id in multiSelectMap);
            });
          }
          filterElement
            .each(function(d) {
              //must be element
              var parentNode = node
                .filter(function(pd) {return pd.name === d.parent})
              //paint parent
              parentNode
                .select('.select_ring')
                .style('display', 'block')
                .style('stroke', eleColorMap[filter])
                .style('stroke-opacity', .7)

            })
        }
    } else {
        node.selectAll('text').style('opacity', 1);
        node.select('rect').style('opacity', 1);
        link.style('opacity', 1);
    }

    //try highlight hovering
    if (hovering) {
      d3.selectAll('.' + hovering.object)
        .filter(function(d) {return d.id == hovering.id})
        .each(function(d) {
          var parentNode = node
            .filter(function(pd) {return pd.name === d.parent})
          //highlight its parent
          parentNode
          .select('.select_ring')
          .style('display', 'block')
          .style('stroke', eleColorMap[hovering.object])
          .style('stroke-opacity', 1)
          .style('stroke-width', '4px')

        })
    }

    //try highlight select
    if (selectedClass === 'node') {
      node
        .filter(function(d) {return d.id === selected.id})
        .select('.select_ring')
        .style('stroke', dColor)
        .style('stroke-width', '6px')
        .style('display', 'block')
    } else if (selected) {
      //must be element
      var element = node.selectAll('.' + selectedClass)
        .filter(function(d) {
          return d.id === selected.id;
        }).each(function(d) {
          d3.select(this)
            .style('stroke-width', 2)
            .style('stroke', 'lime');
            //must be element
            var parentNode = node
              .filter(function(pd) {return pd.name === d.parent})
            //paint parent
            parentNode
              .select('.select_ring')
              .style('display', 'block')
              .style('stroke', eleColorMap[selected.object])
              .style('stroke-opacity', filter ? 1 : 0.5)
              .style('stroke-width', '5px')
        });
    }

}

var _enterLinks = function(l) {
    var linkenter = l.enter()
        .append('line')
        .attr("class", "link")
        .style('stroke-opacity', 1)
        .style('stroke-width', function(d) {
            if (d.linkType == "fromTo") {
                if (d.object == "transmission_line") {
                    return 2;
                }
                return 1.5;
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

function dragstarted(d) {
  console.log('drag start')
  // d3.event.stopPropagation();
  // d3.select(this).raise().classed("active", true);
}

function dragged(d) {
  console.log('dragging', d3.event)
  // d3.event.stopPropagation();

  console.log(d3.select(this).attr('x'))
  d3.select(this)
          .attr("transform", "translate(" + (d3.event.x)+ "," + (d3.event.y) + ")")

  // d3.select(this).style('display', 'none');

}

function dragended(d) {
  // d3.event.stopPropagation();
  console.log(d3.select(this).attr('x'));
  var t = d3.select(this).attr('transform');
  var x = d3.transform(t).translate[0];
  var y = d3.transform(t).translate[1];
  // To do this, we need to retrieve the projection from the overlay.
  var myoverlayProjection = d3MapVis.overlay.getProjection();
  // Turn the overlay projection into a d3 vis projection (notice the HUGE svg)
  // var googleMapProjection = function (coordinates) {
  //     // console.log(coordinates)
  //     var googleCoordinates = new google.maps.LatLng(coordinates.lat, coordinates.lng);
  //     var pixelCoordinates = myoverlayProjection.fromLatLngToDivPixel(googleCoordinates);
      
  //     return {
  //       x : pixelCoordinates.x + 4000, 
  //       y : pixelCoordinates.y + 4000         
  //     };
  // }
  // console.log('-------')
  // console.log(links)
  // console.log(nodes)
  // console.log('-------')


  var pixelcoord = {
    x: x,
    y: y
  } 
  var realcoord = {
    x: pixelcoord.x - 4000,
    y: pixelcoord.y - 4000
  }

  var mycoord = myoverlayProjection.fromDivPixelToLatLng(new google.maps.Point(realcoord.x, realcoord.y))
  
  console.log(myoverlayProjection);
  console.log('上帝保佑', realcoord)
  console.log('上帝保佑', mycoord)

  console.log('上帝保佑', mycoord.lat(), mycoord.lng())

  // console.log(d.lat, d.lng);
  var formData = {
      id: d.id,
      feeder: 1,
      object: d.object,
      name: d.name,
      lat: mycoord.lat(),
      lng: mycoord.lng()
  };
  console.log('what is the form data', formData);
  // var r = confirm("Attention! Are you sure you want to move the element? This will trigger a re-rendering of the network");
  
  // console.log('-------')
  // // console.log(links)
  // links.forEach(function(d) {
  //   console.log(d.source);
  // })
  // console.log(nodes)
  // console.log('-------')

  if(true) {
    var type = 'd_' + (formData.object == 'node' ? 'buses': formData.object + 's');
    //make ajax here using the id
    var api = '/feeder/api/' + type + '/' + formData.id + '/';
    $.ajax({
        type: "PUT",
        url: api,
        contentType: "application/json",
        data: JSON.stringify(formData),
        dataType: 'json',
        success: function(result) {
            // console.log("success?", result);
            // // d3MapVis.overlay.draw();
            // console.log(result.lat, result.lng);
            var origin = nodes.filter(function(d) {
              return d.name == result.name;
            })[0];
            //for the timebeing let's just update the data, we don't need to do the stupid parse data
            //update the nodes data
            origin.lat = result.lat;
            origin.lng = result.lng;

            // //update the links data //do I need to do that?
            // console.log('准备', origin.name);

            var filterLink = links.filter(function(linkdata) {
              // return false;
              if (linkdata.source.name == origin.name || linkdata.target.name == origin.name) {
                return true;
                // console.log('find it',linkdata.source.name, origin.name);
              } else {
                return false;
              }
              // return false;
            });

            // filterLink
            console.log('-----')
            filterLink.forEach(function(d) {
              console.log(d.source.lat, d.source.lng, d.target.lat, d.target.lng)
            })
            console.log(origin.lat, origin.lng)
            console.log('-----')


            // var l = vis.select("#mapLinkLayer").selectAll(".link").data(links, function(d) {
            //         return d.source.gldIndex + "-" +  d.target.gldIndex;
            //     });
            // var n = vis.selectAll('.visnode').data(nodes, function(d) {
            //     return d.gldIndex
            // });


            // //and then we need to bind the data
            node.data(nodes);
            link.data(links);

            // //let draw function use the new element to draw the new network
            // console.log(origin);
            // d3MapVis.overlay.draw();
            projectToOverlay(d3MapVis.overlay.getProjection());

        }.bind(this)
      });
  }
  console.log('-------');
  // d3.event.stopPropagation();

  console.log('dragend')

  // d3.select(this).classed("active", false);
}
var drag = d3.behavior.drag()
  .on('dragstart', dragended)
  .on('drag', dragged)
  .on('dragend', dragended);

var _enterNodes = function(n) {
    //for the enter
    var nodeG = n.enter()
        .append("g")
        .attr("class", function(d) {
          return ('visnode ' + d.object);
        })
        // .call(drag);
    //for centroid
    nodeG.filter(function(d) {
      return d.object === "centroid";
    }).append('circle')
      .attr('r', 5)
      .attr('stroke-width', 2)
      .attr('stroke', dColor)

    //for not centroid
    nodeG.filter(function(d) {
      return d.object !== 'centroid';
    }).append("rect")
      .attr("y", function(d) {
    })
    //for dbus
    var busNode = nodeG.filter(function(d) {
      return d.object === "node";
    })
    //just attach the elements container here
    busNode.append("g")
         .attr("class", "elements");

    //just attach the elements container here
    busNode.append("circle")
         .attr("class", "select_ring")
         .attr('r', 17)
         .attr('fill', 'none')
         .attr('stroke-width', '2px')
         .attr('stroke-opacity', .7)
         .style('display', 'none');
    //for all
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
        return d.object === "centroid" ? 5: -10;
     })
     .attr("dy", "-.3em")
     .style("font-size", function(d) {
        return '1em'
     })
     .text(function(d) {
      if (d.object === "node") {
        var str = d.name;
        // return str.substring(0, 5);
        return d.name.slice(-3);
      }
      return d.name;
    })
    .style("cursor", "pointer")
    .on('mouseover', function(d) {
      d3.select(this)
        .style('font-size', '1.4em')
      if (d.object === 'centroid') {
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(500)
          .attr('r', 50)
          .attr('fill', 'none');

      }
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .style('font-size', '1em')
      if (d.object === 'centroid') {
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(500)
          .attr('r', 5)
          .attr('fill', dColor);

      }
    })
    .on('click', function(d) {
        // return;
          //TODO
          d3.event.stopPropagation();
         if (d.object === 't_node') {
          //really weird
          d3MapVis.map.setZoom(13);
          // d3MapVis.map.setCenter(new google.maps.LatLng(d.x, d.y));
        } else if (d.object === "node") {
          // d3MapVis.clickCb(d);
        } else if (d.object === "centroid") {
          //TODO do nothing
          d3.event.stopPropagation();
          d3MapVis.map.setZoom(14);
          d3MapVis.map.setCenter(new google.maps.LatLng(d.lat, d.lng));
        } else {
          //should be elements
          d3MapVis.clickCb(d);
        }
    });
}

var _exitNodes = function(n) {
    n.exit().remove();
}


