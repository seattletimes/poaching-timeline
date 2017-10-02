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
var photoContainer = $.one(".photo-container");
var [, , width, height] = svg.getAttribute("viewBox").split(" ").map(Number);

var mapContainer = $.one(".map-container");
var mapElement = $.one("leaflet-map");
var map = mapElement.map;
var leaflet = mapElement.leaflet;

var template = require("./lib/dot").compile(require("./_details.html"));
var photoTemplate = require("./lib/dot").compile(require("./_photo.html"));

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

  var type = event.photo ? "photo" : "no-photo";
  type += event.lat ? " mapped" : " no-map";
  if (!i) type += " active";

  var center = (width - height * 2) * i / (poachingData.length - 1) + height;

  var g = m("g", { class: "dot " + type, id: event.date }, [
    m("circle", { cx: center, cy: height * .5, r: height * .45, class: "outer" }),
    m("circle", { cx: center, cy: height * .5, r: height * .25, class: "inner" })
  ]);

  g.addEventListener("click", onClick);

  if (event.lat) {
    var marker = leaflet.marker([event.lat, event.long], {
      icon: leaflet.divIcon({
        className: "poaching-marker",
        iconSize: [15, 15]
      })
    });
    event.marker = marker;
    marker.addTo(map);
  }

  var [month, day, year] = event.date.split("/").map(n => parseInt(n, 10));
  var months = [null, "Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  event.dateText = `${months[month]} ${day}, ${year}`;

  svg.appendChild(g);

});

var currentMarker = null;

var showDetails = function(date) {
  var data = lookup[date];
  if (!data) return;
  details.innerHTML = template(data);
  photoContainer.innerHTML = photoTemplate(data);
  if (data.lat) {
    mapContainer.classList.remove("hide");
    var img = $.one("img", details);
    if (img) img.onload = () => map.invalidateSize();
    map.flyTo([data.lat, data.long], 7);
    if (currentMarker) {
      currentMarker.classList.remove("active");
    }
    currentMarker = data.marker.getElement();
    currentMarker.classList.add("active");
  } else {
    mapContainer.classList.add("hide");
    currentMarker.classList.remove("active");
  }
};

showDetails(window.poachingData[0].date);

var clickIteration = function() {
  var currentDot = $.one(".dot.active");
  var currentDate = currentDot.id;
  var currentItem = lookup[currentDate];
  var currentIndex = window.poachingData.indexOf(currentItem);
  var index = currentIndex + (this.classList.contains("next") ? 1 : -1);
  if (index < 0) index = 0;
  if (index >= window.poachingData.length) index = window.poachingData.length - 1;
  var dest = window.poachingData[index];
  showDetails(dest.date);
  savage(currentDot).removeClass("active");
  savage(`[id="${dest.date}"]`).addClass("active");
};

$(".iterate button").forEach(el => el.addEventListener("click", clickIteration));