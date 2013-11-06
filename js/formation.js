//--------------------------------------------------------------------------
//
//  
//
//--------------------------------------------------------------------------


var analysis = (function(){

	// DATA
	var FILE = '../data/passes.csv'
	, subselection
	, teams
	, positionData
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
	
	// MAIN DATASET
	, ds = new Miso.Dataset({
	  url : FILE,
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
		  },
		  { name : 'team', 
		    type : 'string'
		  }
		  
		],
	  ready : function() {
	    // do something specific to this dataset here when it's
	    // been fetched
		new Dragdealer('timelineSlider',
			{
				
				callback: function(x, y)
				{
					console.log("STOP Display positions at " + x * matchDuration /60);
					showFormation(x * matchDuration /60);
				},
				animationCallback: function(x, y)
				{
					//console.log("ANIMATE Display positions at " + x * matchDuration /60);
					displayTime(x * matchDuration );
				}
			});
			console.log("READY");
	  }
	});
	
	
	ds.fetch({
		success : function() {
			
			ds.addComputedColumn("time", "number", function(row) {
			    return row.min*60 + row.sec;
			  });
			  
			  
			
			
			players = {}
			ds.each(function(row, index){
			//console.log(row.team_id  );
				var obj = {time: row.time, x:row.x, y:row.y };
				
				if ( players[row["Player name"]] == null ) {
					players[row["Player name"]] = [];
					players[row["Player name"]][0] = row.team_id;
				}
				
				players[row["Player name"]].push(obj);
				
			});
			
			
			// create list of unique players
			matchDuration = Math.ceil(ds.max("time") / 60 ) * 60;
		

			drawPitch();
			
			showFormation(0);
			
			//showPositions();
	    
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
		console.log(mins+":"+secs);
		
		
		
		d3.select("#displayTime")
	    .text( mins+":"+secs )
	}
	
	
	function showFormation(time) {
		//var id =  Math.floor(Math.random()  * teamB.length);
		//var name = teamB.column("ID").data[id];
		//var label = "#x" + (id  + teamA.length);
		var seekTime = Math.floor(time * 60)
		console.log("showFormation at " + seekTime );
		
		positionData =[];
		
		for (var key in players) {
			var length = players[key].length;
			console.log(key);
			console.log(players[key]);
			var obj = {id :key, x:-10, y:-1, team:players[key][0] };
			for ( var i =1; i<length; i++ ) {
				var t = players[key][i].time;
				
				if ( t <= seekTime){
					//console.log("player " + key +": " + players[key][i].time + ": " + players[key][i].x + ", "+ players[key][i].y);
					obj.x = players[key][i].x;
					obj.y = players[key][i].y;
					
					//console.log("player " + key +": " + players[key][i].time + ": " + obj.x + ", "+ obj.y);
					//break;
				}
			}
			positionData.push(obj);
		}
		
		showPositions();
	}
	


	function highlight(name, isVisible){
		
		if ( !isVisible) {
			//clear existing 
			
			var player = d3.selectAll(".circ_" + name);
			player.attr('fill', "#0f0")
					.attr("opacity", 0.2 )
					.attr("visibility", "hidden" );	
		} else {
			//show new player
			player = d3.selectAll(".circ_"+name);
			player.attr("opacity", 0.4 )
				.attr('fill', function(d) {
						if(d[3]==="MC"){
							//return "url(#gradient1)";
							return "#87BCE5";
						} else {
							return "url(#gradient2)";
						}
					})
				.attr("visibility", "visible" );
			
			
		}

		
		
		
	}
	
	
	function showPositions(){
	// create initial layout with each player assigned their own set of circles
	// these can then be changed by setting the css className
		console.log( positionData);
		var circle
		, xPosition = d3.scale.linear()
		, yPosition = d3.scale.linear();
		
		xPosition.domain([0,100 ]).range([border, pitchWidth]);
		yPosition.domain([0,100 ]).range([border, pitchHeight]);
    
    
		//Create SVG element
		svg = d3.select("svg");

svg.selectAll("circle").remove();
       

		svg.selectAll("circle")
 		   .data(positionData, function(d){return d;})
 		   .enter()
		   .append("svg:circle")
		
			.attr('class', function(d,i){
				console.log(d  );
				 return "circ_" + d[0];
			})
			
			.attr("cx", function(d) {
				return xPosition( d.x )+ 10;

			})
			.attr("cy", function(d) {
				return yPosition( d.y )+ 10;
			})
	
			//.attr("fill", "url(#gradient1)")
			.attr("fill", function(d) {
				console.log(d);
				var clr = "#87BCE5";
				if (d.team===30){
					clr="#fff";
				}
			
				return clr;
			})
			//.attr("visibility", "hidden" )
	
			//.attr("r", 45)
			.attr("r", 5)
			.style("stroke", "none")
		





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
				
		// green background
		pitch.append("svg:rect")
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "#181");
		
		//outline
		pitch.append("svg:rect")
				.attr("x", border)
				.attr("y", border)
				.attr("width", pitchWidth )
				.attr("height", pitchHeight)
				.attr("fill", "#181");


		// centre circle
		pitch.append("svg:circle")
				.attr("cx", halfway )
				.attr("cy", (halfHt-border) )
				.attr("r", radius)
				
		// centre line		
		pitch.append("svg:path")
			.attr("d","M " + (border+width/2) + " 20 L " + (border+width/2) + " " + (height-border) )
			
		//centre spot
		pitch.append("svg:circle")
				.attr("cx", halfway )
				.attr("cy", (halfHt-border) )
				.attr("r", spot)
				.attr("fill", "white")
				.style("opacity", 0.3);


		//lh goal area
		pitch.append("svg:circle")
		.attr("cx", border + penalty )
		.attr("cy", (halfHt-border) )
		.attr("r", radius)
		
		pitch.append("svg:rect")
			.attr("width", eighteenYard)
			.attr("height", (2*eighteenYard+goalWidth) )
			.attr("x", border)
			.attr("y", (halfHt - border - goalWidth/2 -eighteenYard) )
			
		//penalty spot
		pitch.append("svg:circle")
				.attr("cx", (penalty + border) )
				.attr("cy", (halfHt - border))
				.attr("r", spot)
				.attr("fill", "white")
				.style("opacity", 0.3);

		pitch.append("svg:rect")
			.attr("width", sixYard)
			.attr("height", (2*sixYard+goalWidth) )
			.attr("x", border)
			.attr("y", (halfHt - border - goalWidth/2 -sixYard) )

		pitch.append("svg:rect")
			.attr("width", border/2)
			.attr("height", goalWidth )
			.attr("x", (border/2))
			.attr("y", (halfHt - border - goalWidth/2) )

			
		//rh goal area				
		pitch.append("svg:circle")
			.attr("cx", width - border - penalty )
			.attr("cy", (halfHt-border) )
			.attr("r", radius)
			
		pitch.append("svg:rect")
			.attr("width", eighteenYard)
			.attr("height", (2*eighteenYard+goalWidth) )
			.attr("x", width-border-eighteenYard)
			.attr("y", (halfHt - border - goalWidth/2 -eighteenYard) )
		
		//penalty spot
		pitch.append("svg:circle")
				.attr("cx", (width - border - penalty) )
				.attr("cy", (halfHt - border))
				.attr("r", spot)
				.attr("fill", "white")
				.style("opacity", 0.3);
				
		pitch.append("svg:rect")
			.attr("width", sixYard)
			.attr("height", (2*sixYard+goalWidth) )
			.attr("x", width-border-sixYard)
			.attr("y", (halfHt - border - goalWidth/2 -sixYard) )

		pitch.append("svg:rect")
			.attr("width", border/2)
			.attr("height", goalWidth )
			.attr("x", width-border)
			.attr("y", (halfHt - border - goalWidth/2) );
			
			
		pitch.style("stroke-width", 2)
			.style("stroke", "white")
			.style("fill", "#181")
			.style("stroke-opacity", 0.3);


	}

	
	

	
}());
	