var Choropleth = {};

Choropleth.Map = React.createClass({
  getDefaultProps: function() {
    return {
      width: 960,
      height: 500
    };
  },

  getInitialState: function() {
    return {
      counties: [],
      states: {},
      rateById: d3.map()
    };
  },

  componentWillMount: function() {
    var cmp = this;

    queue()
      .defer(d3.json, "/assets/data/us.json")
      .defer(d3.tsv, "/assets/data/results.tsv", function(d) {
        cmp.state.rateById.set(d.id, +d.rate);
      })
      .await(function(error, us) {
        cmp.setState({
          counties: topojson.feature(us, us.objects.counties).features,
          states: topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })
        });
      });
  },

  quantize: d3.scale.quantize()
    .domain([0, 1])
    .range(d3.range(9).map(function(i) {
      return "q" + i + "-9";
    })),

  render: function() {
    var cmp = this;

    var svg = React.DOM.svg;
    var g = React.DOM.g;
    var path = React.DOM.path;

    var pathGenerator = d3.geo.path();

    return svg({
      className: "choropleth RdBu",
      width: this.props.width,
      height: this.props.height
    },
               g({
                 className: "counties"
               },
                 _.map(this.state.counties, function(county) {
                   return path({
                     className: cmp.quantize(cmp.state.rateById.get(county.id)),
                     d: pathGenerator(county)
                   });
                 })),
               path({
                 className: "states",
                 d: pathGenerator(this.state.states)
               }));
  }
});

React.renderComponent(Choropleth.Map(), document.getElementById("react"));