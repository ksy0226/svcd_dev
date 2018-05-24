'use strict'; 

function fnTableToExcel(dvData){
    var tab_text="<table border='2px'><tr bgcolor='#87AFC6'>";
    var textRange; var j=0;
    var tab = dvData; // id of table
    
    for(j = 0 ; j < tab.rows.length ; j++) {     
        tab_text=tab_text+tab.rows[j].innerHTML+"</tr>";
        //tab_text=tab_text+"</tr>";
    }

    //alert(tab_text);

    tab_text=tab_text+"</table>";
    tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
    tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

    //alert(tab_text);

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE "); 

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {     // If Internet Explorer
        txtArea1.document.open("txt/html","replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus(); 
        sa=txtArea1.document.execCommand("SaveAs",true,"exceldownload.xls");
    } else {                //other browser not tested on IE 11
        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
    }  
    return (sa);
}

/*
function fnAllExcel(JsonData){
    var tab_text="<table border='2px'>";
    var textRange; var j=0;
    var tab = JsonData; // id of table
    
    tab_text += "<tr bgcolor='#87AFC6'>";
    tab_text += "<th>칼럼1</th>";
    tab_text += "<th>칼럼2</th>";
    tab_text += "</tr>";
    tab_text += "</table>";

    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text = tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE "); 

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {     // If Internet Explorer
        txtArea1.document.open("txt/html","replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus(); 
        sa=txtArea1.document.execCommand("SaveAs",true,"exceldownload.xls");
    } else {                //other browser not tested on IE 11
        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
    }  
    return (sa);
}
*/
function fnJsonToExcel(JsonData){
    var arrData = typeof JsonData != 'object' ? JSON.parse(JsonData) : JsonData;
    var tab_text = '';

    var row = "";
    for (var index in arrData[0]) {
        row += index + ',';
    }
    row = row.slice(0, -1);
    tab_text += row + '\r\n';

    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }
        row.slice(0, row.length - 1);
        tab_text += row + '\r\n';
    }
    
    if (tab_text == '') {
        return;
    }
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE "); 

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {     // If Internet Explorer
        txtArea1.document.open("txt/html","replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus(); 
        sa=txtArea1.document.execCommand("SaveAs",true,"exceldownload.xls");
    } else {                //other browser not tested on IE 11
        //sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
    }  
    return (sa);
}

function getJsonData(){
    $.ajax({
        type: "GET",
        url: "/company/exceldownload",
        contentType: "application/json",
        data: JSON.stringify({}),
        dataType: "json",
        success: function(data, status){
            fnJsonToExcel(JSON.stringify(data));
        },
        error: function(data, status, err) {
            console.log("err : "+err);
            return;
        }
    });
}
