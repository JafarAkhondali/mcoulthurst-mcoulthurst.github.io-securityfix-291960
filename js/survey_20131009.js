var SRC = "../data/survey_locations.csv";
var color = d3.scale.category10();

var PINK = "#FA1387";

var margin = {top: 10, right: 10, bottom: 100, left: 40},
margin2 = {top: 430, right: 10, bottom: 20, left: 40},
width = 960 - margin.left - margin.right,
CHART_WIDTH = 820
height = 500 - margin.top - margin.bottom,
height2 = 500 - margin2.top - margin2.bottom;

var durationCounts = [0,0,0,0,0,0,0,0,0,0];
var durationUndefined = 0;

var calendar =[];
var interest = {};
var interestArray = [];
var age_females =[0,0,0,0,0,0,0,0,0,0,0,0];
var age_males =[0,0,0,0,0,0,0,0,0,0,0,0];
var age_unknown =[0,0,0,0,0,0,0,0,0,0,0,0];
var demographicArray =[];

var locations = {};

var records;
var countryFltr;
var genderFltr;
var ageFltr;
var durationFltr;
var interestFltr;

var ageBands = 5;
var format = d3.time.format("%m/%Y");

var filterList = {};

function compare(a,b) {
  if (a.value < b.value)
   return 1;
 if (a.value > b.value)
  return -1;
return 0;
}


d3.csv(SRC, function(error, data) {

  var now = new Date();
  var startTime = new Date(2013,2,19,8,0,0);
  var count = 0;
  var group = 0;
  var namesList = [ ];
  namesList[0] = [];


    // CROSSFILTER
    records = crossfilter(data);
    countryFltr = records.dimension(function (d) { return d.Country;});
    genderFltr = records.dimension(function (d) { return d.Gender;});
    ageFltr = records.dimension(function (d) { return d.Age;});
    interestFltr = records.dimension(function (d) { return d.Interest;});
    durationFltr = records.dimension(function (d) { 

      var dateStamp = format.parse(d.StartDate);

      if(d.StartDate==="" || dateStamp===null){
        console.log("blank");
        dateStamp = now;

        //convert date object to
      }

      var milliseconds = dateStamp.getTime();
      return milliseconds; 
    });




    //console.log( startTime );
    data.forEach(function(d) {

      if(d.Username!=""){
        count++;
        if(count>100){
         // console.log(namesList[group] );
         count=0;
         group++;
         namesList[group] =[];
       }
       namesList[group].push(d.Username)
        //console.log(count++);
      }
      format = d3.time.format("%m/%Y");
      d.year = format.parse(d.StartDate);

      if(d.StartDate!==""){
        var duration = Math.round( (now - d.year)/ (365.25 * 86400000) );
        d.duration = parseInt( duration );

        if(!durationCounts[d.duration]){
          durationCounts[d.duration] = 0;

        }
        durationCounts[d.duration] = durationCounts[d.duration] + 1;

      }else{
        durationUndefined++;
      }

      //timestamp 19/03/2013 08:36:48
      var format = d3.time.format("%d/%m/%Y %X");
      d.time = format.parse(d.Timestamp);
      //console.log( "1" + d.Timestamp + ": "  + d.time  );



      // INTEREST / FOCUS

      // loop through and collate each interest group and add up the totals
      if(d.Interest===""){
        d.Interest = "Unanswered";

      }
      if(!interest[d.Interest]){
        interest[d.Interest] = 0;

      }
      interest[d.Interest]++;


      // LOCATION

      // loop through and collate each interest group and add up the totals
      if(d.Country===""){
        d.Country = "Unknown";
      }
      if(!locations[d.Country]){
        locations[d.Country] = 0;
      }
      locations[d.Country]++;



      

      // CALENDAR
      //creates an object with entry for eah hour ater the start of the survey
      // eg
      // calendar[0] = 3;
      // calendar[1] = 53;
      // calendar[2] = 73;

      // loop through and assign each record to the nearest hour slot
      var temp = d.time - startTime;
      //console.log(temp);
      var timeDiff = Math.floor ( (d.time - startTime) / 3600000) ;
      
      //start 19/03/2013 08:36:48
      if(!calendar[timeDiff]){
        calendar[timeDiff] = 0;

      }
      calendar[timeDiff] = calendar[timeDiff] + 1;





      // AGE DEMOGRAPHIC

      // loop through and assign each record to the nearest age group by gender
      var ageGroup = Math.floor ( d.Age/ageBands );
      
      if(d.Age>0){
        if (d.Gender==="Male"){
          age_males[ageGroup]++;

        }else if (d.Gender==="Female"){
          age_females[ageGroup]++;

        }else{
          age_unknown[ageGroup]++;

        }
      }


      
    });


console.log("calendar");
console.log(calendar);
console.log( namesList[namesList.length-1] );

    // TIDY UP CALENDER DATA
    var length = calendar.length;

    for ( i=0;i<length; i++){
      if( !calendar[i] ){
        calendar[i] = 0;
      }

    };

    // TIDY UP DURATION DATA
    var length = durationCounts.length;

    for ( i=0;i<length; i++){
      if( !durationCounts[i] ){
        durationCounts[i] = 0;
      }

    };


    //console.log(durationCounts);

    var locationsArray= [{id:0, name:"other", value:0}];  //set initial value to catch all the small units: "other"


    // convert to array
    var counter = 1;
    for (d in locations) {

      var obj ={};
      obj.name = d;
      obj.value = locations[d];
      obj.id = counter;
      locationsArray.push(obj);
      counter++;

    }

    locationsArray.sort(compare);

    // convert to array
    var counter =0;
    for (d in interest) {

      var obj ={};
      obj.name = d;
      obj.value = interest[d];
      obj.id = counter;
      interestArray.push(obj);
      counter++;

    }



    // demographicArray [id, unknown, males, females] for each 10-year group
    var length = age_males.length;
    for ( var i=0; i<length;i++){

      var obj = [];
      obj[0] = i;
      obj[1] = age_unknown[i];
      obj[2] = age_males[i];
      obj[3] = age_females[i];
      demographicArray.push(obj);

    }
    //console.log(demographicArray);







    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // DRAW THE CHARTS
    //
    /////////////////////////////////////////////////////////////////////////////////////////

    var hoursInWeek = 168;
    var m = [10, 10, 20, 29]; // margins
    var w = CHART_WIDTH ;
    var h = 200;
    var x = d3.scale.linear()

    .domain([0, hoursInWeek]) 
    .range([0, w]);

    var y = d3.scale.linear()
    .domain([100, 0])
    .rangeRound([0, h]);

     //console.log("calender w " + (barWidth * calendar.length) );

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
      // assign the X function to plot our line as we wish
      .x(function(d,i) { 
        // verbose logging to show what's actually being done
        //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
        // return the X coordinate where we want to plot this datapoint
        return x(i); 
      })
      .y(function(d) { 
        // verbose logging to show what's actually being done
       // console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
        // return the Y coordinate where we want to plot this datapoint
        return y(d); 
      })

      // Add an SVG element with the desired dimensions and margin.
      var graph = d3.select("div#calender").append("svg:svg")
      .attr("width", w - m[1] - m[3])
      .attr("height", h + m[0] + m[2])
      .append("svg:g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

      // create yAxis
      var xAxis = d3.svg.axis().scale(x)
      .tickValues( calendar.map(function(d, i) {
        //console.log(d, i);
        return Math.round(i/24) * 24;
      }) )
      .tickSize(-h);

      // Add the x-axis.
      graph.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);


      // create left yAxis
      //var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
      //var yAxisLeft = d3.svg.axis().scale(y).tickValues(10);

      var yAxisLeft = d3.svg.axis().scale(y)
      .tickValues( calendar.map(function(d, i) {
        //console.log(d, i);
        return Math.round(i/20) * 20;
      }) )
      .tickSize(-w)
      .orient("left")
      ;


      // Add the y-axis to the left
      graph.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + 0 + ",0)")
      .call(yAxisLeft);
      
        // Add the line by appending an svg:path element with the data line we created above
      // do this AFTER the axes above so that the line is above the tick-lines
      graph.append("svg:path").attr("d", line(calendar));










    // EXPERIENCE
    var w = 700;//CHART_WIDTH;
    var h = 400;
    var barWidth = 10;
    var PADDING =2;
    var maxm = Math.max.apply(null, durationCounts);
    var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, w]);
    //console.log(maxm);
    var y = d3.scale.linear()
    .domain([0, 250])
    .rangeRound([0, h]);


    var durationChart = d3.select("div#experience").append("svg")
    .attr("class", "chart")
    .attr("width", w )
    .attr("height", h);

     // create the bar chart
     var bar = durationChart.selectAll("rect")
     .data(durationCounts)
     .enter().append("rect")
     .attr("x", function(d, i) { return (i*barWidth)+PADDING })
     .attr("y", function(d) { 
         //   console.log(d);
         return h - y(d) - 55; 
       })
     .attr("width", barWidth)
     .style("fill", PINK)
     .attr("id", function(d,i) { 
      return "bar"+i; 
    })
     .attr("selected", function(d,i) { 
      return false; 
    })
     .attr("height", function(d) { 
           // console.log(d);
           return y(d); 
         })


        /////////////////////////////////////////////////////////////////////////////////////////

        .on("click", function (d, i){
          // get the state of this element first
          var elem = d3.select(this);
          var slcted = elem.attr("selected");

          // clear any/all existing selection for this chart
          bar.attr("selected", "false");
          bar.style("fill", PINK);

          // toggle the selection
          if(slcted==="true"){
            elem.attr("selected", "false"); 
            filterList.duration = "";
          }else{
            elem.attr("selected", "true"); 
            elem.style("fill", "#B0171F");
            filterList.duration = i;
          }

          // apply filters
          var now = new Date().getTime();
          var newStartDate = new Date( (now-(i*365.25 * 86400000) ) );
          var start = newStartDate.getTime();
          
          updateTitle();

          durationFltr.filter( function(d) {
            return d <= start;
          });

          displayAccounts(durationFltr.top(Infinity));

        })


        .on("mouseover", function(d,i) {
          console.log("over" + d +": " +i);
          var bar = d3.select(this);
          bar.style("fill", "#eee");


          displayExperience(d, d);
        })


        .on("mouseout",  function(d,i) {
          var elem = d3.select(this);
          var slcted = elem.attr("selected");

          if(slcted==="true"){
            elem.style("fill", "#B0171F"); 
          }else{
            elem.style("fill", PINK); 
          }
        });

        durationChart.on("mousemove", function(d,i) {
          bar.style("fill", PINK);
          cx = d3.mouse(this)[0];
          cy = d3.mouse(this)[1];

          idx = Math.round( cx/barWidth);
          var item = "#bar"+idx
          //console.log("over " + item);

          var elem = d3.select(item);
          elem.style("fill", "#fff");

          console.log("durationCounts " + durationCounts[idx] + " for " + idx);

          displayExperience(durationCounts[idx], idx);
        })

        /////////////////////////////////////////////////////////////////////////////////////////


      function displayExperience(count, i){
        var response="Experience: ";

        if(count===0){
          response += "No-one has ";
        }else if(count===1){
          response += "One person has ";
        }
        else{
          response += count + " people have ";
        }

        if(i==0){
          response += "less than a years experience."
        }else{
          response += i + " years experience."
        }



        $("#experienceTitle").text(response);

      }

      // create yAxis
      var xAxis = d3.svg.axis().scale(x)
      .tickValues( durationCounts.map(function(d, i) {
        var step = 7*i/100;//Math.round(i/100)*5
        //console.log(step);
        return step;
      }) )
      .tickSize(10);

      // Add the x-axis.
      durationChart.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (h-50) + ")")
      .call(xAxis);


      // create left yAxis
      //var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
      var yAxisLeft = d3.svg.axis().scale(y).ticks(4).tickSize(-w)
      .orient("left");
/*
      var yAxisLeft = d3.svg.axis().scale(y)
      .tickValues( durationCounts.map(function(d, i) {
        console.log(d, i +": " +Math.round(d/10) * 10);
        return Math.round(d/10) * 10;
      }) )
      .tickSize(-w)
      .orient("left")
      ;

*/
      // Add the y-axis to the left
      durationChart.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + 0 + ",0)")
      .call(yAxisLeft);







    //POPULATION STACKED BAR DEMOGRAPHIC

    var w = CHART_WIDTH,
    h = 150,
      barHt = 10;//100/ageBands;

      // create canvas
      var stack_svg = d3.select("div#demographic").append("svg")
      .attr("class", "chart")
      .attr("width", w)
      .attr("height", h )
      .append("svg:g")
      .attr("transform", "translate(10,150)");


      x = d3.scale.ordinal().rangeRoundBands([0, h])
      y = d3.scale.linear().range([0, (w-10)/2])
      z = d3.scale.ordinal().range(["black", "Lightsteelblue", "lightpink"]) // eg unknown, males, females


      var remapped =["c1","c2","c3"].map(function(dat,i){
        return demographicArray.map(function(d,ii){
          return {x: ii, y: d[i+1] };
        })
      });

      var stacked = d3.layout.stack()(remapped)
      console.log(stacked)

      x.domain(stacked[0].map(function(d) { return d.x; }));
      y.domain([0, d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })]);


      // Add a group for each column.
      var valgroup = stack_svg.selectAll("g.valgroup")
      .data(stacked)
      .enter().append("svg:g")
      .attr("class", "valgroup")
      .style("fill", function(d, i) { 
        return z(i); 
      })
      .style("stroke", "#f00")

        // Add a rect for each date.
        var rect = valgroup.selectAll("rect")
        .data(function(d,i){return d;})
        .enter()
        .append("svg:rect")
        .attr("x", function(d,i) { 
          if(d.y0-d.y>0){
            return ( (w/4+10) - y(d.y) -50)
          }
          return w/4 + 10 -50
        })
        .attr("y", function(d) {
          return - (d.x) * (barHt+2); 
        })
        .attr("selected", false)
        .attr("height", barHt)
        .attr("width", function(d) { 
          if(d.y){ 
            return y(d.y);
          }else{
            return 0;
            
          }

        })


        /////////////////////////////////////////////////////////////////////////////////////////

        .on("click", function (d, i){

          console.log("pyramid");
          // get gender
          var gender
          //console.log(d, i);
          //console.log( d.y0-d.y );
          if(d.y0-d.y>0){
            gender = "Female";
          }else{
            gender = "Male";
          }

          // get the age range
          var start = d.x*ageBands;
          var end = d.x*ageBands + (ageBands-1);
          //console.log("find " + gender + "s in age bracket " + start + "-" + end )

          // get the state of this element first
          var elem = d3.select(this);
          var slcted = elem.attr("selected");

          // clear any/all existing selection for this chart
          rect.attr("selected", "false");
          rect.style("fill", function(d,i){
            z(i);
          });

          // toggle the selection
          if(slcted==="true"){
            elem.attr("selected", "false"); 
            filterList.gender = "";
            filterList.startAge = "";
            filterList.endAge = "";
          }else{
            elem.attr("selected", "true"); 
            elem.style("fill", "#B0171F");
            filterList.gender = gender;
            filterList.startAge = start;
            filterList.endAge = end;
          }

          // apply filters
          updateTitle();

          ageFltr.filter( function(d) {
            return d >= start && d<=end;
          });

          genderFltr.filter(gender);

          displayAccounts(genderFltr.top(Infinity));

        })


.on("mouseover", function(d,i) {
  var bar = d3.select(this);
  bar.style("fill", "#eee");

})


.on("mouseout",  function(d,i) {
  var elem = d3.select(this);
  var slcted = elem.attr("selected");

  if(slcted==="true"){
    elem.style("fill", "#B0171F"); 
  }else{
    elem.style("fill", function(d,i){
      z(i);
    }); 
  }
});

        /////////////////////////////////////////////////////////////////////////////////////////
//TODO: is this in the right place?
        $(".content").mCustomScrollbar();

      });




    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // DRAW THE PIE CHART OF INTEREST(!)
    //
    /////////////////////////////////////////////////////////////////////////////////////////


  var width = 100,
  height = 100,
  radius = Math.min(width, height) / 2;
  var colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
  var color = d3.scale.ordinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
  .outerRadius(radius)
  .innerRadius(0);

  var pie = d3.layout.pie()
  .sort(null)
  .value(function(d) { return d.value; });

  console.log("draw pie");

  var svg = d3.select("div#focus").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
  .data(pie(interestArray))
  .enter().append("g")
  .attr("class", "arc");

  var path =  g.append("path")
  .attr("d", arc)
  .attr("selected", false)
  .style("fill", function(d,i) { 
         // console.log(d); 
         return colors[d.data.id]; 
       });

  g.append("text")
  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
  .attr("dy", ".35em")
  .style("text-anchor", "middle")
  .text(function(d) { 
          //console.log(d);
          //return d.data.name; 
        })

        /////////////////////////////////////////////////////////////////////////////////////////
        path.on("mouseover", function(d,i) {
          var bar = d3.select(this);

          //console.log(bar);
          bar.style("fill", "#eee");
          //console.log(d);
        })


        path.on("mouseout",  function(d,i) {
          var elem = d3.select(this);
          var slcted = elem.attr("selected");

          if(slcted==="true"){
            elem.style("fill", "#B0171F"); 
          }else{
            elem.style("fill", function(d,i) { 
              return colors[d.data.id]; 
            }); 
          }

        });


        path .on("click", function (item, i){
          // get the state of this element first
          var elem = d3.select(this);
          var slcted = elem.attr("selected");

          // clear any/all existing selection for this chart
          path.attr("selected", "false");
          path.style("fill", function(d,i) { 
            return colors[d.data.id]; 
          });

          // toggle the selection
          if(slcted==="true"){
            elem.attr("selected", "false"); 
            filterList.interest = "";
          }else{
            elem.attr("selected", "true"); 
            elem.style("fill", "#B0171F");
            filterList.interest = item.data.name;
          }

          // apply filters
          updateTitle();
          
          interestFltr.filter( function(d) {
            return d === item.data.name;
          });

          displayAccounts(interestFltr.top(Infinity));

        });



        /////////////////////////////////////////////////////////////////////////////////////////









function displayAccounts(people){
  console.log("Display accounts");
  $("#list").empty();
  var length = people.length;

  for ( i=0;i<length; i++){

    if(people[i].Username){
        //console.log(people[i].Username + ", " + people[i].StartDate + ", age: " + people[i].Age + ", location: " + people[i].Country+ ", color: " + people[i].color);
        $("#list").append("<li>" + people[i].Username + "</li>")
      }

    };

    $(".content").mCustomScrollbar("update");
  }


  function updateTitle() {
    console.log(filterList);
    var title = "Filter: ";
    if(filterList.gender){
      title += filterList.gender + " aged " + filterList.startAge + "-" + filterList.endAge + " ";
    }
    if(filterList.duration){
      title += "with " + filterList.duration + " years experience ";
    }
    if(filterList.interest){
      title += "whose interest is '" + filterList.interest.toLowerCase() + "' ";
    }
    if(filterList.calendar){
      title += "who signed up after " + filterList.calendar;
    }

    $("#titleBlock").text( title );
  }


  function brushed() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    focus.select("path").attr("d", area);
    focus.select(".x.axis").call(xAxis);
  }