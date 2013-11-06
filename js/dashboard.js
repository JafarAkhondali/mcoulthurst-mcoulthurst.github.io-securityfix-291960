//--------------------------------------------------------------------------
//
//  dashboard visualisation
//
//--------------------------------------------------------------------------


var dashboard = (function(){
    "use strict";
    /*global console: true, $:true, Raphael:true, slider:true, videoView:true, box:true*/
    /*jslint newcap:true*/  
    
    var WIDTH = 880
    , HEIGHT = 550
    , PADDING = 10
 
 
    , tempChartCount = 0 
    
        , charts = []
        , products =[ ]
        , chartData = []
        , script = []
        , scriptTitle = []
        , $chartHolder

        , YELLOW = "#F9EE40"
        , ORANGE = "#F37735"
        , GREEN = "#72C050"
        , BLUE = "#59B5D0"
        , BLACK = "#141D2D"
        , GREY_LT = "#575557"
        , GREY_DK = "#403F40"
    , colours = [null, BLUE, BLUE, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, ORANGE, GREEN, GREEN, GREEN, GREEN];


    function drawChart (id, index) {
        console.log("drawChart " + id);
        
        $chartHolder = $("div#chart"+id)
        $chartHolder.empty();
        
        //console.log($chartHolder);

        var xAxisStyle = {
                        color: "#666",
                        mode:"time",
                        font:{
                            color: "#888"
                            }
                     };
        var plotId = products[id].plot[index];
        
        var thePlot = $.plot( ("div#chart"+id), [ charts[plotId] ]
                , 
                {
                    series: {
                        color: colours[id],
                        lines: { show: true }
                    },
                    xaxis: xAxisStyle
                    ,
                    yaxis: {
                        color: "#666",
                            font:{
     
                                color: "#888"
                        }
                    },
                    grid: {
                        color:"#666",
                        backgroundColor: GREY_DK,
                        borderWidth: {
                            top: 0,
                            right: 0,
                            bottom: 1,
                            left: 1
                        }
                    }
                }
            );
    }
    
    
    
    function showPanel(id) {
        var item
        , fig
        , copy
        , title
        , url

        , $chartHolder = $("div#chart"+id)
        , $panelTitle = $("div#panelTitle"+id)
        , $panelCopy = $("span#copy"+id)
        , $panelFigure= $("span#figure"+id)
        , $link = $("#external"+id)
        
        console.log("showPanel " + id);
        
        item = products[id];
        fig = item.figure;
        title = item.title;
        url = item.url;
        
        $link.attr({
              'href':url
            , 'target': "blank"}
            );
        

         if(fig.indexOf("^")>-1){ 
            fig = item.figure.split("^")[0];
        }        
            
        copy = item.copy.replace("Â", "");
        if(item.copy.indexOf("^")>-1){ 
            copy = item.copy.split("^")[0];
        }
            
        

        $panelTitle.text(title);
        $panelCopy.text(copy);
        $panelFigure.text(fig);
        $("div#panelTitle"+id).css({'color': colours[id]});
        
        console.log("colour " + colours[id] );

        drawChart(id, 0);


       }
       
              
    function createData(){
    var i
        ,j;
        var listLength = chartData.length;
        
 
        for ( i = 0; i < listLength; i++) {
           // console.log("data series " + i);
            var len = chartData[i].length;
            
            charts[i] = [];
            
            var day = 1;
            var month =0;
            var year =2007;
            
               //items 0 and 3 are quarterly rest are monthly
            var step;
             if (i===0 || i===3){
                step =  3;// quarter

            } else{
                step = 1; // month
            }
                
            for ( j = 0; j < len; j++ ) {

                var newDate =  new Date(year, month, day).getTime();


                charts[i].push( [newDate, chartData[i][j] ]);
                                
                month = month + step;
                if(month>11){
                    month=0;
                    year++;
                }
                
            }
           
        }
    }


        
    function populateChartData(){
        var i
        ,j;
        var listLength = chartData.length;
        
 
        for ( i = 0; i < listLength; i++) {
            console.log("data series " + i);
            var len = chartData[i].length;
            
            charts[i] = [];
            
            var day = 1;
            var month =0;
            var year =2007;
            
               //items 0 and 3 are quarterly rest are monthly
            var step;
             if (i===0 || i===3){
                step =  3;// quarter

            } else{
                step = 1; // month
            }
                
            for ( j = 0; j < len; j++ ) {

                var newDate =  new Date(year, month, day).getTime();


                charts[i].push( [newDate, chartData[i][j] ]);
                                
                month = month + step;
                if(month>11){
                    month=0;
                    year++;
                }
                
            }
           
        }
    }


      function loadData(){
        console.log("load data here");
        
        $.ajax({
            dataType: "json",
            //url: 'products.json',//http://www.ons.gov.uk/ons/interactive/ons-statistics-products/data.js
            url: '../data/products.json',
            data: "String",
            success: function(data, status, xhr) {
                   
                console.log("success");
                    
                    products = data.products;
                    chartData = data.chartData;
                    script = data.script;
                    scriptTitle = data.scriptTitle;  
                    
                    populateChartData();
                    
                    init();

            },
            error: function(data) {
                   
                console.log("error");
                    
                }
        });

    }
        
        
    //----------------------------------
    //  init doc...
    //----------------------------------
    
    
    function init()
    {
        console.log("CODE READY");
        //createData();
        
        
        var i;
        
        for ( i=1; i<13; i++){
            showPanel(i);
        }
        
        
        
    }






    document.addEventListener( "DOMContentLoaded", function() {
        console.log("DOMCONtent loaded " ) ;
         loadData();
        
    });





    

    
}());