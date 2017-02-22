//d3 update pattern
var dColor = "white"
var tColor = "white"

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

exports =  module.exports = function(props, vis, d3_selections, d3_data) {
    var selected = props.selected;
    var filter = props.filter;
    var multiSelectMap = props.multiSelectMap;
    var hovering = props.hovering;
    var nodes = d3_data['nodes'];
    var links = d3_data['links'];

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
    d3_selections['link'] = vis.select("#mapLinkLayer").selectAll(".link");
    d3_selections['node'] = vis.selectAll(".visnode");

    var node = d3_selections['node'] ;
    var link = d3_selections['link'];
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

    //just attach the select_ring container here
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
          d3MapVis.clickCb(d);
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
