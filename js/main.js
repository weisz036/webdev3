//an example Leaflet map
var map = L.map("map", {
    center: [46.79, -92.084],
    zoom: 13
});

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// function callback() {
//   var locations = JSON.parse(this.responseText);
//   console.log(locations);
//   var locationsLayer = L.geoJSON(locations)
//   	.bindPopup(function (layer){
// 	    return layer.feature.properties.name;
// 	})
//   	.addTo(map);
// };

// var request = new XMLHttpRequest();
// request.addEventListener("load", callback);
// request.open("GET", "data/locations.geojson");
// request.send();

var request1 = new Promise(function(resolve, reject){
	var request = new XMLHttpRequest();
	request.addEventListener("load", function(){ resolve(this.responseText) });
	request.open("GET", "data/locations.geojson");
	request.send();
});

var request2 = new Promise(function(resolve, reject){
	var request = new XMLHttpRequest();
	request.addEventListener("load", function(){ resolve(this.responseText) });
	request.open("GET", "data/duluth_precincts_WGS84.geojson");
	request.send();
});

Promise.all([request1, request2]).then(function(values){
	//parse the two incoming datasets into JSON format
	var locations = JSON.parse(values[0]);
	var precincts = JSON.parse(values[1]);
	console.log(locations, precincts)

	//create a marker layer for locations
	var locationsLayer = L.geoJSON(locations)
		.bindPopup(function (layer){
		    return layer.feature.properties.name;
		})
	  	.addTo(map);

	//create a polygon layer for precincts
	var precinctsLayer = L.geoJSON(precincts, {
		    style: function (feature) {
		    	var demVote = feature.properties.USPRSDFL;
		    	var repVote = feature.properties.USPRSR;
		    	var totalVote = feature.properties.USPRSTOTAL;

		    	var pointLead = Math.round(demVote/totalVote*100) - Math.round(repVote/totalVote*100);

		    	//assign colors from the ColorBrewer RdBu scale
		    	var color;
		    	if (pointLead < -20){
		    		color = "#b2182b";
		    	} else if (pointLead < -10){
		    		color = "#d6604d";
		    	} else if (pointLead < -5){
		    		color = "#f4a582";
		    	} else if (pointLead < -1){
		    		color = "#fddbc7";
		    	} else if (pointLead <= 1){
		    		color = "#f7f7f7";
		    	} else if (pointLead <= 5){
		    		color = "#d1e5f0";
		    	} else if (pointLead <= 10){
		    		color = "#92c5de";
		    	} else if (pointLead <= 20){
		    		color = "#4393c3";
		    	} else {
		    		color = "#2166ac";
		    	};
		        return {
		        	color: color,
		        	fillColor: color,
		        	fillOpacity: 0.9
		        };
		    }
		})
		.bindPopup(function (layer){
			var demVote = layer.feature.properties.USPRSDFL;
		    var repVote = layer.feature.properties.USPRSR;
		    var totalVote = layer.feature.properties.USPRSTOTAL;
		    var pctName = layer.feature.properties.PCTNAME;

		    var html = "<h4>Precinct: "+pctName+"</h4>"+
		    	"<table><tr><td>Democratic votes: </td><td>"+demVote+"</td></tr>"+
		    	"<tr><td>Republican votes: </td><td>"+repVote+"</td></tr>"+
		    	"<tr><td>Third party votes: </td><td>"+(totalVote-demVote-repVote)+"</td></tr></table>";

		    return html;
		})
	  	.addTo(map);
});