// var projectToOverlay = require('./projectToOverlay')
//GoogleMapOverlay Component
MapVisOverlay.prototype = new google.maps.OverlayView();
/** @constructor */
function MapVisOverlay(map, resolve) {
    this.resolve = resolve;
    console.debug('overlay constructor');
    // Define a property to hold the vis div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this._div = null;
    // Similarly Define a property to hold the huge svg container
    this._svgContainer = null;
    // Similarly Define a property to hold the big g elements
    this.d3Container = {
        transition: null,
        distribution: null
    }
    
    // Explicitly call setMap on this overlay.
    this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
MapVisOverlay.prototype.onAdd = function() {
    console.debug('overlay onadd');
    //when the overlay is added, get the pane
    /*
    from google:
    When the overlay is first instantiated and ready to display, we need to attach it to the map via the browser's DOM. 
    The API indicates that the overlay has been added to the map by invoking the overlay's onAdd() method. 
    To handle this method we create a <div> to hold our image(here is the svg), add an <img> element, attach it to the <div>, 
    and then attach the overlay to one of the map's panes. 
    A pane is a node within the DOM tree. 
    */
    // Add the layer div, relative position to the "overlayLayer" panes.
    console.debug('overlay panes add a relative layer div');
    var div = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("class", "layerDiv")
        .style({
          width: '100%',
          height: '100%',
          position: 'relative',
        });
    //bind the div
    this._div = div;
    //on the layer div, attach the absolute & HUGE svg
    console.debug('layer div add a suge svg container');
    var hugeSvgContainer = div.append("svg")
        .attr('id', 'hugeSvgContainer')
        .style({
          position: 'absolute',
          width: '8000px',
          height: '8000px',
          left: '-4000px',
          top: '-4000px',
        });

    this._svgContainer = hugeSvgContainer;

    //attach the actuall dis_G (contains node and link)
    console.debug('svg container add a g for dis_G, a g for trans_G');
    
    //for distribution
    var dis_G = hugeSvgContainer.append("g")
        .attr("id", "distribution_network");
    //attach a g element for the link
    dis_G.append('g').attr('id','dLinkLayer');

    //for transmission
    var trans_G = hugeSvgContainer.append("g")
        .attr("id", "transmission_network");
    trans_G.append('g').attr('id','tLinkLayer');


    this.d3Container.distribution = dis_G;
    this.d3Container.transmission = trans_G;

    //at this moment, the dis_G(container for node & link) is available
    this.resolve(dis_G, trans_G);
}


//in charge of locating in right place
MapVisOverlay.prototype.draw = function() {
    console.info('overlay draw trigger projection...');
    // // // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();
    projectToOverlay(overlayProjection, this.d3Container);
}
MapVisOverlay.prototype.onRemove = function() {
  console.debug('overlay onRemove');
  // this._div.parentNode.removeChild(this.div_);
  // this._div = null;
}


function projectToOverlay(overlayProjection, d3Container) {
    console.debug('projectToOverlay get called...')
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

    // To do this, we need to retrieve the projection from the overlay.
    // Turn the overlay projection into a d3 vis projection (notice the HUGE svg)
    //use the data bind to the d3 selection to get the corresponding real x, y
    var trans_G = d3Container.transmission;
    var tlink = trans_G.select("#tLinkLayer").selectAll("line");
    var tnode = trans_G.selectAll('.tnodeG');

    //TODO: code can be improved!
    tnode.each(function(d) {
      var real_pos = pgProjection(d, overlayProjection); 
      d.real_x = real_pos.x;
      d.real_y = real_pos.y;
      d3.select(this)
          .attr("transform", "translate(" + d.real_x + "," + d.real_y+ ")")

    });

    tlink.each(function(d) {
       d3.select(this)
        .attr('x1', d.source.real_x)
        .attr('y1', d.source.real_y)
        .attr('x2', d.target.real_x)
        .attr('y2', d.target.real_y)
    });

    var dis_G = d3Container.distribution;
    var dlink = dis_G.select("#dLinkLayer").selectAll(".dlink");
    var dnode = dis_G.selectAll('.dnodeG');

    //TODO: code can be improved!
    dnode.each(function(d) {
      var real_pos = pgProjection(d, overlayProjection); 
      d.real_x = real_pos.x;
      d.real_y = real_pos.y;
      d3.select(this)
          .attr("transform", "translate(" + d.real_x + "," + d.real_y+ ")")

    });

    dlink.each(function(d) {
       d3.select(this)
        .attr('x1', d.source.real_x)
        .attr('y1', d.source.real_y)
        .attr('x2', d.target.real_x)
        .attr('y2', d.target.real_y)
    });
}



exports = module.exports = MapVisOverlay;
