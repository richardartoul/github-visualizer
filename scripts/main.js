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
				var color = d3.scale.category20c(); 
				searchResults = data.items;
				var JSONResults = convertResultsToJSON(data);

				var width = $(window).width(), height = $(window).height() * 0.9;
				var pack = d3.layout.pack()
					.size([width,height])
					.value(function (d) {
						return d.stargazers_count;
						// return Math.max(5, d.stargazers_count/100);
					})
					.sort(function(a,b) {
						return Math.random() > 0.5 ? true : false;
					})
					.padding(100)
				var packCalculations = pack.nodes(JSONResults);
				var svg = d3.select("body").append("svg")
					.attr("width", width)
					.attr("height", height);
				var bubbles = svg.selectAll("g")
					.data(packCalculations[0].children)
					.enter()
					.append("g")

				bubbles.append("circle")
					.attr("r", function(d) {
						// return d.stargazers_count/100 > 300 ? 100 : d.stargazers_count/100
						return d.r;
					})
					.style("fill", "blue")
					.attr("transform", function(d,i) {
						return "translate(" + d.x + "," + d.y + ")"
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
					})
					.on('mouseout', function(d) {
						div.transition()
							.duration(500)
							.style("opacity", 0)
					})
					.on("click", function(d) {
						window.open(d.html_url, '_blank');
					})
			}
		});
    });
 });