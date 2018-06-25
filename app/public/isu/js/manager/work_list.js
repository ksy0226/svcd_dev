'use strict';

var incident_id = ''; //선택 인시던트 id
var higher_cd = '000'//선택 상위코드
var rowIdx = 0; //출력 시작 인덱스
var dataCnt = 0; // 출력 종료 인덱스
var inCnt = 15; //한번에 화면에 조회되는 리스트 수

var totalDataCnt = 0;      // 총 데이터 수 

var dataPerPage = 15;   // 한 페이지에 나타낼 데이터 수
var pageCnt = 10;      // 한 화면에 나타낼 페이지 수
var totalPage = 0;


$(document).ready(function () {

    $('#reg_date_from').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "yyyy-mm-dd"
    });
    $('#reg_date_to').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "yyyy-mm-dd"
    });


    //엔터키 이벤트 시
    $('#searchText').keypress(function (e) {
        if (e.keyCode == 13) {
            $('#searchText').val($('#searchText').val());
            research(1);
        }
    });

    getCompany();

    //최초 페이징
    //paging(totalData, dataPerPage, pageCount, 1);

    //최초 조회
    getDataList(1);

    //조회버튼 클릭 시
    $('#searchBtn').on('click', function () {
        $('#lower_cd').val('*');
        research(1);
    });

    //회사 선택 시
    $('#company_cd').on('change', function () {
        //getHigherProcessList(); //회사에 따라 상위업무 세팅
        research(1);
    });



    //진행상태 변경 시
    $('#status_cd').on('change', function () {
        research(1);
    });

    //하위업무 변경 시
    $('#lower_cd').on('change', function () {
        research(1);
    });


    /**
     * 접수처리 화면
     */
    $('input[name="incident[complete_reserve_date]"]').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "yyyy-mm-dd",
    });

    //오늘날짜 설정
    setDatepickerToday($('input[name="incident[complete_reserve_date]"]'));

    //접수저장버튼 클릭 시
    $('#receiptSaveBtn').on('click', function () {
        receiptSave();
        research(1);
    });

    //업무변경버튼 클릭 시
    $('#hChangeSaveBtn').on('click', function () {
        if($('select[name="ch_higher_cd"]').val() != '*'){
            hChangeSave();
            research(1);
        }else{
            alert('변경할 상위업무를 선택하세요.')
        }
    });

    //완료저장버튼 클릭 시
    $('#completeSaveBtn').on('click', function () {
        completeSave();
        research(1);

    });

    //협의필요 저장버튼 클릭 시
    $('#holdSaveBtn').on('click', function () {
        holdSave();
        research(1);

    });

    //미처리 저장버튼 클릭 시
    $('#n_completeSaveBtn').on('click', function () {
        n_completeSave();
        research(1);

    }); 
    
    //사용자 클릭 시 request_nm
    //미처리 저장버튼 클릭 시
    $('#request_nm').on('click', function () {
        getRequestInfo();
    }); 

    //업무변경 상위업무 선택 시
    $('select[name="ch_higher_cd"]').on('change', function () {
        
        if($('select[name="ch_higher_cd"]').val() != '*'){
            var higher_cd = $('select[name="ch_higher_cd"]').val();
            //하위업무
            var targetSelect = $('select[name="ch_lower_cd"]');
            getLowerNm(targetSelect, higher_cd);
        }else{
            $('select[name="ch_lower_cd"]').empty();
        }
    });


    //select박스 초기화
    setSelectBox();


    /**
     * 접수처리 화면
     */
    $('#receipt_modal').on('show.bs.modal', function () {
        //하위업무
        var targetSelect = $('select[name="incident[lower_cd]"]');
        getLowerNm(targetSelect, higher_cd);
    });
    $('#receipt_modal').on('hidden.bs.modal', function () {
        initReceiptModal();
    });

    /**
     * 업무변경 화면
     */
    $('#hchange_modal').on('show.bs.modal', function () {
        //상위업무
        var targetSelect = $('select[name="ch_higher_cd"]');
        getHigherNm(targetSelect);
    });
    $('#hchange_modal').on('hidden.bs.modal', function () {
        initHChangeModal();
    });

    /**
     * 완료처리 화면
     */
    $('#complete_modal').on('show.bs.modal', function () {
        getQuestionType();
    });
    $('#complete_modal').on('hidden.bs.modal', function () {
        initCompleteModal();
    });


    /**
     * 협의필요 처리 화면
     */
    $('#hold_modal').on('show.bs.modal', function () {
        //getQuestionType();
    });
    $('#hold_modal').on('hidden.bs.modal', function () {
        initHoldModal();
    });

    /**
     * 미처리 화면
     */
    $('#n_complete_modal').on('show.bs.modal', function () {
        //getQuestionType();
    });
    $('#n_complete_modal').on('hidden.bs.modal', function () {
        initNCompleteModal();
    });
});

function getRequestInfo(){
    $('#info_modal').modal('show');
}



/**
 * 다시 조회
 */
function research(selectedPage) {
    rowIdx = 1;
    inCnt = 3;

    //내용삭제
    $("#more_list").empty();
    getDataList(selectedPage);
}

/**
 * incident 데이타 조회
 */
function getDataList(selectedPage) {
    if ($('#lower_cd').val() == "") {
        $('#lower_cd').val() = "*";
    }

    //나의업무처리현황 user 구분 추가
    //user=manager 시, 관리자가 본인이 접수해야할 것만 Incident 보이도록 처리
    var reqParam = 'user=manager&page=' + selectedPage + '&perPage=' + dataPerPage + '&searchType=' + $('#searchType').val() + '&status_cd=' + $('#status_cd').val()
        + '&company_cd=' + encodeURIComponent($('#company_cd').val())
        + '&lower_cd=' + $('#lower_cd').val()  + '&reg_date_from='
        + $('#reg_date_from').val() + '&reg_date_to=' + $('#reg_date_to').val()
        + '&searchText=' + encodeURIComponent($('#searchText').val());

    $.ajax({
        type: "GET",
        async: true,
        url: "/incident/getIncident",    //mng_list와 같이 처리 필요 : "/higherProcess/getUFhigherprocess",
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
            if(totalDataCnt < dataPerPage){
                totalPage = 1;
            }else{
                totalPage = Math.ceil(totalDataCnt/dataPerPage);    // 총 페이지 수
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
 * 조회된 incident 내용 매핑
 */
function setDataList(dataObj, selectedPage, totalDataCnt) {
    //선택한 페이지가 1page 이상일 때,
    //if(selectedPage>1){
    //기존 데이터 삭제
    $("#more_list tr").remove();

    var loopCnt = dataPerPage;
    
    if (totalDataCnt < dataPerPage){
        loopCnt = totalDataCnt;
    }
    
    if(loopCnt > 0){

        for(var i = 0 ; i < loopCnt ; i++){ 
            var addList = "";
            //addList += "							<tr onclick=detailShow('" + dataObj[i]._id + "')>";
            addList += "                            <tr>";
            addList += "								<td class='text-center'>" + dataObj[i].process_speed + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i].status_cd + "</td>";
            addList += "								<td onclick=detailShow('" + dataObj[i]._id + "')>" + dataObj[i].title + "</td>";
            addList += "								<td onclick=getRequestInfo()>" + dataObj[i].request_company_nm + "/" + dataObj[i].request_nm + "</td>";
            addList += "								<td class='text-center'>" + dataObj[i].register_date + "</td>";
            if(dataObj[i].receipt_date ==null){
                addList += "								<td class='text-center'></td>";
            }else{
                addList += "								<td class='text-center'>" + dataObj[i].receipt_date + "</td>";
                
            }
            addList += "							</tr>";

            $("#more_list").append(addList);
        } 
    }else{
        var addList = "";
        addList += "<tr>";
        addList += "    <td colspan='6' class='text-center'>조회된 데이타가 없습니다.</td>";
        addList += "</tr>";

        $("#more_list").append(addList);
    }
    $('#more_list > tr').each(function () {

        /**
         * 긴급구분
         */
        if ($(this).find('td:eq(0)').html() == "N") {
            $(this).find('td:eq(0)').html('');
        } if ($(this).find('td:eq(0)').html() == "Y") {
            $(this).find('td:eq(0)').html('<span class="label label-warning">✔</span>');
        }

        /**
         * 진행상태
         */
        if ($(this).find('td:eq(1)').html() == "1") {
            $(this).find('td:eq(1)').html('<span class="label label-inverse">접수대기</span>');
        } if ($(this).find('td:eq(1)').html() == "2") {
            $(this).find('td:eq(1)').html('<span class="label label-primary">처리중</span>');
        } if ($(this).find('td:eq(1)').html() == "3") {
            $(this).find('td:eq(1)').html('<span class="label label-success">미평가</span>');
        } if ($(this).find('td:eq(1)').html() == "4") {
            $(this).find('td:eq(1)').html('<span class="label label-purple">처리완료</span>');
        } if ($(this).find('td:eq(1)').html() == "5") {
            $(this).find('td:eq(1)').html('<span class="label label-info">협의필요</span>');
        } if ($(this).find('td:eq(1)').html() == "9") {
            $(this).find('td:eq(1)').html('<span class="label label-default">미처리</span>');
        }

    })

}

/**
 * 페이징 처리
*/
function paging(totalDataCnt, dataPerPage, pageCnt, currentPage) {

    var totalPage = Math.ceil(totalDataCnt/dataPerPage);    // 총 페이지 수
    var pageGroup = Math.ceil(currentPage/pageCnt);    // 페이지 그룹

    //검색 시, 총 페이지 수가 화면에 뿌려질 페이지(10개Page)보다 작을 경우 처리
    if(totalPage <= pageCnt){
        last = totalPage;
        first = 1;
    }else{
        var last = pageGroup * pageCnt;    // 화면에 보여질 마지막 페이지 번호
        if(last > totalPage)
            last = totalPage;
        var first = last - (pageCnt-1);    // 화면에 보여질 첫번째 페이지 번호
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
 * 상세모달호출
 * @param {*} incident_id  
 */
function detailShow(id) {
    //incident id값 세팅
    incident_id = id;

    var reqParam = '';
    $.ajax({
        type: "GET",
        async: true,
        url: "/incident/getIncidentDetail/" + id,
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
            initDetail();
            setDetail(dataObj);
            $('#wdetail_modal').modal('show');
        }
    });
}

/**
 * 상세조회 초기화
 */
function initDetail() {


    $('#receiptBtn').attr('style', 'display:none');
    $('#hChangeBtn').attr('style', 'display:none');
    $('#completeBtn').attr('style', 'display:none');
    $('#n_completeBtn').attr('style', 'display:none');
    $('#holdBtn').attr('style', 'display:none');


    /**
     * 등록내용 세팅
     */
    $('#_status_nm').html('');

    /**
    * 긴급구분
    */
    $('#_process_speed').html('');
    $('#_higher_nm').html('');
    $('#_lower_nm').html('');
    $('#_request_company_nm-request_nm').html('');
    $('#_request_complete_date').html('');
    $('#_app_menu').html('');
    $('#_register_nm-register_date').html('');
    $('#_title').html('');
    $('#_content').html('');

    $('#_status_nm').removeClass();

    /**
     * 처리내용 세팅
     */
    $('#_manager_nm').html('');
    $('#_receipt_date').html('');
    $('#_receipt_content').html('');
    $('#_complete_reserve_date').html('');
    $('#_business_level').html('');
    $('#_process_nm').html('');
    $('#_complete_content').html('');
    $('#_complete_date').html('');
    $('#_need_minute').html('');
    $('#_delay_reason').html('');
    $('#_valuation').html('');
    $('#_complete_open_flag-reading_cnt').html('');
    $('#_program_id').html('');
    $('#_sharing_content').html('');

}


/**
 * 상세조회 매핑
 */
function setDetail(dataObj) {

    //업무처리 버튼처리
    if (dataObj.status_cd == '1') {
        $('#receiptBtn').attr('style', 'display:');
        $('#hChangeBtn').attr('style', 'display:');
        $('#holdBtn').attr('style', 'display:');
        $('#completeBtn').attr('style', 'display:none');
        $('#n_completeBtn').attr('style', 'display:none');
    } else if (dataObj.status_cd == '2') {
        $('#receiptBtn').attr('style', 'display:none');
        $('#hChangeBtn').attr('style', 'display:');
        $('#holdBtn').attr('style', 'display:none');
        $('#completeBtn').attr('style', 'display:');
        $('#n_completeBtn').attr('style', 'display:');
    } else if (dataObj.status_cd == '5') {
        $('#receiptBtn').attr('style', 'display:none');
        $('#hChangeBtn').attr('style', 'display:');
        $('#holdBtn').attr('style', 'display:none');
        $('#completeBtn').attr('style', 'display:');
        $('#n_completeBtn').attr('style', 'display:none');
    } else if (dataObj.status_cd == '9') {
        $('#receiptBtn').attr('style', 'display:none');
        $('#hChangeBtn').attr('style', 'display:');
        $('#holdBtn').attr('style', 'display:none');
        $('#completeBtn').attr('style', 'display:');
        $('#n_completeBtn').attr('style', 'display:none');
    } else {
        $('#receiptBtn').attr('style', 'display:none');
        $('#hChangeBtn').attr('style', 'display:none');
        $('#holdBtn').attr('style', 'display:none');
        $('#completeBtn').attr('style', 'display:none');
        $('#n_completeBtn').attr('style', 'display:none');
    }


    //상위코드
    higher_cd = dataObj.higher_cd;

    /**
     * 등록내용 세팅
     */
    if (dataObj.status_nm != "접수대기") {
        $('#_status_nm').html(dataObj.status_nm);
    } else {
        $('#_status_nm').html('접수대기');
    }

    /**
    * 긴급구분
    */
    if (dataObj.process_speed == "Y") {
        $('#_process_speed').html('<span class="label label-warning">✔</span>');
    }
    $('#_higher_nm').html(dataObj.higher_nm);

    $('#_lower_nm').html(dataObj.lower_nm);
    $('#_request_company_nm-request_nm').html(dataObj.request_company_nm + "/" + dataObj.request_nm);
    $('#_request_complete_date').html(dataObj.request_complete_date);
    $('#_app_menu').html(dataObj.app_menu);
    $('#_register_nm-register_date').html(dataObj.register_nm + " / " + dataObj.register_date);
    

    $('#_title').html(dataObj.title);
    $('#_content').html(dataObj.content);

    if (dataObj.status_cd == '1') {
        $('#_status_nm').addClass('label label-inverse');
    } else if (dataObj.status_cd == '2') {
        $('#_status_nm').addClass('label label-primary');
    } else if (dataObj.status_cd == '3') {
        $('#_status_nm').removeClass();
        $('#_status_nm').addClass('label label-success');
    } else if (dataObj.status_cd == '4') {
        $('#_status_nm').addClass('label label-purple');
    } else if (dataObj.status_cd == '5') {
        $('#_status_nm').addClass('label label-info');
    } else if (dataObj.status_cd == '9') {
        $('#_status_nm').addClass('label label-default');
    }

    /**
     * 처리내용 세팅
     */
    $('#_manager_nm').html(dataObj.manager_nm);
    $('#_receipt_date').html(dataObj.receipt_date);
    $('#_complete_reserve_date').html(dataObj.complete_reserve_date);
    $('#_business_level').html(dataObj.business_level);
    $('#_process_nm').html(dataObj.process_nm);
    /*관리자가 처리한 내용 그대로 보이도록 처리*/
    if(dataObj.complete_content != undefined){
        $('#_complete_content').html(dataObj.complete_content.replace(/\r\n/gi,"<br/>"));
    }else{
        $('#_complete_content').html(dataObj.complete_content); 
    }

    $('#_complete_date').html(dataObj.complete_date);
    //$('#_need_minute').html(dataObj.need_minute);
    $('#_need_minute').html(dataObj.work_time);
    $('#_delay_reason').html(dataObj.delay_reason);
    $('#_valuation').html(dataObj.valuation);
    if (dataObj.status_cd == "3" || dataObj.status_cd == "4" || dataObj.status_cd == "5") {
        if (dataObj.complete_open_flag == 'Y') {
            dataObj.complete_open_flag = '공개';
        } else {
            dataObj.complete_open_flag = '비공개';
        }
    }else{
        dataObj.complete_open_flag = '';
    }
    //$('#_complete_open_flag-reading_cnt').html(dataObj.complete_open_flag+"/"+dataObj.reading_cnt);
    $('#_complete_open_flag').html(dataObj.complete_open_flag);
    //$('#_program_id').html(dataObj.program_id);
    if(dataObj.program_id != undefined){
        $('#_program_id').html(dataObj.program_id.replace(/\r\n/gi,"<br/>"));
    }else{
        $('#_program_id').html(dataObj.program_id); 
    }
    
    if(dataObj.sharing_content != undefined){
        $('#_sharing_content').html(dataObj.sharing_content.replace(/\r\n/gi,"<br/>"));
    }else{
        $('#_sharing_content').html(dataObj.sharing_content); 
    }
    $('#_receipt_content').html(dataObj.receipt_content);


    /**
    * 첨부파일
    */
    if (dataObj.attach_file.length > 0) {
        $('#_attach').html('');
    
        for (var cnt = 0; cnt < dataObj.attach_file.length; cnt++) {
            var fileList = "";
            fileList += "<a href='/search/download/" + dataObj.attach_file[cnt].path +"/"+ dataObj.attach_file[cnt].originalname + "'>";
            fileList += "<span class='text-pink'> " + dataObj.attach_file[cnt].originalname + "</span>";
            fileList += "<span class='text-muted.m-l-10'> " + "(" + dataObj.attach_file[cnt].size + " Byte)" + "</span>";
            //$('#_attach').addClass('i fa fa-paperclip m-r-10 m-b-10');
            $('#_attach').append("<td class='i fa fa-paperclip m-r-10 m-b-10'>" + fileList + "</td>");
        }

    } else {
        $('#_attach').html('');
        $('#_attach').removeClass();
    }

}

/**
 * select박스 초기화
 */
function setSelectBox() {
    //시간 세팅
    $('select[name="incident[complete_hh]"]').empty();
    for (var i = 0; i < 24; i++) {
        if (i < 10) {
            $('select[name="incident[complete_hh]"]').append("<option value='0" + i + "'>0" + i + "</option>");
        } else {
            $('select[name="incident[complete_hh]"]').append("<option value='" + i + "'>" + i + "</option>");
        }
    }
    $('select[name="incident[complete_hh]"]').val('18');

    //분 세팅
    $('select[name="incident[complete_mi]"]').empty();
    $('select[name="incident[complete_mi]"]').append("<option value='00'>00</option>");
    $('select[name="incident[complete_mi]"]').append("<option value='10'>10</option>");
    $('select[name="incident[complete_mi]"]').append("<option value='20'>20</option>");
    $('select[name="incident[complete_mi]"]').append("<option value='30'>30</option>");
    $('select[name="incident[complete_mi]"]').append("<option value='40'>40</option>");
    $('select[name="incident[complete_mi]"]').append("<option value='50'>50</option>");

    //난이도 세팅
    $('select[name="incident[business_level]"]').empty();
    $('select[name="incident[business_level]"]').append("<option value='S'>S</option>");
    $('select[name="incident[business_level]"]').append("<option value='A' selected>A</option>");
    $('select[name="incident[business_level]"]').append("<option value='B'>B</option>");
    $('select[name="incident[business_level]"]').append("<option value='C'>C</option>");
    $('select[name="incident[business_level]"]').append("<option value='D'>D</option>");
}

/**
 * Datepicker 오늘 날짜 설정
 */
function setDatepickerToday(datepicker) {
    var d = new Date();
    datepicker.datepicker("setDate", new Date(d.getFullYear(), d.getMonth(), d.getDate()));
}

//>>================== 접수처리 스크립트 ==============
/**
 * 접수 내용 저장
 */
function receiptSave() {
    var reqParam = $('#receipt_form').serialize();
    reqParam += "&incident[lower_nm]=" + encodeURIComponent($('select[name="incident[lower_cd]"] option:selected').text()) ;
    $.ajax({
        type: "POST",
        async: true,
        url: "/manager/saveReceipt/" + incident_id,
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

            if (dataObj.success) {
                $('.modal').modal('hide');
                initReceiptModal();
                //research(selectedPage);
            } else {
                alert('e : ' + JSON.stringify(dataObj));
            }
        }
    });
}

/**
 * 접수모달 초기화
 */
function initReceiptModal() {

    $('textarea[name="incident[receipt_content]"]').val('문의하신 내용이 접수되었습니다.');
    setDatepickerToday($('input[name="incident[complete_reserve_date]"]'));
    $('select[name="incident[complete_hh]"]').val('18');
    $('select[name="incident[complete_mi]"]').val('00');
    $('select[name="incident[lower_cd]"] option:eq(0)').attr("selected", "selected");
    $('select[name="incident[business_level]"]').val('A');
    $('input[name="incident[manager_email]"]').val('');
    $('input[name="incident[manager_nm]"]').val('');
    $('input[name="incident[manager_company_nm]"]').val('');
    $('input[name="incident[manager_dept_nm]"]').val('');
    $('input[name="incident[manager_position]"]').val('');
    $('input[name="incident[manager_phone]"]').val('');
}
//<<================== 접수처리 스크립트 ==============


//>>================== 업무변경 스크립트 ==============
/**
 * 업무 변경 저장
 */
function hChangeSave() {
    var reqParam = "incident[higher_cd]="+$('select[name="ch_higher_cd"]').val();
    reqParam += "&incident[higher_nm]=" + encodeURIComponent($('select[name="ch_higher_cd"] option:selected').text()) ;
    reqParam += "&incident[lower_cd]="+$('select[name="ch_lower_cd"]').val();
    reqParam += "&incident[lower_nm]=" + encodeURIComponent($('select[name="ch_lower_cd"] option:selected').text()) ;
    $.ajax({
        type: "POST",
        async: true,
        url: "/manager/saveHChange/" + incident_id,
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("hChangeSave error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {

            if (dataObj.success) {
                $('.modal').modal('hide');
                initHChangeModal();
                //research(1);
            } else {
                alert('e : ' + JSON.stringify(dataObj));
            }
        }
    });
}

/**
 * 접수모달 초기화
 */
function initHChangeModal() {
    $('select[name="ch_lower_cd"]').empty();
}
//<<================== 업무변경 스크립트 ==============



//>>================== 완료처리 스크립트 ==============
/**
 * 완료 내용 저장
 */
function completeSave() {
    //해결여부 checkbox
    //if($('input:checkbox[name="incident[solution_flag]"]').is(":checked") == true){
    //    $('input:checkbox[name="incident[solution_flag]"]').val("Y");
    //}else{
    //    $('input:checkbox[name="incident[solution_flag]"]').val("N");
    //}
    //공개여부 checkbox
    //if($('input:checkbox[name="incident[complete_open_flag]"]').is(":checked") == true){
    //    $('input:checkbox[name="incident[complete_open_flag]"]').val("Y");
    //}else{
    //    $('input:checkbox[name="incident[complete_open_flag]"]').val("N");
    //}
    


    var reqParam = $('#complete_form').serialize();
    reqParam += "&incident[process_nm]=" + encodeURIComponent($('select[name="incident[process_cd]"] option:selected').text());
    //reqParam += "&incident[solution_flag]=" + $('input:checkbox[name="incident[solution_flag]"]').val();
    //reqParam += "&incident[complete_open_flag]=" + $('input:checkbox[name="incident[complete_open_flag]"]').val();
    

    $.ajax({
        type: "POST",
        async: true,
        url: "/manager/saveComplete/" + incident_id,
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("completeSave error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            if (dataObj.success) {
                $('.modal').modal('hide');
                initCompleteModal();
                //research(selectedPage);
            } else {
                alert('e : ' + JSON.stringify(dataObj));
            }
        }
    });
}

/**
 * 완료모달 초기화
 */
function initCompleteModal() {
    $('select[name="incident[process_gubun]"]').empty();
    $('textarea[name="incident[complete_content]"]').val('처리되었습니다.');
    $('textarea[name="incident[work_time]"]').val('1');
    $('textarea[name="incident[delay_reason]"]').val('');
    $('textarea[name="incident[program_id]"]').val('');
    $('textarea[name="incident[sharing_content]"]').val('');

    $('input[name="incident[solution_flag]"]').prop('checked',true);
    $('input[name="incident[complete_open_flag]"]').prop('checked',false);

    
}

//>>================== 협의필요 처리 스크립트 ==============
/**
 * 협의필요  내용 저장
 */
function holdSave() {
    
    var reqParam = $('#hold_form').serialize();
   
    $.ajax({
        type: "POST",
        async: true,
        url: "/manager/saveHold/" + incident_id,
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("holdSave error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            if (dataObj.success) {
                $('.modal').modal('hide');
                initHoldModal();
                //research(selectedPage);
            } else {
                alert('e : ' + JSON.stringify(dataObj));
            }
        }
    });
}


/**
 * 협의필요 모달 초기화
 */
function initHoldModal() {
    //$('select[name="incident[process_gubun]"]').empty();
    $('textarea[name="incident[hold_content]"]').val('');
}

//<<================== 협의필요 처리 스크립트 ==============

//>>================== 미처리 스크립트 ==============
/**
 * 미처리  내용 저장
 */
function n_completeSave() {
    
    var reqParam = $('#n_complete_form').serialize();
   
    $.ajax({
        type: "POST",
        async: true,
        url: "/manager/saveNComplete/" + incident_id,
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("NComplete error : " + error);
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            if (dataObj.success) {
                $('.modal').modal('hide');
                initNCompleteModal();
                //research(selectedPage);
            } else {
                alert('e : ' + JSON.stringify(dataObj));
            }
        }
    });
}


/**
 * 미처리 모달 초기화
 */
function initNCompleteModal() {
    $('textarea[name="incident[nc_content]"]').val('');
}

//<<================== 미처리 스크립트 ==============


/**
 * 요청타입 세팅
 */
function getQuestionType() {
    var reqParam = "";
    $.ajax({
        type: "GET",
        async: true,
        url: "/processGubun/getJSON/" + higher_cd,
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("error : " + error + " : " + JSON.stringify(request));
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setQuestionType(dataObj);
        }
    });
}

/**
 * 요청타입 세팅
 */
function setQuestionType(dataObj) {
    $('select[name="incident[process_cd]"]').empty();
    for (var i = 0; i < dataObj.length; i++) {
        $('select[name="incident[process_cd]"]').append("<option value='" + dataObj[i].process_cd + "'>" + dataObj[i].process_nm + "</option>");
    }
}




/**
 * 상위업무 조회
 */
function getHigherNm(targetSelect) {
    var reqParam = "";
    $.ajax({
        type: "GET",
        async: true,
        //url: "/higherProcess/getHigherProcess",
        url: "/higherProcess/getUFhigherprocess",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("error : " + error + " : " + JSON.stringify(request));
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setHigherSelect(targetSelect, dataObj);
        }
    });
}


/**
 * 상위업무 셀렉트박스 세팅
 */

function setHigherSelect(targetSelect, dataObj) {
    targetSelect.empty();
    targetSelect.append("<option value='*'>선택하세요.</option>");
    for (var i = 0; i < dataObj.length; i++) {
        targetSelect.append("<option value='" + dataObj[i].higher_cd + "'>" + dataObj[i].higher_nm + "</option>");
    }
}


/**
 * 하위타입 조회
 */
function getLowerNm(targetSelect, higher_cd) {
    var reqParam = "";
    $.ajax({
        type: "GET",
        async: true,
        url: "/lowerProcess/getJSON/" + higher_cd,
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: reqParam,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("error : " + error + " : " + JSON.stringify(request));
        },
        beforeSend: function () {
        },
        success: function (dataObj) {
            setLowerSelect(targetSelect,dataObj);
        }
    });
}


/**
 * 하위업무 셀렉트박스 세팅
 */

function setLowerSelect(targetSelect, dataObj) {
    targetSelect.empty();
    for (var i = 0; i < dataObj.length; i++) {
        targetSelect.append("<option value='" + dataObj[i].lower_cd + "'>" + dataObj[i].lower_nm + "</option>");
    }
}



/**
 * 회사 정보 조회
 */
function getCompany() {
    $.ajax({
        type: "GET",
        async: true,
        url: "/company/getUFCompany/",
        contentType: "application/json",
        //data : reqParam,
        dataType: "json",
        error: function (request, status, error) {
            alert("getCompany : " + error + " " + request.responseText);
        },
        success: function (data) {
            setCompany(data);
            //getHigherProcessList();
            research(1);
            
        }
    });
}

/**
 * 회사 정보 세팅
 */
function setCompany(data) {
    $('#company_cd').empty();
    
    if (data.length == 1) {
        $('#company_cd').append("<option value='" + data[0]["company_cd"] + "' >" + data[0]["company_nm"] + "</option>");
        $('#company_cd').val(data[0]["company_cd"]);
    } else {
        $('#company_cd').append("<option value='*'>전체</option>");
        for (var i = 0; i < data.length; i++) {
            $('#company_cd').append("<option value='" + data[i]["company_cd"] + "'>" + data[i]["company_nm"] + "</option>");
        }
    }

}