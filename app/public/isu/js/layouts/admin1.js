'use strict';

var rowIdx = 0; //출력 시작 인덱스
var dataCnt = 0; // 출력 종료 인덱스
var inCnt = 10; //한번에 화면에 조회되는 리스트 수
var incident_id ='';
var cnt =0; //modal창 갯수

$(document).ready(function () {
    //미승인 사용자 카운트 로드
    getDataCnt();


});

/**
 * 미승인 사용자 수 가져오기
 */

function getDataCnt() {
    $.ajax({
        type: "GET",
        async: true,
        url: "/usermanageAccess/list",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        //data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            $('#ajax_indicator').css("display", "none");
            alert("error : " + error);
        },
        beforeSend: function () {
            $('#ajax_indicator').css("display", "");
        },
        success: function (dataObj) {
            //alert(dataObj.length);
            $('.badge').text(dataObj.length);
            //$('#ajax_indicator').css("display", "none");
            //페이징 처리
            //setDataList(dataObj, selectedPage);
            //totalData = dataObj.length;
            //totalPage = Math.ceil(totalData / dataPerPage);
            //$('#totalPage').text(totalPage);
            //paging(totalData, dataPerPage, pageCount, selectedPage);
        }
    });
}