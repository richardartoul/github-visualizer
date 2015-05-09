// var convertResultsToJSON = function(data) {
// 	console.log(data.items);
// 	var resultsJSONString = "{ \n \"search\": \"" + searchText + "\", \n \"children\": [";
// 	for (var i = 0; i < data.items; i++) {
// 		var repo = data.items[i];
// 		console.log(repo);
// 		resultsJSONString += "{\n \"name\": \"" + repo.name + "\", \n \"stars\": "
// 			+ repo["stargazers count"] + " \n }"
// 	} 
// 	resultsJSONString += "]}";
// 	console.log(resultsJSONString);
// 	return JSON.parse(resultsJSONString);
// }

var convertResultsToJSON = function(data) {
	// console.log(data.items);
	var resultsJSONString = "{ \n \"search\": \"" + searchText + "\", \n \"children\":"
	resultsJSONString += JSON.stringify(data.items);
	resultsJSONString += "}";
	// console.log(resultsJSONString);
	return JSON.parse(resultsJSONString);
}

//gets repository results from github api when user searches
$(document).ready(function () {
	$('#searchBox').bind('submit',function(event) {
  		event.preventDefault();
  		var searchText = $("#searchText").val();
  		// console.log(searchText);
  		$.ajax({
			url: "https://api.github.com/search/repositories",
			data: {
				q:searchText,
				sort: "stars",
				order: "desc",
				per_page: 100
			},
			dataType: "json",
			success: function(data) {
				//draws circles from ajax response data
				searchResults = data.items;
				// var JSONResults = JSON.stringify(data.items);
				var JSONResults = convertResultsToJSON(data);
				// console.log(convertResultsToJSON(data));
				// console.log(JSONResults);

				var width = 1600, height = 800;
				var pack = d3.layout.pack()
					.size([width,height])
					.value(function (d) {
						return d.stargazers_count/100;
					})
				var packCalculations = pack.nodes(JSONResults);
				// console.log(packCalculations);
				// packCalculations = pack.nodes(JSON.parse(JSONResults));
				console.dir(packCalculations);
				// console.dir(packCalculations);
				// console.log(convertResultsToJSON(data));
				// console.dir(searchResults);
				var svg = d3.select("body").append("svg")
					.attr("width", width)
					.attr("height", height);
				var bubbles = svg.selectAll("g")
					.data(packCalculations[0].children)
					.enter()
					.append("g")
					// .attr("transform", function(d,i) {
					// 	var x = 0;
					// 	for (var count = 0; count<i; count++) {
					// 		x += d.stargazers_count;
					// 	}
					// 	return "translate(" + x/100 + "," + height/7 + ")"
					// });
				bubbles.append("circle")
					.attr("r", function(d) {
						return d.stargazers_count/100
					})
					.style("fill", "blue")
					.attr("transform", function(d,i) {
						return "translate(" + d.x + "," + d.y + ")"
					});
			}
		});
    });
 });