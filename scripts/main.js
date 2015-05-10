var convertResultsToJSON = function(data) {
	var resultsJSONString = "{ \n \"search\": \"" + searchText + "\", \n \"children\":"
	resultsJSONString += JSON.stringify(data);
	resultsJSONString += "}";
	return JSON.parse(resultsJSONString);
}

var visualizeResultsFactory = function() {
	var searchCount = 0;
	var previousResults = [];
	//array of colors for each result
	var colors = d3.scale.category10().range();

	var width = $(window).width(), height = $(window).height() * 0.9;
	var svg = d3.select("body").append("svg")
			.attr("width", width)
			.attr("height", height);

	return function(data) {
		//draws circles from ajax response data
		searchResults = data.items;
		for (var i = 0; i < searchResults.length; i++) {
			searchResults[i].searchCount = searchCount;
		}
		console.log("previous result looks like", previousResults);
		for (var i = 0; i < previousResults.length; i++) {
			searchResults = searchResults.concat(previousResults[i]);
			console.log("search results after concat looks like",searchResults);
		}
		var JSONResults = convertResultsToJSON(searchResults);

		previousResults.push(data.items);

		// var width = $(window).width(), height = $(window).height() * 0.9;

		var pack = d3.layout.pack()
			.size([width,height])
			.value(function (d) {
				return d.stargazers_count;
			})
			.sort(function(a,b) {
				//randomly sorts circles
				return Math.random() > 0.5 ? true : false;
			})
			.padding(100)

		var packCalculations = pack.nodes(JSONResults);
		console.log("packs", packCalculations);
		packCalculations.shift();
		console.log("pack after unshift", packCalculations);

		// var svg = d3.select("body").append("svg")
		// 	.attr("width", width)
		// 	.attr("height", height);

		//remove old bubbles
		svg.selectAll("g")
			.remove();

		var bubbles = svg.selectAll("g")
			.data(packCalculations)
			.enter()
			.append("g");

		bubbles.append("circle")
			.attr("r", function(d) {
				return d.r;
			})
			.attr("transform", function(d,i) {
				return "translate(" + d.x + "," + d.y + ")"
			})
			.style("fill", function(d) {
				return colors[d.searchCount];
			});

		var div = d3.select("body").append("div")   
		    .attr("class", "tooltip")               
		    .style("opacity", 0);

		bubbles
			.on('mouseover', function(d) {
				div.transition()
					.duration(200)
					.style("opacity", 0.9)
				div.html("<b>" + d.name + "</b>" + "<br>" + d.description)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px")
				d3.select(this).selectAll("circle").transition()
					.duration(100)
					.attr("r", d.r*1.2)
			})
			.on('mouseout', function(d) {
				div.transition()
					.duration(500)
					.style("opacity", 0)
				d3.select(this).selectAll("circle").transition()
					.duration(100)
					.attr("r", d.r)
			})
			.on("click", function(d) {
				window.open(d.html_url, '_blank');
			})
		//update closure data
		searchCount++;
		};
}

var visualizeResults = visualizeResultsFactory();

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
				visualizeResults(data);
			}
		});
    });
 });