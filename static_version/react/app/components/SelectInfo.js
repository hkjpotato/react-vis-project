var React = require('react');
var iconClassName = {
  "load": 'fa fa-arrow-down',
  "generator": 'fa fa-bolt',
  "storage": 'fa fa-battery-three-quarters',
  "solar": 'fa fa-star',
  "capacitor": 'fa fa-archive',
}
var eleColorMap = {
  "load": '#ff6d6d',
  "generator": '#ffca6d',
  "storage": '#6dcaff',
  "solar": '#FFFF00 ',
  "capacitor": '#00c26d',
}

var SelectInfo = React.createClass({
  render: function() {
    var inlineStyle = {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 300,
        maxHeight: 500,
        border: '1px solid #009688',
        overflow: 'auto',
        background: 'white'
    }
    var selectedInfo = this.props.selectedInfo;
    var keys = Object.keys(selectedInfo);
    keys = keys.filter(function(d) {
        return (d !== "object" && d !== "elements");
    });

    var rows = keys.map(function(key) {
        return (
            <tr key={key} style={{height: 10}}>
                <td>{key}</td>
                <td>{selectedInfo[key]}</td>
            </tr>
        )
    });

// onClick={this.props.onSelectChange.bind(this, selectedInfo['elements'][key])
    if ("elements" in selectedInfo) {
        var elementsInfo = [];
        for (var eleObj in selectedInfo['elements']) {
            elementsInfo.push(
                <span key={eleObj} onClick={this.props.onSelectChange.bind(null, selectedInfo['elements'][eleObj])} style={{color: eleColorMap[eleObj]}} className={iconClassName[eleObj]} aria-hidden="true">&nbsp;</span>
            )
        }

        // var addInfo = {
        //     parent: selectedInfo.name, 
        //     eleObj: 'generator'
        // }
        // elementsInfo.push(
        //     <span key='addIcon' onClick={this.props.addElement.bind(null, addInfo)} className="fa fa-plus" aria-hidden="true">&nbsp;</span>
        // )
        rows.push(
            <tr key={"elements"} style={{height: 10}}>
                <td>{"elements"}</td>
                <td>{elementsInfo}</td>
            </tr>)
    }


    return (
        <div className="z-depth-3" style={inlineStyle}>
          <table className="highlight bordered striped">
            <thead>
                <tr>
                    <th>Object</th>
                    <th>{selectedInfo.object}</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>

          {selectedInfo.elements ? null : (
            <div className="row">
                <div className="input-field col s4 offset-s4">
                  <a className="waves-effect waves-light btn" onClick={this.props.editStateChange}>Edit</a>
                </div>
            </div>
          )}
        </div>
    )
  }
})

module.exports = SelectInfo;
