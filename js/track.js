//--------------------------------------------------------------------------
//
//  Main Miso and d3 rendering demo
//
//--------------------------------------------------------------------------


var analysis = (function(){
/*global //console: true, $:true, Raphael:true, slider:true, videoView:true, box:true*/
	/*jslint newcap:true*/	
	
	// DATA
	var subselection
	, teams
	, positionData
	, sampleData = []
	, table = {}
	, ds_table
	, players
	, teamA
	, teamB

	// DIMENSIONS	
	, width = 840
	, height = 584
	, border = 20
	, pitchWidth = width - 2*border
	, pitchHeight = height - 2*border
	, maxHt
	, maxWd
	, matchDuration
	
	// DISPLAY
	, pitch
	, svg
	, color = d3.scale.category20()
	, previouslySelectedPlayer
	, gradient1
	, gradient2
	, slideControl
	, chartLayer
	
	// MAIN DATASET
	, ds = new Miso.Dataset({
	  url : '../data/passes.csv',
	  delimiter : ',',
	  columns : [
		  { name : 'Player name', 
		    type : 'string'
		 },
		  { name : 'x', 
		    type : 'number'
		 },
		  { name : 'y', 
		    type : 'number'
		  },
		  { name : 'min', 
		    type : 'number'
		  },
		  { name : 'sec', 
		    type : 'number'
		  }
		  
		],
	  ready : function() {
	    // do something specific to this dataset here when it's
	    // been fetched
		slideControl = new Dragdealer('timelineSlider',
			{
				
				callback: function(x, y)
				{
					//console.log("STOP Display positions at " + x * matchDuration /60);
					showData(x * matchDuration /60);
				},
				animationCallback: function(x, y)
				{
					////console.log("ANIMATE Display positions at " + x * matchDuration /60);
					displayTime(x * matchDuration );
				}
			});
			//console.log("READY");
			
			init();
	  }
	});
	
	
	ds.fetch({
		success : function() {
			
			ds.addComputedColumn("time", "number", function(row) {
			    return row.min*60 + row.sec;
			  });
			  
			  
			
			
			players = {}
			ds.each(function(row, index){
			
				var obj = {time: row.time, x:row.x, y:row.y };
				
				if ( players[row["Player name"]] == null ) {
					players[row["Player name"]] = [];
				}
				
				players[row["Player name"]].push(obj);
				
			});
			
			
			// create list of unique players
			matchDuration = Math.ceil(ds.max("time") / 60 ) * 60;
		

			drawPitch();
			
			calculatePositionData("Silva, David");
			
			showData(10);
			

	    
		},
	  
		error : function() {
			// do things here in case your data fetch fails.
		}
	});
	
	

	
	function displayTime(seconds) {
		
		if( isNaN(seconds) ) { seconds = 0};
		var secs
		, mins
		
		mins = Math.floor(seconds/60);
		if (mins <10) {
			mins = "0" + mins;
		}
		secs = Math.round(seconds%60);
		if (secs <10) {
			secs = "0" + secs;
		}
		////console.log(mins+":"+secs);
		
		
		
		d3.select("#displayTime")
	    .text( mins+":"+secs )
	}
	
	
	function calculatePositionData(key) {
		//var id =  Math.floor(Math.random()  * teamB.length);
		//var name = teamB.column("ID").data[id];
		//var label = "#x" + (id  + teamA.length);
		//var seekTime = Math.floor(time * 60)
		//console.log("showFormation at " + seekTime );
		
		positionData =[];
		//key = "Silva, David";
		
		//for (var key in players) {
			var length = players[key].length;
			
			for ( var i =0; i<length; i++ ) {
				var obj = {id :key, x:-10, y:-10 };
				//var t = players[key][i].time;
				
				//if ( t <= seekTime){
					//console.log("player " + key +": " + players[key][i].time + ": " + players[key][i].x + ", "+ players[key][i].y);
					obj.id = i;
					obj.x = players[key][i].x;
					obj.y = players[key][i].y;
					obj.time = players[key][i].time;
					
					//console.log("player " + key +": " + players[key][i].time + ": " + obj.x + ", "+ obj.y);
					//break;
					positionData.push(obj);
				//}
			}
			
		//}
		
		//showPositions();
	}
	



	
	
	function showData(time){
		//console.log("show data " + time);
		var length = positionData.length
		, seekTime = Math.floor(time * 60)
		, t
		, i
		, posn;
		
		sampleData = [];
		//console.log(positionData);
		for ( i=0; i<length; i++ ) {
			t = positionData[i].time;
			if ( t <= seekTime){
				//console.log(positionData[i]);
				obj = positionData[i]
				sampleData.push(obj);
			}
		}
		
		sampleData.reverse();
		
		if(sampleData.length>10){
			sampleData.length=10;
		}
		
		sampleData.reverse();
		
		displayTime( seekTime );
		posn = seekTime / matchDuration;
		slideControl.setValue(posn);
		showPositions();
	}
	
	
	
	function stepData(index){

		var length = sampleData.length
		, start
		, end
		, initId
		, posn
		, lastPosn
		, lastId = positionData.length-10;
		
		
		if(!sampleData[0]) {
			initId = 0;
		}else{
			initId = sampleData[0].id
		}
		
		
		if (index>0) {
			
			// STEP UP
			
			if(sampleData.length<10){
				start = 0;
				end = start + length + 1;
			}else{
				start = sampleData[0].id + 1;
				end = start + 10;
			}

			//check for end of list
			if (initId>lastId) {
				
				start = sampleData[0].id + 1;
				end = positionData.length;
				
				//check there is always a last entry
				if (start>=positionData.length) start = positionData.length-1;
			}
			
		}else{
			
			//STEP DOWN
			if(initId==0){
				length--;
				// check that there is always a first entry
				if (length<1) length = 1;
				sampleData.length = length;
			}
			
			if(sampleData.length<10){
				start = 0;
				end = start + length ;
			}else{
				start = sampleData[0].id - 1;
				end = start + 10;
			}
			
			//count down the display
			if (initId>lastId) {
				start = initId - 1;
				end = positionData.length;
			}
		}


		// extract sample data
		sampleData = positionData.slice( start, end );
		
		// determine time of last point
		lastPosn = sampleData[sampleData.length-1];
		//console.log(lastPosn);
		// update the display: slide control has scale 0 - 1
		posn =  (lastPosn.time / matchDuration);
		slideControl.setValue(posn);
		displayTime( lastPosn.time );
		
		showPositions();
	}


	
	
	function showPositions(){
	// create initial layout with each player assigned their own set of circles
	// these can then be changed by setting the css className
		//console.log( sampleData);
		var circle
		, xPosition = d3.scale.linear()
		, yPosition = d3.scale.linear();
		
		xPosition.domain([0,100 ]).range([border, pitchWidth]);
		yPosition.domain([0,100 ]).range([border, pitchHeight]);
    
    
		//Create SVG element
		svg = chartLayer;

		svg.selectAll("circle").remove();
		svg.selectAll("path").remove();
       

		svg.selectAll("circle")
 		  // .data(positionData, function(d){return d;})
 		   .data(sampleData, function(d){
 		   //	//console.log(d );
 		   	return d;
 		   	})
 		   .enter()
		   .append("svg:circle")
		
			.attr('class', function(d,i){
				//console.log(d  );
				 return "path circ_" + d[0];
			})
			
			.attr("cx", function(d) {
				return xPosition( d.x )+ 10;

			})
			.attr("cy", function(d) {
				return yPosition( d.y )+ 10;
			})
	
			//.attr("fill", "url(#gradient1)")
			.attr("fill", function(d, i) {
				//console.log(i);
				var fillStr = "rgba(" + 255 + ", "+ 255 +", "+ 255 +", " + ((i*0.09)+0.1) + ")"
				return fillStr;
			} )
			//.attr("fill", "#87BCE5")
			//.attr("visibility", "hidden" )
	
			//.attr("r", 45)
			.attr("r", 5)
			.style("stroke", "none")
			
			
			// create a line function that can convert data[] into x and y points
		var line = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d,i) { 
				//console.log( d);
				// verbose logging to show what's actually being done
				//console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
				// return the X coordinate where we want to plot this datapoint
				return xPosition( d.x )+ 10; 
			})
			.y(function(d) { 
				//console.log("y " + d.y);
				// verbose logging to show what's actually being done
				//console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
				// return the Y coordinate where we want to plot this datapoint
				return yPosition( d.y )+ 10; 
			});
			
			
			// Add the line by appending an svg:path element with the data line we created above
			// do this AFTER the axes above so that the line is above the tick-lines
  			svg.append("svg:path").attr("d", line(sampleData, function(d){return d;}));


	}
	

	
	
	
	function drawPitch() {
		
	    var pathinfo = [{x:border, y:border},
			{x:border, y:(height-border)},
			{x:(width - border), y:(height-border)},
			{x:(width - border), y:border},
			{x:border, y:border}]
						
		, halfway = border+width/2
		, halfHt = border + height/2
		, scaling = pitchWidth / 100
		, goalWidth = 8 * scaling
		, sixYard = 6 * scaling
		, eighteenYard = 17 * scaling
		, radius = 10 * scaling
		, penalty = 11 * scaling
		, spot = 0.2 * scaling;


		pitch = d3.select("div#chartTable")
				.append("svg:svg")
				.attr("width", width)
				.attr("height", height);
				
		
		var pitchMarkings = pitch.append("g");
		// green background
		pitchMarkings.append("svg:rect")
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "#181");
		
		//outline
		pitchMarkings.append("svg:rect")
				.attr("x", border)
				.attr("y", border)
				.attr("width", pitchWidth )
				.attr("height", pitchHeight)
				.attr("fill", "#181");


		// centre circle
		pitchMarkings.append("svg:circle")
				.attr("cx", halfway )
				.attr("cy", (halfHt-border) )
				.attr("r", radius)
				
		// centre line		
		pitchMarkings.append("svg:path")
			.attr("d","M " + (border+width/2) + " 20 L " + (border+width/2) + " " + (height-border) )
			
		//centre spot
		pitchMarkings.append("svg:circle")
				.attr("cx", halfway )
				.attr("cy", (halfHt-border) )
				.attr("r", spot)
				.attr("fill", "white")
				.style("opacity", 0.3);


		//lh goal area
		pitchMarkings.append("svg:circle")
		.attr("cx", border + penalty )
		.attr("cy", (halfHt-border) )
		.attr("r", radius)
		
		pitchMarkings.append("svg:rect")
			.attr("width", eighteenYard)
			.attr("height", (2*eighteenYard+goalWidth) )
			.attr("x", border)
			.attr("y", (halfHt - border - goalWidth/2 -eighteenYard) )
			
		//penalty spot
		pitchMarkings.append("svg:circle")
				.attr("cx", (penalty + border) )
				.attr("cy", (halfHt - border))
				.attr("r", spot)
				.attr("fill", "white")
				.style("opacity", 0.3);

		pitchMarkings.append("svg:rect")
			.attr("width", sixYard)
			.attr("height", (2*sixYard+goalWidth) )
			.attr("x", border)
			.attr("y", (halfHt - border - goalWidth/2 -sixYard) )

		pitchMarkings.append("svg:rect")
			.attr("width", border/2)
			.attr("height", goalWidth )
			.attr("x", (border/2))
			.attr("y", (halfHt - border - goalWidth/2) )

			
		//rh goal area				
		pitchMarkings.append("svg:circle")
			.attr("cx", width - border - penalty )
			.attr("cy", (halfHt-border) )
			.attr("r", radius)
			
		pitchMarkings.append("svg:rect")
			.attr("width", eighteenYard)
			.attr("height", (2*eighteenYard+goalWidth) )
			.attr("x", width-border-eighteenYard)
			.attr("y", (halfHt - border - goalWidth/2 -eighteenYard) )
		
		//penalty spot
		pitchMarkings.append("svg:circle")
				.attr("cx", (width - border - penalty) )
				.attr("cy", (halfHt - border))
				.attr("r", spot)
				.attr("fill", "white")
				.style("opacity", 0.3);
				
		pitchMarkings.append("svg:rect")
			.attr("width", sixYard)
			.attr("height", (2*sixYard+goalWidth) )
			.attr("x", width-border-sixYard)
			.attr("y", (halfHt - border - goalWidth/2 -sixYard) )

		pitchMarkings.append("svg:rect")
			.attr("width", border/2)
			.attr("height", goalWidth )
			.attr("x", width-border)
			.attr("y", (halfHt - border - goalWidth/2) );
			
			
		pitchMarkings.style("stroke-width", 2)
			.style("stroke", "white")
			.style("fill", "#181")
			.style("stroke-opacity", 0.3);

		// add layer for chart data
		chartLayer = pitch.append("svg:g");
		chartLayer.style("stroke-width", 2)
			.style("stroke", "#333")
			.style("fill", "none")
			.style("stroke-opacity", 0.3);
			

	}

	function onPlayerChange() 
	{
		var val = $playerSelect.val();
		console.log("change " + val);
		
		calculatePositionData(val);
		showData(10);
		
		
	}
	
	
	
	//----------------------------------
	//  init doc...
	//----------------------------------
	
	function init() 
	{
		
		//console.log("PATH READY");
		
  
		// video controls
		$("#backBtn").click(function(){
			//console.log("BACK");
			stepData( - 1);
		});

				

		$("#nextBtn").click(function(){
			//console.log("NEXT");
			
			stepData( + 1);
		});
		
		$playerSelect = $("select#playerMenu");
		$playerSelect.change(onPlayerChange);
		
		
		$('.selectpicker').selectpicker();
		
	}

	
}());
	
	
	

	
		

