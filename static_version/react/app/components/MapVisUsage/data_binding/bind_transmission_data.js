var _MapVisManager = null;

var rect_init_width = 10;
var react_init_height = 2;
var centroid_init_display = 'none';
var t_init_color = 'aqua';


function bind_transmission_data(MapVisManager) {
    console.debug('bind transmission data...', MapVisManager);
    _MapVisManager = MapVisManager;
    //use the most update
    var tnodeData = MapVisManager.d3data.transmission['nodedata'];
    var tlinkdData = MapVisManager.d3data.transmission['linkdata'];
    var trans_G = MapVisManager.overlay.d3Container.transmission;
    //binding to link
    var tlink = trans_G.select("#tLinkLayer").selectAll(".tlink").data(tlinkdData, function(d) {
            return d.source.name + "-" +  d.target.name;
        });
    //binding to node
    var tnode = trans_G.selectAll('.tnodeG').data(tnodeData, function(d) {
        return d.name;
    });
    _enterTNode(tnode);
    _exitTNode(tnode);
    _enterTLink(tlink);
    _exitTLink(tlink);
}

function _enterTLink(l) {
    var linkenter = l.enter()
        .append('line')
        .attr("class", "tlink")
        .style('stroke', 'black')
        .style("stroke-width", 2)
        .style("stroke-dasharray", function(d) {
            if (d.object == "centroid_line") {
                return ("3, 3");
            }
        })
        .style("display", function(d) {
            if (d.object == "centroid_line") {
                return 'none'
            }
        })
        .style('stroke', t_init_color);
}

function _exitTLink(l) {
    l.exit().remove();
}

function _enterTNode(n) {
    //for the enter, make the g element first
    var nodeG = n.enter()
        .append("g")
        .attr("class", "tnodeG")
        .style('fill', t_init_color);
    //append the rect for the dbus

    //for centroid, append a circle
    nodeG.filter(function(d) {
      return d.object === "centroid";
    }).style('display', centroid_init_display)
        .append('circle')
        .style('opacity', .5)
        .attr('r', 5)
        .attr('stroke-width', 2)


    //append the rect for the bus node
    nodeG.filter(function(d) {
      return d.object !== "centroid";
    }).append('rect')
        .attr('width', rect_init_width)
        .attr('x', -rect_init_width / 2)
        .attr('height', react_init_height)

    //for all, append the title
    nodeG.append("text")
        .attr("class", function(d) {
            return d.object == "t_node" ? "t_bus_title" : "centroid_title";
        })
        .attr("x", function(d) {
        return d.object === "centroid" ? 5: -10;
        })
        .attr("dy", "-.3em")
        .style("font-size", '1em')
        .text(function(d) {
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
          }
        })
        .on('click', function(d) {
            // console.log(d);
            d3.event.stopPropagation();
            if (d.object == "centroid") {
                _MapVisManager.loadFeederData(d, _MapVisManager);
            } else {
                _MapVisManager.map.setZoom(13);
            }
        })
}

function _exitTNode(n) {
    n.exit().remove();
}

exports = module.exports = bind_transmission_data;

