'use strict';

var rowIdx = 0; //출력 시작 인덱스
var dataCnt = 0; // 출력 종료 인덱스
var inCnt = 15; //한번에 화면에 조회되는 리스트 수

//페이징 처리 변수 정의
var totalData = 0;      // 총 데이터 수 
var dataPerPage = 15;   // 한 페이지에 나타낼 데이터 수
var pageCount = 10;     // 한 화면에 나타낼 페이지 수
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
    paging(totalData, dataPerPage, pageCount, 1);

    //최초 조회
    getDataList(1);

    //조회버튼 클릭 시
    $('#searchBtn').on('click', function () {
        research(1);
    });

    //회사명 변경 시
    $('#company_cd').on('change', function () {
        research(1);
    });

    //정렬방식 변경 시
    $('#using_yn').on('change', function () {
        research(1);
    });

});

//다시 조회
function research(selectedPage) {
    //내용삭제
    $("#more_list").empty();
    getDataList(selectedPage);
}

function getDataList(selectedPage) {
    var reqParam = 'searchType=' + $('#searchType').val() + '&company_cd=' + encodeURIComponent($('#company_cd').val())
        + '&searchText=' + encodeURIComponent($('#searchText').val())
        + '&using_yn=' + $('#using_yn').val();

    $.ajax({
        type: "GET",
        async: true,
        url: "/usermanage/list",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
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
            //페이징 처리
            setDataList(dataObj, selectedPage);
            totalData = dataObj.length;
            totalPage = Math.ceil(totalData / dataPerPage);
            $('#totalPage').text(totalPage);
            paging(totalData, dataPerPage, pageCount, selectedPage);
        }
    });
}

//내용 매핑
function setDataList(dataObj, selectedPage) {
    //기존 데이터 삭제
    $("#more_list tr").remove();

    var startIdx = dataPerPage * (selectedPage - 1) + 1;
    var endIdx = dataPerPage * selectedPage + 1;

    //endIdx 가 실제 데이터 수보다 클 경우,
    if (dataObj.length < endIdx) { // 7<16
        endIdx = dataObj.length;
    }

    //조회 내용 추가
    if (endIdx > 0) {
        for (var i = startIdx; i < endIdx + 1; i++) {
            var addList = "";
            addList += "							<tr onclick=location='/usermanage/edit/" + dataObj[i - 1]._id + "'>";
            addList += "								<td>" + dataObj[i - 1].company_nm + "</td>";
            addList += "								<td>" + dataObj[i - 1].email + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i - 1].employee_nm + "</td>";
            addList += "								<td>" + dataObj[i - 1].dept_nm + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i - 1].position_nm + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i - 1].hp_telno + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i - 1].using_yn + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i - 1].email_send_yn + "</td>";
            addList += "							</tr>";

            $("#more_list").append(addList);

            startIdx++;
        }
    } else {
        var addList = "";
        addList += "							<tr>";
        addList += "								<td class='text-center' colspan = '6'>조회된 데이타가 없습니다.</td>";
        addList += "							</tr>";

        $("#more_list").append(addList);
    }

    $('#more_list > tr').each(function () {
        // 진행상태
        if ($(this).find('td:eq(6)').html() == "Y") {
            $(this).find('td:eq(6)').html('사용');
        } else {
            $(this).find('td:eq(6)').html('사용안함');
        }

        if ($(this).find('td:eq(7)').html() == "Y") {
            $(this).find('td:eq(7)').html('사용');
        } else {
            $(this).find('td:eq(7)').html('사용안함');
        }
    })

}


/**
 * 페이징 처리
 */
function paging(totalData, dataPerPage, pageCount, currentPage) {

    var totalPage = Math.ceil(totalData / dataPerPage);    // 총 페이지 수
    var pageGroup = Math.ceil(currentPage / pageCount);    // 페이지 그룹

    //검색 시, 총 페이지 수가 화면에 뿌려질 페이지(10개Page)보다 작을 경우 처리
    if (totalPage <= pageCount) {
        last = totalPage;
        first = 1;
    } else {
        var last = pageGroup * pageCount;    // 화면에 보여질 마지막 페이지 번호
        if (last > totalPage)
            last = totalPage;
        var first = last - (pageCount - 1);    // 화면에 보여질 첫번째 페이지 번호
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

    //페이지 목록 선택 시 페이징 함수, 데이터 조회 함수 호출
    $("#paging a").click(function () {
        $("#more_list").empty();

        var $item = $(this);
        var $id = $item.attr("id");
        var selectedPage = $item.text();

        if ($id == "next") selectedPage = next;
        if ($id == "prev") selectedPage = prev;

        paging(totalData, dataPerPage, pageCount, selectedPage);
        getDataList(selectedPage);

    });
}
