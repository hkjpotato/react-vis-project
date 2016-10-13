var React = require('react');
var EditForm = React.createClass({
    getInitialState: function() {
        var initialInfo = Object.assign({}, this.props.selectedInfo);
        return {
            selectedInfo: initialInfo
        }
    },
    componentDidUpdate: function() {
        var updateInfo = Object.assign({}, this.props.selectedInfo);
        this.setState({
            selectedInfo: updateInfo
        });
    },
    componentDidMount: function() {
        $(document).ready(function() {
            Materialize.updateTextFields();
        });
    },
    handleChange: function(event) {
        var currInfo = this.state.selectedInfo;
        currInfo[event.target.id] = event.target.value;
        this.setState({
            selectedInfo: currInfo
        });

    },
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
        var selectedInfo = this.state.selectedInfo;
        var keys = Object.keys(selectedInfo);

        var rows = keys.map(function(key) {
            return (
              <div key={key} className="row">
                <div className="input-field col s12">
                  <input value={selectedInfo[key]} id={key} type="text" className="validate" onChange={this.handleChange} />
                  <label className="active" htmlFor={key}>{key}</label>
                </div>
              </div>
            )
        }.bind(this))
        return (
        <div className="z-depth-3" style={inlineStyle}>
            <div className="row">
                <form className="col s12">
                    {rows}
                </form>
            </div>
            <div className="row">
                <div className="col s6">
                    <a className="waves-effect waves-light btn" onClick={this.saveData}>Confirm</a>
                </div>
            </div>
        </div>
        )
    }
});




module.exports = EditForm;
