// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

var $ = require("./lib/qsa");
var savage = require("savage-query");
var m = savage.dom;

var svg = $.one("svg.timeline");
var details = $.one(".event .details");
var [, , width, height] = svg.getAttribute("viewBox").split(" ").map(Number);

var mapContainer = $.one(".map-container");
var mapElement = $.one("leaflet-map");
var map = mapElement.map;
var leaflet = mapElement.leaflet;

var template = require("./lib/dot").compile(require("./_details.html"));

var lookup = {};

svg.appendChild(m("line", {
  x1: height,
  x2: width - height,
  y1: height * .5,
  y2: height * .5,
  class: "time"
}));

var onClick = function() {
  var date = this.getAttribute("id");
  savage(".dot.active").removeClass("active");
  savage(this).addClass("active");
  showDetails(date);
}

window.poachingData.forEach(function(event, i) {
  lookup[event.date] = event;

  var center = (width - height * 2) * i / (poachingData.length - 1) + height;

  var g = m("g", { class: "dot " + (i ? "" : "active"), id: event.date }, [
    m("circle", { cx: center, cy: height * .5, r: height * .45, class: "outer" }),
    m("circle", { cx: center, cy: height * .5, r: height * .25, class: "inner" })
  ]);

  g.addEventListener("click", onClick);

  if (event.lat) {
    var marker = leaflet.marker([event.lat, event.long], {
      icon: leaflet.divIcon({
        iconSize: [15, 15]
      })
    });
    event.marker = marker;
    marker.addTo(map);
  }

  svg.appendChild(g);

});

var showDetails = function(date) {
  var data = lookup[date];
  if (!data) return;
  details.innerHTML = template(data);
  if (data.lat) {
    mapContainer.classList.remove("hide");
    map.flyTo([data.lat, data.long], 11);
  } else {
    mapContainer.classList.add("hide");
  }
};

showDetails(window.poachingData[0].date);