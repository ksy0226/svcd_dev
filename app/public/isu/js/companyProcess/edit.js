'use strict';

$(document).ready(function() { 
    //조회 버튼 클릭 시
    $('#searchBtn').on('click', function () {
        getHigherProcess();
    });

    //회사 업무 변경 시
    $('#company_cd').on('change', function () {
        getHigherProcess();
    });

    //전체 선택 시
    $('#select-all').on('click', function () {
        $('#companyProcessSelect').multiSelect('select_all');
    });

    //전체 취소 시
    $('#deselect-all').on('click', function () {
        $('#companyProcessSelect').multiSelect('deselect_all');
    });

    //저장 버튼 클릭 시
    $('#saveBtn').on('click',function(){
        if(confirm("등록하시겠습니까?")){
            saveCompanyProcess();
        }
    });

    //회사 정보 조회
    getCompany();
});

/**
 * 회사 정보 조회
 */
function getCompany(){
    //var reqParam = 'company_cd=' + company_cd ;
    $.ajax({          
        type: "GET",
        async: true,
        url: "/company/getCompany/",
        contentType: "application/json",
        //data : reqParam,
        dataType: "json", 
        error: function (request, status, error) {
            alert("getCompany : " + error+ " "+request.responseText);
        },         
        success: function( data ) { 
            setCompany(data);
        }             
    }); 
}
 
/**
 * 회사 정보 세팅
 */
function setCompany(data){
    $('#company_cd').empty();
    $('#company_cd').append("<option value='-'>선택되지 않음</option>");
    for(var i=0; i<data.length; i++){
        $('#company_cd').append("<option value='"+data[i]["company_cd"]+"'>"+data[i]["company_nm"]+"</option>");
    }
}

/**
 * 상위 업무 가져오기
 */
function getHigherProcess(){
    if($('#company_cd').val() != '-'){
        //var reqParam = 'company_cd=' + $('#company_cd').val() ;
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
                getCompanyProcess();
            }             
        }); 
    }
}

/**
 * select에 higher_cd를 세팅
 */
function setHigherProcess(data){
    
   $('#companyProcessSelect').empty();
   $('#companyProcessSelect').multiSelect('refresh');

   for(var i=0; i < data.length ; i++){
       var optValue = data[i].higher_cd + "^" +data[i].higher_nm;
       $('#companyProcessSelect').multiSelect('addOption',{value : optValue, text : data[i].higher_nm});
   }
   
   $('#companyProcessSelect option').each(function(){
       $(this).addClass('p-l-80');
   });
   
   $('#companyProcessSelect').multiSelect('refresh');

}

/**
 * 회사별 상위 업무 가져오기
 */
function getCompanyProcess(){
    if($('#company_cd').val() != '-'){
        var reqParam = 'company_cd=' + encodeURIComponent($('#company_cd').val()) ;
        $.ajax({          
            type: "GET",
            async: true,
            url: "/companyProcess/getCompanyProcess/",
            contentType: "application/json",
            data : reqParam,
            dataType: "json", 
            error: function (request, status, error) {
                alert("getCompanyProcess : " + error+ " "+request.responseText);
            },         
            success: function( data ) { 
                setCompanyProcess(data);
            }             
        }); 
    }
}


/**
 * 회사별 상위 업무 가져오기
 */
function setCompanyProcess(data){
    var companyProcess = Array();
    for(var i=0; i<data.length; i++){
        companyProcess.push(data[i].higher_cd + "^" +data[i].higher_nm);
    }

    $('#companyProcessSelect').multiSelect('select',companyProcess);
}

/**
 * 회사 업무 저장
 */
function saveCompanyProcess(){
    var companyProcess = $("#companyProcessSelect").val().toString();
    var reqParam = "company_cd=" + $('#company_cd').val()+"&companyProcess="+companyProcess;
    $.ajax({
        type: "POST",
        async: true,
        url: "/companyProcess/edit",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        data: reqParam, // $($('form')).serialize()
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("saveCompanyProcess error : " + error+ " "+request.responseText);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            alert(dataObj.message);
        }
    });
}