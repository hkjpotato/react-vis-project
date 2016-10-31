var React = require('react');
var Filter = require('./Filter');
var Preloader = require('./Preloader');
var ColorSelect = require('./ColorSelect');

var SideBar = React.createClass({
    getInitialState: function() {
        return {
            t_color: 'black',
            d_color: 'black'
        }
    },
    componentDidMount: function() {

    },
    render: function() {
        if (!this.props.data) {
            return <Preloader />
        } else {
            return (
                <div className="row" style={{height: "100%"}}>
                    <div className="col s12">
                        <h5>Explorator</h5>
                    </div>
                    <div className="col s12">
                        <Filter onFilterChange={this.props.onFilterChange} currFilter={this.props.filter} />
                    </div>
                    <div className="col s12">
                        <ColorSelect 
                            tColor={this.props.tColor} 
                            dColor={this.props.dColor} 
                            onMapStyleChange={this.props.onMapStyleChange} 
                            onTColorChange={this.props.onTColorChange} 
                            onDColorChange={this.props.onDColorChange}/>
                    </div>
                    <div className="col s12">
                        <a className="waves-effect waves-light btn red darken-1" onClick={this.props.runAnalysis}>{this.props.status}</a>
                    </div>
                </div>
            )
        }
    }
});

module.exports = SideBar;

      // <div style={runButtonStyle}>
      //   <a className='dropdown-button btn' href='#' data-activates='dropdown1'>Analysis</a>
      //   <ul id='dropdown1' className='dropdown-content'>
      //     <li><a href="#!">ProsumerGrid</a></li>
      //     <li className="divider"></li>
      //     <li><a href="#!">GridLab-D</a></li>
      //     <li className="divider"></li>
      //     <li><a href="#!">OMF</a></li>
      //   </ul>

      //   <div style={{marginTop: 100}} className="input-field col 2">
      //     <select>
      //       <option value="" disabled selected>Choose your option</option>
      //       <option value="1">red</option>
      //       <option value="2">blue</option>
      //       <option value="3">green</option>
      //     </select>
      //     <label>transmission color</label>
      //   </div>
      //   <a style={{display: 'block', marginTop: 20}} className="waves-effect waves-light btn red darken-1" onClick={this.runAnalysis}>{status}</a>
      // </div>