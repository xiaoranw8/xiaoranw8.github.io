// add Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoieHJ3IiwiYSI6ImNrOWZ2NDJoYzA5cTczZXBueHdmMWFqeWoifQ.xDiLhWviR4rm1ryO_6frlw";

var map = new mapboxgl.Map({
  container: 'map', // Specify the container ID
  style: 'mapbox://styles/mapbox/streets-v11', // Specify which map style to use
  center: [-75.1090,40.000], // Specify the starting position
  zoom: 11.5, // Specify the starting zoom
});


var urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
var lon = -75.183;
var lat = 39.9534;
var profile = 'cycling';
var minutes = 10;

// Create a function that sets up the Isochrone API query then makes an Ajax call
function getIso() {
  var query = urlBase + profile + '/' + lon + ',' + lat + '?contours_minutes=' + minutes + '&polygons=true&access_token=' + mapboxgl.accessToken;

  $.ajax({
    method: 'GET',
    url: query
  }).done(function(data) {
    //console.log(data);
    map.getSource('iso').setData(data)
  });
};

// Call the getIso function
// You will remove this later - it's just here so you can see the console.log results in this step
//getIso();

map.on('load', function() {
 // When the map loads, add the source and layer
 map.addSource('iso', {
   type: 'geojson',
   data: {
     'type': 'FeatureCollection',
     'features': []
   }
 });

 map.addLayer({
   'id': 'isoLayer',
   'type': 'fill',
   // Use "iso" as the data source for this layer
   'source': 'iso',
   'layout': {},
   'paint': {
     // The fill color for the layer is set to a light purple
     'fill-color': '#5a3fc0',
     'fill-opacity': 0.3
   }
 }, "poi-label");

 // Make the API call
 getIso();
});


// Target the "params" form in the HTML portion of your code
var params = document.getElementById('params');

// When a user changes the value of profile or duration by clicking a button, change the parameter's value and make the API query again
params.addEventListener('change', function(e) {
  if (e.target.name === 'profile') {
    profile = e.target.value;
    getIso();
  } else if (e.target.name === 'duration') {
    minutes = e.target.value;
    getIso();
  }
});

var marker = new mapboxgl.Marker({
 'color': '#314ccd'
});

// Create a LngLat object to use in the marker initialization
// https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
var lngLat = {
 lon: lon,
 lat: lat
};

marker.setLngLat(lngLat).addTo(map);
