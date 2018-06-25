'use strict';

var rowIdx = 0; //출력 시작 인덱스
var dataCnt = 0; // 출력 종료 인덱스
var inCnt = 10; //한번에 화면에 조회되는 리스트 수
var incident_id ='';
var cnt =0; //modal창 갯수

$(document).ready(function () {
    //최초 조회
    getDataList();

    //메인 카운트 로드(접수대기,처리중,미평가,완료)
    cntLoad();

    //당월 처리현황 조회
    monthlyLoad();

    //팝업체크여부 조회
    getPopUpYN();


   
});

/**
 * 메인 카운트 로드
 */

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
            alert("error : " + error);
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
    $('#chart1').attr('data-text', "0" + "%");
    $('#chart1').attr('data-percent', "0");
    $('#chart2').attr('data-text', "0" + "%");
    $('#chart2').attr('data-percent', "0");
    $('#chart3').attr('data-text', "0" + "%");
    $('#chart3').attr('data-percent', "0");
    $('#chart4').attr('data-text', "0" + "%");
    $('#chart4').attr('data-percent', "0");

    for (var i = 0; i < dataObj.length; i++) {

        $('#status' + dataObj[i]._id.status_cd).html(dataObj[i].count);

        if ($('#status' + (i)).text() == "") {        //없으면 0
            $('#status' + (i)).text("0");
            //alert(dataObj[i]._id.status_cd-1);  //3

            $('#chart' + (dataObj[i]._id.status_cd - 1)).attr('data-text', 0 + "%");
            $('#chart' + (dataObj[i]._id.status_cd - 1)).attr('data-percent', 0);
        }
    }

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


/**
 * 당월 처리현황 조회
 */
function monthlyLoad() {
    $.ajax({
        type: "GET",
        async: true,
        url: "/statistic/monthlyload",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: {},
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("error : " + error);
        },
        beforeSend: function (dataObj) {
        },
        success: function (dataObj) {
            setMonthlyLoad(dataObj);
        }
    });
}

function setMonthlyLoad(dataObj) {
    //alert("setMonthlyLoad >> " + JSON.stringify(dataObj));

    var DrawSparkline = function () {
        $('#sparkline2').sparkline(dataObj.avg, {

            type: 'bar',
            height: '180',
            barWidth: '12',
            barSpacing: '10', //3
            barColor: '#3bafda',
            chartRangeMax: 5,     //평점 5점만점
            chartRangeMin: 0,
            //tooltipFormatFieldlist: ['x','y'],
            ///xaxis: {ticks: [[1,'One'], [2,'Two'], [3,'Three'], [4,'Four'], [5,'Five']]},

            tooltipFormat: '{{offset:offset}} {{value}}점',
            tooltipValueLookups: {
                'offset': {
                    0: '1월 : ',
                    1: '2월 :',
                    2: '3월 :',
                    3: '4월 :',
                    4: '5월 :',
                    5: '6월 :',
                    6: '7월 :',
                    7: '8월 :',
                    8: '9월 :',
                    9: '10월 :',
                    10: '11월 :',
                    11: '12월 :'
                }
            },
        });

    };

    DrawSparkline();

    var resizeChart;

    $(window).resize(function (e) {
        clearTimeout(resizeChart);
        resizeChart = setTimeout(function () {
            DrawSparkline();
        }, 300);
    });

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
            alert("error : " + error);
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

    //조회 내용 추가
    if (rowIdx < dataObj.length) {

        if ((rowIdx + inCnt) < dataObj.length) {
            dataCnt = rowIdx + inCnt;
        } else {
            dataCnt = dataObj.length;
        }

        for (var i = rowIdx; i < dataCnt; i++) {
            /*var creat_dateVal = dataObj[i].created_at;
            creat_dateVal = creat_dateVal.substring(0, 10);
            var complete_dateVal = dataObj[i].complete_date;
            complete_dateVal = complete_dateVal.substring(0, 10);
            */

            var addList = "";
            addList += "<tr onclick=window.location='/manager/work_list/' style='cursor:pointer'>";
            addList += "	<td class='text-center'>" + dataObj[i].process_speed + "</td>";
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

        $('#more_list > tr').each(function () {
            // 긴급구분
            if ($(this).find('td:eq(0)').html() == "N") {
                $(this).find('td:eq(0)').html('');
            } if ($(this).find('td:eq(0)').html() == "Y") {
                $(this).find('td:eq(0)').html('<span class="label label-warning">✔</span>');
            }

            // 진행상태
            if ($(this).find('td:eq(4)').html() == "접수" || $(this).find('td:eq(4)').html() == "접수중" || $(this).find('td:eq(4)').html() == '접수대기') {
                $(this).find('td:eq(4)').html('<span class="label label-inverse">접수대기</span>');
            } if ($(this).find('td:eq(4)').html() == "처리중") {
                $(this).find('td:eq(4)').html('<span class="label label-primary">처리중</span>');
            } if ($(this).find('td:eq(4)').html() == "미평가") {
                $(this).find('td:eq(4)').html('<span class="label label-success">미평가</span>');
            } if ($(this).find('td:eq(4)').html() == '처리완료') {
                $(this).find('td:eq(4)').html('<span class="label label-purple">처리완료</span>');
            } if ($(this).find('td:eq(4)').html() == '협의필요') {
                $(this).find('td:eq(4)').html('<span class="label label-info">협의필요</span>');
            } if ($(this).find('td:eq(4)').html() == '미처리') {
                $(this).find('td:eq(4)').html('<span class="label label-default">미처리</span>');
            }
        })
    }
}


//팝업공지 체크에 따른 회사리스트 조회
function getPopUpYN() {
    $.ajax({
        type: "GET",
        async: true,
        url: "/oftenQna/getPopUpYN",
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
            $('#ajax_indicator').css("display", "none");
            setPopUp(dataObj);
        }
    });
}



//modal창 데이터 매핑
function setPopUp(dataObj){
    var addList = "";
    

    if(dataObj.length>0){
        for(var i = 0 ; i < dataObj.length ; i++) {

            //팝업차단 시 각각 _id 기억하기 위함.
            incident_id = dataObj[i]._id;

            addList += "<div id='"+dataObj[i]._id+"' role='dialog' class='modal fade'>";
            addList += "<div class='modal-dialog' style='overflow-y: scroll; max-height:90%;  margin-top: 30px; margin-bottom:30px;'>";
            addList += "<div id='modalContent' class='modal-content'>";
            addList += "<div class='modal-header'>";
            //addList += "    <button type='button' data-dismiss='modal' class='close'>×</button>";
            addList += "    <h4 id='_title' class='modal-title'>" + dataObj[i].title + "</h4>";
            addList += "</div>";
            addList += "<div class='modal-body'>";
            addList += "    <p id='_content'>" + dataObj[i].content + "</p>";
            addList += "</div>";
            addList += "<div class='modal-footer'>";
            addList +="<label for='pop-day' onclick=closePopup('"+dataObj[i]._id + "') >"
            addList += "<input id='pop-day' value='"+dataObj[i]._id + "' name='pop-day' type='checkbox'/> 하루동안 보지 않기&nbsp; ";
            addList += "</label>";
            addList += "<button id='pop-close-btn' type='button' data-dismiss='modal' class='btn btn-default' onclick=closeBtn('"+dataObj[i]._id + "')>Close</button>";
            addList += "</div>";
            addList += "</div>";
            addList += "</div>";
            addList += "</div>";

            
            $("#modalArea").append(addList);
            
            /* 쿠키에 팝업차단 열지않기 확인 
            ** "N"이 아닐 경우만 Modal SHOW
            */
            var cookieCheck = getCookie(incident_id);
            
            if(cookieCheck != "N"){
                //모달팝업 시 부모창 스크롤 막기 처리
                $('html, body').css({'overflow': 'hidden', 'height': '100%'}); 
                $("#"+dataObj[i]._id).modal('show');
                cnt++;
            }    
            
        }
    }
}

//쿠키값 가져오기 incident_id="N"
function getCookie(name) { 
    var cookie = document.cookie;
    if (document.cookie != "") { 
        var cookie_array = cookie.split("; "); 
        for (var index in cookie_array) { 
            var cookie_name = cookie_array[index].split("="); 
            
            if (cookie_name[0] == incident_id) { 
                return cookie_name[1]; 
            } 
        } 
    }
    return ; 
}


//쿠키값 설정
function setCookie(name, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString();
}

//닫기버튼 클릭 시
function closePopup(id) {
    //alert("id :" + id);
    $('#pop-day:checked').each(function() {
        setCookie(this.value, "N", 1); //this.value ->id값으로 쿠키명 확인
    });
    
}

//모달 창 없을 때, 닫으면 부모창 Modal hidden 해제 
function closeBtn(id){
    cnt--;

    if(cnt==0){
        $('html, body').css({'overflow': 'auto', 'height': '100%'});
    }
}