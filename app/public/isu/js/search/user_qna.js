'use strict';
var incident_id = '';   //선택 인시던트 id
var rowIdx = 0;         //출력 시작 인덱스
var dataCnt = 0;        // 출력 종료 인덱스
var inCnt = 15;         //한번에 화면에 조회되는 리스트 수


var totalData = 0;      // 총 데이터 수 

var dataPerPage = 15;   // 한 페이지에 나타낼 데이터 수
var pageCount = 10;      // 한 화면에 나타낼 페이지 수
var totalPage = 0;

$(document).ready(function () {
   
    $('#searchText').keypress(function(e){
        if(e.keyCode == 13) {
            $('#searchText').val($('#searchText').val());
            research(1);
        }
    });

    //최초 페이징
    paging(totalData, dataPerPage, pageCount, 1);

    getDataList(1);
    

    //조회버튼 클릭 시
    $('#searchBtn').on('click', function () {
        research(1);
    }); 

    //상위업무 변경 시
    $('#higher_cd').on('change', function () {
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
 * 데이터 조회-(상위업무 구분, 검색어 중) 선택된 리스트 가져오기 
 */
function getDataList(selectedPage){
    var reqParam = 'searchType=' + $('#searchType').val() + '&higher_cd=' + $('#higher_cd').val() + '&searchText=' + encodeURIComponent($('#searchText').val());

    $.ajax({
        type: "GET",
        async: true,
        url: "/search/getqnalist",
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
    
    //선택한 페이지가 1page 이상일 때,
    if(selectedPage>1){
        //기존 데이터 삭제
        $("#more_list tr").remove();
    }
    
    var startIdx = dataPerPage*(selectedPage-1)+1;
    var endIdx = dataPerPage*selectedPage+1;

    //endIdx 가 실제 데이터 수보다 클 경우,
    if(dataObj.length < endIdx){  2 < 16
        endIdx = dataObj.length;
    } 
    
    for(var i = startIdx ; i < endIdx+1 ; i++){ //1~2
        //var created_atVal = dataObj[i-1].created_at;
        //alert(i +"번째" +created_atVal);

        var idValue = dataObj[i-1]._id ;
        var created_atVal = dataObj[i-1].created_at; 
    
        if(created_atVal){
            created_atVal = created_atVal.substring(0,10);
        }else{
            created_atVal = ""; 
        }


        var addList = "";
        //addList += "							<tr onclick=window.location='/search/qna_detail/" + dataObj[i-1]._id + "'>";
        addList += "							<tr onclick=detailShow('" + dataObj[i-1]._id + "')>";
        addList += "								<td>" + dataObj[i-1].higher_nm + "</td>";
        if(dataObj[i-1].attach_file.length > 0){
            addList += "								<td><span class='i fa fa-paperclip m-r-10 m-b-10'></span></td>";
        }else{
            addList += "								<td></td>";
        }
        addList += "								<td>" + dataObj[i-1].title + "</td>";
        addList += "								<td class='text-center'>" + created_atVal + "</td>";
        addList += "								<td class='text-center'>" + dataObj[i-1].user_nm + "</td>";
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
function detailShow(id){
    //incident id값 세팅
    incident_id = id;

    var reqParam = '';
    $.ajax({
        type: "GET",
        async: true,
        url: "/search/qna_detail/"+id,
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
            init(dataObj);
            setDetail(dataObj);
            $('#wdetail_modal').modal('show');
        }
    });
}

/**
 * 상세조회 매핑
 */
function setDetail(dataObj){
    /**
     * 조회내용 세팅
     */
    $('#_higher_nm').html(dataObj.higher_nm);
    $('#_title').html(dataObj.title);
    $('#_content').html(dataObj.content);

    
    /**
     * 첨부파일
     */
    if(dataObj.attach_file.length > 0){
        $('#_attach').html('');

        for(var cnt=0; cnt <dataObj.attach_file.length; cnt++){
            var fileList = "";
            fileList += "<a href='/search/download/" + dataObj.attach_file[cnt].path +"/"+ dataObj.attach_file[cnt].originalname + "'>";
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

/**
 * 상세조회 매핑
 */
function init(dataObj){
    /**
     * 조회내용 세팅
     */
    $('#_higher_nm').html("");
    $('#_title').html("");
    $('#_content').html("");


}