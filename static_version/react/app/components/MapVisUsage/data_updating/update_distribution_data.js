exports = module.exports = function(data, d3data) {
    //new data in distribution is alread in nodes and links, the only thing we need to do is to bind them
    //but if force layout is coming into play, it becomes weird
    if (!data) {
        console.info('no data parse in, ready to remove');
        d3data['nodedata'] = [];
        d3data['linkdata'] = [];
        return;
    }
    var name2eleMap = {};

    //since we alread bind the elements in backend, we only need to bind the links in front end
    var nodes_raw = data['nodes'];
    var links_raw = data['links'];

    nodes_raw.forEach(function(node) {
        name2eleMap[node.name] = node;
    });


    links_raw.forEach(function(link) {
        link['source'] = name2eleMap[link['from']];
        link['target'] = name2eleMap[link['to']];
    });

    d3data['nodedata'] = nodes_raw;
    d3data['linkdata'] = links_raw;
    
    // var force = d3.layout.force();
    // force.nodes(nodes);
    // force.links(links);

    // force
    //     // .linkDistance(10)
    //     .gravity(.1)
    //     // .charge(function(n, i) {

    //     //   return (n.name == "150") ? -3000 : -1000;
    //     // })
    //     .size([100, 100])
    //     .on('tick', function() {
    //         console.log('tick');
    //     })
    //     .on('end', function() {
    //         console.log('end');
    //         nodes.forEach(function(node) {
    //             node.lat = node.lat -50/10000 + node.x/10000;
    //             node.lng = node.lng -50/10000 + node.y/10000;
    //         });
    //         // console.log(links);
    //         d3data['nodedata'] = nodes;
    //         d3data['linkdata'] = links;
    //     })
    //     .start();

    // //   console.log(force.alpha())
    // while(force.alpha() > 0.01) { 
    //   force.tick();
    // }
    // force.stop();
}