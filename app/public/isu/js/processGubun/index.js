'use strict';

var incident_id = ''; //선택 인시던트 id
//var higher_cd = '000'//선택 상위코드
var rowIdx = 0;         //출력 시작 인덱스
var dataCnt = 0;        // 출력 종료 인덱스
var inCnt = 15;         //한번에 화면에 조회되는 리스트 수

var totalData = 0;      // 총 데이터 수 

var dataPerPage = 15;   // 한 페이지에 나타낼 데이터 수
var pageCount = 10;      // 한 화면에 나타낼 페이지 수
var totalPage = 0;




$(document).ready(function () {

    //엔터키 이벤트 시
    $('#searchText').keypress(function(e){
        if(e.keyCode == 13) {
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

});


//다시 조회
function research(selectedPage){
    //내용삭제
    $("#more_list").empty();
    getDataList(selectedPage);
    //getDataList();
}



/**
 * 데이터 조회-(상위업무 검색어, 날짜 중) 리스트 가져오기 
 */

function getDataList(selectedPage){
//function getDataList(){    

    var reqParam = 'searchText=' + encodeURIComponent($('#searchText').val());
    $.ajax({
        type: "GET",
        async: true,
        url: "/processGubun/list",
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
            $('#ajax_indicator').css("display", "none");
            //리스트에 내용 매핑
            setDataList(dataObj, selectedPage);
            totalData = dataObj.length;
            totalPage = Math.ceil(totalData/dataPerPage);
            $('#totalPage').text(totalPage);

            paging(totalData, dataPerPage, pageCount, selectedPage);   
        }
    });
}


/**
 * 선택된 내용 매핑하기
 */
function setDataList(dataObj, selectedPage) {
//function setDataList(dataObj) {
    //선택한 페이지가 1page 이상일 때,
    //if(selectedPage>1){
    //기존 데이터 삭제
    $("#more_list tr").remove();
    //}

    var startIdx = dataPerPage*(selectedPage-1)+1;
    var endIdx = dataPerPage*selectedPage+1;
    
    //endIdx 가 실제 데이터 수보다 클 경우,
    if(dataObj.length < endIdx){ // 7<16
        endIdx = dataObj.length;
    } 

    for(var i = startIdx ; i <endIdx+1 ; i++){ 

        var addList = "";
        //addList += "							<tr onclick=window.location='/search/user_detail/" + dataObj[i-1]._id + "'>";
        //addList += "							<tr onclick=detailShow('" + dataObj[i-1]._id + "') style='cursor:pointer' >";
        addList += "							<tr onclick=location='/processGubun/edit/" + dataObj[i-1]._id + "'>";
        //상위업무 제외
        //addList += "								<td>" + dataObj[i-1].higher_nm + "</td>";
        addList += "								<td>" + dataObj[i-1].process_nm + "</td>";
        addList += "								<td>" + dataObj[i-1].question_type + "</td>";
        addList += "								<td>" + dataObj[i-1].description + "</td>";
        addList += "								<td>" + dataObj[i-1].user_nm + "</td>";
        addList += "								<td class='text-center'>" + dataObj[i-1].use_yn + "</td>";
        addList += "							</tr>";

        $("#more_list").append(addList);

        startIdx++;
    }
}


/**
 * 페이징 처리
 */

function paging(totalData, dataPerPage, pageCount, currentPage){
    
    var totalPage = Math.ceil(totalData/dataPerPage);    // 총 페이지 수
    var pageGroup = Math.ceil(currentPage/pageCount);    // 페이지 그룹

    //검색 시, 총 페이지 수가 화면에 뿌려질 페이지(10개Page)보다 작을 경우 처리
    if(totalPage <= pageCount){
        last = totalPage;
        first = 1;
    }else{
        var last = pageGroup * pageCount;    // 화면에 보여질 마지막 페이지 번호
        if(last > totalPage)
            last = totalPage;
        var first = last - (pageCount-1);    // 화면에 보여질 첫번째 페이지 번호
    }
    
    var next = last+1;
    var prev = first-1;
    

    var html = "";
    
    if(prev > 0)
        html += "<li class='cpaginate_button previous'><a href=# id='prev'>Previous</a></li>";
    for(var i=first; i <= last; i++){
        if(i == currentPage){
            html += "<li class='cpaginate_button active'><a href='#' id=" + i + ">" + i + "</a></li> ";
        }else{
            html += "<li class='cpaginate_button'><a href='#' id=" + i + ">" + i + "</a></li> ";
        }
    }
    
    if(last < totalPage)
        html += "<li class='cpaginate_button next'><a href=# id='next'>Next</a></li>";
    
    $("#paging").html(html);    // 페이지 목록 생성
   
    //$("#paging a").css("color", "black");
    // $("#paging a#" + currentPage).css({"text-decoration":"none", 
    //                                 "color":"red", 
    //                                 "font-weight":"bold"});    // 현재 페이지 표시
    
    
   //페이지 목록 선택 시 페이징 함수, 데이터 조회 함수 호출
    $("#paging a").click(function(){
        $("#more_list").empty();

        var $item = $(this);
        var $id = $item.attr("id");
        var selectedPage = $item.text();
        
        if($id == "next")    selectedPage = next;
        if($id == "prev")    selectedPage = prev;

        paging(totalData, dataPerPage, pageCount, selectedPage);
        getDataList(selectedPage);
        
    });
}





/**
 * 상세모달호출
 * @param {*} incident_id  
 */
/*
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
*/
/**
 * 상세조회 매핑
 */

//function setDetail(dataObj){

    //상위코드
    //higher_cd = dataObj.higher_cd;

    /**
     * 등록내용 세팅
     */
    //$('#_status_nm').html(dataObj.status_nm);
    //$('#_process_speed').html(dataObj.process_speed);
    
    //if(dataObj.status_nm !="접수대기"){
    //    $('#_status_nm').html(dataObj.status_nm);
    //}else{
    //    $('#_status_nm').html('접수대기');
    //}

    /**
    * 긴급구분
    */
    /*
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
    */
    /**
     * 처리내용 세팅
     */
    /*
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
    */
    /**
     * 첨부파일
     */
    /*
    if(dataObj.attach_file.length > 0){
        $('#_attach').html('');

        for(var cnt=0; cnt <dataObj.attach_file.length; cnt++){
            var fileList = "";
            fileList += "<a href='/search/download/" + dataObj.attach_file[cnt].path + "'>";
            fileList += "<span class='text-pink'> " + dataObj.attach_file[cnt].originalname +  "</span>";
            fileList += "<span class='text-muted.m-l-10'> " + "(" + dataObj.attach_file[cnt].size + " Byte)" +  "</span>";
            //$('#_attach').addClass('i fa fa-paperclip m-r-10 m-b-10');
            $('#_attach').append("<td class='i fa fa-paperclip m-r-10 m-b-10'>" + fileList +"</td>");
        } 
        
    }else{
        $('#_attach').html('');
        $('#_attach').removeClass();
    }
}
*/