//--------------------------------------------------------------------------
//
//  table visualisation
//
//--------------------------------------------------------------------------


var tables = (function(){
    "use strict";



    /* FILTER MULTIPLES

    Firstly the filter type needs to be set to regexp so we can filter with regular expressions
    {name:'Animal', type:'string', filterable:true, filterType:'regexp'}
    Then the filter needs to us a regular expression like so
    filters{'Animal':/Elephant|Giraffe|Armadillo/} 
    */




    // Define the structure of fields, if this is not defined then all fields will be assumed
    // to be strings.  Name must match csv header row (which must exist) in order to parse correctly.
    var fields = [
        //Timestamp,Gender,Age,City,Country,Twitter,Month,Year,Interest,Years Elapsed,Months Elapsed,Focus,Extent,lat,lon,,,
        
        // filterable fields
       // {name: 'Timestamp',         type: 'string', filterable: true, filterType: 'regexp'},
         {name: 'Timestamp',         type: 'string', filterable: false} 
       , {name: 'Gender',            type: 'string', filterable: true}
       , {name: 'Age',               type: 'string', filterable: true}
       , {name: 'City',              type: 'string', filterable: true}
       , {name: 'Country',           type: 'string', filterable: true}
       , {name: 'Twitter',           type: 'string', filterable: false}
       , {name: 'Focus',           type: 'string', filterable: true}

        ]


        function setupPivot(input){
          console.log("set up pivot");

            input.callbacks = {afterUpdateResults: function(){
              console.log("set up pivot: input callback");


              $('#results > table').dataTable({
                  "sDom": "<'row'<'span5'l><'span4'f>>t<'row'<'span6'i><'span6'p>>",
                  "iDisplayLength": 50,
                  "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
                  "sPaginationType": "bootstrap",
                  "oLanguage": {
                    "sLengthMenu": "_MENU_ records per page"
                  },

                  // this is the list of columns need a custom renderer for each (or null)
                "aoColumns":[
                  null,
                  { "fnRender": function (oObj) {
                    console.log(oObj.aData[1]);
                          return '<a href=http://twitter.com/' + oObj.aData[1] + ' target="_blank">' + oObj.aData[1] + '</a>';
                        }
                  }
                  ,null,null,null,null,null
                ]
              });


          }};

          console.log("BEFORE set up pivot");
          $('#pivot-demo').pivot_display('setup', input);
          console.log("AFTER set up pivot");

         // calcTwitSplit();

      };




      function calcTwitSplit(){
          console.log("complte");
          var results = pivot.data('all');
          var length = results.length;
          var blank = 0;
          for (var i=0; i<length; i++){
            if(results[i].Twitter===""){
                blank++;
            }
        }
        var blank_pc = Math.round(100 * blank/length);
        var twit_pc = 100 - blank_pc;

        console.log("Twitter: " + twit_pc +"%. None: " + blank_pc  +"%");
         // console.log(pivot.data('all'));

         if( ! isNaN(twit_pc) ){
            $('#twit').text("With " + twit_pc +"%");
            $('#blank').text("Without " + blank_pc  +"%");
        }
    }

    //----------------------------------
    //  init doc...
    //----------------------------------
    
    $(document).ready(function() {

       console.log("Document ready loaded" ) ;
        // load and init PIVOT table
        setupPivot({url:'../data/cleanSurvey.csv', fields: fields, filters: {}, rowLabels:["Timestamp", "Twitter", "Gender", "Age", "City", "Country", "Focus"  ]})

        

        // prevent dropdown from closing after selection
        $('.stop-propagation').click(function(event){
          event.stopPropagation();

          calcTwitSplit();

      });


    });

    

    
}());