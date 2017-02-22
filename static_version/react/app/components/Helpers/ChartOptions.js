var  Highcharts = require('highcharts');

exports = module.exports = {
  options: {
           // credits: { enabled: false },
           // tooltip: { enabled: false },
            chart: {
                // spacingBottom: -10,
                // spacingTop: 10,
                spacingLeft: -32,
                height: 120,
                width: 520,
                backgroundColor:null
            },
            xAxis: {
              labels: {
                min: 0,
                max: 11
              },
              offset: 15,
              lineColor: 'transparent',
              minorGridLineColor: 'transparent',
              // tickColor: 'transparent',
              plotLines: [{
                  color: 'transparent'
              }],
              lineWidth: 0,
              tickmarkPlacement: 'on',
              title: {
                  enabled: false
              },
              categories: 
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12pm', 
                   '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', ],

            },
            yAxis: {
              lineColor: 'transparent',
              minorGridLineColor: 'transparent',
              tickColor: 'transparent',
              plotLines: [
                {
                  value: 10,
                  color: '#FF7070',
                  dashStyle: 'shortdash',
                  width: 1,
              }],
              gridLineColor: 'transparent',

                title: {
                    text: null
                },
                min: 0,
            },
            title: {
              text: null
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                areaspline: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 1
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            // series: [{
            //     type: 'areaspline',
            //     // data: new Array(24).fill(0),
            //     data: [
            //       25,
            //       20,
            //       15,
            //       10,
            //       8,
            //       4,
            //       5, //6
            //       8,
            //       13,
            //       20,
            //       18,
            //       19, //11
            //       17,
            //       16,
            //       13,
            //       8,
            //       7,
            //       15,
            //       20,
            //       25, //8
            //       30,
            //       35,
            //       28,
            //       25
            //     ],
            //     enableMouseTracking: false
            // }]
        }
}