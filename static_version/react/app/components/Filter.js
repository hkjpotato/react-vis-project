var React = require('react');
import { eleColorMap, iconClassName } from './Helpers/ElementHelper';

var Filter = React.createClass({
  filterClick: function(e) {
      console.info('------filterClick-------');
      e.preventDefault();
      var filter = e.target.value;
      this.props.onFilterChange(this.props.currFilter == filter ? null : filter);
  },
  render: function() {
    var currFilter = this.props.currFilter
    //arrange them in order of load/generator/storage/solar/capacitor
    var items = ['load', 'generator', 'storage', 'solar', 'capacitor'];
    var rows = items.map(function(item, i) {
      return (
      <div style={{color: 'black', height: '35px',}} key={i}>
        <input 
          id={"filter_" + item} 
          type="checkbox" 
          value={item}
          style={{display: 'none'}}
          checked={currFilter == item}
          onChange={this.filterClick} >
        </input>
        <label htmlFor={"filter_" + item} style={{paddingLeft: 10, cursor: 'pointer', userSelect: 'none'}}>
          <i 
            className={'fa ' + (currFilter == item ? 'fa-check-circle-o' : 'fa-circle-o')} >
          </i>
          <i 
            style={{color: eleColorMap[item],  width: '30px', marginLeft: '10px'}} 
            className={iconClassName[item]} >
          </i>
          <span>{item}</span>
        </label>
      </div>)
    }.bind(this));

    return (
      <div
        style={{
          // fontSize: ".9em",
          paddingLeft: '10px',  
          paddingRight: '10px',
          border: '1px solid lightgray',
          margin: '10px 0px',
        }}>
        <span 
          style={{
            fontSize: '0.8em',
            color: 'gray',
            fontWeight: 700,
            lineHeight: '2px',
          }}>filter</span>
        <div
          style={{
            paddingBottom: '-2px',
        }}>
          {rows}
        </div>
      </div>
    );
  }
});

module.exports = Filter;