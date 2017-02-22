var React = require('react');
var foundText = null;
var foundRow = null;
var currStroke = null;
var currColor = null;
var textTimeout = null;
var rowTimeout = null;

var SearchBar = React.createClass({
  componentDidMount: function() {
    $(document).ready(function() {
      $(window).keydown(function(event){
        if(event.keyCode == 13) {
          event.preventDefault();
          return false;
        }
      });
    });
  },
  searchClick: function() {
    //clear
    console.log(textTimeout)
    if (textTimeout) {
        foundText.css({
            "stroke": currStroke
        });
        clearTimeout(textTimeout);
        textTimeout = null;
    }
    var foundText = $("text:contains('" + this.refs.searchStr.value + "')" ).last()
    if (foundText) {
        currStroke = foundText.css("stroke");
        foundText.css({
            "stroke": "#00ffa5"
        });
        textTimeout = setTimeout(function() {
            foundText.css({
                "stroke": currStroke
            });
        }, 2000);
        textTimeout = null;
    }
    if (rowTimeout) {
        foundRow.css({
            "color": currColor
        });
        clearTimeout(rowTimeout);
        rowTimeout = null;
    }
    var foundRow = $("tr:contains('" + this.refs.searchStr.value + "')" ).last()
    console.log(foundRow, this.refs.searchStr.value);
    if (foundRow) {
        currColor = foundRow.css("color");
        foundRow.css({
            "color": "#00ffa5"
        });
        rowTimeout = setTimeout(function() {
            foundRow.css({
                "color": currColor
            })
        }, 2000);
        rowTimeout = null;
    }
    // console.log(foundin2);
  },
  render: function() {
    return (
      <form style={{height: 30}}>
        <div className="input-field">
          <i style={{cursor: 'pointer'}}className="material-icons prefix" onClick={this.searchClick}>search</i>
          <input style={{height: 30}} ref="searchStr" id="search" type="text" placeholder="Search..."/>
        </div>
      </form>
    );
  }
});

module.exports = SearchBar;
