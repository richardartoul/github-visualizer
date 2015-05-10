var bubbleChart = new BubbleChart();

//gets repository results from github api when user searches
$(document).ready(function () {
	$('#searchBox').bind('submit',function(event) {
  		event.preventDefault();
  		//retrieves search terms from the input box of the form
  		var searchText = $("#searchText").val();
  		$.ajax({
			url: "https://api.github.com/search/repositories",
			data: {
				//what the user typed in the search box
				q:searchText,
				//sort repositories by number of stars
				sort: "stars",
				order: "desc",
				//number of repositories per query
				per_page: 100
			},
			dataType: "json",
			/*the bubblechart object handles all the data visualization on
			completion of the search */
			success: function(data) {
				bubbleChart.newData(searchText,data);
				bubbleChart.render();
			}
		});
    });
    //bubbleChart will re-render if window changes size
    $(window).resize(function() {
    	bubbleChart.render();
    })
 });