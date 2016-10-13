var React = require('react');
var ReactDOM = require('react-dom');

//global data
var d3Force = {};
var pgObject = null;
var name2eleMap = {};

//data
var nodes = [];
var links = [];

//d3 selections
var vis = null;
var node = null;
var link = null;
//forcelayout
var force = null;
var color = d3.scale.category10();


//D3 Component
d3Force.create = function(el, props, clickCb) {
    var width = el.offsetWidth;
    var height = el.offsetHeight;
    // Zoomer
    var zoomer = d3.behavior.zoom();
    zoomer.scaleExtent([0.1, 30]);
    var visContainer = d3.select(el)
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .on('click', function() {
            console.log('svg click event tagname', window.event.target.tagName)
            if (window.event.target.tagName == 'svg') {
                // props.itemClick(null);
                clickCb(null);
            }
        })
        .call(zoomer.on('zoom', function() {
            vis.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
        }));


    vis = visContainer.append('g') //d3 selections
        .attr('id', 'powerGrid');
    // add a layer to force the links to the bottom.
    vis.append('g').attr('id','linkLayer');
    node = vis.selectAll('circle'),
    link = vis.select('#linkLayer').selectAll('.link');

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

    force = d3.layout.force()
        .linkDistance(30)
        // .gravity(0)
        // .charge(-100)
        .size([width, height])
        .nodes(nodes)
        .links(links)
        .on('tick', function() {
            link
                .attr('x1', function(d) {return d.source.x})
                .attr('y1', function(d) {return d.source.y})
                .attr('x2', function(d) {return d.target.x})
                .attr('y2', function(d) {return d.target.y})
            node
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
        });

    d3Force.update(props, clickCb);
}

//most important!: use to update the nodes and links data
d3Force.parseData = function(data) {
    //we can for sure that data has been changed at this state!
    console.log("^^^CRAZY PARSE DATA DUE TO DATA CHANGE by d3Force^^^");
    pgObject = data;
    //at this moment, we always clear the data
    nodes = [];
    links = [];
    //also tell force about it
    if (force) {
        force.stop();
        force.nodes(nodes);
        force.links(links)
    }

    if (nodes.length == 0) {
        //if force already set up, which means after the init. or the current force is working
        //clean them
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
                    y: pgObject[x].lng,
                    // fixed: true
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

//update is where the data binding and general d3 update patterns
d3Force.update = function(props, clickCb) {
    console.log('d3Force update');
    var selected = props.selected;
    var filter = props.filter;

    //up to now, the data should be update by parseData already
    var l = vis.select("#linkLayer").selectAll(".link").data(links, function(d) {
            return d.source.pgIndex + "-" +  d.target.pgIndex;
        });
    var n = vis.selectAll('.node').data(nodes, function(d) {
        return d.pgIndex
    })

    // enter link
    _enterLinks(l);
    // exit link
    _exitLinks(l);
    // enter node, should attach event listener
    _enterNodes(n, clickCb);
    // exit node
    _exitNodes(n);

    //update + enter
    link = vis.select("#linkLayer").selectAll(".link");
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


    force.start();
}

d3Force.destroy = function() {
  // Any clean-up would go here
  // in this example there is nothing to do
}

var _enterLinks = function(l) {
    l.enter()
        .append('line')
        .attr("class", "link")
        .style('stroke', '#999999')
        .style('stroke-opacity', .6)
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
    // var drag = force.drag()
    //     .origin(function(d) { return d; })
    //     .on("dragstart", function(d) {
    //         //key to stop propagation so that zoom does not try to do panning
    //         d3.event.sourceEvent.stopPropagation();
    //     });
    var nodeG = n.enter()
        .append("g")
        .attr("class", "node")
        .on("mouseover", function(d) {
            console.log('mouse over...', d, d3.select(this));
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
        .call(
            //to fixed the bug of conflict between drag and zoom
            force.drag()
            .origin(function(d) { return d; })
            .on("dragstart", function(d) {
                //key to stop propagation so that zoom does not try to do panning
                d3.event.sourceEvent.stopPropagation();
            })
        );

    nodeG.append("circle")
     .attr("cx", 0)
     .attr("cy", 0)
    .style("cursor", "pointer")
    .on('click', function(d) {
        // d3.select(this).transition()
        // .duration(750)
        // .attr("r", 16)
        // .style("fill", "lightsteelblue");
        console.log('circle click cb', d);
        clickCb(d);
    });

    nodeG.append("text")
     .attr("x", function(d) {
        return "1em";
     })
     .attr("dy", ".35em")
     .style("font-size", "0.8em")
     .text(function(d) {return d.objectType + " : " + d.name})

}

var _exitNodes = function(n) {
    n.exit().remove();
}

//React Component
var ForceVis = React.createClass({
    saveData: function() {
        //update the node x and y to the pgObject, just update the node
        for (var x in pgObject) {
            //in a tree, if an element has either name or module but from is undefined, it must be a node
            if ((pgObject[x].name != undefined || pgObject[x].module != undefined) && pgObject[x].from == undefined) {
                pgObject[x]['ha'] = "ha";
                if (pgObject[x].object == "node") {
                    pgObject[x]['lat'] = name2eleMap[nodeName].x;
                    pgObject[x]['lng'] = name2eleMap[nodeName].y;
                }
            }
        }
        //try to use form to submit
        var method = 'post' // Set method to post by default, if not specified.
        var form = document.createElement('form');
        form.setAttribute('id', 'invisible')
        form.setAttribute('method', method);
        form.setAttribute('action', '/saveFeeder/');
        var params = {
            'feederObjectJson' : JSON.stringify(pgObject)
        }
        for(var key in params) {
            if(params.hasOwnProperty(key)) {
                var hiddenField = document.createElement('input')
                hiddenField.setAttribute('type', 'hidden')
                hiddenField.setAttribute('name', key)
                hiddenField.setAttribute('value', params[key])
                form.appendChild(hiddenField)
            }
        }
        document.body.appendChild(form);

        $('#invisible').bind('ajax:complete', function() {
            // tasks to do 
            console.log('submit complete');
            location.reload();

        });
        // form.submit();

        // location.reload();
        //try use jquery ajax to send the data
        // var params = {
        //     'feederObjectJson' : JSON.stringify(pgObject)
        // }
        // $.ajax({
        //    type: "POST",
        //    url: "/saveFeeder/",
        //    dataType: "json",
        //    contentType: "application/json; charset=utf-8",
        //    success: function (msg) {
        //         console.log('success', msg);
        //    },
        //    failure: function(msg) {
        //         console.log('failure', msg);
        //    },
        //    data: JSON.stringify(params)
        // });
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
        console.log('ForceVis didmount!');
        var el = ReactDOM.findDOMNode(this);
        d3Force.parseData(this.props.data);
        d3Force.create(el, this.props, this.singleClick);
    },
    componentDidUpdate: function() {
        console.log('ForceVis didUpdate!');
        if (this.props.dataChange) {
            d3Force.parseData(this.props.data);
        }
        d3Force.update(this.props, this.singleClick);
    },
    componentWillUnMount: function() {
        d3Force.destroy();
    },
    render: function() {
        console.log('ForceVis render');
        var buttonStyle = {
            position: 'absolute',
            bottom: '30px',
            right: '30px'
        }
        var inlineStyle = {
            width: '100%',
            height: '100%',
        }
        return (
            <div style={inlineStyle} className="forceVis">
                <a style={buttonStyle} className="waves-effect waves-light btn" onClick={this.saveData}>update</a>
            </div>
        )
    }
});

module.exports = ForceVis;
