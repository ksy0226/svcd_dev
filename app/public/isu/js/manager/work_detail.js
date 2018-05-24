'use strict';

$(document).ready(function () {
    $('input[name="incident[complete_reserve_date]"]').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "yyyy-mm-dd",
    });
    //오늘날짜 설정
    setDatepickerToday($('input[name="incident[complete_reserve_date]"]'));
    
    //저장버튼 클릭 시
    $('#receiptSaveBtn').on('click', function () {
        receiptSave();
    });
    
    //select박스 초기화
    setSelectBox();
});

/**
 * 접수 내용 저장
 */
function receiptSave(){
    var reqParam = $('#receipt_form').serialize();
    $.ajax({
        type: "POST",
        async: true,
        url: "/manager/saveReceipt/"+$('#incident_id').val(),
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("receiptSave error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            if(dataObj.success){
                //$(location).attr('href','/manager/work_list');
                history.back(1);
            }else{
                alert('e : '+JSON.stringify(dataObj));
            }
        }
    });
}

/**
 * select박스 초기화
 */
function setSelectBox(){

    //시간 세팅
    $('select[name="complete_hh"]').empty();
    for(var i = 0; i < 24; i++){
        if(i < 10){
            $('select[name="complete_hh"]').append("<option value='0"+i+"'>0"+i+"</option>");
        }else{
            $('select[name="complete_hh"]').append("<option value='"+i+"'>"+i+"</option>");
        }
    }
    $('select[name="complete_hh"]').val('18');

    //분 세팅
    $('select[name="complete_mi"]').empty();
    $('select[name="complete_mi"]').append("<option value='00'>00</option>");
    $('select[name="complete_mi"]').append("<option value='10'>10</option>");
    $('select[name="complete_mi"]').append("<option value='20'>20</option>");
    $('select[name="complete_mi"]').append("<option value='30'>30</option>");
    $('select[name="complete_mi"]').append("<option value='40'>40</option>");
    $('select[name="complete_mi"]').append("<option value='50'>50</option>");

    //난이도 세팅
    $('select[name="incident[complete_reserve_date]"]').empty();
    $('select[name="incident[complete_reserve_date]"]').append("<option value='S'>S</option>");
    $('select[name="incident[complete_reserve_date]"]').append("<option value='A'>A</option>");
    $('select[name="incident[complete_reserve_date]"]').append("<option value='B'>B</option>");
    $('select[name="incident[complete_reserve_date]"]').append("<option value='C'>C</option>");
    $('select[name="incident[complete_reserve_date]"]').append("<option value='D'>D</option>");

}

/**
 * Datepicker 오늘 날짜 설정
 */ 
function setDatepickerToday(datepicker) {
    var d = new Date();
    datepicker.datepicker("setDate", new Date(d.getFullYear(), d.getMonth(), d.getDate()));
}
