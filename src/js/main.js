// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");
require("component-leaflet-map");

var $ = require("./lib/qsa");

var blockTime = $.one(".timeline-blocks");
var details = $.one(".event .details");
var photoContainer = $.one(".photo-container");

var mapContainer = $.one(".map-container");
var mapElement = $.one("leaflet-map");
var map = mapElement.map;
var leaflet = mapElement.leaflet;

var template = require("./lib/dot").compile(require("./_details.html"));
var photoTemplate = require("./lib/dot").compile(require("./_photo.html"));

var lookup = {};

var onClick = function() {
  var date = this.getAttribute("id");
  $(".block.active").forEach(el => el.classList.remove("active"));
  this.classList.add("active");
  showDetails(date);
}

window.poachingData.forEach(function(event, i) {
  lookup[event.date] = event;

  var type = event.photo ? "photo" : "no-photo";
  type += event.lat ? " mapped" : " no-map";
  if (!i) type += " active";

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

  var block = document.createElement("div");
  block.className = "block " + type;
  block.id = event.date;
  blockTime.appendChild(block);
  block.addEventListener("click", onClick);

  var [month, day, year] = event.date.split("/").map(n => parseInt(n, 10));
  var months = [null, "Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  event.dateText = `${months[month]} ${day}, ${year}`;
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
    map.flyTo([data.lat, data.long], 8, { duration: .5 });
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
  var currentDot = $.one(".block.active");
  var currentDate = currentDot.id;
  var currentItem = lookup[currentDate];
  var currentIndex = window.poachingData.indexOf(currentItem);
  var index = currentIndex + (this.classList.contains("next") ? 1 : -1);
  if (index < 0) index = 0;
  if (index >= window.poachingData.length) index = window.poachingData.length - 1;
  var dest = window.poachingData[index];
  showDetails(dest.date);
  currentDot.classList.remove("active");
  $.one(`.block[id="${dest.date}"]`).classList.add("active");
};

$(".iterate button").forEach(el => el.addEventListener("click", clickIteration));