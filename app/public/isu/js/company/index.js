'use strict';

var incident_id = ''; //선택 인시던트 id
var rowIdx = 0;         //출력 시작 인덱스
var dataCnt = 0;        // 출력 종료 인덱스
var inCnt = 15;         //한번에 화면에 조회되는 리스트 수

var totalDataCnt = 0;      // 총 데이터 수 

var dataPerPage = 15;   // 한 페이지에 나타낼 데이터 수
var pageCnt = 10;      // 한 화면에 나타낼 페이지 수
var totalPage = 0;


$(document).ready(function () {

    //엔터키 이벤트 시
    $('#searchText').keypress(function (e) {
        if (e.keyCode == 13) {
            $('#searchText').val($('#searchText').val());
            research(1);
        }
    });

    //최초 페이징
    //paging(totalData, dataPerPage, pageCount, 1);

    //최초 조회
    getDataList(1);

    //조회버튼 클릭 시
    $('#searchBtn').on('click', function () {
        research(1);
    });

});

//다시 조회
function research(selectedPage) {
    //내용삭제
    $("#more_list").empty();
    getDataList(selectedPage);
    //getDataList();
}

/**
 * 데이터 조회-(상위업무 검색어, 날짜 중) 리스트 가져오기 
 */

function getDataList(selectedPage) {
    //function getDataList(){    

    var reqParam = 'page=' + selectedPage + '&perPage=' + dataPerPage + '&searchText=' + encodeURIComponent($('#searchText').val());
    //alert("reqParam : " + reqParam);

    $.ajax({
        type: "GET",
        async: true,
        url: "/company/list",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        data: reqParam, // $($('form')).serialize()
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            $('#ajax_indicator').css("display", "none");
        },
        beforeSend: function () {
            $('#ajax_indicator').css("display", "");
        },
        success: function (dataObj) {
            totalDataCnt = Number(dataObj.totalCnt);
            if (totalDataCnt < dataPerPage) {
                totalPage = 1;
            } else {
                totalPage = Math.ceil(totalDataCnt / dataPerPage);    // 총 페이지 수
            }

            $('#totalPage').text(totalPage);
            $('#totalCnt').text(totalDataCnt);
            //리스트에 내용 매핑
            setDataList(dataObj.company, selectedPage, totalDataCnt);

            paging(totalDataCnt, dataPerPage, pageCnt, selectedPage);
        }
    });
}


/**
 * 선택된 내용 매핑하기
 */
//function setDataList(dataObj, selectedPage) {
function setDataList(dataObj, selectedPage, totalDataCnt){
    $("#more_list tr").remove();

    var loopCnt = dataPerPage;
    
    if (totalDataCnt < dataPerPage) {
        loopCnt = totalDataCnt;
    }

    if(totalDataCnt > 0){
        for (var i = 0; i < loopCnt; i++) {

            var idValue = dataObj[i]._id;
            var addList = "";
            //addList += "							<tr onclick=window.location='/search/user_detail/" + dataObj[i-1]._id + "'>";
            //addList += "							<tr onclick=detailShow('" + dataObj[i-1]._id + "') style='cursor:pointer' >";
            addList += "							<tr onclick=location='/company/" + dataObj[i]._id + "/edit'>";
            //addList += "                           <tr onclick=detailShow('" + dataObj[i]._id + "') style='cursor:pointer'>";
            addList += "								<td>" + dataObj[i].company_nm + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i].ceo_nm + "</td>";
            addList += "								<td>" + dataObj[i].addr + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i].tel_no + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i].fax_no + "</td>";
            addList += "							</tr>";

            $("#more_list").append(addList);
        }
        
    } 
}

/**
 * 페이징 처리
 */
function paging(totalDataCnt, dataPerPage, pageCnt, currentPage) {
    
    var totalPage = Math.ceil(totalDataCnt / dataPerPage);    // 총 페이지 수
    var pageGroup = Math.ceil(currentPage / pageCnt);    // 페이지 그룹

    //검색 시, 총 페이지 수가 화면에 뿌려질 페이지(10개Page)보다 작을 경우 처리
    if (totalPage <= pageCnt) {
        last = totalPage;
        first = 1;
    } else {
        var last = pageGroup * pageCnt;    // 화면에 보여질 마지막 페이지 번호
        if (last > totalPage)
            last = totalPage;
        var first = last - (pageCnt - 1);    // 화면에 보여질 첫번째 페이지 번호
    }

    var next = last + 1;
    var prev = first - 1;

    var html = "";

    if (prev > 0)
        html += "<li class='cpaginate_button previous'><a href=# id='prev'>Previous</a></li>";
    for (var i = first; i <= last; i++) {
        if (i == currentPage) {
            html += "<li class='cpaginate_button active'><a href='#' id=" + i + ">" + i + "</a></li> ";
        } else {
            html += "<li class='cpaginate_button'><a href='#' id=" + i + ">" + i + "</a></li> ";
        }
    }

    if (last < totalPage)
        html += "<li class='cpaginate_button next'><a href=# id='next'>Next</a></li>";

    $("#paging").html(html);    // 페이지 목록 생성

    //$("#paging a").css("color", "black");
    // $("#paging a#" + currentPage).css({"text-decoration":"none", 
    //                                 "color":"red", 
    //                                 "font-weight":"bold"});    // 현재 페이지 표시


    //페이지 목록 선택 시 페이징 함수, 데이터 조회 함수 호출
    $("#paging a").click(function () {
        $("#more_list").empty();

        var $item = $(this);
        var $id = $item.attr("id");
        var selectedPage = $item.text();

        if ($id == "next") selectedPage = next;
        if ($id == "prev") selectedPage = prev;

        paging(totalDataCnt, dataPerPage, pageCnt, selectedPage);
        getDataList(selectedPage);

    });
}