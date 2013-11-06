//--------------------------------------------------------------------------
//
//  Main Miso and d3 rendering demo
//
//--------------------------------------------------------------------------


var analysis = (function(){
/*global console: true, $:true, Raphael:true, slider:true, videoView:true, box:true*/
	/*jslint newcap:true*/	
	
	// DATA
	var subselection
	, teams
	, positionData
	, table = {}
	, ds_table
	, players
	, teamA
	, teamB
	, playerRef = []
	, playerID ={}

	// DIMENSIONS	
	, width = 840
	, height = 584
	, border = 20
	, pitchWidth = width - 2*border
	, pitchHeight = height - 2*border
	, maxHt
	, maxWd	
	
	// DISPLAY
	, pitch
	, svg
	, previouslySelectedPlayer
	, gradient1
	, gradient2
	
	// MAIN DATASET
	, ds = new Miso.Dataset({
	  url : '../data/passes.csv',
	  delimiter : ',',
	  columns : [
		  { name : 'ID', 
		    type : 'string'
		 },
		  { name : 'x', 
		    type : 'number'
		 },
		  { name : 'y', 
		    type : 'number'
		  },
		  { name : 'team', 
		    type : 'number'
		  }
		],
	  ready : function() {
	    // do something specific to this dataset here when it's
	    // been fetched
			console.log("READY");
	  }
	});
	
	
	ds.fetch({
		success : function() {
			var teamName;
			
			// create list of unique players
			players = ds.countBy("Player name");
	    
		    console.log(players);
			//add teams to player data
			var team;
			players.addColumn({ name:"team", type:"number"} );
			//players.addColumn({type:"number", name:"meanX"} );
			//players.addColumn({type:"number", name:"meanY"} );
			
			
			players.each(function(row, index) {
				//console.log(row);
				team = ds.where(function(d)
				{
					
					if (d["Player name"] == row["Player name"]) {
						return (d);
					}
				});
				var myRow = players.rowByPosition(index)
				teamName = team.column("team_id").data[0];
				
				//console.log(teamName);
				players.update({ _id : myRow._id, team : teamName });
									//, meanX : team.column("meanX").mean
									//, meanY : team.column("meanY").mean });
				
			});
		

			players.sort(function(rowA, rowB) {
				    if (rowA["Player name"] > rowB["Player name"]) { 
				      return 1; 
				    }
				    if (rowA["Player name"] < rowB["Player name"]) { 
				      return -1;  
				    }
				    return 0;
				  });
				  
			    teamA = players.where({
			      // copy over the one column
			      columns: ['Player name',"team"],
			      // and only where the values are > 1
			      rows: function(row) {
			        return row.team != teamName;
			      }
			    });
				teamB = players.where({
			      // copy over the one column
			      columns: ['Player name',"team"],
			      // and only where the values are > 1
			      rows: function(row) {
			        return row.team == teamName;
			      }
			    });	
			    

			createPlayerList();
			
		    //create the position data array used by d3
			positionData = []
			
			ds.each(function(row, index){
				ref = playerID[row["Player name"]];
				row["ref"] = ref;
				
				positionData.push([
					row["ref"],
					row["Player name"],
					row["x"],
					row["y"],
					row["team_id"]
				]);
			});
			
		//console.log(positionData);
		
		maxHt = ds.max("x");
		maxWd = ds.max("y");
    
		drawPitch();

	    showPositions();
	    showRandom();
	    
		},
	  
		error : function() {
			// do things here in case your data fetch fails.
		}
	});
	
	

	
	function showRandom() {
		var id =  Math.floor(Math.random()  * teamB.length);
		var name = teamB.column("Player name").data[id];
		var label = "#x" + (id  + teamA.length);

		var target = d3.select(label);
		target.property("checked", true);
		
		highlight(name, true);	
	}
	
	
	function createPlayerList() {
		var count =0;
		
		teamA.each(function(row, rowIndex) {
			createTeamList(row, rowIndex, true);
			playerRef[count] = row["Player name"];
			playerID[row["Player name"]] = count;
			count++;
		});		
		teamB.each(function(row, rowIndex) {
			createTeamList(row, rowIndex, false);
			playerRef[count] = row["Player name"];
			playerID[row["Player name"]] = count;
			count++;
		});		
		console.log(playerRef);
		console.log(playerID);
	}
	
	
	
	function createTeamList(row, rowIndex, isHometeam){
		var rowId
			, name
			, selector
			, increment =0;
		if(isHometeam) {
			selector = d3.select("ul#homeTeam").append("li")
		} else {
			increment = teamA.length;
			selector = d3.select("ul#awayTeam").append("li")
		}
			
	    selector
	    
		.append("input")
		
		.attr("type", "checkbox")
		.property ("checked", false)
		.attr("id", function(d,i) { return "x"+( rowIndex + increment ); })
		.on("click", function(d,i) {
			
			rowId =  this.getAttribute("id");
			rowId = Number(rowId.slice(1));
			if (isHometeam) {
				name = teamA.column("Player name").data[rowId];
			} else {
				rowId =rowId - increment;
				name = teamB.column("Player name").data[rowId];
			}
			
			
			highlight(name, this.checked);
		})
		selector.append("label")
	    .attr("for", function(d,i) { return "x"+( rowIndex + increment ); })
	    .text( row["Player name"] )
	}
	

	function highlight(name, isVisible){
		var ref = playerID[name];
		console.log(name + ":" + ref);
		
		if ( !isVisible) {
			//clear existing 
			
			var player = d3.selectAll(".circ_" + ref);
			player.attr('fill', "#0f0")
					.attr("opacity", 0.2 )
					.attr("visibility", "hidden" );	
		} else {
			//show new player
			player = d3.selectAll(".circ_"+ref);
			player.attr("opacity", 0.4 )
				.attr('fill', function(d) {
						if(d[4]===43){
							return "url(#gradient1)";
							//return "#87BCE5";
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
		
		var xPosition = d3.scale.linear()
		, yPosition = d3.scale.linear();
		
		xPosition.domain([0,100 ]).range([border, pitchWidth]);
		yPosition.domain([0,100 ]).range([border, pitchHeight]);
    
    
		//Create SVG element
		svg = d3.select("svg")

        svg.selectAll("circle")
		   .data(positionData)
		   .enter()
		   .append("svg:circle")
		
			.attr('class', function(d,i){
				 return "circ_" + d[0];
			})
			
			.attr("cx", function(d) {
				//console.log(d);
				if(d[4]===43){
					return xPosition( d[2] )+ 10;
				} else {
					return xPosition( (100 - d[2]) )+ 10;
				}
			})
			.attr("cy", function(d) {
				if(d[4]==43){
					return yPosition( d[3] )+ 10;
				} else {
					return yPosition( (100 - d[3]) )+ 10;
				}
			})
	
			.attr("fill", "url(#gradient1)")
			//.attr("fill", "#87BCE5")
			.attr("visibility", "hidden" )
	
			.attr("r", 45)
			//.attr("r", 5)
			.style("stroke", "none")
		

		gradient1 = svg.append("svg:defs")
		  .append("svg:radialGradient")
		    .attr("id", "gradient1")
		    .attr("x1", "0%")
		    .attr("y1", "0%")
		    .attr("x2", "100%")
		    .attr("y2", "100%")
		    .attr("spreadMethod", "pad");

		

		gradient1.append("svg:stop")
		    .attr("offset", "0%")
		    .attr("stop-color", "#87BCE5")
		    .attr("stop-opacity", 0.8);
		
		gradient1.append("svg:stop")
		    .attr("offset", "100%")
		    .attr("stop-color", "#181")
		    .attr("stop-opacity", 0.0);


		
		gradient2 = svg.append("svg:defs")
		  .append("svg:radialGradient")
		    .attr("id", "gradient2")
		    .attr("x1", "0%")
		    .attr("y1", "0%")
		    .attr("x2", "100%")
		    .attr("y2", "100%")
		    .attr("spreadMethod", "pad");
		
		gradient2.append("svg:stop")
		    .attr("offset", "0%")
		    .attr("stop-color", "#fff")
		    .attr("stop-opacity", 0.8);
		
		gradient2.append("svg:stop")
		    .attr("offset", "100%")
		    .attr("stop-color", "#181")
		    .attr("stop-opacity", 0.0);


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
		, spot = 0.2 * scaling
		, goalHeight = (border/2)+4;


		pitch = d3.select("div#chartTable")
				.append("svg:svg")
				.attr("width", width)
				.attr("height", height);
				
		// green background
		pitch.append("svg:rect")
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "#0f790f");
		
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
			.attr("width", goalHeight)
			.attr("height", goalWidth )
			.attr("x", (border/2)-4)
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
			.attr("width", goalHeight)
			.attr("height", goalWidth )
			.attr("x", width-border)
			.attr("y", (halfHt - border - goalWidth/2) );
			
			
		pitch.style("stroke-width", 2)
			.style("stroke", "white")
			.style("fill", "#181")
			.style("stroke-opacity", 0.3);


	}

	
	

	
}());
	
	
		

