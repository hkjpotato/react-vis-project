var React = require('react');
var EditForm = React.createClass({
    getInitialState: function() {
        var initialInfo = Object.assign({}, this.props.selectedInfo);
        return {
            selectedInfo: initialInfo
        }
    },
    componentDidUpdate: function() {
        // var updateInfo = Object.assign({}, this.props.selectedInfo);
        // this.setState({
        //     selectedInfo: updateInfo
        // });
    },
    componentWillReceiveProps: function(nextProps) {
      // You don't have to do this check first, but it can help prevent an unneeded render
      if (nextProps.selectedInfo.object !== this.state.selectedInfo.object || nextProps.selectedInfo.id !== this.state.selectedInfo.id) {
        this.setState({ selectedInfo: nextProps.selectedInfo });
      }
    },
    componentDidMount: function() {
        $(document).ready(function() {
            Materialize.updateTextFields();
        });
    },
    handleChange: function(event) {
        console.log('handle change啊喂')
        console.log('calling the edit form select', event.target.id);
        // return;
        var currInfo = this.state.selectedInfo;
        currInfo[event.target.id] = event.target.value;
        this.setState({
            selectedInfo: currInfo
        });
    },
    saveData: function(e) {
        console.log('submit!', e);
        e.preventDefault();
        console.log(this.refs);
        var formData = {};
        Object.keys(this.refs).forEach(function(key) {
            console.log(key);
            formData[key] = this.refs[key].value ? this.refs[key].value : null;

        }.bind(this));
        console.log('what is the form data', formData);
        var _self = this;
      var type = 'd_' + (formData.object == 'node' ? 'buses': formData.object + 's');
      //make ajax here using the id
      var api = '/feeder/api/' + type + '/' + formData.id + '/';
      $.ajax({
          type: "PUT",
          url: api,
          contentType: "application/json",
          data: JSON.stringify(formData),
          dataType: 'json',
          success: function(result) {
              console.log("success?", result);
            // _self.props.updateElement(Object.assign({}, _self.state.selectedInfo, result));
              _self.props.onSelectChange(Object.assign({}, _self.state.selectedInfo, result));
              // _self.props.updateElement(Object.assign({}, _self.state.selectedInfo, result));
          }.bind(this)
      });
    },
    render: function() {
        console.log('这里是render')
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
                  <input ref={key} defaultValue={selectedInfo[key]} id={key} type="text" className="validate" onChange={this.handleChange} />
                  <label className="active" htmlFor={key}>{key}</label>
                </div>
              </div>
            )
        }.bind(this))
        return (
        <div className="z-depth-3" style={inlineStyle}>
            <div className="row">
                <form className="col s12" onSubmit={this.saveData}>
                    {rows}
                    <div className="row">
                        <div className="input-field col s6">
                          <a className="waves-effect waves-light btn" onClick={this.props.editStateChange}>Back</a>
                        </div>
                        <div className="input-field col s6">
                          <input className="waves-effect waves-light btn" type="submit" onChange={this.handleChange} value="Confirm"/>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        )
    }
});




module.exports = EditForm;
