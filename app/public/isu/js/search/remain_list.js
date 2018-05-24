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
    $('#reg_date_from').datepicker({
        //showOn: "both",  
        autoclose: true,
        todayHighlight: true,
        format: "yyyy-mm-dd"
    });

    $('#reg_date_to').datepicker({
        //showOn: "both",  
        autoclose: true,
        todayHighlight: true,
        format: "yyyy-mm-dd"
    });

    //엔터키 이벤트 시
    $('#searchText').keypress(function(e){
        if(e.keyCode == 13) {
            $('#searchText').val($('#searchText').val());
            research(1);
        }
    });

    //최초 페이징
    //paging(totalData, dataPerPage, pageCount, 1);
    
    //최초 조회
    //getDataList(1);
    getHigherProcessList();
    

    //조회버튼 클릭 시
    $('#searchBtn').on('click', function () {
        research(1);
    }); 

    //상위업무 변경 시
    $('#higher_cd').on('change', function () {
        //getLowerProcessList();
        research(1);
    });
    
});


//다시 조회
function research(selectedPage){
    //내용삭제
    $("#more_list").empty();
    getDataList(selectedPage);
}



/**
 * 데이터 조회-(상/하위업무 구분, 검색어, 날짜 중) 선택된 리스트 가져오기 
 */

function getDataList(selectedPage){
  
    //var reqParam = 'searchType=' + $('#searchType').val() + '&higher_cd=' + $('#higher_cd').val() + '&lower_cd=' + $('#lower_cd').val() + '&reg_date_from=' + $('#reg_date_from').val()+ '&reg_date_to=' + $('#reg_date_to').val()+ '&searchText=' + encodeURIComponent($('#searchText').val());
    var reqParam = 'gbn=remain&page=' + selectedPage + '&perPage=' + dataPerPage + '&searchType=' + $('#searchType').val() + '&higher_cd=' + $('#higher_cd').val() + '&reg_date_from=' + $('#reg_date_from').val()+ '&reg_date_to=' + $('#reg_date_to').val()+ '&searchText=' + encodeURIComponent($('#searchText').val());
    
    $.ajax({
        type: "GET",
        async: true,
        url: "/search/getRemainList",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        data: reqParam, // $($('form')).serialize()
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            $('#ajax_indicator').css("display", "none");
            alert("error : " + error);
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
            setDataList(dataObj.incident, selectedPage, totalDataCnt);

            paging(totalDataCnt, dataPerPage, pageCnt, selectedPage);
        }
    });
    
}

/**
 * 선택된 내용 매핑하기
 */
function setDataList(dataObj, selectedPage, totalDataCnt) {

    $("#more_list tr").remove();

    var loopCnt = dataPerPage;
    
    if (totalDataCnt < dataPerPage) {
        loopCnt = totalDataCnt;
    }
    if(totalDataCnt > 0){
        for (var i = 0; i < loopCnt; i++) {

            var idValue = dataObj[i]._id;
            var addList = "";


            addList += "							<tr onclick=detailShow('" + dataObj[i]._id + "') style='cursor:pointer'>";
            addList += "								<td class='text-center'>" + dataObj[i].higher_nm + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i].lower_nm + "</td>";
            if (dataObj[i].complete_open_flag == "Y") {
                addList += "								<td>" + dataObj[i].title + "</td>";
            } else {

                addList += "								<td><i class='fa fa-lock m-r-5' style='color:darkblue'/>&nbsp;&nbsp;" + dataObj[i].title + "</td>";
            }
            addList += "								<td class='text-center'>" + dataObj[i].register_date + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i].manager_nm + "</td>";
            if(dataObj[i].solution_flag == "N"){
                addList += "								<td class='text-center'>미해결</td>";
            }else{
                addList += "								<td class='text-center'></td>";
            }
            
            addList += "							</tr>";

            $("#more_list").append(addList);

        }
        

        $('#more_list > tr').each(function () {

            /**
             * 긴급구분
             */
            /*
            if($(this).find('td:eq(0)').html() == "1"){
                $(this).find('td:eq(0)').html('');
            }if($(this).find('td:eq(0)').html() == "2"){
                $(this).find('td:eq(0)').html('<span class="label label-warning">✔</span>');
            }
            */

            /**
             * 진행상태
             */
            if ($(this).find('td:eq(5)').html() == "접수" || $(this).find('td:eq(5)').html() == "접수중" || $(this).find('td:eq(5)').html() == '접수대기') {
                $(this).find('td:eq(5)').html('<span class="label label-inverse">접수대기</span>');
            } if ($(this).find('td:eq(5)').html() == "처리중") {
                $(this).find('td:eq(5)').html('<span class="label label-primary">처리중</span>');
            } if ($(this).find('td:eq(5)').html() == "미평가") {
                $(this).find('td:eq(5)').html('<span class="label label-success">미평가</span>');
            } if ($(this).find('td:eq(5)').html() == '처리완료') {
                $(this).find('td:eq(5)').html('<span class="label label-purple">처리완료</span>');
            } if ($(this).find('td:eq(5)').html() == '협의필요') {
                $(this).find('td:eq(5)').html('<span class="label label-info">협의필요</span>');
            } if ($(this).find('td:eq(5)').html() == '미처리') {
                $(this).find('td:eq(5)').html('<span class="label label-default">미처리</span>');
            }

        })
    } else {
        var addList = "";        
        addList = "<tr><td colspan='7' class='text-center'>조회된 데이터가 없습니다.</td></tr>";
        $("#more_list").append(addList);
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



/**
 * 상위업무 가져오기
 */
function getHigherProcessList() {
    // var reqParam = 'company_cd=' + encodeURIComponent($('#company_cd').val());

    $.ajax({
        type: "GET",
        async: true,
        url: "/higherProcess/getUFhigherprocess",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        //data: "", // $($('form')).serialize()
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("getHigherProcessList error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setHigherContent(dataObj);
            research(1);

        }
    });
}


/**
 * 상위업무 뿌리기
 */
function setHigherContent(data) {
        
    $('#higher_cd').empty();
    $('#higher_cd').append("<option value='*'> 전체</option>");

    for (var i = 0; i < data.length; i++) {
        var higher_cdVal = data[i]["higher_cd"];
        $('#higher_cd').append("<option value='" + higher_cdVal + "'>" + data[i]["higher_nm"] + "</option>")
    }
}

    




/**
 * 상세모달호출
 * @param {*} incident_id  
 */
function detailShow(id){
    //incident id값 세팅
    incident_id = id;

    var reqParam = '';
    $.ajax({
        type: "GET",
        async: true,
        url: "/incident/getIncidentDetail/"+id,
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000, //제한 시간
        cache: false,
        data: reqParam, // $($('form')).serialize()
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setDetail(dataObj);
            $('#wdetail_modal').modal('show');
        }
    });
}

/**
 * 상세조회 매핑
 */
function setDetail(dataObj){


    //상위코드
    //higher_cd = dataObj.higher_cd;

    /**
     * 등록내용 세팅
     */
    $('#_status_nm').html(dataObj.status_nm);
    //$('#_process_speed').html(dataObj.process_speed);

    /**
    * 긴급구분
    */
    if(dataObj.process_speed == "2"){
        $('#_process_speed').html('<span class="label label-warning">✔</span>');
    }

    $('#_higher_nm').html(dataObj.higher_nm);
    $('#_lower_nm').html(dataObj.lower_nm);
    $('#_request_company_nm-request_nm').html(dataObj.request_company_nm+"/"+dataObj.request_nm);
    $('#_request_complete_date').html(dataObj.request_complete_date);
    $('#_app_menu').html(dataObj.app_menu);
    $('#_register_nm-register_date').html(dataObj.register_nm+"/"+dataObj.register_date);
    $('#_title').html(dataObj.title);
    $('#_content').html(dataObj.content);

    if(dataObj.status_cd == '1'){
        $('#_status_nm').addClass('label label-inverse');
    }else if(dataObj.status_cd == '2'){
        $('#_status_nm').addClass('label label-primary');
    }else if(dataObj.status_cd == '3'){
        $('#_status_nm').removeClass();
        $('#_status_nm').addClass('label label-success');
    }else if(dataObj.status_cd == '4'){
        $('#_status_nm').addClass('label label-purple');
    }else if(dataObj.status_cd == '5'){
        $('#_status_nm').addClass('label label-info');
    }else if(dataObj.status_cd == '9'){
        $('#_status_nm').addClass('label label-default');
    }

    /**
     * 처리내용 세팅
     */
    $('#_manager_nm').html(dataObj.manager_nm);
    $('#_receipt_date').html(dataObj.receipt_date);
    $('#_complete_reserve_date').html(dataObj.complete_reserve_date);
    $('#_business_level').html(dataObj.business_level);
    $('#_complete_content').html(dataObj.complete_content);
    $('#_complete_date').html(dataObj.complete_date);
    $('#_need_minute').html(dataObj.need_minute);
    $('#_delay_reason').html(dataObj.delay_reason);
    $('#_valuation').html(dataObj.valuation);
    if(dataObj.complete_open_flag == 'Y'){
        dataObj.complete_open_flag = '공개';
    }else{
        dataObj.complete_open_flag = '비공개';
    }
    //$('#_complete_open_flag-reading_cnt').html(dataObj.complete_open_flag+"/"+dataObj.reading_cnt);
    $('#_complete_open_flag-reading_cnt').html(dataObj.complete_open_flag);
    $('#_sharing_content').html(dataObj.sharing_content);

}