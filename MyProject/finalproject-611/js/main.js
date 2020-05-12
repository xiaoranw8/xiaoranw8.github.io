// add Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoieHJ3IiwiYSI6ImNrOWZ2NDJoYzA5cTczZXBueHdmMWFqeWoifQ.xDiLhWviR4rm1ryO_6frlw";

var map = new mapboxgl.Map({
  container: 'map', // Specify the container ID
  style: 'mapbox://styles/mapbox/light-v10', // Specify which map style to use
  center: [-75.242229, 40.001036], // Specify the starting position
  zoom: 10.2, // Specify the starting zoom
//  maxZoom: 11 // set max zoom level to ensure mapFlyTo always works
});

// load data
var mkt = "https://raw.githubusercontent.com/xiaoranw8/musa-611-midterm/master/mkt_new.geojson";
var hoods = "https://raw.githubusercontent.com/xiaoranw8/musa-611-midterm/master/hoods_clean.geojson";
var boundary = "https://raw.githubusercontent.com/xiaoranw8/musa-611-midterm/master/City_Limits.geojson";

// show introduction before everything
$("#introModal").modal('show');



// read market location from url and save as variable
// var marketData;
// $.ajax(mkt).done(function(data) {
//   marketData = JSON.parse(data);
// });
// $.getJSON(mkt, function(data) {
//   marketData = data;
// });


// Create variables for iso
var urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
var lon; // to be determined by clicking
var lat; // to be determined by clicking
var profile = "driving"; // set the default mode and minutes
var minutes = 10;
var theMarker; // to be added and calculated when clicking
var area;

// use bootstrap button to choose the mode and duration for iso
$('#modes').on('change', function(e){
  profile = e.target.value;
});
$('#duration').on('change', function(e){
  minutes = e.target.value;
});


// find users location
var geolocate = new mapboxgl.GeolocateControl();
$('#geolocate').on('click', function(){
  map.addControl(geolocate);

  geolocate.on('geolocate', function(e) {
        var lon = e.coords.longitude;
        var lat = e.coords.latitude;
        var myCoor = [e.coords.longitude, e.coords.latitude]; // save location as new variable
  });
});



$(document).ready(function() {
  map.on('load', function(){

    // add philly boundary
    map.addSource('limits', {
      type: 'geojson',
      data: boundary
    });
    map.addLayer({
      'id': 'limits',
      'type': 'line',
      'source': 'limits',
      'layout': {},
      'paint': {
        'line-width': 2,
        'line-color': "#540000"
      }
    });

    // add neighborhood
    map.addSource('hood', {
      type: 'geojson',
      data: hoods
    });
    map.addLayer({
      'id': 'hood',
      'type': 'fill',
      'source': 'hood',
      'layout': {}, //"visibility":"none"
      'paint': {
        'fill-color': 'rgba(200, 100, 240, 0)',
        'fill-outline-color': 'rgba(0, 25, 146, 0)'
      }
    });

    // toggle button to change visibility
    $("#nLayer").on('change', function(){
      if($(this).prop("checked") == true){
        map.setPaintProperty('hood', 'fill-outline-color', 'rgba(78, 102, 109, 1)');
      } else {
        map.setPaintProperty('hood', 'fill-outline-color', 'rgba(0, 25, 146, 0)');
      }
    });


    // add market locations
    map.addSource('location', {
      type: 'geojson',
      data: mkt
    });
    map.addLayer({
      'id': 'location',
      'type': 'circle',
      'source': 'location',
      'layout': {},
      'paint': {
        'circle-radius': 5,
        // color circles by grocery type
        'circle-color': ['match', ['get', 'type'], 'Supermarket', '#4FA0D3', 'Farmers market', '#ffb14e', /* other */ '#030204'],
        'circle-opacity': 1
      }
    });


    // make it clickable: trigger table and generate iso
    map.on('click', 'location', function(e) {
      // get the selected location's coordinates and info
      var coordinates = e.features[0].geometry.coordinates.slice();
      $('#message').hide();
      $('#detail').show(); // show the table
      $('#groname').text(e.features[0].properties.name);
      $('#address').text(e.features[0].properties.address);
      $('#neighborhood').text(e.features[0].properties.mapname);
      $('#hour').text(e.features[0].properties.time);
      $('#mon').text(e.features[0].properties.month);

      // set lon and lat for iso
      lon = coordinates[0];
      lat = coordinates[1];
      // set up iso API and make ajax call
      var query = urlBase + profile + '/' + lon + ',' + lat + '?contours_minutes=' + minutes + '&polygons=true&access_token=' + mapboxgl.accessToken;
      $.ajax({
        method: 'GET',
        url: query
      }).done(function(data) {
        var data_polygon = data.features[0]; // save the iso data as polygon
        var city_boundary = map.querySourceFeatures('limits', {sourceLayer: 'limits'})[3]; // get the limit GeoJSON
        var city_polygon = turf.polygon(city_boundary.geometry.coordinates); // extract the polygon coordinates from GeoJSON
         console.log(map.querySourceFeatures('limits'));

        var city_buffer = turf.buffer(city_polygon, 0.0001).features[0];  // buffer to aviod topo error
        var data_buffer = turf.buffer(data_polygon, 0.0001).features[0];
        var intersecton = turf.intersect(city_buffer, data_buffer);
        console.log(intersecton);

        map.getSource('iso').setData(intersecton);
        // map.getSource('iso').setData(data);

        // calculate iso area, convert sq meter to sq mi
        area = (turf.area(intersecton)/2.59e+6).toFixed(2);
        $('#area').text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Access area is ' + area + ' square mile' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0');
      });

/***

Possible Reason for "Error message: "Input data given to 'iso' is not a valid GeoJSON object.""

'map.querySourceFeatures('limits')' has below possible outcomes
1. 4 arrays  -----> use array[2]
  Array0, 1, and 3 can only cover part of the city.
  Array[2] is the only one that has the highest possibility to get the polygon that covers the whole city,
  Using [2] to make the result more stable.

2. 5 arrays  -----> use array[3]
  Array0, 1, 2 and 4 can only cover part of the city.
  Array[3] is the only one that has the highest possibility to get the polygon that covers the whole city,
  Using [3] to make the result more stable.

3. 7 arrays  -----> only see this outcome twice.

The fact I found on 5/10/2020: If keep the console open while run the app, you are more likely get the outcome #1;
if does not open console window, you are more likely to get the outcome #2,
so I use array[3] in the current code.


Type "map.querySourceFeatures('limits');" in console to view the possible outcomes.

Change the index for the city_boundary, then use "map.getSource('iso').setData(city_polygon);"" to see the current city_polygon.
When the city_boundary is using other arrays, one may find the city_polygon only cover a haft part of the city.
Keep querying "map.querySourceFeatures('limits');" to track the current number of arrays.

***/

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // add marker for each new cilcking
      if (theMarker != undefined) {
        //console.log(theMarker);
        theMarker.setLngLat(coordinates);
      } else {
        theMarker = new mapboxgl.Marker({
          'color': '#D6D396'
        }).setLngLat(coordinates).addTo(map);
      }
    });

    // When the map loads, add the iso source and layer
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
        'fill-color': '#4194AD',
        'fill-opacity': 0.6
      }
    }, "poi-label");

    // add mouseover for the point layer
    map.on('mouseenter', 'location', function() {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'location', function() {
      map.getCanvas().style.cursor = '';
    });

    //select neighborhood from dropdown
    $('#nhselection').on('change', function(){
      //var selected = $("#nhselection option:selected").text();
      var v = document.getElementById("nhselection");
      var selected = v.options[v.selectedIndex].value;

      var neighborhoods = map.querySourceFeatures('hood'); // query the neighborhood polygon
      //console.log(neighborhoods);

      // function to filter to selected neighborhood
      var selected_neighborhoods = _.filter(neighborhoods, function(n){
        return n.properties.name == selected;
      });

      var selected_neighborhood = selected_neighborhoods[0]; // select the target neighborhood

      var neighborhood_coor = selected_neighborhood.geometry.coordinates; // get the coordinates of the selected neighborhood
      var centroid = turf.centroid(turf.polygon(neighborhood_coor)).geometry.coordinates; // get the centroid of selected neighborhood
      // fly to the selected neighborhood
      map.flyTo({
        center: centroid,
        zoom: 11.8,
        essential: true});
    });

// end mark
  });
});
