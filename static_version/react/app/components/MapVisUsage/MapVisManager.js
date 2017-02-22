//this is the MapVisManager element, it lives outside the react control
var d3MapVis = {}
var MapVisManager = {}
var MapStyles = require('./MapStyles');
var MapControlElement = require('./MapControlElement');
var MapVisOverlay = require('./MapVisOverlay');
// var updateData = require('./updateData');
var update_transmission_data = require('./data_updating/update_transmission_data');
var update_distribution_data = require('./data_updating/update_distribution_data');
var bind_distribution_data = require('./data_binding/bind_distribution_data');
var bind_transmission_data = require('./data_binding/bind_transmission_data');

var marginColorScale = d3.scale.linear().domain([0, 15, 30]).range(['#00cd00', 'yellow', 'red']);
var injectionColorScale = d3.scale.linear().domain([-100, 100, 400]).range(['#00cd00', 'yellow', 'red']);
var lineCapacityCriteria = .75;
import { eleColorMap } from './../Helpers/ElementHelper';


//The init function will in charge of 
// 0. bind callbacks to this manager (I guess it is the best place to place now)
// 1. init the map
// 2. initialize the overlay + svgcontainer
// 3. initialize the d3 selections & data (but could be empty data)
MapVisManager.init = function(container, initProps) {
    console.debug('MapVisManager init');
    // bind the required callbacks to this manager
    this.onSelectChange = initProps.onSelectChange;
    this.onViewChange = initProps.onViewChange;
    this.loadFeederData = initProps.loadFeederData;
    this.loadTransData = initProps.loadTransData;
    this.overlay = null;
    this.d3data = {
        transmission: {
            nodedata: [],
            linkdata: []
        },
        distribution: {
            nodedata: [],
            linkdata: []
        }
    }
    // //dont bind them here
    // this.zoomLevel = initProps.mapProps.zoomLevel;
    // this.tColor = initProps.tColor;
    // this.dColor = initProps.dColor;
    // init the map
    var map = initMap(container, initProps.mapProps) //notice that this map is out of React Control as well
    console.debug('map inited');
    this.map = map;
    // init overlay(and add it to map)
    // the overlay contains the actual svg g element to hold node & link
    this.overlay = new MapVisOverlay(map, resolve); //bind the overlay here for future reference. e.g. get projection
    
    function resolve(dis_G, trans_G) {
        console.log('add this moment, overlay init and dis_G ready', dis_G, trans_G);
        //onAdd only in charge of binding the g element to the manager
        
        console.info('map ready, d3 G read, call ajax to load trans data');
        MapVisManager.loadTransData(MapVisManager);
        //Deprecated
        // // however the initProps may not have the data
        // // thus we should use the data binding to manager to do update
        // //call update before draw function get called
        // MapVisManager.update(initProps);
    }
}

// This is a busy function, it has many responsibities...
// 0. update mapStyle is done here...
// 1. update data binding to manager if necessary
// 2. if d3 container available, bind data to d3 selection through general_update_patterns (data binding + basic styles)
// 3. if d3 container available, call the projection to locate the vis elements at right place
// 4. if d3 container available, update customized styles(color&size&selected&filtered&hover&time_series)

/**
    maybe should devide this update function into different tasks
    zoom_based_update
    select_based_update
    data_binding_update (
        //loading different data
    )
    time_series_update
*/
MapVisManager.update = function(nextProps) {
    console.info('-------------MapVisManager update-----------');
    //in this function
    var zoomChange = false;
    if (this.zoomLevel !== nextProps.mapProps.zoomLevel) {
        this.zoomLevel = nextProps.mapProps.zoomLevel;
        zoomChange = true;
    }

    //TODO: color customization set together with data binding since you always need to do data binding
    this.map.setMapTypeId(nextProps.mapStyle);

    // be careful! at this moment, maynot have d3 element
    //but you can go ahead to do data update
    if (nextProps.dataChange) {
        console.info('datachange detected...');
        if (nextProps.dataChange == 'transmission') {
            console.info('transmission data change...to update transmission data');
            update_transmission_data(nextProps.data.transmission, this.d3data.transmission);
            console.info('transmission data change...to bind transmission data to d3 G');
            bind_transmission_data(MapVisManager);
        }
        if (nextProps.dataChange == 'distribution') {
            console.info('distribution data change...to update distribution data');
            update_distribution_data(nextProps.data.distribution, this.d3data.distribution);
            console.info('distribution data change...to bind distribution data to d3 G');
            bind_distribution_data(MapVisManager);
        }
    }

    //for transmission level update...actually do I need to do transmission update after first loading process?
    if (this.overlay.d3Container.transmission) {
        var trans_G = this.overlay.d3Container.transmission;
        
        //zoom scaling
        if (zoomChange) {
            console.info('zoom change and do trans scaling');
            trans_zoom_based_styling(MapVisManager);
        }

        //color rendering
        if (this.tColor !== nextProps.tColor) {
            this.tColor = nextProps.tColor;
            trans_G.selectAll('.tnodeG')
                .style('fill', this.tColor);
            trans_G.selectAll('line')
                .style('stroke', this.tColor);
        }
    }

    //only do d3 updating when d3 element available
    if (this.overlay.d3Container.distribution) {
        var dis_G = this.overlay.d3Container.distribution;

        //do I always need to do that?
        // console.info('dis_data_binding...!!!!!');
        // bind_distribution_data(MapVisManager); //exit & enter & update + callback binding
        // MapVisManager.overlay.draw();
        if (zoomChange) {
            console.info('zoom change and do dis scaling');
            dis_zoom_based_styling(MapVisManager);
        }

        //color rendering
        if (this.dColor !== nextProps.dColor) {
            this.dColor = nextProps.dColor;
            dis_G.selectAll('.dnodeG')
                .style('fill', this.dColor);
            dis_G.selectAll('line')
                .style('stroke', this.dColor);
        }

        //show contour
        if (nextProps.process == 'finished') {
            let contouring = nextProps.contouring;
            if (contouring) {
                let busTimeSeries = nextProps.outputdata['bus'];
                let dnode = dis_G.selectAll('.dnodeG');
                let timeAttribute = nextProps.timeAttribute;
                dnode
                    .selectAll('.time_series')
                    .style('display', 'block')
                    .transition()
                    .duration(500)
                    .style('fill', function(d) {
                        var nextValue = busTimeSeries[d.name][timeAttribute][nextProps.timeVal - 1];
                        return timeAttribute == 'marginal' ? marginColorScale(nextValue) : injectionColorScale(nextValue);
                    })

            } else {
                dis_G.selectAll('.dnodeG')
                    .selectAll('.time_series')
                    .style('display', 'none')
            }
            //for line time series
            let lineTimeSeries = nextProps.outputdata['line'];
            // console.info(lineTimeSeries)
            var dlink = dis_G.select("#dLinkLayer").selectAll(".dlink");
            let dColor = this.dColor;
            dlink
                .style('stroke', function(d) {
                    // console.info('-----')
                    let flowCap =  Math.abs(+lineTimeSeries[d.name]['flow'][nextProps.timeVal - 1]) / d.cap;
                    if (flowCap > lineCapacityCriteria) {
                        return 'red';
                    } else if (flowCap > lineCapacityCriteria / 1.2) {
                        return 'yellow';
                    } else {
                        return '#00cd00';
                    }
                })
                .style('stroke-width', 3)
                .transition()
                .duration(500)
                .style('stroke-width', 1.5);
        } else {
            //need to clean the original countour
            dis_G.selectAll('.dnodeG')
                .selectAll('.time_series')
                .style('display', 'none')
            var dlink = dis_G.select("#dLinkLayer").selectAll(".dlink");
            dlink.style('stroke', this.dColor);
        }

        if (this.filter !== nextProps.filter) {
            let filter = this.filter = nextProps.filter;
            //clean current filter
            dis_G.selectAll('.dnodeG')
                .selectAll('.highlight_ring')
                .style('display', 'none')

            if (filter == 'node') {
                return;
            } else {
                let filterElement = dis_G.selectAll('.' + filter)
                filterElement
                    .each(function(d) {
                        let parentNode = d3.select(this.parentNode.parentNode);
                        parentNode
                            .select('.highlight_ring')
                            .style('display', 'block')
                            .style('stroke', eleColorMap[filter])
                    })
            }
        }
    }
}

//not used
function select_based_styling(MapVisManager) {
    //clear previous selected & filter
    var dis_G = MapVisManager.overlay.d3Container.distribution;
    var dnode = dis_G.selectAll('.dnodeG');
    var selected = MapVisManager.selected;
    dnode
        .selectAll('.highlight_ring')
        .style('display', 'none')
        .style('stroke-width', '2px');

    //try highlight select
    if (selected.object === 'node') {
      dnode
        .filter(function(d) {return d.id === selected.id})
        .select('.highlight_ring')
        .style('stroke', dColor)
        .style('stroke-width', '6px')
        .style('display', 'block')
    } else if (selected) {
      //must be element
      var element = dnode.selectAll('.' + selected.object)
        .filter(function(d) {
          return d.id === selected.id;
        }).each(function(d) {
          d3.select(this)
            //must be element
            var parentNode = dnode
              .filter(function(pd) {return pd.name === d.parent})
            //paint parent
            parentNode
              .select('.highlight_ring')
              .style('display', 'block')
              .style('stroke', eleColorMap[selected.object])
        });
    }
}

function trans_zoom_based_styling(MapVisManager) {
    var trans_G = MapVisManager.overlay.d3Container.transmission;
    var tlink = trans_G.select("#tLinkLayer").selectAll("line");
    var tnode = trans_G.selectAll('.tnodeG');
    var currZoomLevel = MapVisManager.zoomLevel;
    tnode.filter(function(d) {
        return d.object == 'centroid';
    }).style('display', function(d) {
        return currZoomLevel >= 13 ? 'block' : 'none';
    })
    tnode.each(function (d) {
        //for the rect
        d3.select(this).select('rect')
            .attr('width', function(d) {
                return currZoomLevel >= 12 ? 20 : 10;
            })
            .attr('height', function(d) {
                return currZoomLevel >= 12 ? 5 : 2;
            })
            .attr('x', function(d) {
                return currZoomLevel >= 12 ? -10 : -5;
            });
        //as a whole
        d3.select(this)
            .style('opacity', function(d) {
                return currZoomLevel >= 14 ? .2 : 1;
            })
    });
    tlink.style('opacity', function(d) {
        return currZoomLevel >= 14 ? .2 : 1;
    })

    tlink.filter(function(d) {
        return d.object === 'centroid_line'
        })
        .style('display', function(d) {
        return currZoomLevel >= 13 ? 'block' : 'none';
    })
}

function dis_zoom_based_styling(MapVisManager) {
    var dNodeRectSizeStyle = {
        feeder_overview: {
            width: 10,
            height: 2,
            x: -5
        },
        feeder_detail: {
            width: 30,
            height: 4,
            x: -15
        }
    }
    var dNodeTitleStyle = {
        feeder_overview: {
            display: 'none'
        },
        feeder_detail: {
            display: 'block'
        }
    }

    var dNodeElementStyle = {
        feeder_overview: {
            display: 'none'
        },
        feeder_detail: {
            display: 'block'
        }
    }
    function getZoomState(zoomLevel) {
      return zoomLevel > 14 ? 'feeder_detail' : 'feeder_overview';
    }
    var zoomState = getZoomState(MapVisManager.zoomLevel);
    //get corresponding selection
    var dis_G = MapVisManager.overlay.d3Container.distribution;
    var dlink = dis_G.select("#dLinkLayer").selectAll(".dlink");
    var dnode = dis_G.selectAll('.dnodeG');
    dnode.each(function (d) {
        //for the rect
        d3.select(this).select('rect')
            .attr('width', dNodeRectSizeStyle[zoomState].width)
            .attr('height', dNodeRectSizeStyle[zoomState].height)
            .attr('x', dNodeRectSizeStyle[zoomState].x);

        //for the d_bus_title
        d3.select(this).select('.d_bus_title')
            .style('display', dNodeTitleStyle[zoomState].display)

        d3.select(this).select('.elements')
            .style('display', dNodeElementStyle[zoomState].display)
    });
}




MapVisManager.destroy = function() {
    console.debug('MapVisManager destroy');
}

exports = module.exports = MapVisManager;
/**
 * init a map
 * @param {dom} container - The div container for the map
 * @param {Object} mapProps - the init map props including zoomLevel & mapCenter
 * @param {function} cbs - the callback function to be binded
 */
function initMap(container, mapProps) {
    var map = new google.maps.Map(container, {
        zoom: mapProps['zoomLevel'],
        center: mapProps['mapCenter'],
        disableDefaultUI: true,
        // draggable: false
    });

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('light', MapStyles['lightStyle']);
    map.mapTypes.set('dark', MapStyles['darkStyle']);
    map.mapTypes.set('plain', MapStyles['plainStyle']);
    map.mapTypes.set('night', MapStyles['nightStyle']);

    map.addListener('click', function() {
        MapVisManager.onSelectChange(null);
    });

    //set the self created control UI on the map (the zoomlevel bar)
    var zoomControlDiv = document.createElement('div');
    var zoomControl = new MapControlElement(zoomControlDiv, map);
    map.addListener('zoom_changed', function() {
        console.info('map zoom_changed detected');
        // callback get called here instead of overlay draw, logically right & better performance
        MapVisManager.onViewChange({
            zoomLevel: map.getZoom(), 
            mapCenter: map.getCenter()
        })
        zoomControl.setZoom(map.getZoom());
    });
    zoomControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(zoomControlDiv);
    map.setOptions({ minZoom: 11, maxZoom: 17 });
    return map;
}