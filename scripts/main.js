// var convertResultsToJSON = function(data) {
// 	var resultsJSONString = 
// 		"{ \n \"search\": \"" + searchText + "\", \n \"children\": [";
// 		for (var i = 0; i < data.items; i++) {
// 			resultsJSONString
// 		} 
// }

//gets repository results from github api when user searches
$(document).ready(function () {
	$('#searchBox').bind('submit',function(event) {
  		event.preventDefault();
  		var searchText = $("#searchText").val();
  		console.log(searchText);
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
				console.dir(searchResults);
				var width = 8000, height = 800;
				var svg = d3.select("body").append("svg")
					.attr("width", width)
					.attr("height", height);
				var bubbles = svg.selectAll("g")
					.data(searchResults)
					.enter()
					.append("g")
					.attr("transform", function(d,i) {
						var x = 0;
						for (var count = 0; count<i; count++) {
							x += d.stargazers_count;
						}
						return "translate(" + x/100 + "," + height/7 + ")"
					});
				bubbles.append("circle")
					.attr("r", function(d) {
						return d.stargazers_count/100
					})
					.style("fill", "blue");
			}
		});
    });
 });