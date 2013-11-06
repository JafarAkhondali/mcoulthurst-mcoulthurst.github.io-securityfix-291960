//--------------------------------------------------------------------------
//
//  Player visualisation
//
//--------------------------------------------------------------------------


var player = (function(){
	/*global console: true, $:true, Raphael:true, slider:true, videoView:true, box:true*/
	/*jslint newcap:true*/	
	
	// DATA
	var possessionData = []
	, summary = {}
	, summaryData = []
	, cumulativeTime = 0
	, playerList = {}	//list of personal data, ht, wt, dob, etc
	, maxTime
	, matchDate = "2011-08-21"
	, selectedPlayer = "Silva, David"	//used to track display = this is the players nameas a string
	
	, vis
	, arcs
	, totalValue
	, totalUnits
		
	// DIMENSIONS	
	, width = 780
	, height = 482
	, border = 20
	, pitchWidth = width - 2*border
	, pitchHeight = height - 2*border
	, maxHt
	, maxWd	
	
	// DISPLAY
	, pitch
	, svg
	, color = d3.scale.category20()
	, previouslySelectedPlayer
	, gradient1
	, gradient2
	, passChart
	, recipientChart
	, distanceChart
	, chartLayer

	//boolean init
	haveGotPlayers = false
	haveGotPasses = false;

	
	
		d3.csv("../data/players.csv",function(data) {
			//console.log("got data ");
			//console.log(data);

				
				var length = data.length;
				
				for ( var i=0; i<length;i++){
					//console.log(data[i].player);
					playerList[data[i].player] = data[i];
					
				}
				
				haveGotPlayers = true;
				initApp();
				//console.log(playerList);
				
				
				 
			 });



	// MAIN DATASET
	var ds = new Miso.Dataset({
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
		  }
		],
	  ready : function() {
	    // do something specific to this dataset here when it's
	    // been fetched
	    haveGotPasses = true;
		init();
	  }
	});
	

	
	
	
	ds.fetch({
		success : function() {
			
			ds.addComputedColumn("time", "number", function(row) {
			    return row.min*60 + row.sec;
			  });
			ds.addComputedColumn("passDistance", "number", function(row) {
				
				return Math.floor( 100 * Math.sqrt( Math.pow(row["X travel"],2) + Math.pow(row["Y travel"],2) ) );
			});
			 
			

			var numPossessions = 0
			
			
			, startTime = 0
			, endTime = 0
			, isStartTimeSet = false
			, totalPossession =0
			, duration
			, obj;

		    

			ds.each(function(row, index) {
				
				//console.log(row);
				var name = "Player name"
				, id = row[name]
				, tempCoords
				, recipient = "Recipient"
				, target =row[recipient];
				
				if ( !summary[id] ) {
					summary[id] = {
							name: id
							, posnCoords:[]
							, completes:0
							, incompletes:0
							, passDistance:0
							, passes:[]
							, longPasses:0
							, finalThird:0
							, distance:0
							, speed:[]
							, passDistribution:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
							, passIncompletes:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
							, totalPasses:[ [], [], [], [], [], [], [], [], [], [], [] ]
							, recipient:{}
						};
				}
				
				//add target info for recipient
				if(target != "Incomplete pass" && target!="N"){
					if(row.event_id>0){
						if ( !summary[id].recipient[target] ) {
							summary[id].recipient[target] =  1;
						}else {
							summary[id].recipient[target] = summary[id].recipient[target] + 1;
						}
					}
				}
				
				
				//hack to clean duplicate blank data rows
				if(row.event_id>0){
					if (row.outcome=="Incomplete") {
						summary[id].incompletes = summary[id].incompletes + 1;
					}else{
						summary[id].completes = summary[id].completes + 1;
					}
					/*
					if ( !summary[id].incompletes ) {
												summary[id].incompletes =  0;
											}*/
					
				
					tempCoords = {x:row.x, y:row.y, t:row.time, target:target, distance: row.passDistance};
					summary[id].posnCoords.push(tempCoords);
					summary[id].passes.push([row.time/60, row.passDistance]);
					//summary[id].passTiming.push(row.time);
				
					
					//pass distribution
					var dist = Math.floor(row.passDistance/500);
					//if(id==selectedPlayer){
					//	if(row.passDistance<1000 || row.passDistance>99000){
					//	//console.log(dist + ": " + row.passDistance);
					//	}
					//}
					
				summary[id].passDistribution[dist] = summary[id].passDistribution[dist] + 1;
				}
				
				if(row.outcome =="Incomplete" ) {	// ! remember that the units are in cm!!
					summary[id].passIncompletes[dist] = summary[id].passIncompletes[dist] + 1;
				}
				if(row.passDistance >=5000 ) {	// ! remember that the units are in cm!!
					summary[id].longPasses +=1;
				}
				
				if(row["X-end"] >= 66 ) {	// ! remember that the RAW units are in m!!
					summary[id].finalThird +=1;
				}
				
				summary[id].passDistance = summary[id].passDistance + row.passDistance;
				
				 if (row.outcome=="Incomplete") {
					endTime = row.time;
					//numPossessions++;
					
					
					
					duration = row.time - startTime;
					obj = {start:startTime, duration:duration};
					totalPossession += duration;
					possessionData.push(obj);
					cumulativeTime += duration;
					//console.log("Incomplete pass so end possesion at " +"(" + row.min+":" + row.sec + ")" + row.time +"-" + startTime +"::" + duration +" cf " + cumulativeTime + " at " + row.time);
					
					startTime = row.time;
					isStartTimeSet = false;
					
				 }else{
					if (!isStartTimeSet) {
						isStartTimeSet = true;
						startTime = row.time;
						//console.log("set start " + startTime);
					}
					//
				 }
				 //console.log(cumulativeTime + ":" + ds.max("time")  + "::" + 90*60);
				//console.log(row);
				
				
			});
			
			//having looped thro all the records

			
			
			
			maxTime = ds.max("time");
			
			
			//convert summary data to array and process the position
			
			for (item in summary) {
				
				//sort recipients
				var sortable = []
				, plyrs
				, i;
				for ( plyrs in summary[item].recipient) {
					sortable.push( [ plyrs,   summary[item].recipient[plyrs] ] );
					sortable.sort(function(a,b) {return b[1]-a[1]}); //sort descending
				}
				//change the recipient property to the sorted array
				summary[item].recipient = sortable;
				
				//console.log(item);
				//console.log(summary[item]);
				summaryData.push(summary[item]);
				var length = summary[item].posnCoords.length;
				var sumSpeed =0;
				
				for (  i=1; i<length; i++){
					var obj = summary[item].posnCoords
					, xDiff = obj[i].x - obj[i-1].x
					, yDiff = obj[i].y - obj[i-1].y
					, distance = Math.sqrt( (xDiff*xDiff) + (yDiff*yDiff) ) 
					, timeDiff = obj[i].t - obj[i-1].t
					, speed = 0;
					
					distance = Math.round(distance);
					if(distance >0){
						speed = distance/timeDiff;
					}
					//console.log("distance " + distance +  ", speed "  + speed );
					summary[item].distance = summary[item].distance + distance;
					summary[item].speed.push(speed);
					sumSpeed += speed;
					
					
					
				}
				
				var distributionLength = summary[item].passDistribution.length;
				for ( var i=0; i<distributionLength; i++){
					//add complete and imcomplete passes
					//summary[item].totalPasses[i] = [summary[item].passDistribution[i], summary[item].passIncompletes[i]];
					var incompletes = summary[item].passIncompletes[i];
					if(!incompletes) {incompletes =0};
					
					summary[item].totalPasses[i] = { complete: summary[item].passDistribution[i], incomplete:incompletes  };
				}
				//console.log("sumSpeed "  + sumSpeed +": " + length);
				//console.log("summary[id].passDistribution "  + summary[item].passDistribution);
				summary[item].averageSpeed =  Math.floor( (sumSpeed / length)*100) /100;
				summary[item].topSpeed = Math.floor( Math.max.apply(null, summary[item].speed)*100) / 100;
				
				
				//add a final pass in order to get the last grid line to display
				summary[item].passes.push([100, 0]);
				
			}
			

			//getPlayerData();
			
			
			drawPitch();
			

			
			//console.log(summary[selectedPlayer]);
			
			//createTable();

			haveGotPasses = true;

			initApp();
			

			
		},
	  
		error : function() {
			// do things here in case your data fetch fails.
			console.warn("error loading data");
		}
		
		
	});
	
	function initApp(){
		console.log("init app " + haveGotPlayers + " : " +  haveGotPasses )
		if(haveGotPlayers===true && haveGotPasses===true){
			drawRecipientChart();
			drawDistanceTimeChart();
			
			showPositions();
			
			showPlayer(selectedPlayer);
		}
	}
	
/*
	function getPlayerData() {
				//console.log("get player data");
			//pull in some speicfic player data
			d3.csv("data/players.csv",function(data) {
				playerList = d3.csv.parse(data);
				
				//console.log(playerList);
				
				//convert to playersObj					
 });
				 
		
	}*/

	function getAge(dateString) {
	    var nowDate = new Date(matchDate);
	    var birthDate = new Date(dateString);
	    //console.log(age + ": "+ nowDate + ": " + birthDate);
	    var age = nowDate.getFullYear() - birthDate.getFullYear();
	    //console.log(age);
	    var m = nowDate.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && nowDate.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
	}
	
	
	function formatDate(dateString) {
	    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	    , thisDate = new Date(dateString)
	    , newDate =  months[thisDate.getMonth()] + " " + thisDate.getFullYear() ;


	    
	    return newDate;
	}


	function showPlayer(id, val) {
		
		console.log(id);
		console.log(playerList[selectedPlayer]);
		selectedPlayer = id;
		var names = selectedPlayer.split(", ");
		player = playerList[selectedPlayer];
		age = getAge(player.dob);
		//console.log("show player "  + selectedPlayer + ":" + age);
		var title = names[0].toUpperCase() + ", " + names[1];
		$("h4#player").text( title );
		$("h5#shirt").text( player.shirt );
		
		
		d3.selectAll("svg").remove();
		
		
		drawPassesChart();
		drawRecipientChart();
		drawDistanceTimeChart();
		updateTable();
		
		drawPitch();
		showPositions();
		
		$("span#age").text( age );
		$("span#dateOfBirth").text( formatDate(player.dob) );
		$("span#ht").text( player.ht + " m" );
		$("span#wt").text( player.wt + " kg");
		$("span#debut").text( formatDate(player.debut) );
		
	}
	
	
	function updateTable() {
		//console.log("updateTable "  + selectedPlayer);
		
		var passes = summary[selectedPlayer].completes + summary[selectedPlayer].incompletes
		, accuracy = Math.round ( summary[selectedPlayer].completes / passes * 100 )
		, meanPassDistance = Math.round ( 10* (summary[selectedPlayer].passDistance / passes) / 100 ) /10;
		
		// PROFILE
		
		
		// SUMMARY
		$("span#shots").text( "*tbd*" );
		$("span#shotsOnTarget").text( "*" + " on target" );
		$("span#passes").text( passes );
		$("span#accuracy").text( accuracy + "%");
		$("span#distanceTravelled").text( summary[selectedPlayer].distance );
		
		
		// PERFORMANCE
		$("span#speedCount").text( "*tbd*" );
		$("span#ballDistance").text( "*tbd*" );
		$("span#topSpeed").text( summary[selectedPlayer].topSpeed );
		$("span#meanSpeed").text( summary[selectedPlayer].averageSpeed );
		$("span#timeOnBall").text( "*tbd*" );
		
		// PASSSING
		$("span#totalPasses").text( passes );
		$("span#incompletePasses").text( summary[selectedPlayer].incompletes + " incomplete" );
		$("span#finalThird").text( summary[selectedPlayer].finalThird );
		$("span#finalThirdIncomplete").text( "*tbd*" );
		$("span#meanPass").text( meanPassDistance );
		
	}
	
	
	function drawPassesChart () {
		//console.log("drawPassesChart " + selectedPlayer );
		
		var w = 740
		    , h = 120
		    , labelpad = 100
		    , p = 4
		    , padding = 20
		    , dataset =  summary[selectedPlayer].totalPasses 
		    //, dataset =  summary["Milner, James"].totalPasses 
		    , sampsize = dataset.length
		    , maxvalrev = 20
		    
		    , barwidth = 12
		    , bottom = h - 2*p
		    , colors = ["#444E36", "#85A76B"]
		    , x = d3.scale.linear().domain([0, sampsize+1]).range([0, w ])
		    , y = d3.scale.linear().domain([0, maxvalrev]).range([0, bottom])
		    
		   // , vis
		    , bars
		    , rules;

		//document.write('<p>Max Rev ' + maxvalrev +  ' , Max Units ' + maxvalunits + '</p>')
		//document.write('<p>Max Rev ' + addCommas('' + maxvalrev) +  ' , Max Units ' + maxvalunits + '</p>')
		
		//d3.select("div#passChart").remove();
		passChart = d3.select("div#passChart")
		   .append("svg:svg")
		     .attr("class", "chart")
		     .attr("width", w + 2*p)
		     .attr("height", h + 2*p)
		     .append("g");
	
		// Add first data-series
		bars = passChart.selectAll("rect")
		     .data(dataset)
		   .enter().append("svg:rect")
		     .attr("fill", colors[0] )
		     .attr("x", function(d, i) { 
		     	//console.log(d);
		     	return x(i+1); })
		     .attr("y", function(d) { 
		     	    	return bottom - y(d.complete);
		     	 })
		     .attr("width", barwidth)
		     .attr("height", function(d) { return y(d.complete); });
	
	
	   
	
		rules = passChart.selectAll("g.rule")
		    .data(dataset)
		  .enter().append("svg:g")
		    .attr("class", "rule");
		
		// Add second data-series
		rules.append("svg:rect")
		     .attr("fill", colors[1])
		     .attr("x", function(d, i) { return x(i+1); })
		     //.attr("y", function(d) { return bottom - y(d.complete) - y(d.incomplete); }    )
		     
		     
		     .attr("y", function(d) { 
		     	//console.log(d);
		     	return bottom - y(d.complete) - y(d.incomplete); 
		     	}    )
		     .attr("width", barwidth)
		     .attr("height", function(d) { return y(d.incomplete); });
	
	
	
		// Add horiz axis labels
		rules.append("svg:text")
		    .attr("y", h)
		    .attr("x", function(d, i) { return x(i+1) +  barwidth/2; })
		    .attr("dy", ".35em")
		    .attr("text-anchor", "middle")
		    .attr("class", "chartText"  )
		    .text( function(d, i) { return (i+1)*5; } );
	
	
		// Custom: Vertical-axis grid + labels
		// See default values below
		rules.append("svg:line")
		    .data(y.ticks(10))
		    .attr("y1", function(d, i) {
		    	if ((i+1) % 2 == 0) {
		    	return (i+1)* bottom/10;
		    	}
		    	})
		    .attr("y2", function(d, i) {
		    	if ((i+1) % 2 == 0) {
		    	return (i+1)* bottom/10;
		    	}
		    	})
		    .attr("x1", 20)
		    .attr("x2", w-20 );
		
		rules.append("svg:text")
		    .data(y.ticks(10))
		    .attr("y",  function(d, i) {return (i)* bottom/10 ; } )
		    .attr("x",  20)
		    .attr("dy", ".35em")
		    .attr("text-anchor", "end")
		    .attr("class", "chartText"  )
		    
		    .text(function(d, i) {
		    	 if ((i) % 2 == 0 && i>0) {
		    	 	//console.log(i);
		    	 	return 2*(10-i);
		    	 } else {
		    	 	return '';} 
		    	 }); 
		    
	
	
		// ---------------------------------------
		// Add Title, then Legend
		// ---------------------------------------
/*
		passChart.append("svg:text")
		   .attr("x", 10)
		   .attr("y", 10    )
		   .attr("class", "title"  )
		   .text("Pass distribution by distance");*/

		
		passChart.append("svg:rect")
		   .attr("fill", colors[0] )
		   .attr("x", w-labelpad)
		   .attr("y", 20    )
		   .attr("width", 10)
		   .attr("height", 10);
		
		passChart.append("svg:text")
		   .attr("x", w-labelpad + padding)
		   .attr("y", 30    )
		   .attr("class", "title"  )
		   .text("Complete");
		
		passChart.append("svg:rect")
		   .attr("fill", colors[1] )
		   .attr("x", w - labelpad)
		   .attr("y", 35    )
		   .attr("width", 10)
		   .attr("height", 10);
		
		passChart.append("svg:text")
		   .attr("x", w-labelpad + padding)
		   .attr("y", 45    )
		   .attr("class", "title"  )
		   .text("Incomplete");
	
					
	}
	
	
	
	
	
	function formatData(obj){
		//console.log(obj);
		var arr = [];
		for ( var item in obj){
			//console.log( obj[item])
			
			//filter top 5
			if (item<5){
				arr.push( {player: obj[item][0], count:obj[item][1] } );
			}
		}
		//console.log( arr);
		return arr;
	}
	
	function drawRecipientChart () {
		//console.log("drawRecipientChart");
		
		var w = 800
		, h = 100
		, barPadding = 4
		, barHt = 14
		, xPosn = 0
		, xOffset = 150
		, dataset = formatData( summary[selectedPlayer].recipient )
		, chart;
		

			
		//d3.select("svg").remove();
		//Create SVG element
		chart = d3.select("div#recipientChart")
		            .append("svg")
		            .attr("width", w)
		            .attr("height", h)
		            .append("g")
					.attr("transform", "translate(10,15)");
		            
		            
		chart.selectAll("rect")
		   .data(dataset)
		   .enter()
		   .append("rect")
		   .attr("x", xOffset)
		   .attr("y", function(d, i) {
			    return i*(barHt+barPadding);  
			})
		   .attr("width", function(d) {
			    return d.count*12; 
			})
		   .attr("height", barHt)
			.attr("fill", function(d, i) {
				  return "rgb(137, 167, 107)";
			})
			.attr("id", function(d,i) {
				    return i;
			})
			.on("click", function(d,i){
				var row = ( this.getAttribute("id")  );
				showMatch(row);
			})
			.on("mouseover", function(d){
				this.style.cursor="pointer";
			});


		// Titles
		chart.selectAll("playerNames")
			.data(dataset)
			.enter().append("svg:text")
			.attr("x", function(d, i) {
			    return -10;//xPosn;  
			})
			.attr("y", function(d, i) {
			    return i*(barHt+barPadding); 
			})
			.attr("dx", 3) // padding-right
			.attr("dy", barPadding + barHt/2) // vertical-align: middle
			.attr("class", "title")
			//.attr("text-anchor", "end") // text-align: right
			.text( function(d, i) {
				//console.log("add player "  + d.player);
			    return d.player;  
			} )

		// Labels
		chart.selectAll("count")
			.data(dataset)
			.enter().append("svg:text")
			.attr("x", function(d, i) {
			    return xOffset + d.count*12;  
			})
			.attr("y", function(d, i) {
			    return i*(barHt+barPadding); 
			})
			.attr("dx", 3) // padding-right
			.attr("dy", barPadding + barHt/2) // vertical-align: middle
			//.attr("text-anchor", "end") // text-align: right
			.attr("class", "title")
			.text( function(d, i) { return d.count; });

		
	}
	
	function drawDistanceTimeChart () {
		//console.log("drawDistanceTimeChart");
		
		var dataset = summary[selectedPlayer].passes
		, w = 740
		, h = 200
		, xOffset = 50
		, yOffset = 20
		, padding = 10
		, yPosn = 120
		, labelpad = 0
		, xPadding = 10
		, yPadding = 30
		
		, chart
		, vRules
		, hRules
		
		// x and y scales
		, xScale = d3.scale.linear()
					.domain([0, 100])
					.range([0, (w-xOffset-20)])
		,  yScale = d3.scale.linear()
					.domain([50,0])
					.range([0, yPosn]);

		//define the x axis
		 xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")
                  //.tickFormat(formatMinutes);
                  .ticks(5)  //Set rough # of ticks;
		//Define Y axis
		 yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  .ticks(5);
			
//chart.select("svg.g").remove();
		//Create SVG element
		chart = d3.select("div#distanceChart")
		            .append("svg")
		            .attr("width", w)
		            .attr("height", h);
		            
		distanceChart = chart.append("svg:g")
					.attr("transform", "translate(" + xOffset + "," + yOffset + ")");
		            
		 
		 
		//horizontal lines
		hRules = distanceChart.selectAll("line")
			.data(yScale.ticks(4)) //set 6 ticks eg every 15 mins
			.enter().append("line")
			.attr("class", "rule")
			.attr("x1", 0)
			.attr("x2", w)
			.attr("y1", yScale)
			.attr("y2", yScale)
			.attr("stroke", "#ccc")
			.attr("stroke-opacity", .3);
			
		// vertical bars every 10 mins
		vRules = distanceChart.selectAll("g.rule")
		    .data(xScale.ticks(10))
			.enter().append("svg:g")
		    .attr("class", "rule")
		    .attr("transform", function(d) {
		    	//console.log(d); 
		    	//console.log(d +": "+ xScale(d)); 
		    	return "translate(" + (xScale(d)+xPadding) + ", 0)"; 
		    	});
		    	

		vRules.append("svg:line")
		    .attr("y1", 0)
		    .attr("y2", yPosn)
		    .attr("x1", labelpad)
		    .attr("x2", labelpad)
		    .attr("stroke", "black");
		
/*		vRules.append("svg:line")
		    .attr("y1", 0)
		    .attr("y2", h)
		    .attr("x1", labelpad)
		    .attr("x2", labelpad)
		    .attr("stroke", "white")
		    .attr("stroke-opacity", 0.3);*/

	    
	    	         
	   	// draw the bars 
		distanceChart.selectAll("rect")
		   .data(dataset)
		   .enter()
		   .append("svg:rect")
		   .attr("transform", "translate(" + xPadding + "," + 0 + ")")
		   .attr("x", function(d, i) {
		   		//console.log( d[0] +": " +  xScale(d[0]));
			    return xScale(d[0]);  
			})
		   .attr("y", function(d, i) {
			    return  yPosn - d[1]/50;  
			})
		   .attr("width", function(d) {
			    return 4; 
			})
		   .attr("height", function(d, i) {
			    return  d[1]/50;  
			})
		   .attr("id", function(d, i) {
			    return  d[1]/100;  
			})
		   
			.attr("fill", function(d, i) {
				  return "rgba(137, 167, 107, 128)";
			})

			.on("click", function(d,i){
				var row = ( this.getAttribute("id")  );
				//console.log("distnace " + row)
				//showMatch(row);
			})
			.on("mouseover", function(d){
				this.style.cursor="pointer";
			});





	
		//Create X axis
		distanceChart.append("svg:g")
			//add css class
			.attr("class", "axis")
			// shift axis down
			.attr("transform", "translate(" + xPadding + "," + yPosn + ")")
			.call(xAxis);

		distanceChart.append("svg:text")      // text label for the x axis
	        .attr("x", w/2 - xOffset)
	        .attr("y", yPosn + yPadding  )
	        .style("text-anchor", "middle")
	        .attr("class", "chartText"  )
	        .text("Time");   
   
	   //Create Y axis
		distanceChart.append("svg:g")
		    .attr("class", "axis")
		    .attr("transform", "translate(" + 5 + ",0)")
		    .call(yAxis);

		distanceChart.append("svg:text")
	        .attr("transform", "rotate(-90)")
	        .attr("x", -yPosn/2)
	        .attr("y",  -40)
	        .attr("dy", "1em")
	        .style("text-anchor", "middle")
	        .attr("class", "chartText"  )
	        .text("Distance (m)");

	}
	
		
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
	
		return ( mins+":"+secs )
	}
	
	
	
	function calculatePossession (time) {
		
		time = time * 60;
		
		//console.log("possession at time " + time);
		
		var index = 0
		, i
		, length = possessionData.length -1
		, cumulative = 0;
		
		for ( i=0; i<length; i++) {
			//console.log(index +":: " + possessionData[i].start + ": " + cumulative + " " + time + "::" + cumulative/time);
			if (possessionData[i+1].start > time){
				break;
			}
			index++;
			cumulative += possessionData[i].duration;
		}
		//console.log("last " + index + "::" + cumulative)
		
		
		
		var possession = Math.floor(100*cumulative/(time)); 
		vis.remove();
		//drawChart(possession);
		//console.log("calculatePossession: " + cumulative + " of " + time +": " +possession);
		
		totalValue.text(function(){return possession + " %";});

	}
	

	
	function drawChart () {
		
		var width = 1100
		, height = 600
		, scale =  maxTime / width;
		//console.log("scale " + scale);
		svg = d3.select("div#chartTable")
				.append("svg:svg")
				.attr("width", width)
				.attr("height", height)
				
		//add circles to each line for each data value
		svg.selectAll('.block')
			.data([summary])
			.enter().append("svg:rect")
			.attr("class", 'block')			 //set the css class
			.attr("width", function(d, i) {
					return d.duration/scale ;
				})
			.attr("height", 20)
			.attr("x", function(d, i) {
					return d.start/scale ;
				})
			.attr("y", 30)
			.on('mouseover', function() {
				//console.log("x " + this.getAttribute("width"));
			})
	
	}
	
	function drawPossession () {
		
		var width = 1100
		, height = 600
		, scale =  maxTime / width;
		//console.log("scale " + scale);
		svg = d3.select("div#chartTable")
				.append("svg:svg")
				.attr("width", width)
				.attr("height", height)
				
		//add circles to each line for each data value
		svg.selectAll('.block')
			.data(possessionData)
			.enter().append("svg:rect")
			.attr("class", 'block')			 //set the css class
			.attr("width", function(d, i) {
					return d.duration/scale ;
				})
			.attr("height", 20)
			.attr("x", function(d, i) {
					return d.start/scale ;
				})
			.attr("y", 30)
			.on('mouseover', function() {
				//console.log("x " + this.getAttribute("width"));
			})
	
	}

	function createTable(){
		var columnNames = ["name", "completes", "incompletes", "finalThird", "longPasses", "passDistance", "distance", "topSpeed", "averageSpeed"]
		, rows
		, cells

		
		table = d3.select("#resultsTable").append("table"),
		thead = table.append("thead"),
        tbody = table.append("tbody");

    	// append the header row
    	thead.append("tr")
        .selectAll("th")
        .data(columnNames)
        .enter()
        .append("th")
        .text(function(column) { return column; });

    // create a row for each object in the data
    rows = tbody.selectAll("tr")
        .data(summaryData)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    cells = rows.selectAll("td")
        .data(function(row) {
            return columnNames.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function(d) { return d.value; });
	
	}
	
	
	function showPositions(){
	// create initial layout with each player assigned their own set of circles
	// these can then be changed by setting the css className

	$("span#passTime").text( displayTime(0) );
	$("span#passDistance").text( 0.0 );
	$("span#surname").text( "" );
	$("span#firstname").text( "" );
	$("span#speed").text( "*tbd*" );
	$("span#passCompletion").text( "" );
				
				
	var positionData = summary[selectedPlayer].posnCoords;	
		//console.log(positionData);
		var xPosition = d3.scale.linear()
		, yPosition = d3.scale.linear();
		
		xPosition.domain([0,100 ]).range([border, pitchWidth]);
		yPosition.domain([0,100 ]).range([border, pitchHeight]);
    
    	
		//Create SVG element
		//svg = d3.select("svg")

        chartLayer.selectAll("circle")
		   .data(positionData)
		   .enter()
		   .append("svg:circle")
		
			.attr('class', function(d,i){
				 return "circ_" + d[0];
				// //console.log(d.t);
			})
			
			.attr("cx", function(d) {
				//console.log(d.x);
				//if(d[3]==="MC"){
					return xPosition( d.x )+ 10;
				//} else {
				//	return xPosition( (100 - d[1]) )+ 10;
				//}
			})
			.attr("cy", function(d) {
				//console.log(d.y);
				//if(d[3]=="MC"){
					return yPosition( d.y )+ 10;
				//} else {
				//	return yPosition( (100 - d[2]) )+ 10;
				//}
			})
	
			.attr("fill", "rgba(255, 255, 255, 0.6)")
	
			.attr("r", 5)
			.style("stroke", "rgba(255, 255, 255, 1)")
			
			
			.on("click", function(d,i){

				var names = ["", ""]
				complete = "Complete";
				names = d.target.split(", ");

				if(names[0]=="N"){
					names[0]="None";
					names[1]="";
				}
				if(names[0]=="Incomplete pass"){
					names[0]="None";
					names[1]="";
					complete = "Incomplete";
				}
				
				
				
				$("span#passTime").text( displayTime(d.t) );
				$("span#passDistance").text( Math.round (d.distance/10) /10 );
				$("span#surname").text( names[0] );
				$("span#firstname").text( names[1] );
				$("span#speed").text( "*tbd*" );
				$("span#passCompletion").text( complete );
				
				
				
			})
			
			
			//.attr("fill", "url(#gradient1)")
			//.style("stroke", "none")
			
			
/*
		
		gradient1 = chartLayer.append("svg:defs")
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
		
		gradient2 = chartLayer.append("svg:defs")
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
		    .attr("stop-opacity", 0.0);*/


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
		, green = "#181";//"#85A76B";//"#181"


		pitch = d3.select("div#pitch")
				.append("svg:svg")
				.attr("width", width)
				.attr("height", height);
				
		var pitchMarkings = pitch.append("g");
		
		// green background
		pitchMarkings.append("svg:rect")
				.attr("width", width)
				.attr("height", height)
				.attr("fill", green);
		
		//outline
		pitchMarkings.append("svg:rect")
				.attr("x", border)
				.attr("y", border)
				.attr("width", pitchWidth )
				.attr("height", pitchHeight)
				.attr("fill", green);


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
			.style("fill", green)
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
		var id = $playerSelect.find(":selected").text()
		, val = $playerSelect.val();
		
		//console.log("change " + id +":" + val);
		
		showPlayer(id, val);
		
	}
	

	//----------------------------------
	//  init doc...
	//----------------------------------
	
	function init() 
	{
		//console.log("PLAYER READY");
		
		$playerSelect = $("select#playerMenu");
		$playerSelect.change(onPlayerChange);
		
		
		$('.selectpicker').selectpicker();
		
		
	}
	

	
}());

		

