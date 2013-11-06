//--------------------------------------------------------------------------
//
//  Main Miso and d3 rendering demo
//
//--------------------------------------------------------------------------


var analysis = (function(){

  var defaultTitle = "Created by...";
  var defaultSubTitle = "Credit goes here...";
  Highcharts.setOptions({
    colors: ["#003D57","#A8BD3A","#C5000B","#90B0C9","#FF950E","#7E0021","#FF420E","#314004","#FFD320", "#000000"]
  });

  var BASE_URL = "youngPeople.csv"



  , titleObj = {
    text: defaultTitle
    , style: {
      fontFamily: 'Open Sans'
      , color: '#333'
    }
  }

  , subTitleObj = {
    text: defaultSubTitle
    , style: {
      fontFamily: 'Open Sans'
      , color: '#333'
    }
  }
  , itemStyleObj ={
    fontFamily: 'Open Sans'
    , color: '#333'

  }
  , xAxisStyleObj = {
    fontFamily: 'Open Sans'
    , color: '#333'
    , fontSize : '16px'

  }
  , yAxisStyleObj = {
    fontFamily: 'Open Sans'
    , color: '#333'
    , fontSize : '16px'
                            //, fontWeight: 'normal'
                            
                          }

                          , chart
                          , chartType = "Line"
                          , results

                          , chartOptions
                          , units = {
                            title: ''
                          }




        // CREATE PROFILE FOR THE HIGHCHART PLOTS: LINE, BAR (COLUMN) AND PIE
        // NOTE THAT THE CHART REQUIRE DIFFERENT SERIES

        , pieChart = {
          chart: {
            renderTo: 'chart',
            defaultSeriesType: 'pie'

          }
          , title: titleObj
          , subtitle: subTitleObj
          , tooltip: {
            formatter: function() {
                       // return '<b>' + this.point.name + '</b>: ' + this.y/1000000 + ' ' + units.title;
                       return '<b>' + this.point.name + '</b> ' + this.y + ' ' + units.title;
                     }
                   }
                   , series: []
                   , plotOptions: {


                    pie: {
                      dataLabels: {
                        style: itemStyleObj
                        , connectorWidth: 0
                        , softConnector: false
                        , formatter: function() {
                             //return '<b>' + this.point.name + '</b>:<br/>' + this.y/1000000 + ' ' + units.title;
                             return '<b>' + this.point.name + '</b><br/>' + this.y + ' ' + units.title;
                           }   
                         }
                       }


                     }
                     , legend: {
                      layout: 'horizontal',
                      align: 'right',
                      verticalAlign: 'top',
                      x: -160,
                      y: 320,
                      floating: true,
                      borderWidth: 0,
                      itemStyle: itemStyleObj
                    }

                    , credits:{
                      enabled:false
                    }
                    , exporting:{
                      enabled:false
                    }
                  }



                  , lineChart = {
                    chart: {
                      renderTo: 'chart',
                      type: 'line'
                    },
                    title: titleObj,
                    subtitle: subTitleObj,
                    xAxis: {
                      title: {
                        text: ''
                        , style: xAxisStyleObj
                      }
                      , type: 'datetime'
                      , labels:{
                        style: xAxisStyleObj
                        , y:25
                      }

                        /*categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']*/
                      },
                      yAxis: {
                        title: {
                          text: 'Percentage'
                          , align: 'high'
                          , style: yAxisStyleObj
                        },
                        plotLines: [{
                          value: 0,
                          width: 1,
                          color: '#808080'
                        }]
                        , labels:{
                          style: yAxisStyleObj
                          , x: -20
                        }
                      }
                      , plotOptions:{
                        line : {
                          marker:{
                            enabled:false
                          }
                        }
                      }
                      , tooltip: {
                        valueSuffix: '%'
                      }


                      , legend: {
                        layout: 'horizontal',
                        align: 'right',
                        verticalAlign: 'bottom',
                        x: 0,
                        y: 0,
                        floating: true,
                        borderWidth: 0,
                        itemStyle: itemStyleObj
                      }

                      , credits:{
                        enabled:false
                      }
                      , exporting:{
                        enabled:false
                      }
                    }

                    , barChart = {
                      chart: {
                        renderTo: 'chart',
                        type: 'column'
                      },
                      title: titleObj,
                      subtitle: subTitleObj,
                      xAxis: {
                        categories: []
                        , title: {
                          text: ''
                          , style: xAxisStyleObj
                        }
                        , labels:{
                          style: xAxisStyleObj
                          , y:25
                        }

                      },
                      yAxis: {
                        min: 0,
                        title: {
                          text: 'Population'
                          , align: 'high'
                          , style: yAxisStyleObj
                        },
                        labels: {
                          overflow: 'justify'
                          , style: yAxisStyleObj
                          , x: -20
                        }
                      },
                      tooltip: {
                        valueSuffix: ''
                      },
                      plotOptions: {
                        bar: {
                          dataLabels: {
                            enabled: true
                          }
                        }
                      }
                      , legend: {
                        //enabled: false

                        enabled: true,
                        layout: 'vertical',
                        align: 'left',
                        verticalAlign: 'top',
                        x: 70,
                        y: 35,
                        floating: true,
                        borderWidth: 1,
                        backgroundColor: '#FFFFFF',
                        shadow: true,
                        itemStyle: itemStyleObj
                        
                      }
                      , credits: {
                        enabled: false
                      }

                      , credits:{
                        enabled:false
                      }
                      , exporting:{
                        enabled:false
                      }
                    }
                    , stackChart = {
                      chart: {
                        renderTo: 'chart',
                        type: 'column'
                      },
                      title: titleObj,
                      subtitle: subTitleObj,
                      xAxis: {
                        categories: []
                        , title: {
                          text: ''
                          , style: xAxisStyleObj
                        }
                        , labels:{
                          style: xAxisStyleObj
                          , y:25
                        }

                      },
                      yAxis: {
                        min: 0,
                        title: {
                          text: 'Population'
                          , align: 'high'
                          , style: yAxisStyleObj
                        },
                        labels: {
                          overflow: 'justify'
                          , style: yAxisStyleObj
                          , x: -20
                        }
                      },
                      tooltip: {
                        valueSuffix: ''
                      },
                      plotOptions: {
                        column: {
                          stacking: 'normal',
                          dataLabels: {
                            enabled: true,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                          }
                        }
                      }
                      , legend: {
                        //enabled: false

                        enabled: true,
                        layout: 'vertical',
                        align: 'left',
                        verticalAlign: 'top',
                        x: 70,
                        y: 35,
                        floating: true,
                        borderWidth: 1,
                        backgroundColor: '#FFFFFF',
                        shadow: true,
                        itemStyle: itemStyleObj
                        
                      }
                      , credits: {
                        enabled: false
                      }

                      , credits:{
                        enabled:false
                      }
                      , exporting:{
                        enabled:false
                      }

                    };


                    function generateChart(chartType){

                      switch (chartType) {
                        case "Line":
                            //console.log("load line");
                            chartOptions.series = [];


                            //console.log(results);
                            //console.log("length: " + results.length);


                            $.each(results, function(i, item)
                            {
                                //console.log("item " +i);

                                //extract the titles of the series dna create the array for each series
                                // also set timeseries params

                                if(i===0){
                                  var length = item.length;

                                  for ( var j=1; j<length; j++){
                                    chartOptions.series[j-1] = {};
                                    chartOptions.series[j-1].name = results[0][j];
                                    chartOptions.series[j-1].data = [];

                                        //timeseries:

                                        chartOptions.series[j-1].pointInterval = 24 * 3600 * 1000 * 30;
                                        chartOptions.series[j-1].pointStart =  Date.UTC(2008, 1, 01);

                                      };
                                    }else{  

                                    // loop through the remaining values inthe csv adn populate the series data array
                                    var length = item.length;
                                    var j = 1;

                                    for ( var j=1; j<length; j++){

                                      item[j] = parseFloat(item[j]);
                                        //console.log(i +":: "  + " add item " + item[j])
                                        chartOptions.series[j-1].data.push(item[j]);    
                                        
                                      }
                                    }
                                    //console.log(item);
                                    

                                  }); 
                            /*
                            chartOptions.series =[{
                                    name: 'Tokyo',
                                    data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                                }, {
                                    name: 'New York',
                                    data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
                                }, {
                                    name: 'Berlin',
                                    data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
                                }, {
                                    name: 'London',
                                    data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
                                }]

                                */  
                                break;


                                case "Stacked":
                            /*
                             series: [{
                                            name: 'John',
                                            data: [5, 3, 4, 7, 2]
                                        }, {
                                            name: 'Jane',
                                            data: [2, 2, 3, 2, 1]
                                        }, {
                                            name: 'Joe',
                                            data: [3, 4, 4, 2, 5]
                                        }]
                                        */
                                        chartOptions.series = [];

                                        $.each(results, function(i, item)
                                        {
                                          console.log(i + ": " + item);
                                // ignore the column headings
                                if(i>0){
                                    //create blank objects for each series
                                    var length = results[i].length;
                                    var j = 1;
                                    
                                    if (!chartOptions.series[i-1]){
                                    //console.log("create sereis " + i);
                                    chartOptions.series[i-1] = {};
                                    chartOptions.series[i-1].data =[];
                                  }

                                  chartOptions.series[i-1].name = item[0];    
                                  for ( var j=1; j<length; j++){

                                    item[j] = parseFloat(item[j]);
                                        //console.log(i +":: "  + " add item " + item[j])
                                        chartOptions.series[i-1].data.push(item[j]);    

                                        
                                      }

                                    }else{
                                    // make a list of titles
                                    chartOptions.xAxis.categories = item.slice(1);
                                  }
                                }); 
break;


case "Bar":
                            //console.log("load bar");
                            chartOptions.series = [];
                            /*chartOptions.series[0] = {};
                            chartOptions.series[0].data =[];
                            chartOptions.series[1] = {};
                            chartOptions.series[1].data =[];*/
                            
                            $.each(results, function(i, item)
                            {
                                //console.log(i + ": " + item);

                                

                                // ignore the column headings
                                if(i>0){
                                    //create blank objects for each series
                                    var length = results[i].length;
                                    var j = 1;
                                    
                                    if (!chartOptions.series[i-1]){
                                    //console.log("create sereis " + i);
                                    chartOptions.series[i-1] = {};
                                    chartOptions.series[i-1].data =[];
                                  }

                                  chartOptions.series[i-1].name = item[0];    
                                  for ( var j=1; j<length; j++){

                                    item[j] = parseFloat(item[j]);
                                        //console.log(i +":: "  + " add item " + item[j])
                                        chartOptions.series[i-1].data.push(item[j]);    

                                        
                                      }

                                    }else{
                                    // make a list of titles
                                    chartOptions.xAxis.categories = item.slice(1);
                                  }
                                //console.log(item);


                              }); 
break;


case "Ordered":
console.log("load ordered");

chartOptions.series = [];
                            /*chartOptions.series[0] = {};
                            chartOptions.series[0].data =[];
                            chartOptions.series[1] = {};
                            chartOptions.series[1].data =[];*/


                            var copy = results.slice(0);
                            var firstItem = [copy.shift()];


                            copy.sort(function(a,b){
                              return a[1] - b[1];
                            });
                            copy.reverse();

                            copy = firstItem.concat(copy);

                            console.log(copy);
                            
                            $.each(copy, function(i, item)
                            {
                              console.log(i + ": " + item);



                                // ignore the column headings
                                if(i>0){
                                    //create blank objects for each series
                                    var length = copy[i].length;
                                    var j = 1;
                                    
                                    if (!chartOptions.series[i-1]){
                                    //console.log("create sereis " + i);
                                    chartOptions.series[i-1] = {};
                                    chartOptions.series[i-1].data =[];
                                  }

                                  chartOptions.series[i-1].name = item[0];    
                                  for ( var j=1; j<length; j++){

                                    item[j] = parseFloat(item[j]);
                                        //console.log(i +":: "  + " add item " + item[j])
                                        chartOptions.series[i-1].data.push(item[j]);    
                                        
                                      }
                                    //sort data:
                                    chartOptions.series[i-1].data.sort();
                                    /*
                                    // format with number on bars
                                    chartOptions.series[i-1].dataLabels = {
                                        enabled: true,
                                        rotation: -90,
                                        color: '#FFFFFF',
                                        align: 'right',
                                        x: 4,
                                        y: 10,
                                        style: {
                                            fontSize: '10px',
                                            fontFamily: 'Open sans'
                                        }
                                    }
                                    */

                                    console.log(chartOptions.series);
                                  }else{
                                    // make a list of titles
                                    chartOptions.xAxis.categories = item.slice(1);
                                  }
                                //console.log(item);



                              }); 





break;


case "Pie":
                            //console.log("load pie " + results.length);
                            // create series data without first line of data (titles)
                            var tempData = results.slice( 1 );
                            //console.log("after shift " + results.length);
                            //remove first line (titles)
                            //results.shift();
                            var seriesPie = {
                              type: 'pie',
                              name: '',
                              data: tempData
                            };

                            //chartOptions.series = [];
                            chartOptions.series.push(seriesPie);
                            break;

                          }


                   // if (chart){
                    console.log("Destroy all monsters!");
                    chart.destroy();
                   // }
                   chart = new Highcharts.Chart(chartOptions);
                    //chart.redraw();
                    var txt = $("#chart_title").val();
                    //chart.setTitle({text: txt});
                    var subtxt = $("#creditLine").val();
                    var xLabel = $("#chart_x").val();
                    var yLabel = $("#chart_y").val();

                    chart.setTitle({text: txt}, { text: subtxt });
                    if(xLabel!==""){
                      chart.xAxis[0].setTitle({ text: xLabel });
                    }

                    //populate edit boxes
                    if(chart.xAxis[0].axisTitle){
                      if(chart.xAxis[0].axisTitle.text){
                        $("#chart_x").val( chart.xAxis[0].axisTitle.text );
                      }
                    }
                    if(yLabel!==""){
                      chart.yAxis[0].setTitle({ text: yLabel });
                    }
                    if(chart.yAxis[0].axisTitle){
                      if(chart.yAxis[0].axisTitle.text){
                        $("#chart_y").val( chart.yAxis[0].axisTitle.text );
                      }
                    }
                  }



                  function getPNG (argument) {
            //console.log("get png");

            canvg(document.getElementById('canvas'), chart.getSVG({
             chart: {
              width: 700,
              height: 400
            }
          }) );

            var canvas = document.getElementById("canvas");
            var img = canvas.toDataURL("image/png");

            //document.write('<img src="'+img+'"  width="1200" height="900"/>');

            $('#snapshot').empty();
            $('#snapshot').prepend('<img src="'+img+'" />');

            /*
            var link = document.createElement("a");
            link.setAttribute("href", img);
            link.setAttribute("download", "snapshot.png");

            link.click();
            */
          }

          function setChartType (element) {

            switch (element) {
              case 0:
                    //console.log("add");
                    break;
                    case "Line":
                    //console.log("add line");
                    chartOptions = lineChart;
                    break;
                    case "Ordered":
                    chartOptions = barChart;
                    chartOptions.legend.align= 'right';
                    chartOptions.legend.x= 0;


                    break;
                    case "Bar":
                    //console.log("add bar");
                    chartOptions = barChart;
                    break;
                    case "Stacked":
                    //console.log("add pie");
                    chartOptions = stackChart;
                    break;
                    case "Pie":
                    //console.log("add pie");
                    chartOptions = pieChart;
                    break;

                  }

            //chart = new Highcharts.Chart(chartOptions);


          }

          function redrawChart(){
            if (results){
                //console.log("redraw chart");
                generateChart(chartType);
              } else{
                //console.log("load chart data");
                
              }


            }

            var reader;

            function handleFileSelect(evt) {
              console.log("file select");
            var files = evt.target.files; // FileList object

            var f = files[0];

            reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = receivedText;
            reader.readAsText(f);
          }

          function receivedText() { 
            //result = fr.result; 
            console.log(reader.result);
            var newArr = reader.result; 
            console.log(newArr);

            //clear existing
            if(chart){
                    //console.log("remove series..." + chart.series.length)
                    while(chart.series.length > 0){
                      chart.series[0].remove(true);
                      chartOptions.series = [];
                    }
                    //chart.redraw();
                  }

            //load in new   
            results = $.csv.toArrays(reader.result);

            //set data to parsefloat
            $.each(results, function(itemNo, item)
            {
              if(itemNo>0){
                item[1] = parseFloat(item[1])
              }
              console.log(item);
            });  


            console.log(results);
            //console.log("chartType " + chartType);

            generateChart(chartType);

          }


      function loadData(file_url){
        console.log("load data here");
        var newURL = "../data/" + file_url;
        $.ajax({
            dataType: "text",
            //url: 'products.json',//http://www.ons.gov.uk/ons/interactive/ons-statistics-products/data.js
            url: newURL,
            data: "String",
            success: function(data, status, xhr) {
                   
                console.log("success");
                console.log(data);

                //clear existing
                if(chart){
                  //console.log("remove series..." + chart.series.length)
                  while(chart.series.length > 0){
                    chart.series[0].remove(true);
                    chartOptions.series = [];
                  }
                }

                //load in new   
                results = $.csv.toArrays(data);

                //set data to parsefloat
                $.each(results, function(itemNo, item)
                {
                  if(itemNo>0){
                    item[1] = parseFloat(item[1])
                  }
                  console.log(item);
                });  


            console.log(results);
            console.log("chartType " + chartType);

            generateChart(chartType);


            },
            error: function(data) {
                   
                console.log("error");
                    
                }
        });

    }


    $(document).ready(function() {

        //console.log("Ready!")
        
        //console.log(lineChart);
        chart = new Highcharts.Chart(lineChart);

        // DROP DOWN ADD BUTTON
        //
        $('a[id^="action"]').click(function(e){
          e.preventDefault();
          var id = e.currentTarget.id.substr(6);
          id  = parseFloat(id);
          chartType = e.currentTarget.text;
          setChartType( e.currentTarget.text );

            //console.log(e.currentTarget.text);
            //$('a[id^="action"]').removeClass("active");
            $('li a[id^="action"]').parent().removeClass('active');
            $(e.currentTarget).parent().addClass('active');

            setChartType(chartType);
            redrawChart();
          });



$("#bar").on('click', function(e){ 
  e.preventDefault();
  //chartType = "bar";
  loadData("bar_chart.csv");
});

$("#line").on('click', function(e){ 
  e.preventDefault();
  //chartType = "line";
  loadData("line_chart.csv");
});

$("#pie").on('click', function(e){ 
  e.preventDefault();
  //chartType = "pie";
  loadData("pie_chart.csv");
});

$('#snapshotBtn').click(function(){
            //console.log("snap!")
            getPNG();
          }); 


$('#chart_title').keyup(function() {
  var txt = $("#chart_title").val();
  chart.setTitle({text: txt});
});

$('#creditLine').keyup(function() {
  var subtxt = $("#creditLine").val();

  chart.setTitle(null, { text: subtxt });
});
$('#chart_x').keyup(function() {
  var lbl = $("#chart_x").val();

  console.log(lbl);
  chart.xAxis[0].setTitle({
    text: lbl
  });
});

$('#chart_y').keyup(function() {
  var lbl = $("#chart_y").val();
  console.log(lbl);

  chart.yAxis[0].setTitle({
    text: lbl
  });
});


         //init

         setChartType(chartType);





       });




}());