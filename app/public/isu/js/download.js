'use strict'; 

function fnTableToExcel(dvData){
    var tab_text="<table border='2px'><tr bgcolor='#87AFC6'>";
    var textRange; 
    var j=0;
    var tab = dvData; // id of table
    for(j = 0 ; j < tab.rows.length ; j++) {
        tab_text=tab_text+tab.rows[j].innerHTML+"</tr>";
    }

    tab_text=tab_text+"</table>";
    tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
    tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE "); 

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {     // If Internet Explorer
        txtArea1.document.open("txt/html","replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus(); 
        var sa=txtArea1.document.execCommand("SaveAs",true,"exceldownload.xls");
    } else {                //other browser not tested on IE 11
        var sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
    }  
    return (sa);
}


function fnAllExcel(JsonData){

    var arrData = typeof JsonData != 'object' ? JSON.parse(JsonData) : JsonData;

    var tab_text="<table border='1px'>";
    tab_text += "<tr bgcolor='#87AFC6'>";
    
    /*
    for (var index in arrData[0]) {
        tab_text=tab_text+ "<th>"+index+"</th>";
    }
    */
    tab_text=tab_text+ "<th>진행상태</th>";
    tab_text=tab_text+ "<th>상위업무</th>";
    tab_text=tab_text+ "<th>하위업무</th>";
    tab_text=tab_text+ "<th>요청자이름</th>";
    tab_text=tab_text+ "<th>요청자회사</th>";
    tab_text=tab_text+ "<th>요청자부서</th>";
    tab_text=tab_text+ "<th>등록일자</th>";
    tab_text=tab_text+ "<th>완료일자</th>";
    tab_text=tab_text+ "<th>요청제목</th>";
    tab_text=tab_text+ "<th>고객요청내용</th>";
    tab_text=tab_text+ "<th>담당자이름</th>";
    tab_text=tab_text+ "<th>처리내용</th>";
    tab_text=tab_text+ "<th>처리소요시간</th>";


    tab_text += "</tr>";

    for (var i = 0; i < arrData.length; i++) {
        tab_text += "<tr>";    
        /*for (var index in arrData[i]) {
            alert("index"+index);
            if(arrData[i][index] == ""){
                tab_text += "<td></td>";
            }else{
                tab_text += "<td>"+arrData[i][index]+"</td>";

            }
        }*/
        if(arrData[i]['status_nm'] != null){
            tab_text += "<td>"+arrData[i]['status_nm']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['higher_nm'] != null){
            tab_text += "<td>"+arrData[i]['higher_nm']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['lower_nm'] != null){
            tab_text += "<td>"+arrData[i]['lower_nm']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['request_nm'] != null){
            tab_text += "<td>"+arrData[i]['request_nm']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['request_company_nm'] != null){
            tab_text += "<td>"+arrData[i]['request_company_nm']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['request_dept_nm'] != null){
            tab_text += "<td>"+arrData[i]['request_dept_nm']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['register_date'] != null){
            tab_text += "<td>"+arrData[i]['register_date']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['complete_date'] != null){
            tab_text += "<td>"+arrData[i]['complete_date']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['title'] != null){
            tab_text += "<td>"+arrData[i]['title']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['content'] != null){
            tab_text += "<td>"+arrData[i]['content'].replace(/<br>/g,"").replace(/<\/p>/g, "").replace(/<p>/g, "")+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['manager_nm'] != null){
            tab_text += "<td>"+arrData[i]['manager_nm']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['complete_content'] != null){
            tab_text += "<td>"+arrData[i]['complete_content'].replace(/<br>/g,"").replace(/<\/p>/g, "").replace(/<p>/g, "")+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        if(arrData[i]['work_time'] != null){
            tab_text += "<td>"+arrData[i]['work_time']+"</td>";
        }else{
            tab_text += "<td></td>";
        }
        //.select ('title content')
        //.select('status_nm higher_nm lower_nm request_nm request_company_nm request_dept_nm register_date receipt_date complete_date title content complete_content work_time')
        //.sort('-created_at');
        tab_text += "</tr>";
    }
     
    tab_text=tab_text+"</table>";


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
        var sa = txtArea1.document.execCommand("SaveAs",true,"exceldownload.xls");
    } else {                //other browser not tested on IE 11
        var sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
    }  
    return (sa);
    
}

function fnJsonToExcel(JsonData){
    //var arrData = typeof JsonData != 'object' ? JSON.parse(JsonData) : JsonData;
    //var dataVal = JSON.stringify(arrData);
    //alert("dataVal"+dataVal);
    var arrData = typeof JsonData != 'object' ? JSON.parse(JsonData) : JsonData;
    var tab_text = '';

    var row = "";
    for (var index in arrData[0]) {
        row += index + ',';
    }
    row = row.slice(0, -1);
    //tab_text += row + '\r\n';
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
        var sa = txtArea1.document.execCommand("SaveAs",true,"exceldownload.xls");
    } else {                //other browser not tested on IE 11
        //sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
        var sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
    }  
    return (sa);
}

function getJsonData(){
    var reqParam = $($('form')).serialize();
    $.ajax({
        type: "GET",
        url: "/incident/exceldownload",
        contentType: "application/json",
        //data: JSON.stringify({}),
        data: reqParam, // $($('form')).serialize()
        dataType: "json",
        success: function(data, status){
            //fnJsonToExcel(JSON.stringify(data));
            fnAllExcel(JSON.stringify(data));
        },
        error: function(data, status, err) {
            return;
        }
    });
}
