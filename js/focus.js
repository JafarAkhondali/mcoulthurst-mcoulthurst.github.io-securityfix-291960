var SRC = "../data/cleanSurvey.csv";
var color = d3.scale.category20();

var PINK = "#FA1387";
var LIGHT_PINK ="#feb9dc";
var BLUE = "#0D0177";

var margin = {top: 10, right: 10, bottom: 100, left: 40},
margin2 = {top: 430, right: 10, bottom: 20, left: 40},
width = 960 - margin.left - margin.right,
CHART_WIDTH = 820
height = 500 - margin.top - margin.bottom,
height2 = 500 - margin2.top - margin2.bottom;

var durationCounts = [0,0,0,0,0,0,0,0,0,0];
var durationUndefined = 0;

var calendar =[];
var calendarArray =[];
var interest = {};
var interestArray = [];
var age_females =[0,0,0,0,0,0,0,0,0,0,0,0];
var age_males =[0,0,0,0,0,0,0,0,0,0,0,0];
var age_unknown =[0,0,0,0,0,0,0,0,0,0,0,0];
var demographicArray =[];
var focus = {};
var focusArray = [];

var locations = {};

var records;
var countryFltr;
var genderFltr;
var ageFltr;
var durationFltr;
var interestFltr;

var dayCount =0;
var ageBands = 5;
var format = d3.time.format("%m/%Y");

var filterList = {};


var newFocus = [];
var newFocusArray = [];

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
    interestFltr = records.dimension(function (d) { return d.Extent;});
    durationFltr = records.dimension(function (d) { 

      var dateStamp = format.parse(d.Interest);
      if(d.Interest==="" || dateStamp===null){
       // console.log("blank");
       dateStamp = now;

        //convert date object to
      }

      var milliseconds = dateStamp.getTime();
      return milliseconds; 
    });




    //console.log( startTime );
    data.forEach(function(d) {

      //quick function to generate user list for twitter lookup
      if(d.Twitter!=""){
        count++;
        if(count>100){
          // console.log(namesList[group]);
          count=0;
          group++;
          namesList[group] =[];
        }
        namesList[group].push(d.Twitter)
        //console.log(count++);
      }




      format = d3.time.format("%d/%m/%Y");
      d.year = format.parse(d.Interest);

      if(d.Interest!==""){
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



      // EXTENT OF INTEREST
      // loop through and collate each interest group and add up the totals
      if(d.Extent===""){
        d.Extent = "Unanswered";

      }
      if(!interest[d.Extent]){
        interest[d.Extent] = {};
        interest[d.Extent].total = 0;
        interest[d.Extent].twit = 0;
        interest[d.Extent].none = 0;

      }

      if(d.Twitter!==""){
        interest[d.Extent].twit++;
      }else{
        interest[d.Extent].none++;
      }

      interest[d.Extent].total++;


      // LOCATION

      // loop through and collate each interest group and add up the totals
      if(d.Country===""){
        d.Country = "Unknown";
      }
      if(!locations[d.Country]){
        locations[d.Country] = 0;
      }
      locations[d.Country]++;

      
      // FOCUS

      if(d.Focus===""){
        d.Focus = "Unanswered";
      }
      var tempSplit = d.Focus.split(", ");
      // loop through each entry and collate each Focus group and add up the totals
      var iFocus =0;
      var lenFocus = tempSplit.length;

      for ( i=0; i<lenFocus; i++){

        var item = tempSplit[i];


        if(item!="Academic/Research" && item != "Art/Experimentation" && item!=="Commercial/Business"){
          item="Other";
          
          //console.log(tempSplit);
          //console.log(d.Focus);
          tempSplit[i] = "Other";
          
        }

        if(!focus[item]){
          focus[item] = 0;
        }

        focus[item]++;
        
//console.log(d.Focus);

}

      // make a new copy of the focus with 'other'
      newFocus.push(tempSplit.join(", "));

      



      

      // CALENDAR
      //creates an object with entry for each hour after the start of the survey
      // eg
      // calendar[0] = 3;
      // calendar[1] = 53;
      // calendar[2] = 73;

      // loop through and assign each record to the nearest hour slot
      var temp = d.time - startTime;
      //console.log(temp);
      var timeDiff = Math.floor ( (d.time - startTime) / 3600000) ;
      var dayCount = Math.floor( timeDiff / 24);

      var hourCount = timeDiff - (dayCount*24);


      //console.log("new day " + dayCount + ": hour " + hourCount);
      
      //start 19/03/2013 08:36:48
      if(!calendar[dayCount]) {
        calendar[dayCount] = [];
      }

      if(!calendar[dayCount][hourCount]){
        calendar[dayCount][hourCount] = 0;
      }

      calendar[dayCount][hourCount]++;








      // AGE DEMOGRAPHIC
//console.log( "d.Age " + d.Age );
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


/*
console.log("calendar");
console.log(calendar);
console.log( namesList[namesList.length-1] );
*/
//console.log( age_males );
//console.log( age_females );
//console.log( newFocus );


    // loop through new focus and sum up via a new OBJECT
    var focusCounts = {};
    var len = newFocus.length;

    for ( i=0; i<len; i++){

      var item = newFocus[i];
      //console.log(item);
      if (!focusCounts[ item ]){
        focusCounts[ item ]=0;
      }
      focusCounts[ item ]++;

    }
    //now loop through OBJECT and create array as data for D3
    for ( item in focusCounts){
      //console.log(item);
      var temp = [];
      temp[0] = item;
      temp[1] = focusCounts[item];

      newFocusArray.push(temp);
    }
    newFocusArray.sort(function(a, b) {return b[1] - a[1]})
    //console.log( newFocusArray );


    //now loop through basic focus OBJECT and create array as data for D3
    for ( item in focus){
      //console.log(item);
      var temp = [];
      temp[0] = item;
      temp[1] = focus[item];

      focusArray.push(temp);
    }
    focusArray.sort(function(a, b) {return b[1] - a[1]});


    var fLength = newFocusArray.length;
    


    // create constants
    var BUSINESS = "Commercial/Business";
    var RESEARCH = "Academic/Research";
    var ART = "Art/Experimentation";
    var OTHER = "Other";

    var maxStep =[];
    var dnaName =[];
    // create dna array in set format
    var dnaArray = [];
    dnaArray[0] = [BUSINESS];
    dnaArray[1] = [RESEARCH];
    dnaArray[2] = [ART];
    dnaArray[3] = [OTHER];

    var hasBus = false;
    var hasArt = false;
    var hasRes = false;
    var hasOth = false;

    //Process the newFocusArray and split the items into component counts for bus, art, acad, other
    for (i=0; i<fLength; i++){

      hasBus = false;
      hasArt = false;
      hasRes = false;
      hasOth = false;

      //console.log("got business? " + newFocusArray[i][0].indexOf("Commercial/Business")  +":" + newFocusArray[i][0]);

      if(newFocusArray[i][0].indexOf(BUSINESS)>-1){
        hasBus = true;
      }
      if(newFocusArray[i][0].indexOf(ART)>-1){
        hasArt = true;
      }
      if(newFocusArray[i][0].indexOf(RESEARCH)>-1){
        hasRes = true;
      }
      if(newFocusArray[i][0].indexOf(OTHER)>-1){
        hasOth = true;
      }

      //console.log(newFocusArray[i] + ", " + hasBus + ", " + hasArt+ ", " + hasRes+ ", " + hasOth);


      if(hasBus && hasRes && hasArt && hasOth){
        dnaArray[0][1] = newFocusArray[i][1];
        dnaArray[1][1] = newFocusArray[i][1];
        dnaArray[2][1] = newFocusArray[i][1];
        dnaArray[3][1] = newFocusArray[i][1];
        maxStep[0] = newFocusArray[i][1];
        dnaName[0] = newFocusArray[i][0];
      }
      

      //////////////////////////////////////////
      if(hasBus && hasRes && hasArt && !hasOth){
        dnaArray[0][2] = newFocusArray[i][1];
        dnaArray[1][2] = newFocusArray[i][1];
        dnaArray[2][2] = newFocusArray[i][1];
        dnaArray[3][2] = 0; 
        maxStep[1] = newFocusArray[i][1];
        dnaName[1] = newFocusArray[i][0];
      }
      
      if(hasBus && hasRes && !hasArt && hasOth){
        dnaArray[0][3] = newFocusArray[i][1];
        dnaArray[1][3] = newFocusArray[i][1];
        dnaArray[2][3] = 0;
        dnaArray[3][3] = newFocusArray[i][1];
        maxStep[2] = newFocusArray[i][1];
        dnaName[2] = newFocusArray[i][0];
      }
      
      if(hasBus && !hasRes && hasArt && hasOth){
        dnaArray[0][4] = newFocusArray[i][1];
        dnaArray[1][4] = 0;
        dnaArray[2][4] = newFocusArray[i][1];
        dnaArray[3][4] = newFocusArray[i][1];
        maxStep[3] = newFocusArray[i][1];
        dnaName[3] = newFocusArray[i][0];
      }
      
      if(!hasBus && hasRes && hasArt && hasOth){
        dnaArray[0][5] = 0;
        dnaArray[1][5] = newFocusArray[i][1];
        dnaArray[2][5] = newFocusArray[i][1];
        dnaArray[3][5] = newFocusArray[i][1];
        maxStep[4] = newFocusArray[i][1];
        dnaName[4] = newFocusArray[i][0];
      }
      //////////////////////////////////////////

      //////////////////////////////////////////
      if(hasBus && hasRes && !hasArt && !hasOth){
        dnaArray[0][6] = newFocusArray[i][1];
        dnaArray[1][6] = newFocusArray[i][1];
        dnaArray[2][6] = 0;
        dnaArray[3][6] = 0;
        maxStep[5] = newFocusArray[i][1];
        dnaName[5] = newFocusArray[i][0];
      }
      
      if(hasBus && !hasRes && hasArt && !hasOth){
        dnaArray[0][7] = newFocusArray[i][1];
        dnaArray[1][7] = 0;
        dnaArray[2][7] = newFocusArray[i][1];
        dnaArray[3][7] = 0;
        maxStep[6] = newFocusArray[i][1];
        dnaName[6] = newFocusArray[i][0];
      }
      
      if(hasBus && !hasRes && !hasArt && hasOth){
        dnaArray[0][8] = newFocusArray[i][1];
        dnaArray[1][8] = 0;
        dnaArray[2][8] = 0;
        dnaArray[3][8] = newFocusArray[i][1];
        maxStep[7] = newFocusArray[i][1];
        dnaName[7] = newFocusArray[i][0];
      }
      
      if(!hasBus && hasRes && hasArt && !hasOth){
        dnaArray[0][9] = 0;
        dnaArray[1][9] = newFocusArray[i][1];
        dnaArray[2][9] = newFocusArray[i][1];
        dnaArray[3][9] = 0;
        maxStep[8] = newFocusArray[i][1];
        dnaName[8] = newFocusArray[i][0];
      }

      if(!hasBus && hasRes && !hasArt && hasOth){
        dnaArray[0][10] = 0;
        dnaArray[1][10] = newFocusArray[i][1];
        dnaArray[2][10] = 0;
        dnaArray[3][10] = newFocusArray[i][1];
        maxStep[9] = newFocusArray[i][1];
        dnaName[9] = newFocusArray[i][0];
      }

      if(!hasBus && !hasRes && hasArt && hasOth){
        dnaArray[0][11] = 0;
        dnaArray[1][11] = 0;
        dnaArray[2][11] = newFocusArray[i][1];
        dnaArray[3][11] = newFocusArray[i][1];
        maxStep[10] = newFocusArray[i][1];
        dnaName[10] = newFocusArray[i][0];
      }
      //////////////////////////////////////////

            
      //////////////////////////////////////////
      if(hasBus && !hasRes && !hasArt && !hasOth){
        dnaArray[0][12] = newFocusArray[i][1];
        dnaArray[1][12] = 0;
        dnaArray[2][12] = 0;
        dnaArray[3][12] = 0;
        maxStep[11] = newFocusArray[i][1];
        dnaName[11] = newFocusArray[i][0];
      }
      
      if(!hasBus && hasRes && !hasArt && !hasOth){
        dnaArray[0][13] = 0;
        dnaArray[1][13] = newFocusArray[i][1];
        dnaArray[2][13] = 0;
        dnaArray[3][13] = 0;
        maxStep[12] = newFocusArray[i][1];
        dnaName[12] = newFocusArray[i][0];
      }

      if(!hasBus && !hasRes && hasArt && !hasOth){
        dnaArray[0][14] = 0;
        dnaArray[1][14] = 0;
        dnaArray[2][14] = newFocusArray[i][1];
        dnaArray[3][14] = 0
        maxStep[13] = newFocusArray[i][1];
        dnaName[13] = newFocusArray[i][0];
      }

      if(!hasBus && !hasRes && !hasArt && hasOth){
        dnaArray[0][15] = 0;
        dnaArray[1][15] = 0;
        dnaArray[2][15] = 0;
        dnaArray[3][15] = newFocusArray[i][1];
        maxStep[14] = newFocusArray[i][1];
        dnaName[14] = newFocusArray[i][0];
      }
      //////////////////////////////////////////


    }

    console.log(dnaArray);





    // TIDY UP CALENDER DATA
    var daysLength = calendar.length;
    var length = 24;

    for ( i=0;i<daysLength; i++){
      for ( j=0;j<length; j++){
        if( !calendar[i][j] ){
          calendar[i][j] = 0;
        }
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


    // LOCATIONS convert to array
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



    //move EXTENT interest to array and sort:
    var sortedInterests = [];
    for (var item in interest){
      sortedInterests.push([item, interest[item]]);
    }
    sortedInterests.sort(function(a, b) {return b[1].total - a[1].total})

    //console.log(sortedInterests);
    var extents = [];
    var extentNames = [];
    // EXTENT interest convert to array
   // var counter =0;
   for (d in sortedInterests) {

    var obj ={};
    obj.name = sortedInterests[d][0];
    obj.value = sortedInterests[d][1];
    obj.id = d;

    var temp =[];
    temp[0] = sortedInterests[d][0];
    temp[1] = sortedInterests[d][1].twit;
    temp[2] = sortedInterests[d][1].none;
    temp[3] = sortedInterests[d][1].total;




    interestArray.push(temp);
    extents.push(sortedInterests[d][1]);    // the object with counts
    extentNames.push(sortedInterests[d][0]);  // the name
      //counter++;

    }
    //console.log(interestArray);





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



/*
    //Convert FOCUS obj to array and sort:
    var sortedFocus = [];
    for (var item in focus){
      sortedFocus.push([item, focus[item]]);
    }
    sortedFocus.sort(function(a, b) {return b[1].total - a[1].total})

    //console.log(sortedFocus);
    var focusValues = [];
    var focusNames = [];
    // EXTENT interest convert to array
   // var counter =0;
   for (d in sortedFocus) {

    var obj ={};
    obj.name = sortedFocus[d][0];
    obj.value = sortedFocus[d][1].total;
    obj.id = d;

    var temp =[];
    temp[0] = sortedFocus[d][0];
    temp[1] = sortedFocus[d][1].twit;
    temp[2] = sortedFocus[d][1].none;
    temp[3] = sortedFocus[d][1].total;

    focusArray.push(temp);
    focusValues.push(sortedFocus[d][1]);  // the object
    focusNames.push(sortedFocus[d][0]); // the nanme
      //counter++;

    }
    //console.log(focusArray);
*/



    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // DRAW THE CHARTS
    //
    /////////////////////////////////////////////////////////////////////////////////////////

    var hoursInWeek = 168;
    var m = [10, 10, 20, 29]; // margins
    var w = 800;//CHART_WIDTH ;
    var h = 200;
       // x = d3.scale.linear().domain([ 0, hoursInWeek ]).range([0, w]),
       // y = d3.scale.linear().domain([100, 0]).range([0, h]);

       var x = d3.scale.linear()
       .domain([0, 23]) 
       .range([0, (w - m[1] - m[3] - m[3])]);

       var y = d3.scale.linear()
       .domain([100, 0])
       .rangeRound([0, h]);

       //console.log(color);

       var graph = d3.select("div#calender").append("svg:svg")
       .data(calendar)
       .attr("width", w - m[1] - m[3])
       .attr("height", h + m[0] + m[2])

       .append("svg:g")
       .attr("transform", "translate(" + m[3] + "," + m[0] + ")");




      // create yAxis
      var xAxis = d3.svg.axis().scale(x)
      .tickValues( calendar[0].map(function(d, i) {
        //console.log(d, i);
          return i;//Math.round(i/24) * 24;
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
        return i * 20;
      }) )
      .tickSize(-w)
      .orient("left")
      ;


      // Add the y-axis to the left
      graph.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + 0 + ",0)")
      .call(yAxisLeft);
      


      var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d,i) { return x(i); })
      .y(function(d) { 
            //console.log(d);
            return y(d); 
          });



      graph.selectAll(".line")
      .data(calendar)
      .enter()
      .append("svg:path")
      .attr("class", "line")
      .attr("fill", LIGHT_PINK)
      .attr("stroke", function(d,i){
        return color(i)
      })
      .attr("stroke-width", 1)
      .attr("d", line);






    // EXPERIENCE

    var m = [10, 10, 20, 30]; // margins: top, right, bottom, left
    var w = 800;
    var h = 400;
    var barWidth = 10;
    var PADDING =2;

    var maxCount = 250;
    var maxAge = 70;
    
    var x = d3.scale.linear()
    .domain([0, 70])
    .range([0, 700]);
    
    var y = d3.scale.linear()
    .domain([0, maxCount])
    .rangeRound([h, 0]);

    var durationChart = d3.select("div#experience").append("svg")
    .attr("class", "chart")
    .attr("width", w - m[1] - m[3])
    .attr("height", h + m[0] + m[2])
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


    xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(5).tickPadding(5)

      // Add the x-axis.
      durationChart.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

      yAxis = d3.svg.axis().scale(y)
      .orient("left")
      .ticks(5)
      .tickSize(-w)
      .tickPadding(5);

      // Add the y-axis to the left
      durationChart.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + 0 + ",0)")
      .call(yAxis);




     // create the bar chart
     var bar = durationChart.selectAll("rect")
     .data(durationCounts)
     .enter().append("rect")
     .attr("x", function(d, i) { return (i*barWidth)+PADDING })
     .attr("y", function(d) { 
         //   console.log(d);
         return y(d) ; 
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
           return h-y(d); 
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
          cx = d3.mouse(this)[0] - PADDING;
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
          var response="Years of Experience: ";
          if(count>=0){
            if(count===0){
              response += "No-one has ";
            }else if(count===1){
              response += "One person has ";
            }
            else {
              response += count + " people have ";
            }

            if(i==0){
              response += "less than a years experience."
            }else{
              response += i + " years experience."
            }



            $("#experienceTitle").text(response);
          }
        }








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
      z = d3.scale.ordinal().range(["black", BLUE, PINK]) // eg unknown, males, females


      var remapped =["c1","c2","c3"].map(function(dat,i){
        return demographicArray.map(function(d,ii){
          return {x: ii, y: d[i+1] };
        })
      });

      var stacked = d3.layout.stack()(remapped)
      //console.log(stacked)

      //demographicArray[i, age_unknown, age_males, age_females] 
      //console.log(demographicArray)

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
  var gndr = 0;
  var bar = d3.select(this);
  bar.style("fill", "#fff");

  console.log( d, i);

          //console.log( d.y0-d.y );
          if(d.y0-d.y>0){
            gender = "women";
            gndr = 3;
          }else{
            gender = "men";
            gndr = 2;
          }
          //console.log(gender);
          var start = d.x*ageBands;
          var end = d.x*ageBands + (ageBands-1);
          console.log("find " + gender + " in age bracket " + start + "-" + end )

        //get count
        //console.log(demographicArray)
        //console.log("get count " + demographicArray[i][gndr]);
        var count  = demographicArray[i][gndr]

        response = "Demographic: There are " + count +" "+ gender + " in age bracket " + start + "-" + end;
        $("#demographicTitle").text(response);
        //displayDemographic();
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

  $("#demographicTitle").text("Demographic");
});

        /////////////////////////////////////////////////////////////////////////////////////////

        var shortWidth = w - 260;
      //add some guidelines
      stack_svg.append("line")
      .attr("x1", 0)
      .attr("x2", shortWidth)
      .attr("y1", -109)
      .attr("y2", -109)
      .style("stroke", "#ccc");
      stack_svg.append("line")
      .attr("x1", 0)
      .attr("x2", shortWidth)
      .attr("y1", -85)
      .attr("y2", -85)
      .style("stroke", "#ccc");
      stack_svg.append("line")
      .attr("x1", 0)
      .attr("x2", shortWidth)
      .attr("y1", -61)
      .attr("y2", -61)
      .style("stroke", "#ccc");

      stack_svg.append("line")
      .attr("x1", 0)
      .attr("x2", shortWidth)
      .attr("y1", -37)
      .attr("y2", -37)
      .style("stroke", "#ccc");

      stack_svg.append("text")
      .attr("x", 10)
      .attr("y", -112)
      .style("text-anchor", "middle")
      .text(function(d) { 
        return "50 Years";
      })
      .style("fill", "#111")

      stack_svg.append("text")
      .attr("x", 10)
      .attr("y", -88)
      .style("text-anchor", "middle")
      .text(function(d) { 
        return "40 Years";
      })
      .style("fill", "#111")

      stack_svg.append("text")
      .attr("x", 10)
      .attr("y", -64)
      .style("text-anchor", "middle")
      .text(function(d) { 
        return "30 Years";
      })
      .style("fill", "#111")

      stack_svg.append("text")
      .attr("x", 10)
      .attr("y", -40)
      .style("text-anchor", "middle")
      .text(function(d) { 
        return "20 Years";
      })
      .style("fill", "#111")




      $(".content").mCustomScrollbar();




      function displayDemographic(count, i){
        var response="Years of Experience: ";

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


      // response = "Demographic: " + gender + "s in age bracket " + start + "-" + end;
      //  $("#demographicTitle").text(response);

    }








    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // DRAW THE DNA FOCUS bar using focus
    //
    /////////////////////////////////////////////////////////////////////////////////////////
    console.log(maxStep);
    var leftMargin = 110; // space for extentNames
    var maxX = 0;
    var svg,
    width = 800,
    bar_height = 20,
    height = (bar_height +2) * dnaArray.length;

    var svg = d3.select("div#focusDNA")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "DNA")
    .append("g")
    //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    console.log("DRAW THE FOCUS");

    var x, y;
    x = d3.scale.linear().domain([0, 1500]).range([0, (width-leftMargin)]),
    y = d3.scale.linear().domain([0, 1000]).range([0, height]);

    // Add first data-series
    var bars = svg.selectAll("rect")
    .data(dnaArray)
    .enter().append("svg:rect")
    .attr("fill", color(0)  )
    .attr("x", leftMargin)
    .attr("y", function(d, i) { return i*22; }    )
    .attr("height", 20)
    .attr("width", function(d) { 
      return x(d[1]);
    })
    .attr("idx", 0)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });

    var rules = svg.selectAll("g.rule")
    .data(dnaArray)
    .enter().append("svg:g")
    .attr("class", "rule");


    // Add second data-series
    rules.append("svg:rect")
    .attr("fill", color(1) )
    .attr("x", function(d) { 
      maxX = Math.max (maxX, (maxStep[0] + 2));
      //console.log(maxX + ":: " + (maxStep[0] + 2) )
      console.log("0 " + (maxX) );
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[2]); })
    .attr("idx", 1)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });

    // Add 3 data-series
    rules.append("svg:rect")
    .attr("fill", color(2) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + 2;
      console.log("1 " + (maxX) );
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[3]); })
    .attr("idx", 2)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });

    // Add 3 data-series
    rules.append("svg:rect")
    .attr("fill", color(3) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + 2;
      console.log("2 " + (maxX) );
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[4]); })
    .attr("idx", 3)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });



    // Add 4 data-series
    rules.append("svg:rect")
    .attr("fill", color(4) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + 2;
      console.log("3 " + (maxX) );
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[5]); })
    .attr("idx", 4)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });



    // Add 5 data-series
    rules.append("svg:rect")
    .attr("fill", color(5) )
    .attr("x", function(d,i) { 
      //console.log(d +":  " + maxStep[5]);
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + 2;
      console.log("4 " + (maxX) );
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[6]); })
    .attr("idx", 5)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });


    // Add 6 data-series
    rules.append("svg:rect")
    .attr("fill", color(6) )
    .attr("x", function(d,i) {
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + 2;
      console.log("5 " + (maxX) );
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[7]); })
    .attr("idx", 6)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });


    // Add 7 data-series
    rules.append("svg:rect")
    .attr("fill", color(7) )
    .attr("x", function(d,i) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + 2;
      console.log("6 " + (maxX) );
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[8]); })
    .attr("idx", 7)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });



    // Add 8 data-series
    rules.append("svg:rect")
    .attr("fill", color(8) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + maxStep[7] + 2;
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[9]); })
    .attr("idx", 8)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });



    // Add 9 data-series
    rules.append("svg:rect")
    .attr("fill", color(9) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + maxStep[7] + maxStep[8] + 2;
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[10]); })
    .attr("idx", 9)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });



    // Add 10 data-series
    rules.append("svg:rect")
    .attr("fill", color(10) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + maxStep[7] + maxStep[8] + maxStep[9] + 2;
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[11]); })
    .attr("idx", 10)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });




    // Add 11 data-series
    rules.append("svg:rect")
    .attr("fill", color(11) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + maxStep[7] + maxStep[8] + maxStep[9] + maxStep[10] + 2;
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[12]); })
    .attr("idx", 11)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });




    // Add 12 data-series
    rules.append("svg:rect")
    .attr("fill", color(12) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + maxStep[7] + maxStep[8] + maxStep[9] + maxStep[10] + maxStep[11] + 2;
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[13]); })
    .attr("idx", 12)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });




    // Add 13 data-series
    rules.append("svg:rect")
    .attr("fill", color(13) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + maxStep[7] + maxStep[8] + maxStep[9] + maxStep[10] + maxStep[11] + maxStep[12] + 2;
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { return x(d[14]); })
    .attr("idx", 13)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });



    // Add 14 data-series
    rules.append("svg:rect")
    .attr("fill", color(14) )
    .attr("x", function(d) { 
      maxX = maxStep[0] + maxStep[1] + maxStep[2] + maxStep[3] + maxStep[4] + maxStep[5] + maxStep[6] + maxStep[7] + maxStep[8] + maxStep[9] + maxStep[10] + maxStep[11] + maxStep[12] + maxStep[13] + 2;
      return (leftMargin + x(maxX));
    })
    .attr("y", function(d,i) { return i*22 ; }    )
    .attr("height", 20)
    .attr("width", function(d) { 
      return x(d[15]); })
    .attr("idx", 14)
    .on("mouseover", function(d,i) {
      rollOverGroup(this, d,i);
    })
    .on("mouseout",  function(d,i) {
      rollOutGroup(d,i);
    });







/*
    svg.selectAll("text.score")
    .data( dnaArray )
    .enter().append("text")
    .attr("x", function(d) { return x(d[1]) + leftMargin; })
    .attr("y", function(d,i) { return i*22 +10; } )
    .attr("dx", 5)
    .attr("dy", ".36em")
    .attr("text-anchor", "left")
    .attr('class', 'scorex')
    .text(function(d) { return d[1]; });
*/
    svg.selectAll("text.name")
    .data(dnaArray)
    .enter().append("text")
    .attr("x", 0)
    .attr("y", function(d,i) { 
      //console.log(d,i);
      return i*22 + 10 ; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "left")
    .attr('class', 'name')
    .text(function(d) { return d[0]; });




    function rollOverGroup(item, d, i){
        var elem = d3.select(item);
        var idx = elem.attr("idx");
        var value = maxStep[idx];
        var name = dnaName[idx];
        response = "Count: There are " + value +" items in " + name;
        $("#dnaSubTitle").text(response);
        
    }



    function rollOutGroup(d,i){
      response = "Count: ";
      $("#dnaSubTitle").text(response);
    }




    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // DRAW THE FOCUS bar using focus
    //
    /////////////////////////////////////////////////////////////////////////////////////////
    

    var leftMargin = 320; // space for extentNames
    var svg,
    width = 660,
    bar_height = 20,
    height = (bar_height +2) * newFocusArray.length;

    var svg = d3.select("div#focus")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "extentchart")
    .append("g")
    //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    console.log("DRAW THE FOCUS");

    var x, y;
    x = d3.scale.linear().domain([0, 1200]).range([0, (width-leftMargin)]),
    y = d3.scale.linear().domain([0, 1000]).range([0, height]);

    // Add first data-series
    var bars = svg.selectAll("rect")
    .data(newFocusArray)
    .enter().append("svg:rect")
    .attr("fill", PINK )
    .attr("x", leftMargin)
    .attr("y", function(d, i) { return i*22; }    )
    .attr("height", 20)
    .attr("width", function(d) { 
      //console.log(d);
      return x(d[1]);
    });

    var rules = svg.selectAll("g.rule")
    .data(newFocusArray)
    .enter().append("svg:g")
    .attr("class", "rule");

    svg.selectAll("text.score")
    .data( newFocusArray )
    .enter().append("text")
    .attr("x", function(d) { return x(d[1]) + leftMargin; })
    .attr("y", function(d,i) { return i*22 +10; } )
    .attr("dx", 5)
    .attr("dy", ".36em")
    .attr("text-anchor", "left")
    .attr('class', 'scorex')
    .text(function(d) { return d[1]; });

    svg.selectAll("text.name")
    .data(newFocusArray)
    .enter().append("text")
    .attr("x", 0)
    .attr("y", function(d,i) { 
      //console.log(d,i);
      return i*22 + 10 ; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "left")
    .attr('class', 'name')
    .text(function(d) { return d[0]; });









    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // DRAW THE FOCUS bar using simple focus
    //
    /////////////////////////////////////////////////////////////////////////////////////////

   var leftMargin = 110; // space for extentNames
    var svg,
    width = 660,
    bar_height = 20,
    height = (bar_height +2) * focusArray.length;

    var svg = d3.select("div#focusOriginal")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "extentchart")
    .append("g")
    //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    //console.log("DRAW THE FOCUS");

    var x, y;
    x = d3.scale.linear().domain([0, 1200]).range([0, (width-leftMargin)]),
    y = d3.scale.linear().domain([0, 1000]).range([0, height]);

    // Add first data-series
    var bars = svg.selectAll("rect")
    .data(focusArray)
    .enter().append("svg:rect")
    .attr("fill", BLUE )
    .attr("x", leftMargin)
    .attr("y", function(d, i) { return i*22; }    )
    .attr("height", 20)
    .attr("width", function(d) { 
      //console.log(d);
      return x(d[1]);
    });

    var rules = svg.selectAll("g.rule")
    .data(focusArray)
    .enter().append("svg:g")
    .attr("class", "rule");

    svg.selectAll("text.score")
    .data( focusArray )
    .enter().append("text")
    .attr("x", function(d) { return x(d[1]) + leftMargin; })
    .attr("y", function(d,i) { return i*22 +10; } )
    .attr("dx", 5)
    .attr("dy", ".36em")
    .attr("text-anchor", "left")
    .attr('class', 'scorex')
    .text(function(d) { return d[1]; });

    svg.selectAll("text.name")
    .data(focusArray)
    .enter().append("text")
    .attr("x", 0)
    .attr("y", function(d,i) { 
      //console.log(d,i);
      return i*22 + 10 ; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "left")
    .attr('class', 'name')
    .text(function(d) { return d[0]; });

});


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