$( document ).ready(function() {
            
    var id,code,name,content;
    

    $(".active").click(function(){
        $("#lessonForm").slideDown(1000);
        $.ajax({
            method:"GET",
            url:"/lesson",
            })
        .done(function(response){
           id = response[0]._id;
           code = response[0].code;
           name = response[0].name;
           content = response[0].content;
           $("#lessonCode").val(code);
           $("#lessonName").val(name);
           $("#lessonContent").val(content);
        })
        .fail(function(jqXHR, textStatus, err){
            console.log("Error response: "+textStatus)
        });
    });

    $("#lessonCode").keyup(function(){
        PutRequest();
    });
    $("#lessonName").keyup(function(){
        PutRequest();
    });
    $("#lessonContent").keyup(function(){
        PutRequest();
    });

    function PutRequest(){
        var sendData = TakeFormValues();
        $.ajax({
            url    : "/lesson/"+id,
            data   : sendData,
            dataType: "json",
            method : "PUT",
            success: function(data){
                $("#lessonCodeCol").html(data.code);
                $("#lessonNameCol").html(data.name);

            }
        }); 
    }

    function TakeFormValues(){
          var jsonData = {
                code : $("#lessonCode").val(),
                name : $("#lessonName").val(),
                content : $("#lessonContent").val()
            }
            return jsonData;
    }

    

    function ShowXML(){
        $.ajax({
            method:"GET",
            url:"/show-xml",
            })
        .done(function(data){
            $("#data-show").val(data);
        })
        .fail(function(jqXHR, textStatus, err){
            console.log("Error response: "+textStatus)
        });
    }
    
    function ShowJSON(){
        $.ajax({
            method:"GET",
            url:"/show-json",
            })
        .done(function(data){
            $("#data-show").val(data);
        })
        .fail(function(jqXHR, textStatus, err){
            console.log("Error response: "+textStatus)
        });
    }

    $("#jsonButton").click(function(){
        ShowJSON();
    });
    $("#xmlButton").click(function(){
       ShowXML();
    });
});