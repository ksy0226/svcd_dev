'use strict';

var rowIdx = 0; //출력 시작 인덱스
var dataCnt = 0; // 출력 종료 인덱스
var inCnt = 10; //한번에 화면에 조회되는 리스트 수

$(document).ready(function () {
    //최초 조회
    getDataList();
    //미평가 조회
    getDataList2()
    //메인 카운트 로드
    cntLoad();
});

//메인 카운트 로드
function cntLoad() {
    $.ajax({
        type: "GET",
        async: true,
        url: "/statistic/cntload",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: {},
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("cntLoad error : " + error);
        },
        beforeSend: function (dataObj) {
        },
        success: function (dataObj) {
            setCntLoad(dataObj);
        }
    });
}

function setCntLoad(dataObj) {
    $('#status' + "1").html(0);
    $('#status' + "2").html(0);
    $('#status' + "3").html(0);
    $('#status' + "4").html(0);
    for (var i = 0; i < dataObj.length; i++) {
        
        $('#status' + dataObj[i]._id.status_cd).html(dataObj[i].count);
        
        //if($('#status' + dataObj[i]._id.status_cd) == null){
        //    dataObj[i].count =="0";
        //}

        if ($('#status' + (i)).text() == "") {        //없으면 0

            $('#status' + (i)).text("0");
            //$('#chart' + (i)).text("0");
            //alert(dataObj[i]._id.status_cd-1);  //3

            $('#chart' + (dataObj[i]._id.status_cd - 1)).attr('data-text', 0 + "%");
            $('#chart' + (dataObj[i]._id.status_cd - 1)).attr('data-percent', 0);
        }
    }

    $('#chart1').attr('data-text', "0" + "%");
    $('#chart1').attr('data-percent', "0");
    $('#chart2').attr('data-text', "0" + "%");
    $('#chart2').attr('data-percent', "0");
    $('#chart3').attr('data-text', "0" + "%");
    $('#chart3').attr('data-percent', "0");
    $('#chart4').attr('data-text', "0" + "%");
    $('#chart4').attr('data-percent', "0");
    
    for (var i = 0; i < dataObj.length; i++) {
        var total; //전체카운트
        //total = Number($('#status1').text()) + Number($('#status2').text()) + Number($('#status3').text()) + Number($('#status4').text());
        total = Number($('#status1').text()) + Number($('#status2').text());

        if (dataObj[i]._id.status_cd == "1") {                      //'접수대기'일 경우
            var totalCnt = total;
            var percent = Math.round((dataObj[i].count / totalCnt) * 100);

            $('#chart1').attr('data-text', percent + "%");
            $('#chart1').attr('data-percent', percent);
        }
        else if (dataObj[i]._id.status_cd == "2") {                 //'처리중'일 경우
            var totalCnt = total;
            var percent = Math.round((dataObj[i].count / totalCnt) * 100);

            $('#chart2').attr('data-text', percent + "%");
            $('#chart2').attr('data-percent', percent);
        }
        else if (dataObj[i]._id.status_cd == "3") {                 //'미평가'일 경우
            var totalCnt = dataObj[i].count + Number($('#status4').text());
            var percent = Math.round((dataObj[i].count / totalCnt) * 100); // (129/129+160)*100 반올림 처리

            $('#chart3').attr('data-text', percent + "%");
            $('#chart3').attr('data-percent', percent);

        } else if (dataObj[i]._id.status_cd == "4") {                //'처리완료'일 경우
            var totalCnt = dataObj[i].count + Number($('#status3').text());
            var percent = Math.round((dataObj[i].count / totalCnt) * 100); // (160/129+160)*100 반올림 처리
            $('#chart4').attr('data-text', percent + "%");
            $('#chart4').attr('data-percent', percent);
        }
    }
    $('.circliful-chart').circliful();
}

function getDataList() {
    var reqParam = '';
    $.ajax({
        type: "GET",
        async: true,
        url: "/login/main_list",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("getDataList error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setDataList(dataObj);
        }
    });
}

//내용 매핑
function setDataList(dataObj) {
    //기존 데이터 삭제
    $("#more_list tr").remove();

    rowIdx = 0;
    dataCnt = 0;

    //조회 내용 추가
    if (rowIdx < dataObj.length) {

        if ((rowIdx + inCnt) < dataObj.length) {
            dataCnt = rowIdx + inCnt;
        } else {
            dataCnt = dataObj.length;
        }

        for (var i = rowIdx; i < dataCnt; i++) {
            /*
            var creat_dateVal = dataObj[i].created_at;
            creat_dateVal = creat_dateVal.substring(0, 10);
            var complete_dateVal = dataObj[i].complete_date;
            complete_dateVal = complete_dateVal.substring(0, 10);
            */

            var addList = "";
            addList += "<tr onclick=window.location='/incident/' style='cursor:pointer'>";
            addList += "	<td>" + dataObj[i].title + "</td>";
            addList += "	<td class='text-center'>" + dataObj[i].register_date + "</td>";
            addList += "	<td class='text-center'>" + dataObj[i].app_menu + "</td>";
            addList += "	<td class='text-center'>" + dataObj[i].status_nm + "</td>";
            addList += "	<td class='text-center'>" + dataObj[i].manager_nm + "</td>";
            addList += "	<td class='text-center'>" + dataObj[i].complete_date + "</td>";
            addList += "</tr>";

            $("#more_list").append(addList);

            rowIdx++;
        }

        // 진행상태
        $('#more_list > tr').each(function () {
            // 진행상태
            if ($(this).find('td:eq(3)').html() == "접수" || $(this).find('td:eq(3)').html() == "접수중" || $(this).find('td:eq(3)').html() == '접수대기') {
                $(this).find('td:eq(3)').html('<span class="label label-inverse">접수대기</span>');
            } if ($(this).find('td:eq(3)').html() == "처리중") {
                $(this).find('td:eq(3)').html('<span class="label label-primary">처리중</span>');
            } if ($(this).find('td:eq(3)').html() == "미평가") {
                $(this).find('td:eq(3)').html('<span class="label label-success">미평가</span>');
            } if ($(this).find('td:eq(3)').html() == '처리완료') {
                $(this).find('td:eq(3)').html('<span class="label label-purple">처리완료</span>');
            } if ($(this).find('td:eq(3)').html() == '협의필요') {
                $(this).find('td:eq(3)').html('<span class="label label-info">협의필요</span>');
            } if ($(this).find('td:eq(3)').html() == '미처리') {
                $(this).find('td:eq(3)').html('<span class="label label-default">미처리</span>');
            }
        })
    }
}

function getDataList2() {
    var reqParam = '';
    $.ajax({
        type: "GET",
        async: true,
        url: "/login/main_list_nocomplete",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("getDataList2 error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj2) {
            setDataList2(dataObj2);
        }
    });
}

//내용 매핑
function setDataList2(dataObj2) {
    //기존 데이터 삭제
    rowIdx = 0;
    dataCnt = 0;
    $("#more_list_nocomplete tr").remove();

    //조회 내용 추가
    if (rowIdx < dataObj2.length) {

        if ((rowIdx + inCnt) < dataObj2.length) {
            dataCnt = rowIdx + inCnt;
        } else {
            dataCnt = dataObj2.length;
        }

        for (var i = rowIdx; i < dataCnt; i++) {
            /*
            var creat_dateVal = dataObj2[i].created_at;
            creat_dateVal = creat_dateVal.substring(0, 10);
            var complete_dateVal = dataObj2[i].complete_date;
            complete_dateVal = complete_dateVal.substring(0, 10);
            */

            var addList = "";
            addList += "<tr onclick=window.location='/incident/' style='cursor:pointer'>";
            addList += "	<td>" + dataObj2[i].title + "</td>";
            addList += "	<td class='text-center'>" + dataObj2[i].register_date + "</td>";
            addList += "	<td class='text-center'>" + dataObj2[i].app_menu + "</td>";
            addList += "	<td class='text-center'>" + dataObj2[i].status_nm + "</td>";
            addList += "	<td class='text-center'>" + dataObj2[i].manager_nm + "</td>";
            addList += "	<td class='text-center'>" + dataObj2[i].complete_date + "</td>";
            addList += "</tr>";

            $("#more_list_nocomplete").append(addList);

            rowIdx++;
        }

        // 진행상태
        $('#more_list_nocomplete > tr').each(function () {
            if ($(this).find('td:eq(3)').html() == "미평가") {
                $(this).find('td:eq(3)').html('<span class="label label-success">미평가</span>');
            }
        })
    }
}