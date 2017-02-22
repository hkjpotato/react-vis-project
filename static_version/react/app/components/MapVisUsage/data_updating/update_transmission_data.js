exports = module.exports = function(data, d3data) {
    //new data in distribution is alread in nodes and links, the only thing we need to do is to bind them
    //but if force layout is coming into play, it becomes weird
    var name2eleMap = {};

    //since we alread bind the elements in backend, we only need to bind the links in front end
    var nodes_raw = data['nodes'];
    var links_raw = data['links'];

    nodes_raw.forEach(function(node) {
        name2eleMap[node.name] = node;
    });

    //links_raw should already have object type (centroid_line | transimission_line) of the line
    links_raw.forEach(function(link) {
        link['source'] = name2eleMap[link['from']];
        link['target'] = name2eleMap[link['to']];
    });

    d3data['nodedata'] = nodes_raw;
    d3data['linkdata'] = links_raw;
}