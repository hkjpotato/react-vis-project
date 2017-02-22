var _MapVisManager = null;
import { eleColorMap, eleTextCodeMap } from './../../Helpers/ElementHelper';

var rect_init_width = 10;
var react_init_height = 2;
var title_init_display = 'none';
var elements_init_display = 'none';
var d_init_color = "white";



function bind_distribution_data(MapVisManager) {
    console.debug('bind distribution data...', MapVisManager);
    _MapVisManager = MapVisManager;

    //use the most update
    var dnodeData = MapVisManager.d3data.distribution['nodedata'];
    var dlinkData = MapVisManager.d3data.distribution['linkdata'];
    var dis_G = MapVisManager.overlay.d3Container.distribution;
    //binding to link
    var dlink = dis_G.select("#dLinkLayer").selectAll(".dlink").data(dlinkData, function(d) {
            return d.source.name + "-" +  d.target.name;
        });
    //binding to node
    var dnode = dis_G.selectAll('.dnodeG').data(dnodeData, function(d) {
        return d.name;
    });
    _enterDNode(dnode);
    _exitDNode(dnode);
    _enterDLink(dlink);
    _exitDLink(dlink);

    var elements = dnode.select('.elements')
      .selectAll('text')
      .data(function(d) {
        return d.elements;
      }, function(ele) {
        return ele.object + ele.name
      })

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
        d3.select(this)
          .style('font-size', '2em')
          .attr("dy", 20)
          .attr("x", 15 * i - 20)

      })
      .on('mouseout', function(d, i) {
        d3.select(this)
          .style('font-size', '1em')
          .attr("dy", 12)
          .attr("x", 15 * i - 15)

      })
      .on('click', function(d) {
        d3.event.stopPropagation();
        _MapVisManager.onSelectChange(d);
      })
    elements.exit().remove();
}


function dragstarted(d) {
  // d3.event.stopPropagation();
  console.log('drag start')
}

function dragged(d) {
  // d3.event.stopPropagation();
  // console.log('dragging', d3.event)
  console.log(d3.select(this).attr('x'))
  d3.select(this)
          .attr("transform", "translate(" + (d3.event.x)+ "," + (d3.event.y) + ")")
}

function dragended(d) {

  var t = d3.select(this).attr('transform');
  var x = d3.transform(t).translate[0];
  var y = d3.transform(t).translate[1];
  // To do this, we need to retrieve the projection from the overlay.
  var myoverlayProjection = _MapVisManager.overlay.getProjection();
  var real_coord = {
    x: x,
    y: y
  }
  var div_coord = {
    x: real_coord.x - 4000,
    y: real_coord.y - 4000
  }
  var mycoord = myoverlayProjection.fromDivPixelToLatLng(new google.maps.Point(div_coord.x, div_coord.y))
  //hopefully it is a pointer
  d.lat = mycoord.lat();
  d.lng = mycoord.lng();
  console.log('drag end');
  _MapVisManager.overlay.draw();
}

var drag = d3.behavior.drag()
  .on('dragstart', dragstarted)
  .on('drag', dragged)
  .on('dragend', dragended);


function _enterDLink(l) {
    var linkenter = l.enter()
        .append('line')
        .attr("class", "dlink")
        .style('stroke', 'black')
        .style("stroke-width", 1.5)
        .style('stroke', d_init_color);
}

function _exitDLink(l) {
    l.exit().remove();
}



function _enterDNode(n, MapVisManager) {
    //for the enter, make the g element first
    var nodeG = n.enter()
        .append("g")
        .attr("class", "dnodeG")
        .style('fill', d_init_color);
        // .call(drag);
    //append the rect for the dbus
    nodeG.append('rect')
        .attr('width', rect_init_width)
        .attr('x', -rect_init_width / 2)
        .attr('height', react_init_height)

    //append the title
    nodeG.append("text")
        .attr("class", "d_bus_title")
        .attr("x", -20)
        .attr("dy", "-.3em")
        .style('display', title_init_display)
        .style("font-size", function(d) {
            return '1em'
        })
        .text(function(d) {
          // return d.name.substring(0, 4);
          return d.name;
        })
        .style("cursor", "pointer")
        .on('mouseover', function(d) {
          d3.select(this)
            .style('font-size', '1.4em')
        })
        .on('mouseout', function(d) {
          d3.select(this)
            .style('font-size', '1em')
        })
        .on('click', function(d) {
            // console.log(d);
            d3.event.stopPropagation();
            // _MapVisManager.clickCb(d);
            _MapVisManager.onSelectChange(d);
        })

    //append a circle to indicate time_series data
    nodeG.append("circle")
         .attr("class", "time_series")
         .attr('r', 18)
         .style('fill', 'white')
         .style('opacity', 0.2)
         .style('display', 'none'); //default to none

    nodeG.append("circle")
         .attr("class", "time_series")
         .attr('r', 10)
         .style('fill', 'white')
         .style('opacity', 0.5)
         .style('display', 'none'); 

    //append a circle to for select & filter indication
    nodeG.append("circle")
         .attr("class", "highlight_ring")
         .attr('r', 17)
         .style('fill', 'none')
         // .style('stroke', 'lightblue')
         .style('stroke-width', '3px')
         // .style('stroke-opacity', .7)
         .style('display', 'none');

    //just attach the elements container g here
    nodeG.append("g")
         .attr("class", "elements")
         .style('display', elements_init_display);

}

function _exitDNode(n) {
    n.exit().remove();
}

exports = module.exports = bind_distribution_data;

