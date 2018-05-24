'use strict';

$(document).ready(function() { 

    //조회 버튼 클릭 시
    $('#searchBtn').on('click', function () {
        setHigherOptGroup();
    });

    //상위 업무 변경 시
    $('#higher_cd').on('change', function () {
        setHigherOptGroup();
    });

    //전체 선택 시
    $('#select-all').on('click', function () {
        $('#myProcessSelect').multiSelect('select_all');
    });

    //전체 취소 시
    $('#deselect-all').on('click', function () {
        $('#myProcessSelect').multiSelect('deselect_all');
    });

    //저장 버튼 클릭 시
    $('#saveBtn').on('click',function(){
        if(confirm("등록하시겠습니까?")){
            saveMyProcess();
        }
    });


    //상위 업무 조회
    getHigherProcess();
});

/**
 * 상위 업무 가져오기
 */
function getHigherProcess(){
    //var reqParam = 'company_cd=' + company_cd ;
    $.ajax({          
        type: "GET",
        async: true,
        url: "/higherProcess/getHigherProcess/",
        contentType: "application/json",
        //data : reqParam,
        dataType: "json", 
        error: function (request, status, error) {
            alert("getHigherProcess : " + error+ " "+request.responseText);
        },         
        success: function( data ) { 
            setHigherProcess(data);
            
            //상위업무 그룹세팅
            setHigherOptGroup();
        }             
    }); 
}

/**
 * select에 상위 업무 세팅
 * @param {*} data : higher_cd
 */
function setHigherProcess(data){
    $('#higher_cd').empty();
    $('#higher_cd').append("<option value='*'> 전체</option>");
    for(var i=0; i<data.length; i++){
        $('#higher_cd').append("<option value='"+data[i]["higher_cd"]+"'>"+data[i]["higher_nm"]+"</option>");
    }
}

/**
 * select에 higher_cd group을 세팅
 */
function setHigherOptGroup(){
     
    $('#myProcessSelect').empty();
    $('#myProcessSelect').multiSelect('refresh');

    var optionHtml = "";
    if($('#higher_cd').val() != '*'){
        optionHtml = "<optgroup label='"+$('#higher_cd option:selected').text()+"' />";
    }else{
        $('#higher_cd option').each(function(){
            optionHtml += "<optgroup label='"+$(this).text()+"' />";
        });
    }
    $('#myProcessSelect').html(optionHtml);
    //$('#myProcessSelect').multiSelect('refresh');

    //전체 하위 업무 가져오기
    getLowerProcess();
}

/**
 * 전체 하위 업무 가져오기
 */
function getLowerProcess() { 
    //var reqParam = 'searchText=' + encodeURIComponent($('#searchText').val());
    var reqParam = 'higher_cd=' + $('#higher_cd').val();
    $.ajax({
        type: "GET",
        async: true,
        url: "/lowerProcess/getLowerProcess",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        data: reqParam, // $($('form')).serialize()
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("getMyProcess error : " + error+ " "+request.responseText);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setLowerProcess(dataObj);
            getMyProcess();
        }
    });
}

/**
 * 하위 업무 세팅
 * @param {*} data  : myProcess
 */
function setLowerProcess(data){
    var idx = 0;
    var higher_nm = "";
    for(var i=0; i < data.length ; i++){
        
        //option group index값 조정
        if(higher_nm != data[i].higher_nm){
            idx = 0;
            higher_nm = data[i].higher_nm;
        }

        var optValue = data[i].higher_cd + "^" +data[i].higher_nm + "^" +data[i].lower_cd + "^" + data[i].lower_nm;
        $('#myProcessSelect').multiSelect('addOption',{value : optValue, text : data[i].lower_nm, index : idx++, nested : data[i].higher_nm});
    }
    
    $('#myProcessSelect option').each(function(){
        $(this).addClass('p-l-80');
    });
    
    $('#myProcessSelect').multiSelect('refresh');
}

/**
 * 나의 업무 가져오기
 */
function getMyProcess() { 
    //var reqParam = 'searchText=' + encodeURIComponent($('#searchText').val());
    var reqParam = 'higher_cd=' + $('#higher_cd').val();
    $.ajax({
        type: "GET",
        async: true,
        url: "/myProcess/getMyProcess",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        data: reqParam, // $($('form')).serialize()
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("getMyProcess error : " + error+ " "+request.responseText);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setMyProcess(dataObj);
        }
    });
}

/**
 * 나의 업무 세팅
 * @param {*} data  : myProcess
 */
function setMyProcess(data){
    var myProcess = Array();
    for(var i=0; i<data.length; i++){
        myProcess.push(data[i].higher_cd + "^" +data[i].higher_nm + "^" +data[i].lower_cd + "^" + data[i].lower_nm);
    }

    $('#myProcessSelect').multiSelect('select',myProcess);
}

/**
 * 나의 업무 저장
 */
function saveMyProcess(){
    var myProcess = $("#myProcessSelect").val().toString();
    var reqParam = "higher_cd=" + $('#higher_cd').val()+"&myProcess="+encodeURIComponent(myProcess);

    $.ajax({
        type: "POST",
        async: true,
        url: "/myProcess/edit",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        data: reqParam, // $($('form')).serialize()
        //contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("saveMyProcess error : " + error+ " "+request.responseText);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            alert(dataObj.message);
        }
    });
}