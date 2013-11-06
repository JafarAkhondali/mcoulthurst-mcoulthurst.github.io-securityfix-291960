//--------------------------------------------------------------------------
//
//  twitter list visualisation
//
//
//--------------------------------------------------------------------------


var dashboard = (function(){
  "use strict";


  var peopleList;
  var shortlist =[];

  var SRC = "../data/cleanSurvey.csv";
  var color = d3.scale.category10();
  var PINK = "#FA1387";
  var BLUE = "#0D0177";

  var margin = {top: 10, right: 10, bottom: 100, left: 40},
  width = 960 - margin.left - margin.right,
  CHART_WIDTH = 820,
  height = 500 - margin.top - margin.bottom;

  var durationCounts = [0,0,0,0,0,0,0,0,0,0];
  var durationUndefined = 0;

  var newDurations = []; //udates when the ist is filtered

  var calendar =[];
  var interest = {};
  var interestArray = [];
  var age_females =[0,0,0,0,0,0,0,0,0,0,0,0];
  var age_males =[0,0,0,0,0,0,0,0,0,0,0,0];
  var age_unknown =[0,0,0,0,0,0,0,0,0,0,0,0];
  var demographicArray =[];


  var records;
  var countryFltr;
  var genderFltr;
  var ageFltr;
  var durationFltr;
  var interestFltr;

  var ageBands = 5;

  var durationChart // keep reference in order to update when demogrpahic is filtered


  var filterList = {};

  var format = d3.time.format("%d/%m/%Y");
  var fullFormat = d3.time.format("%d/%m/%Y %X");







  d3.csv(SRC, function(error, data) {

    var now = new Date();
    var startTime = new Date(2013,2,19,8,0,0);
    var count = 0;
    var group = 0;
    var namesList = [ ];
    namesList[0] = [];


      // CROSSFILTER
      records = crossfilter(data);

      genderFltr = records.dimension(function (d) { return d.Gender;});
      ageFltr = records.dimension(function (d) { return d.Age;});
      interestFltr = records.dimension(function (d) { return d.Extent;});
      durationFltr = records.dimension(function (d) { 
        var dateStamp = format.parse(d.Interest);
        if(d.Interest==="" || dateStamp===null){
          dateStamp = now;
        }

        var milliseconds = dateStamp.getTime();
        return milliseconds; 
      });




      //console.log( startTime );
      data.forEach(function(d) {

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
        //var format = d3.time.format("%d/%m/%Y %X");
        d.time = fullFormat.parse(d.Timestamp);



        // EXTENT OF INTEREST
        // loop through and collate each interest group and add up the totals
        if(d.Extent===""){
          d.Extent = "Unanswered";
        }

        if(!interest[d.Extent]){
          interest[d.Extent] =  0;
        }
        interest[d.Extent]++;


        // FOCUS OF INTEREST
        if(d.Focus===""){
          d.Focus = "Unanswered";
        }
        var tempSplit = d.Focus.split(", ");
        // loop through each entry and collate each Focus group and add up the totals
        var iFocus =0;
        var lenFocus = tempSplit.length;

        for ( var i=0; i<lenFocus; i++){
          if(!focus[tempSplit[i]]){
            focus[tempSplit[i]] = 0;
          }

          focus[tempSplit[i]]++;
        }




        // AGE DEMOGRAPHIC
        // loop through and assign each record to the nearest age group by gender
        var ageGroup = Math.floor ( d.Age/ageBands );
        //console.log(d.Age +":" + d.Gender + ":" + ageGroup);
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



    // TIDY UP demographicArray [id, unknown, males, females] for each 10-year group
    var length = age_males.length;
    for ( var i=0; i<length;i++){

      console.log(age_males[i])
      var obj = [];
      obj[0] = i;
      obj[1] = age_unknown[i];
      obj[2] = age_males[i];
      obj[3] = age_females[i];
      demographicArray.push(obj);
    }

    // TIDY UP DURATION DATA
    var length = durationCounts.length;
    for ( i=0;i<length; i++){
      if( !durationCounts[i] ){
        durationCounts[i] = 0;
      }

    };



    //move EXTENT interest OBJECT to array and sort:
    var sortedInterests = [];
    for (var item in interest){
      sortedInterests.push([item, interest[item]]);
    }
    sortedInterests.sort(function(a, b) {return b[1] - a[1]})

    //var extents = [];
    //var extentNames = [];
    // EXTENT interest convert to array
    for (var d in sortedInterests) {
        //var obj ={};
        //obj.name = sortedInterests[d][0];
       // obj.value = sortedInterests[d][1];
       // obj.id = d;

       var temp =[];
       temp[0] = sortedInterests[d][0];
       temp[1] = sortedInterests[d][1]

       interestArray.push(temp);
        //extents.push(sortedInterests[d][1]);    // the object with counts
        //extentNames.push(sortedInterests[d][0]);  // the name
      }
      console.log(interestArray);

/*
    //Convert FOCUS obj to array and sort:
    var sortedFocus = [];
    for (var item in focus){
        sortedFocus.push([item, focus[item]]);
    }
    sortedFocus.sort(function(a, b) {return b[1] - a[1]})

    console.log(sortedFocus);
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
        temp[1] = sortedFocus[d][1];

        focusArray.push(temp);
        focusValues.push(sortedFocus[d][1]);  // the object
        focusNames.push(sortedFocus[d][0]); // the nanme
    }
    console.log(focusArray);
    */




    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // DRAW THE CHARTS
    //
    /////////////////////////////////////////////////////////////////////////////////////////


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


      var x = d3.scale.ordinal().rangeRoundBands([0, h])
      , y = d3.scale.linear().range([0, (w-10)/2])
      , z = d3.scale.ordinal().range(["black", BLUE, PINK]) // eg unknown, males, females


      var remapped =["c1","c2","c3"].map(function(dat,i){
        return demographicArray.map(function(d,ii){
          return {x: ii, y: d[i+1] };
        })
      });

      var stacked = d3.layout.stack()(remapped)
      console.log(stacked)

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
          if(d.y0-d.y>0){
            gender = "Female";
          }else{
            gender = "Male";
          }

          // get the age range
          var start = d.x*ageBands;
          var end = d.x*ageBands + (ageBands-1);

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

          ageFltr.filter( function(d) {
            return d >= start && d<=end;
          });

          genderFltr.filter(gender);

          displayAccounts(genderFltr.top(Infinity));

          // apply filters
          updateTitle();

        })


        .on("mouseover", function(d,i) {
          var gndr = 0;
          var bar = d3.select(this);
          bar.style("fill", "#fff");

          var gender;
          
          if(d.y0-d.y>0){
            gender = "women";
            gndr = 3;
          }else{
            gender = "men";
            gndr = 2;
          }
          
          var start = d.x*ageBands;
          var end = d.x*ageBands + (ageBands-1);

          var count  = demographicArray[i][gndr]

          var response = "Demographic: There are " + count +" "+ gender + " in age bracket " + start + "-" + end;
          $("#demographicTitle").text(response);

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
        //add some horizontal guidelines w labels
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
          .style("fill", "#111");


    // END OF DEMOGRAPHIC
    /////////////////////////////////////////////////////////////////////////////////////////





    /////////////////////////////////////////////////////////////////////////////////////////
    //
    // START OF EXPERIENCE
    //
    /////////////////////////////////////////////////////////////////////////////////////////


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

    durationChart = d3.select("div#experience").append("svg")
    .attr("class", "chart")
    .attr("width", w - m[1] - m[3])
    .attr("height", h + m[0] + m[2])
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(5).tickPadding(5)

      // Add the x-axis.
      durationChart.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

    var  yAxis = d3.svg.axis().scale(y)
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
          //console.log(d);
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
/*
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
          var cx = d3.mouse(this)[0] - PADDING;
          var cy = d3.mouse(this)[1];

          var idx = Math.round( cx/barWidth);
          var item = "#bar"+idx
          //console.log("over " + item);

          var elem = d3.select(item);
          elem.style("fill", "#fff");

          console.log("durationCounts " + durationCounts[idx] + " for " + idx);

          displayExperience(durationCounts[idx], idx);
        })
*/
        /////////////////////////////////////////////////////////////////////////////////////////








    });

    /////////////////////////////////////////////////////////////
    //
    //  end of d3.csv function


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

    }


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








    // END OF EXPERIENCE
    /////////////////////////////////////////////////////////////////////////////////////////



    function updateTitle() {
      //console.log(filterList);
      var title = "Twitter Accounts: ";

      // COUNTS
      if(shortlist.length==0){
        title += "There is 1 account. ";
      }else if(shortlist.length>1){
        title += "There are " + shortlist.length + " accounts for this group: ";
      } 

      // FILTERS
      if(filterList.gender){
        title += filterList.gender + ", aged " + filterList.startAge + "-" + filterList.endAge + ".";
      }
      /*
      if(filterList.duration){
        title += "with " + filterList.duration + " years experience ";
      }
      if(filterList.interest){
        title += "whose interest is '" + filterList.interest.toLowerCase() + "' ";
      }
      if(filterList.calendar){
        title += "who signed up after " + filterList.calendar;
      }
     */ 

      $("#titleBlock").text( title );
    }


    function displayAccounts(people){
      // clear table
      $("#tableBody").empty();

      //loop through the csv list and create new JSON one based on twitter data
      shortlist =[];
      var length = people.length;
      var pplListLength = peopleList.length;

      for ( var i=0;i<length; i++){
        
        for ( var j=0;j<pplListLength; j++){

          if(("@" + people[i].Twitter) === peopleList[j].screen_name){
            shortlist.push(peopleList[j]);
          }

        };

      };


//reset the counter
newDurations =[];

      // create list of duration for ppl
      var now = new Date();
            for (var i=0;i<people.length; i++){
        var d = people[i];
 //console.log(d);
 
            d.year = format.parse(d.Interest);

              if(d.Interest!==""){
                var duration = Math.round( (now - d.year)/ (365.25 * 86400000) );
                duration = parseInt( duration );

                if(!newDurations[d.duration]){
                  newDurations[d.duration] = 0;
                }
                newDurations[d.duration] ++;
              }
        
      }
      // TIDY UP DURATION DATA
      var length = newDurations.length;
      for ( i=0;i<length; i++){
        if( !newDurations[i] ){
          newDurations[i] = 0;
        }

      };
      console.log(newDurations);



      shortlist.sort(compare); //  sort by name

      createLayout(shortlist);

      updateExperience();

    }
var newbar
    function updateExperience(){

      console.log("update exp");

console.log(newDurations);
console.log(newbar);

var h = 400;
var maxCount = 250;
var barWidth = 10;
var y = d3.scale.linear()
  .domain([0, maxCount])
  .rangeRound([h, 0]);

      if(newbar){
        console.log(newbar);
        console.log(newbar.selectAll("rect"));
        console.log("overlay");
        //d3.selectAll("block").remove();
        //d3.select("block").remove();
        //d3.select("overlay").remove();
//d3.select("svg").remove();
        newbar.selectAll("rect").remove();
      }

           // create the bar chart
        newbar = durationChart.append("svg:g")
          .attr("class", "overlay");

         newbar.selectAll("rect")
         .data(newDurations)
         .enter().append("rect")
         .attr("class", "block")
         .attr("x", function(d, i) { return (i*barWidth)+2 })
         .attr("y", function(d) { 
              //console.log(d);
             return y(d) ; 
           })
         .attr("width", barWidth)
         .attr("id", barWidth)
         .style("fill", BLUE)
         .attr("height", function(d) { 
               // console.log(d);
               return h-y(d); 
             })


        


    }



    function createLayout(list){

     // console.log(list);
      var i
      , item1
      , item2
      , item3
      , listLength = list.length
      , description = "";

      $("#tableBody").empty();

      for ( i = 0; i < listLength; i=i+3) {


        if(list[i]!==undefined){
          item1 = list[i];

          description += "<tr> <td>";
          description += "<div class='box' id='" + item1.screen_name + "'>";
          //description += "<a href='https://twitter.com/" + item1.screen_name + "' target='_blank'><img class='profile' src='" + item1.img_url + "'/></a>";
          description += "<div class='names'> " ;
          description += "<div class='name'> <a href='https://twitter.com/" + item1.screen_name + "' target='_blank'>"  + item1.name + "</a></div>";
          description += "<div class='screen_name'><a href='https://twitter.com/" + item1.screen_name + "' target='_blank'>"  + item1.screen_name + "</a></div>";
          description += "<div class='copy'> "  + item1.description + "</div>";
          description += "</div>";
          description += "</div>";
          description += "</td> <td>";
        }

        if(list[i+1]!==undefined){
          item2 = list[i+1];

          description += "<div class='box' id='" + item2.screen_name + "'>";
          //description += "<a href='https://twitter.com/" + item2.screen_name + "' target='_blank'><img class='profile' src='" + item2.img_url + "'/></a>";
          description += "<div class='names'> " ;
          description += "<div class='name'><a href='https://twitter.com/" + item2.screen_name + "' target='_blank'>"  + item2.name + "</a></div>";
          description += "<div class='screen_name'><a href='https://twitter.com/" + item2.screen_name + "' target='_blank'>"  + item2.screen_name + "</a></div>";
          description += "<div class='copy'> "  + item2.description + "</div>";
          description += "</div>";
          description += "</div>";
          description += "</td> <td>";
        }else{
          description += "</td> <td>";
        }

        if(list[i+2]!==undefined){
          item3 = list[i+2];

          description += "<div class='box' id='" + item3.screen_name + "'>";
          //description += "<a href='https://twitter.com/" + item3.screen_name + "' target='_blank'><img class='profile' src='" + item3.img_url + "'/></a>";
          description += "<div class='names'> " ;
          description += "<div class='name'><a href='https://twitter.com/" + item3.screen_name + "' target='_blank'>"  + item3.name + "</a></div>";
          description += "<div class='screen_name'><a href='https://twitter.com/" + item3.screen_name + "' target='_blank'>"  + item3.screen_name + "</a></div>";
          description += "<div class='copy'> "  + item3.description + "</div>";
          description += "</div>";
          description += "</div>";
          description += "</td>";

        }else{
          description += "<div class='box blank' id='blank'>";
          description += "</div>";
          description += "</td>";
        }

      }
      $("#tableBody").append(description);

    }






      function loadData(){
        console.log("load data here");
        
        $.ajax({
          dataType: "json",
            //url: 'products.json',//http://www.ons.gov.uk/ons/interactive/ons-statistics-products/data.js
            url: '../data/twitter.json',
            data: "String",

            success: function(data, status, xhr) {
                peopleList = data.ppl;
                createLayout(peopleList);
              },

              error: function(data) {

                console.log("error");

              }
            });

      }

  function compare(a,b) {
    if (a.name < b.name)
       return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  }
    //----------------------------------
    //  init doc...
    //----------------------------------
    

    document.addEventListener( "DOMContentLoaded", function() {
      loadData();

    });


    

    
  }());