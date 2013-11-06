//--------------------------------------------------------------------------
//
//  Main Miso and d3 rendering demo
//
//--------------------------------------------------------------------------


var redux = (function(){
/*global console: true, $:true, Raphael:true, slider:true, videoView:true, box:true*/
	/*jslint newcap:true*/	
	
	// DATA
	var summary = {}
	, summaryData = []
	, maxTime
	, homePasses = 0
	, awayPasses = 0
	, homePossn = 0
	, awayPossn = 0

	// colours
	, homeColors = {}
	, awayColors ={}
	, yellow = "rgb(255, 255, 0)"
	, neutralGreen = "rgb(137, 167, 107)"
	
	, homeLegend
	, awayLegend

		
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
		  }
		],
	  ready : function() {
	    // do something specific to this dataset here when it's
	    // been fetched

	  }
	});
	
	
		homeColors.pass = "#627995";
		homeColors.possession = "#a9b5c6";
		homeColors.goal = "#FFFFFF";
		homeColors.miss = "#C6F473";
		homeColors.save = "#CA0B4E";

		awayColors.pass = "#3090F0";
		awayColors.possession = "#60A8D8";
		awayColors.goal = "#001848";
		awayColors.miss = "#FF6933";
		awayColors.save = "#CA0B4E";
		/*	
		homeColors.pass = "#627995";//"rgb(106, 136, 218)";
		homeColors.possession = "#a9b5c6";//"rgba(168, 189, 247, 0.7)";
		homeColors.goal = "#FF9900";//"#e6e6ff";//"rgb(255, 255, 255)";
		homeColors.miss = "#e6eaef";//"rgb(120, 148, 184)";
		homeColors.save = "#EA0023";//"rgb(153, 0, 255)";

		awayColors.pass = "#bd112b";//"rgba(220, 69, 89, 0.7)";
		awayColors.possession = "#f48495";//"rgba(220, 151, 159, 0.7)";
		awayColors.goal = "#500712";//"rgb(102, 0, 0)";
		awayColors.miss = "#fac2cb";//"rgb(51, 153, 0)";
		awayColors.save = "#6666FF";//"rgb(102, 102, 255)";
		*/
		homeLegend = [
			{title:"pass", color:homeColors.pass},
			{title:"possession", color:homeColors.possession},
			{title:"miss", color:homeColors.miss},
			{title:"save", color:homeColors.save},
			{title:"goal", color:homeColors.goal}
		];
		
		awayLegend = [
			{title:"pass", color:awayColors.pass},
			{title:"possession", color:awayColors.possession},
			{title:"miss", color:awayColors.miss},
			{title:"save", color:awayColors.save},
			{title:"goal", color:awayColors.goal}
		];
	
	
	ds.fetch({
		success : function() {
			
			var maxTime = ds.max("min")
			, mn = 0
			, sc = 0
			, count
			, item;
			
			for ( mn =0; mn<=maxTime; mn++){
					
				for ( sc =0; sc<=59; sc++){
					count = mn*60 + sc;
					if(!summary[count]){
						summary[count] = {};
						summary[count].min = mn;
						summary[count].sec = sc;
						summary[count].team = 0;
						summary[count].player = "";
						summary[count].target = "";
						summary[count].distance = 0;
						
					}
					
				}	
			}
			
			
			ds.each(function(row, index) {
				var count = row.min*60 + row.sec;
				summary[count].min = row.min;
				summary[count].sec = row.sec;
				summary[count].team = row.team_id;
				summary[count].player = row["Player name"];
				summary[count].target = row.Recipient;
				summary[count].distance = row.Distance;
				
			});
			
			//convert summary data to array and process the position
			
			for ( item in summary) {
				if  (summary.hasOwnProperty(item)) {
					summaryData.push(summary[item]);
				}
		
			}	
		
			createTable();
			

			
		},
	  
		error : function() {
			// do things here in case your data fetch fails.
			console.warn("error loading data");
		}
		
		
	});
	
	function addKey(){
		//console.log("add key " );
		//console.log(homeLegend);
		var chart
		, barHt = 8;
		
		
		// add legend to foot of chart
		chart = d3.select("div#legend")
					.append("svg")
		            .attr("width", 520)
		            .attr("height", 150)
		            .append("g");
		
		// HOME		
		legend = chart.selectAll("g.home")
			.data(homeLegend)
			.enter()
			.append("svg:g")
			.attr("class", "legend");

		legend.append("svg:rect")
			.attr("fill", function(d, i) {
			//console.log(d);
				return d.color;
				} )
		   .attr("x", function(d, i) {
			    return 10;  
			})
		   .attr("y", function(d, i) {
			    return (i* 20) + 4;  
			})
		   .attr("width", barHt-1)
		   .attr("height", barHt-1);

		legend.append("svg:text")
			.data(homeLegend)
			.attr("x", function(d, i) {
			    return 28;  
			})
		   .attr("y", function(d, i) {
			    return i*20+12;  
			})
		  // .attr("class", "title"  )
		   .text(function(d, i) {
					return d.title;
				});
				
		
		//AWAY			
		legend = chart.selectAll("g.away")
			.data(awayLegend)
			.enter()
			.append("svg:g")
			.attr("class", "legend");

		legend.append("svg:rect")
			.attr("fill", function(d, i) {
				//console.log(d);
				return d.color;
				} )
		   .attr("x", function(d, i) {
			    return 480;  
			})
		   .attr("y", function(d, i) {
			    return (i* 20) + 4;  
			})
		   .attr("width", barHt-1)
		   .attr("height", barHt-1);

		legend.append("svg:text")
			.data(awayLegend)
			.attr("x", function(d, i) {
			    return 470;  
			})
		   .attr("y", function(d, i) {
			    return i*20+12;  
			})
		   .attr("text-anchor", "end")
		   .text(function(d, i) {
					return d.title;
				});

	}


	
	function createTable () {
		//console.log("createTable");
		
		var w = 520
		, h = 800
		, barPadding = 4
		, barHt = 8
		, xPosn =20
		, xOffset = 200
		, dataset = ds
		, chart
		, lastTeam = 0
		
		
		, tooltip
		, time
		, description
		, pass
		, distance;
		
		
		tooltip = d3.select("div.tip");
		time = d3.select("span#time");
		description = d3.select("span#description");
		pass = d3.select("span#pass");
		distance = d3.select("span#distance");
				
			
		d3.select("svg").remove();
		//Create SVG element
		chart = d3.select("div#resultsTable")
		            .append("svg")
		            .attr("width", w)
		            .attr("height", h)
		            .append("g")
					.attr("transform", "translate(10,15)");
		            
		            
		chart.selectAll("rect")
			.data(summaryData)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
				return d.sec*barHt;  
				})
			.attr("y", function(d, i) {
				return d.min*barHt;  
				})
			.attr("width", barHt-1)
			.attr("height", barHt-1)
		   
			.attr("fill", function(d, i) {
				
				var color;
				
				if(d.team == "43"){
					color = awayColors.pass;
					lastTeam = d.team;
					awayPasses++;
					
					if(d.target=="Goal"){
						color = awayColors.goal;
					}
					if(d.target=="Miss"){
						color = awayColors.miss;
					}
					if(d.target=="Save"){
						color = awayColors.save;
					}
					
				} else if (d.team =="30"){
					color = homeColors.pass;
					lastTeam = d.team;
					homePasses++;
					
					if(d.target=="Goal"){
						color = homeColors.goal;
					}
					if(d.target=="Miss"){
						color = homeColors.miss;
					}
					if(d.target=="Save"){
						color = homeColors.save;
					}
					
				}else {
					if(lastTeam==43 ){
						color = awayColors.possession;
						awayPossn++;
						
					}else if (lastTeam==30){
						color = homeColors.possession;
						homePossn++;
					}else{
						color = neutralGreen;
						
					}
				}
				
				//fake yellow cards due to missing data
				 if ( d.min=="43" && d.sec=="13"  ){
						//console.log("yellow");
						d.player="Fabrice Muamba";
						d.target="Yellow Card";
						color = yellow;
					}
				
				if ( d.min=="43" && d.sec=="49" ){
						//console.log("yellow");
						d.player="Kevin Davies";
						d.target="Yellow Card";
						color = yellow;
					}
				
				
				//console.log(lastTeam);
				return color
			})
			.attr("time", function(d,i) {
				    return displayTime(d.min*60+d.sec);
			})
			.attr("pass", function(d,i) {
				    return d.target;
			})
			.attr("desc", function(d,i) {
				    return d.player;
			})
			.attr("distance", function(d,i) {
				    return d.distance;
			})
			
		
			.on("mouseover", function(){return tooltip.style("visibility", "visible");})
			
			.on("mousemove", function(){

				var xPosn = parseInt(this.getAttribute("x"), 10) + 340
				, yPosn = parseInt(this.getAttribute("y"), 10) + 240
				, dist = ""
				, passTxt = this.getAttribute("pass");
				
				if (this.getAttribute("distance") > 0)  {
					dist = this.getAttribute("distance") + " m";
				}
				
				if (passTxt.indexOf(",") > -1 ){
					passTxt = "to " + passTxt;
				}
				
				if (passTxt=="N" ){
					passTxt = "to no-one";
				}
				
				if (passTxt=="Goal" ){
					dist = "G O A L !";
				}
				
				if (passTxt=="Save" ){
					dist = "Save!";
				}
				
				if (passTxt=="Miss" ){
					dist = "Miss";
				}
				
				if (passTxt=="Yellow Card" ){
					dist = "Booking";
				}
				
				time.text(this.getAttribute("time") );
				description.text(this.getAttribute("desc"));
				pass.text( passTxt );
				distance.text( dist );
				//console.log(passTxt);
				if(passTxt==""){
					tooltip.style("visibility", "hidden")
				}else{
					//console.log(passTxt);
					tooltip.style("visibility", "visible");
				}
				return tooltip.style("top", yPosn+"px").style("left",xPosn+"px");

				})
				
			.on("mouseout", function(){return tooltip.style("visibility", "hidden");});

		addKey();
		
	}
	
		
	function displayTime(seconds) {
		var secs
		, mins;
		
		if( isNaN(seconds) ) {
			 seconds = 0;
		}
		
		mins = Math.floor(seconds/60);
		if (mins <10) {
			mins = "0" + mins;
		}
		secs = Math.round(seconds%60);
		if (secs <10) {
			secs = "0" + secs;
		}
	
		return ( mins+":"+secs );
	}




	
}());
	

