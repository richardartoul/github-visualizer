//BubbleChart object will handle all data visualization
var BubbleChart = function() {
	
	//sets the number of bubbles to display
	this.numBubbles = 20;
	
	//keeps track of number of searches that have been performed
	this.searchCount = 0;
	
	//keeps track of previous search terms to be used as labels for the legend
	this.previousSearchTerms = []
	
	//stores data retrieved from previous searches
	this.previousResults = [];

	//throttles time between rerenderings on window resize
	this.throttleTime = 500; //milliseconds

	//Returns an array of colors that will be used to distinguish search results from each other
	this.colors = d3.scale.category10().range();

	//Creates the SVG element which will hold all the circles. Included here
	//because only one SVG element is required per BubbleChart
	this.svg = d3.select("body").append("svg")
		.attr("width", this.width())
		.attr("height", this.height())

	/*creates the div element that will be used to display tooltips. The same
	div is used for each bubble, so it only needs to be generated once*/
	this.div = d3.select("body").append("div")   
	    .attr("id", "tooltip")               
	    .style("opacity", 0);

	//various visual settings that can be tweaked
	this.padding = 20;

	this.throttled = _.throttle(this.render, this.throttleTime);
    console.log(JSON.stringify(this.throttled));
    console.log(JSON.stringify(_.throttle));
}	

//width and height helper functions retrieve current viewport size
BubbleChart.prototype.width = function() {
	return $(window).width()
}

BubbleChart.prototype.height = function() {
	return $(window).height() * 0.9;
}

//d3 pack layout will only accept data in the form of a nested JSON file
//even if the data you want to work with is a flat array (as in this example)
//it must be converted to a JSON object first. The pack layout specifically
//requires that data points be stored as an array in a property called "children"
BubbleChart.prototype.convertResultsToJSON = function(data) {
	var resultsJSONString = "{ \n \"search\": \"" + searchText + "\", \n \"children\":"
	resultsJSONString += JSON.stringify(data);
	resultsJSONString += "}";
	return JSON.parse(resultsJSONString);
}

//stores new search results obtained from Ajax queries to the GitHub api
//also appends a property called "searchCount" to each item in a specific
//query which is later used to assign datapoints a color based on which
//search they are from in the "render" function
BubbleChart.prototype.newData = function(searchTerm,data) {
	searchResults = data.items;
	for (var i = 0; i < searchResults.length; i++) {
		searchResults[i].searchCount = this.searchCount;
	}
	this.previousResults.push(searchResults);
	this.previousSearchTerms.push(searchTerm);
	this.searchCount++;	
}

BubbleChart.prototype.clearData = function() {
	this.searchCount = 0;
	this.previousResults = [];
	this.previousSearchTerms = [];
	this.render();
}

BubbleChart.prototype.setNumBubbles = function(number) {
	if (number > 100) {
		this.numBubbles = 100;
	}
	else if (number < 0) {
		this.numBubbles = 5;
	}
	else {
		this.numBubbles = number;
	}
}

//checks if a search has been performed before
BubbleChart.prototype.searchedBefore = function(searchTerm) {
	for (var i = 0; i < this.previousSearchTerms.length; i++) {
		if (this.previousSearchTerms[i] === searchTerm) {
			return true;
		}
	}
	return false;
}

//Renders the bubble chart
BubbleChart.prototype.render = function() {
	console.log(this);
	console.log(arguments);
	this.lastRender = Date.now();
	var x = $(window).width();
	var y = $(window).height();
	//resizes the svg element incase the window size has changed
	this.svg
		.attr("width", x)
		.attr("height", y*0.95)

	var searchResults = [];
	var colors = this.colors;

	//concatenates all previous searches together into one long array
	for (var i = 0; i < this.previousResults.length; i++) {
		//limits the number of bubbles per search to the user defined amount
		var subsetPreviousResults = this.previousResults[i].slice(0,this.numBubbles)
		searchResults = searchResults.concat(subsetPreviousResults);
	}

	//converst the long array to a JSON format that d3 layout pack can interpret
	var JSONResults = this.convertResultsToJSON(searchResults);

	/*Configure the settings for the d3 pack layout. D3 pack layouts are functions that
	take a dataset and return positioning values so that those items can be rendered
	in space. In this case, the layout will return three properties for each data item:
	An "x" position, a "y" position, and a radius such that none of the circles will overlap*/
	var pack = d3.layout.pack()
		//The canvas size in which circles can be placed
		.size([this.width(),this.height()])
		/*a function that specifies how the radius of the circles should be determined.
		in this case, the function returns the stargazers_count property of each item,
		so repositories with more stars will have a larger radius */
		.value(function (d) {
			return d.stargazers_count;
		})
		//The return value of this function is random, this will make is so that the circles
		// are displayed in a random order, as opposed to a spiral of decreasing size
		.sort(function(a,b) {
			//randomly sorts circles
			return Math.random() > 0.5 ? true : false;
		})
		//sets the amount of padding between circles
		.padding(this.padding)

	/*calls the layout function and returns an array of all the results, with "x", "y", and "r"
	properties added*/
	var packCalculations = pack.nodes(JSONResults);

	//first element in returned array contains a nested array that is not needed
	packCalculations.shift();

	//load new data into dom elements
	var allBubbles = this.svg.selectAll(".chartBubble").data(packCalculations, function(d) {
		return d.id;
	});

	//create new circles for new data
	var newBubbles = allBubbles.enter().append("circle")
		.attr("class", "chartBubble")

	//update all circle sizes and locations
	allBubbles.transition().duration(500)
		.attr("r", function(d) {
			return d.r;
		})
		.attr("transform", function(d,i) {
			return "translate(" + d.x + "," + d.y + ")"
		})
		.style("fill", function(d) {
			//All circles from the same search query will be of the same color
			return colors[d.searchCount];
		});

	/*removes bubbles if necessary (only occurs when reducing the number
	 of bubbles to display on the screen)*/
	allBubbles.exit().remove()

	/*This block of code handles all the mouseover events for the bubbles
	including rendering the tooltips.*/
	var div = this.div;
	allBubbles
		.on('mouseover', function(d) {
			//Causes the tooltip to appear, but remain slightly transparent
			div.transition()
				.duration(200)
				.style("opacity", 0.9)
			//Sets the text that the tooltip will display
			div.html("<b>" + d.name + "</b>" + "<br>" + d.description)
				/*positions the tooltip to the location of the mouse at the time
				the mouseover event occurred (d3.event) */
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px")
			//circles grow slightly larger when moused over
			d3.select(this).transition()
				.duration(100)
				.attr("r", d.r*1.2)
		})
		//undoes all the events that occur in the mouseover listener
		.on('mouseout', function(d) {
			div.transition()
				.duration(500)
				.style("opacity", 0)
			d3.select(this).transition()
				.duration(100)
				.attr("r", d.r)
		})
		//turns the circles into clickable links that lead to their respective repositories
		.on("click", function(d) {
			window.open(d.html_url, '_blank');
		})

	/*create an array of objects that contain two pieces of information
	for each label so that it can be rendered properly: the color of the
	bubbles it describes, as well as the search term of the query they
	represent*/
	var legendData = []
	for (var i = 0; i < this.searchCount; i++) {
		legendData.push(
		{
			color: colors[i],
			label: this.previousSearchTerms[i]
		})
	}
	/*bind this to a local variable so that the bubble charts properties
	can be referenced inside the functions below*/
	var that = this;

	//removes all old elements
	this.svg.selectAll(".legendBubble").remove();

	//creates a <g> tag to store each element of the legend
	var legend = this.svg.selectAll(".legendBubble").data(legendData)
		
	legend
		.enter()
			.append("g")
			.attr("class", "legendBubble")
			.attr("transform", function(d,i) {
				var height = 20;
				var offset = height * colors.length/2;
				var xPosition = that.width()*0.075;
				//ensures that g elements don't overlap and are vertically separated
				var yPosition = that.height()*0.05 + 50*i;
				return "translate(" + xPosition + "," + yPosition + ")";
			});

	/*generates the circle that represents each key in the legend
	and assigns the appropriate color*/
	legend.append("circle")
		.attr("r", 20)
		// .attr("height", 40)
		.style("fill", function(d,i) {
			return d.color;
		});

	legend.append("text")
		.attr("x", "25")
		.attr("y", "5")
		.html(function(d) {
			return d.label;
		});

	//removes old legends if necessary (when reset button is hit)
	legend.exit()
		.remove();
};
