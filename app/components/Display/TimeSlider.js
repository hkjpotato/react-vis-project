var React = require('react');
var playInterval = null;
var TimeSlider = React.createClass({
  // getInitialState: function() {
  //   return {
  //       value: 1,
  //       playing: true
  //   }
  // },
  onChange: function(event) {
    // console.log("hi", event.target.value, typeof event.target.value);
    // this.setState({
    //     value: +event.target.value
    // });
    this.props.onTimeChange(+event.target.value);
  },
  onPlayClick: function(event) {
    this.props.onPlayClick();
    // if (!this.state.playing) {
    //     console.log('yoyoyoyoyoyoyo', this.state.value);
    //     // var startValue = this.state.value;
    //     clearInterval(playInterval);
    //     playInterval = setInterval(function() {
    //         console.log('interval curr', this.state);
    //         var currValue = this.state.value;
    //         this.setState({
    //             value: (((currValue + 1) - 1) % 24 + 1)
    //             // value: 15
    //         })
    //     }.bind(this), 2000);
    // } else {
    //     clearInterval(playInterval);
    // }
    // this.setState({
    //     playing: !this.state.playing
    // });
  },
  componentDidMount: function() {
    // if (this.state.playing) {
    //     // var startValue = this.state.value;
    //     clearInterval(playInterval);
    //     playInterval = setInterval(function() {
    //         console.log('interval curr', this.state);
    //         var currValue = this.state.value;
    //         this.setState({
    //             value: (((currValue + 1) - 1) % 24 + 1)
    //             // value: 15
    //         })
    //     }.bind(this), 2000);
    // } else {
    //     clearInterval(playInterval);
    // }
  },
  render: function() {
    var inlineStyle = {
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 500,
        height: 75,
        border: '1px solid #009688',
        borderRadius: '2%',
        overflow: 'auto',
        background: 'white',
        paddingTop: 15
    };
    var playButtonStyle = {
        display: 'inline-block',
        margin: 10,
        float: 'left'
    }
    var sliderStyle = {
        display: 'inline-block',
        margin: 10,
        float: 'left',
        width: 400
    }

    var playing = this.props.playing;
    var timeVal = this.props.timeVal;
    return (
        <div className="z-depth-3" style={inlineStyle}>
            <a style ={playButtonStyle} onClick={this.onPlayClick} className="btn-floating btn-small waves-effect waves-light"><i className="material-icons">{playing ? 'pause' : 'play_arrow'}</i></a>
            <p style ={sliderStyle} className="range-field">
              <input type="range" id="test5" step="1" min="1" max="24" value={timeVal} onChange={this.onChange}/>
            </p>
        </div>
    )
  }
});



module.exports = TimeSlider;