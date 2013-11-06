// The SVG container
var width  = 820,
height = 500;

//var color = d3.scale.category10();

var projection = d3.geo.mercator()
.translate([420, 280])
.scale(750);

var path = d3.geo.path()
.projection(projection);

var svg = d3.select("#map").append("svg")
.attr("width", width)
.attr("height", height);

var tooltip = d3.select("#map").append("div")
.attr("class", "tooltip");


//hardcoded count data from survey
var locations = [{ name:"United States", value:529, id:13}, { name:"United Kingdom", value:289, id:3}, { name:"France", value:68, id:1}, { name:"Netherlands", value:68, id:16}, { name:"Canada", value:65, id:31}, { name:"Spain", value:58, id:8}, { name:"Germany", value:52, id:4}, { name:"Australia", value:43, id:20}, { name:"Italy", value:37, id:21}, { name:"India", value:28, id:14}, { name:"Switzerland", value:24, id:7}, { name:"Brazil", value:24, id:38}, { name:"South Africa", value:19, id:2}, { name:"Belgium", value:19, id:10}, { name:"Sweden", value:18, id:9}, { name:"Unknown", value:16, id:32}, { name:"Ireland", value:13, id:26}, { name:"Finland", value:12, id:45}, { name:"Portugal", value:10, id:5}, { name:"Denmark", value:10, id:33}, { name:"Austria", value:9, id:28}, { name:"China", value:7, id:15}, { name:"Norway", value:7, id:19}, { name:"Mexico", value:7, id:39}, { name:"Singapore", value:7, id:40}, { name:"New Zealand", value:7, id:52}, { name:"Argentina", value:6, id:35}, { name:"Hungary", value:6, id:44}, { name:"Russian Federation", value:6, id:54}, { name:"Czech Republic", value:5, id:22}, { name:"Colombia", value:5, id:27}, { name:"Romania", value:5, id:42}, { name:"Greece", value:4, id:12}, { name:"Poland", value:4, id:30}, { name:"Chile", value:4, id:34}, { name:"Turkey", value:4, id:55}, { name:"Slovenia", value:4, id:57}, { name:"Malaysia", value:3, id:17}, { name:"Iceland", value:3, id:18}, { name:"Costa Rica", value:3, id:47}, { name:"Israel", value:3, id:50}, { name:"Moldova", value:3, id:51}, { name:"Nepal", value:2, id:11}, { name:"South Korea", value:2, id:23}, { name:"Ghana", value:2, id:25}, { name:"Egypt", value:2, id:29}, { name:"Lebanon", value:2, id:37}, { name:"Estonia", value:2, id:46}, { name:"Latvia", value:2, id:49}, { name:"Puerto Rico", value:2, id:53}, { name:"Croatia", value:2, id:56}, { name:"Kenya", value:2, id:60}, { name:"Japan", value:2, id:61}, { name:"Lithuania", value:2, id:63}, { name:"Venezuela", value:2, id:68}, { name:"Indonesia", value:2, id:69}, { name:"Nigeria", value:1, id:6}, { name:"Thailand", value:1, id:24}, { name:"Zimbabwe", value:1, id:36}, { name:"Ecuador", value:1, id:41}, { name:"Vietnam", value:1, id:43}, { name:"Belarus", value:1, id:48}, { name:"Dominican republic", value:1, id:58}, { name:"Peru", value:1, id:59}, { name:"Uganda", value:1, id:62}, { name:"Bulgaria", value:1, id:64}, { name:"Aruba", value:1, id:65}, { name:"Bangladesh", value:1, id:66}, { name:"Recife", value:1, id:67}, { name:"Cuba", value:1, id:70}, { id:0, name:"other", value:0}];


var color = d3.scale.threshold()
.domain([1, 2, 4, 10, 32, 50, 100, 200])
.range(["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c", "#08306b", "red"] );

// set the queue to load all files before executing...
queue()
.defer(d3.json, "../data/world-110m.json")
.defer(d3.tsv, "../data/world-country-names.tsv")
.defer(d3.csv, "../data/survey_locations.csv")
.await(ready);

function ready(error, world, names, surveys) { // NB queue loads in file results here; WORLD, NAMES, SURVEYS

  var countries = topojson.object(world, world.objects.countries).geometries,
  neighbors = topojson.neighbors(world, countries),
  data = surveys,
  i = -1,
  n = countries.length;



  countries.forEach(function(d) { 
    d.name = names.filter(function(n) { return d.id == n.id; })[0].name; 
  });



  var country = svg.selectAll(".country")
  .data(countries)
  .enter()
  .insert("path")
  .attr("class", "country")    
  .attr("id", function(d,i) { return d.name; })  
  .attr("title", function(d,i) { return d.name; })
  .attr("d", path)

  .style("fill", function(d,i) {
    var j=0
    , length = locations.length
    , colour
    ;

    for ( j=0; j<length; j++){

      if(locations[j].name == d.name){
            //update the data withteh values from the location dbase
            d.count = locations[j].value;

           // colour = color(locations[j].value); // this sets the country colours
           colour = "white"; 
           break;
         }else{
          d.count = 0;
          colour = "white"; 
        }

      }
      return colour; 

    })
  .style("stroke", "#ddd");

    // EVENT LISTENERS

    //Show/hide tooltip
    country
    .on("mousedown", function (d){
        /*
        console.log(projection.invert(d3.mouse(this)));
        var centroid = path.centroid(d);
        var x = -centroid[0] + width/4;
        var y = -centroid[1] + height/4;
        console.log(x+", " + y);
        */
      })

    .on("mouseover", function(d,i) {
      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
     // d3.select(this).style("fill", "white");
        //console.log(d);

        // FIND THE CENTROID OF THE COUNTRY TO POSITION THE TOOLTIP
        var centroid = path.centroid(d);
        var x = centroid[0] ;//+ width/4;
        var y = centroid[1] - 40;//+ height/4;
        // console.log(centroid[1]+", " + centroid[0]);
        // console.log(x+", " + y);
        // console.log( mouse[1]+", " + mouse[0]);


        tooltip
        .classed("hidden", false)
         // .attr("style", "left:"+(mouse[0]+10)+"px;top:"+(mouse[1]+50)+"px")
        // .attr("style", "left:" + centroid[0] +"px;top:" + (centroid[1]+60) + "px")
         .attr("style", "left:" + x +"px;top:" + y + "px")
         .html(function() { 

          if(d.count>0){
            return d.name + ": " + d.count; 
          }else{
            return d.name; 
          }

        })

       })

    .on("mouseout",  function(d,i) {
       // d3.select(this).style("fill", "lightsteelblue");
       tooltip.classed("hidden", true);
       colour = color(d.count);
       if(d.count===0){
        colour = "white";
      }
     // d3.select(this).style("fill", colour);
    })


      /*
      // SELECT COUNTRY OUTLINE BY ID
      var brazil = d3.select("[id="+"'United States']");
      console.log(brazil);
      var centroid = path.centroid(brazil.datum());
      //brazil.style("fill", "white");
      */

      // TEXT FIELDS SET AT CENTROID OF COUNTRY AREA

      svg.selectAll("text")
      .data(locations)
      .enter()
      .append("text")

      .text(function(d) {
          //console.log(d);
        })
      .style('fill',function(d, i) {
        var clr = "black";
        if(d.name==="United States" || d.name==="Canada"){
          clr= "white";
        } 
        return clr;
      })
        //.style("font-size", "42px")
        .attr("x", function(d, i) {
          var strg = "[id="+"'" + d.name + "']";
          var selection = d3.select(strg);
          var x = 0;

          if(selection[0][0]!==null){
            var centroid = path.centroid(selection.datum());
            x = centroid[0] ;
          }
          if(d.name==="United States"){
            x = x+50;
          } else if(d.name==="United Kingdom"){
            x = x+7;
          } else if(d.name==="Canada"){
            x = x-50;
          } else if(d.name==="Ireland"){
            x = x-8;
          }
          return x;
          
        })
        .attr("y", function(d) {
          var strg = "[id="+"'" + d.name + "']";
          var selection = d3.select(strg);
          var y = 0;

          if(selection[0][0]!==null){
            var centroid = path.centroid(selection.datum());
            y = centroid[1] ;
          }
          if(d.name==="United States"){
            y = y+50;
          } else if(d.name==="United Kingdom"){
            y = y-5;
          } else if(d.name==="Canada"){
            y = y+50;
          }
          return y;
        })
        .attr("id", function(d) {
          //console.log(d);
          return d.name;
        });









        function displayCounts ( ){

          var d = data[inc];

          d3.select("#title").text("World Map: Sign up progress " + d.Timestamp);
          if(d.Country===""){
            d.Country = "Unknown";
          }

          if(!locationCounts[d.Country]){
            locationCounts[d.Country] = 0;
          }

          locationCounts[d.Country]++;

          var selectedCountry = d3.select("text[id='" + d.Country + "']");

          selectedCountry.text(function() {
            var counter = (  locationCounts[d.Country] );
            return counter;
          })

          inc++;
          if (inc>=data.length){
            clearInterval( intervalID );
          }


          var countrySelect = d3.select("[id='" + d.Country + "']")
          .transition()
          .style("fill", function() {

            colour = color(locationCounts[d.Country]);
            return colour; 

          })
        }

        var locationCounts = {};
        var inc = 0;
        var intervalID = setInterval ( displayCounts, 50 );

      }