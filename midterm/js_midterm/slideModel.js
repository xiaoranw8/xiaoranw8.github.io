 // load the base map
 var map = L.map('map', {
   center: [40.000, -75.1090],
   zoom: 11
 });


 var Stamen_TonerBackground = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}', {
 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
 	subdomains: 'abcd',
 	minZoom: 0,
 	maxZoom: 16,
 	ext: 'png'
}).addTo(map);

 // load grocery store and farmers market and neighborhood
 var mkt = "https://raw.githubusercontent.com/xiaoranw8/musa-611-midterm/master/mkt_clean.geojson";
 var hoods = "https://raw.githubusercontent.com/xiaoranw8/musa-611-midterm/master/hoods_clean.geojson";
 var boundary = "https://raw.githubusercontent.com/xiaoranw8/musa-611-midterm/master/City_Limits.geojson";

// BOUNDARY
// set style for border
var exteriorStyle = {
  color: 'black',
  fillOpacity: 0
};

// predefine geojson for boundary
var boundaryData = L.geoJson(null, {
  style: exteriorStyle,
  interactive: false
});
$.getJSON(boundary, function(data) {
  boundaryData.addData(data);
}); // add data from ajax to the pre-defined geojson layer
map.addLayer(boundaryData); // keep the boundary data

var clickZoom = function(e) {
    map.setView(e.target.getLatLng(), 14);
};

// add popup and zoom when click
var setPopup = function(feature, layer){
  layer.bindPopup(feature.properties.name).on('click', clickZoom);
};

// as a replacement for polygons
var setPolyPopup = function(feature, layer){
  layer.bindPopup(feature.properties.mapname);
};


// POLYGONS
var polyStyle = function(feature) {
  if (feature.properties.count == 0 ) {
    return {fillColor: '#ffffaa', fillOpacity: 0.4, weight: 1, color: 'white'};
  } else if (feature.properties.count == 1) {
    return {fillColor: '#a2ccc2', fillOpacity: 0.4, weight: 1, color: 'white'};
  } else if (feature.properties.count == 2) {
    return {fillColor: '#6f93b2', fillOpacity: 0.4, weight: 1, color: 'white'};
  } else if (feature.properties.count == 3 ) {
    return {fillColor: '#425d9b', fillOpacity: 0.4, weight: 1, color: 'white'};
  } else if (feature.properties.count > 3) {
    return {fillColor: '#002a7f', fillOpacity: 0.4, weight: 1, color: 'white'};
  } else {
    return {weight: 3, color: 'white'};
  }
};

var showResults = function() {
  $('#results').show(thename);
};

// TO BE REVISED
// var thename;
// var eachFeatureFunction = function(feature, layer) {
//   layer.on('click', function (event) {
//     thename = "The neighborhood is " + layer.feature.properties.mapname + ", and the total grocery location in " + layer.feature.properties.count;
//     $(".results").text(thename);
//     showResults();
//   });
// };

var hoodData = L.geoJson(null, {
  style: polyStyle,
  onEachFeature: setPolyPopup
//  onEachFeature: eachFeatureFunction
});

$.getJSON(hoods, function(data) {
  hoodData.addData(data);
});


//MARKERS
// make markers for all market location
var makeMarker = function(feature){
  return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
    fillColor: '#CECECE',
    color: '#CECECE',
    radius: 5,
    weight: 1.5,
    fillOpacity: 0.3
  });
};

// define different style for supermarket and farms market
var myfillcolor;
var mycolor;
var markerStyle = function(feature){
  if (feature.properties.type == "Supermarket"){
    myfillcolor = '#295659';
    mycolor = '#295659';
    } else {
      myfillcolor = '#980B00';
      mycolor = '#980B00';
    }
    return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      fillColor: myfillcolor,
      color: mycolor,
      radius: 5,
      weight: 1.5,
      fillOpacity: 0.3
    });
};

// FILTERS
// filter to supermarket
var supermktFilter = function(feature) {
  if (feature.properties.type == 'Supermarket' ){
    return true;
  }
};

// filter to farmers market
var farmersmktFilter = function(feature) {
  if (feature.properties.type == 'Farmers market' ){
    return true;
  }
};

// POINTS
// predefine geojson for all market
var mktData = L.geoJson(null, {
  pointToLayer: makeMarker,
  onEachFeature: setPopup,
});
var baseData = L.geoJson(null, {
  pointToLayer: makeMarker,
  onEachFeature: setPopup
});

$.getJSON(mkt, function(data) {
  baseData.addData(data);
  mktData.addData(data);
});
map.addLayer(mktData);


// predefine supermarket
var onlySPM = L.geoJson(null, {
  filter: supermktFilter,
  pointToLayer: markerStyle,
  onEachFeature: setPopup
});
$.getJSON(mkt, function(data) {
  onlySPM.addData(data);
});

// predefine farmers market
var onlyFM = L.geoJson(null, {
  filter: farmersmktFilter,
  pointToLayer: markerStyle,
  onEachFeature: setPopup
});
$.getJSON(mkt, function(data) {
  onlyFM.addData(data);
});

// MARKER CLUSTERS
var clusters = L.markerClusterGroup();
$.getJSON(mkt, function(data){
  var mktData = L.geoJson(data);
  clusters.addLayer(mktData);
//  map.addLayer(clusters);
});

// layer-related function for slide
var loadLayer = function(myLayer){
  map.addLayer(myLayer);
};
var removeLayer = function(myLayer){
  map.removeLayer(myLayer);
};


// create slide model
var slide1 = {
  slideNumber: 1,
  title: "Philly Grocery Landscape",
  description: "This application shows the grocery locations in Philadelphia with a primary target to explore the grocery distribution across the city. It would be an auxiliary tool to measure food accessibility or site selection for the new grocery business. The map includes both supermarkets and farmers' markets. Later slides will show the pattern at different spatial scales.",
  extraDescription:"To get more information about exact locations, click on the markers on the map.",
  content: baseData,
  basepoint: baseData,
  results: null
};

var slide2 = {
  slideNumber: 2,
  title: "Where are the supermarkets",
  description: "The locations of supermarket are highlighted. ",
  extraDescription:"Clicking for detailed location. ",
  content: onlySPM,
  basepoint: baseData,
  results: null
};

var slide3 = {
  slideNumber: 3,
  title: "Where are the farmers' markets",
  description: "The locations of farmers' markets are highlighted. ",
  extraDescription:"Clicking for specific location. ",
  content: onlyFM,
  basepoint: baseData,
  results: null
};

var slide4 = {
  slideNumber: 4,
  title: "Grocery in clusters",
  description: "Summarizing the grocery locations in clusters. One can observe an overall number of grocery at different zoom scales. The amount locations in each cluster depend on the zoom level.",
  extraDescription:"Clicking the clusters to view the specific grocery locations in this cluster.",
  content: clusters,
  basepoint: baseData,
  results: null
};


var slide5 = {
  slideNumber: 5,
  title: "Grocery in Neighborhood",
  description: "The choropleth map indicates the number of grocery locations in the unit of a neighborhood, and it directly reflects the unbalanced distribution. ",
  extraDescription:"One can observe that many neighborhoods do not have at least one grocery location, but in Center City, multiple neighborhoods have more than three grocery locations.",
  content: hoodData,
  basepoint: baseData,
  results: null
};


/** Here's the simplest implementation I could come up with for
 * representing a deck of slides (nothing exotic is necessary!)
 */
var slides = [slide1, slide2, slide3, slide4, slide5];

var mapContent;
var tempContent;
var currentSlide = 0;

var loadSlide = function(slide) {
  $('#intro').text(slide.title);
  $('#description').text(slide.description);
  $('#extraDescription').text(slide.extraDescription);
//  $('#results').text(slide.results);
  mapContent = loadLayer(slide.content);
  tempContent = loadLayer(slide.basepoint);

  if (currentSlide == 4){
    $('.legend').show();
  } else{
    $('.legend').hide();
  }


  // load or hide buttons
  if (currentSlide == 0) {
    $('#backButton').hide();
    $('#nextButton').show();
  } else if (currentSlide != 0 && currentSlide != slides.length - 1){
    $('#backButton').show();
    $('#nextButton').show();
  } else if (currentSlide != slides.length - 1){
    $('#backButton').show();
  }
};

// define next button
var next = function() {
  removeLayer(slides[currentSlide].content);

  if (currentSlide == slides.length - 1) {
  } else {
    $('#nextButton').show();
    currentSlide = currentSlide + 1; // slide +1 to next slide
    loadSlide(slides[currentSlide]);
  }
  if (currentSlide == slides.length - 1) {
    $('#nextButton').hide();
  }
};

$('#nextButton').click(function(e) {
  next();
});


// defien back button
var back = function() {
  removeLayer(slides[currentSlide].content);
  if (currentSlide == 0) {
    $('#backButton').hide();
  }

  if (currentSlide == 0) {
    $('#backButton').hide();
  } else {
    $('#backButton').show();
    currentSlide = currentSlide - 1;
    loadSlide(slides[currentSlide]);
  }
};

$('#backButton').click(function(e) {
  back();
});
