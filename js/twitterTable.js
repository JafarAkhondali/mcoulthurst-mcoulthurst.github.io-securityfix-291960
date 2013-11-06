//--------------------------------------------------------------------------
//
//  twitter list visualisation
//
//
//  Go without a coat when it's cold; find out what cold is. 
//  Go hungry; keep your existence lean. 
//  Wear away the fat, get down to the lean tissue and see what it's all about. 
//  The only time you define your character is when you go without. 
//  In times of hardship, you find out what you're made of and what you're capable of. 
//  If you're never tested, you'll never define you character. 
//
//  - Henry Rollins
//--------------------------------------------------------------------------


var dashboard = (function(){
    "use strict";
   

    var peopleList;
    var maxDepth = 0;

         
    function createLayout(){
        var i
        , listLength = peopleList.length-800
        , description = "";
 
        for ( i = 0; i < listLength; i=i+3) {
           // console.log("data series " + i);
           // var len = peopleList[i].length;

            var item1 = peopleList[i+1];
            var item2 = peopleList[i+2];
            var item3 = peopleList[i+3];

            //console.log();
            //<tr> <td>1, 0</td> <td>2, 0</td> <td>3, 0</td> </tr>
            description += "<tr> <td>";
            description += "<div class='box' id='" + item1.screen_name + "'>";
            description += "<a href='https://twitter.com/" + item1.screen_name + "'><img class='profile' src='" + item1.img_url + "' target='_blank'/></a>";
            description += "<div class='names'> " ;
            description += "<div class='screen_name'><a href='https://twitter.com/" + item1.screen_name + "' target='_blank'>"  + item1.screen_name + "</a></div>";
            description += "<div class='name'> "  + item1.name + "</div>";
 /*         description += "<div class='copy'> "  + item1.description + "</div>";
            description += "<div class='stat'>Fr <span>"  + item.friend + "</span></div>";
            description += "<div class='stat'>Fo <span>"  + item.follow + "</span></div>";
            description += "<div class='stat'>Tw <span>"  + item.tweet + "</span></div>";*/
            description += "</div>";
            description += "</div>";
            description += "</td> <td>";

            description += "<div class='box' id='" + item2.screen_name + "'>";
            description += "<a href='https://twitter.com/" + item2.screen_name + "'><img class='profile' src='" + item2.img_url + "' target='_blank'/></a>";
            description += "<div class='names'> " ;
            description += "<div class='screen_name'><a href='https://twitter.com/" + item2.screen_name + "' target='_blank'>"  + item2.screen_name + "</a></div>";
            description += "<div class='name'> "  + item2.name + "</div>";
/*          description += "<div class='copy'> "  + item.description + "</div>";
            description += "<div class='stat'>Fr <span>"  + item.friend + "</span></div>";
            description += "<div class='stat'>Fo <span>"  + item.follow + "</span></div>";
            description += "<div class='stat'>Tw <span>"  + item.tweet + "</span></div>";*/
            description += "</div>";
            description += "</div>";
            description += "</td> <td>";

            description += "<div class='box' id='" + item3.screen_name + "'>";
            description += "<a href='https://twitter.com/" + item3.screen_name + "'><img class='profile' src='" + item3.img_url + "' target='_blank'/></a>";
            description += "<div class='names'> " ;
            description += "<div class='screen_name'><a href='https://twitter.com/" + item3.screen_name + "' target='_blank'>"  + item3.screen_name + "</a></div>";
            description += "<div class='name'> "  + item3.name + "</div>";
/*          description += "<div class='copy'> "  + item.description + "</div>";
            description += "<div class='stat'>Fr <span>"  + item.friend + "</span></div>";
            description += "<div class='stat'>Fo <span>"  + item.follow + "</span></div>";
            description += "<div class='stat'>Tw <span>"  + item.tweet + "</span></div>";*/
            description += "</div>";
            description += "</div>";
            description += "</td> <td>";


           
        }


        $("#tableBody").append(description);
/*   
        $('.box').hover(function() {
            var box = $(this);

         
            var top = parseInt( box.css("top"), 10);
            //console.log(box.attr("id"));
            //console.log(box.attr("id") + ": " + top);

            var z = parseInt( $(this).css( "z-index" ), 10 );
            console.log($(this).attr("id") + ": " + z);
            if(isNaN(z)){
                z=0;
            }
            // Keep either the current max, or the current z-index, whichever is higher
            maxDepth = Math.max( maxDepth, z );
            maxDepth++;

            
            $(this).css("z-index", maxDepth);

            if(box.hasClass("offstack")){
                $(this).animate({top: "0px"}, 400, null, function(){
                    box.removeClass("offstack");
                    box.addClass("onstack");
                });
                
            }

            if(box.hasClass("onstack")){
                
                $(this).animate({top: "200px"}, 400, null, function(){
                    box.removeClass("onstack");
                    box.addClass("offstack");
                });

            }
            console.log("maxDepth " + maxDepth);
        }, function (){
            //console.log("out");
        });

*/
    }


        
   


      function loadData(){
        console.log("load data here");
        
        $.ajax({
            dataType: "json",
            //url: 'products.json',//http://www.ons.gov.uk/ons/interactive/ons-statistics-products/data.js
            url: '../data/twitter.json',
            data: "String",

            success: function(data, status, xhr) {
                console.log("success");
                //console.log(data.ppl);
                    
                peopleList = data.ppl;
                createLayout();
            },

            error: function(data) {
                   
                console.log("error");
                    
            }
        });

    }
        
        
    //----------------------------------
    //  init doc...
    //----------------------------------
    

    document.addEventListener( "DOMContentLoaded", function() {
        console.log("DOMCONtent loaded " ) ;
         loadData();


        
    });





    

    
}());