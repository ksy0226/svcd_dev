'use strict';
var incident_id = ''; //선택 인시던트 id

$(document).ready(function () {

    //팝업공지 체크되어 있을 경우,
    if($('input:checkbox[name="oftenqna[pop_yn]"]').val() == "Y"){
        getCheckData(oftenqnaObj._id); 
    }


    if($('input:checkbox[name="oftenqna[pop_yn]"]').val() == "Y"){
        $('input:checkbox[name="oftenqna[pop_yn]"]').attr("checked", true);
    }else{
        $('input:checkbox[name="oftenqna[pop_yn]"]').prop("checked", false);
    }

    $('#higher_cd').val(oftenqnaObj.higher_cd);

    $('.summernote').summernote({
        height: 450, // set editor height
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: false // set focus to editable area after initializing summernote

        , callbacks: {
            onImageUpload: function (files, editor, welEditable) {
                for (var i = files.length - 1; i >= 0; i--) {
                    sendFile(files[i], this);
                }
            }
        }
    });

    $('.inline-editor').summernote({
        airMode: true
    });


 
    $('#form').submit(function(){
        $('input[name=files]').remove();
    });

    function sendFile(files, editor, welEditable) {
        data = new FormData();
        data.append("oftenqna[attach-file]", files);
        $.ajax({
            data: data,
            type: "POST",
            url: '/oftenqna/insertedImage',
            cache: false,
            contentType: false,
            processData: false,
            success: function(url) {
                $('#summernote').summernote("insertImage", url);
            }
        });
    }


    
    $('#pop_yn').on('click', function () {

        if($('input:checkbox[name="oftenqna[pop_yn]"]').is(':checked') == true){
            $('input:checkbox[name="oftenqna[pop_yn]"]').val("Y");
            higherCd();
        }else{
            $('input:checkbox[name="oftenqna[pop_yn]"]').val("N");
            $("input[name=cpChkBox]").prop("checked",false);
            $("#more_list tr").remove();
        }

    })
    
    $('#saveBtn').on('click', function () {
        if (checkValue()) {
            if (confirm("등록하시겠습니까?")) {
                if(document.getElementById("pop_yn").checked) {
                    document.getElementById('pop_ynHidden').disabled = true;
                }
                $('#form').submit();
            }
        }
    })

    

    $("#checkAll").on('click', function () {
        //클릭되었으면
        if($("#checkall").prop("checked")){
            //input태그의 name이 chk인 태그들을 찾아서 checked옵션을 true로 정의
            $("input[name=cpChkBox]").prop("checked",true);
            //클릭이 안되있으면
        }else{
            //input태그의 name이 chk인 태그들을 찾아서 checked옵션을 false로 정의
            $("input[name=cpChkBox]").prop("checked",false);
            
        }
    })
    
    
});

//상위코드 맵핑
function higherCd() {
    //선택된 회사 인덱스 값
    var sIdx = $('#higher_cd option').index($('#higher_cd option:selected'));
    sIdx = sIdx - 1; //'선택하세요' 인덱스값 1을 빼줌
    //선택값 매핑
    $('#higher_nm').val($('#higher_cd option:selected').text());
    var higherCdVal = $('#higher_cd').val();
    getCompany(higherCdVal);
}



//팝업공지 체크에 따른 회사리스트 조회
function getCheckData(id) {

    $.ajax({
        type: "GET",
        async: true,
        url: "/oftenQna/getCheckData/" + id,
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
            setCheckData(dataObj);
        }
    });
}


//내용 매핑
function setCheckData(dataObj) {
    var companyCheckList = dataObj.company_cd.split(',');
    var checkListArr = new Array(companyCheckList.length);

    for(var i = 0 ; i< companyCheckList.length ; i++){
        var tmpValue = companyCheckList[i].split(',');
        checkListArr[i] = tmpValue;
    }

    getCompany(dataObj.higher_cd, checkListArr);
}

//상위업무에 따른 회사조회
function getCompany(higherCdVal, checkListArr) {

    var reqParam = 'higher_cd=' + higherCdVal;

    $.ajax({
        type: "GET",
        async: true,
        url: "/companyProcess/getCompany",
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
            setCompany(dataObj, checkListArr);
            
        }
    });
}


//내용 매핑
function setCompany(dataObj, checkListArr) {
    //alert(JSON.stringify(dataObj));
    
    $("#more_list tr").remove();        
    var addList = "";
    //var iCnt = 0; 객체에 값이 없는 경우
    var j = 0;

    for(var i=0; i<dataObj.length; i++){
        if(i==0){
            addList += "<tr><td><input class='cpChkBox' type='checkbox' id='checkAll' onClick='checkAllFunc()'/></td><td>&nbsp;전체선택 </td></tr><hr/>";
            addList += "<tr>";
        }
        if($.isEmptyObject(dataObj[i].company_nm)){
            //iCnt++;
        }else{
            addList += "<td><input class='cpChkBox' type='checkbox' name='cpChkBox' value='"+dataObj[i].company_nm[0].company_cd+"' onClick='checkFunc("+ i +")' /></td><td>&nbsp;" +dataObj[i].company_nm[0].company_nm + "</td>";

            
            //company_nm 객체에 값이 있을 경우에만 실제 데이터 수(j) 증가
            if((dataObj[i].company_nm[0].company_nm).length>0){
                j++;
            }
            //0이거나 4의 배수 시 <tr>추가
            if(j%4==0){
                addList += "<tr>";
            }
        }
    }
    $("#more_list").append(addList);
    
    //company_cd가 checkList배열에 들어있으면 해당 값 체크
    for(var k=0; k<checkListArr.length; k++){
        $('input:checkbox[name="cpChkBox"]').each(function() {
            if(this.value == checkListArr[k]){ //값 비교
                this.checked = true; //checked 처리
            }
        });
    }  

}


/** 체크박스 전체선택 */
function checkAllFunc(){
    if($("#checkAll").prop("checked")){
        $("input[name=cpChkBox]").prop("checked",true);
    }else{
        $("input[name=cpChkBox]").prop("checked",false);
    }
    //company_nm
    var checkboxValues = $("input[name='cpChkBox']:checkbox:checked").map(function() {
	    return $(this).val();
    }).get();

    $('input[name="oftenqna[company_cd]"]').val(checkboxValues);
    
}


/** 체크박스 개별선택 */
function checkFunc(i){
    //체크박스에 체크된것만 배열 생성
    var checkboxValues = $("input[name='cpChkBox']:checkbox:checked").map(function() {
	    return $(this).val();
    }).get();
    $('input[name="oftenqna[company_cd]"]').val(checkboxValues);


}

/**
 * CheckBox 초기화
 */
function setCheckBox() {
    
}


//필수값 체크
function checkValue() {
    if ($('#higher_cd').val() == '') {
        alert("상위업무를 선택하세요.");
        $('#higher_cd').focus();
        return false;
    }

    if ($('input[name="oftenqna[title]"]').val() == '') {
        alert("제목을 입력하세요.");
        $('input[name="oftenqna[title]"]').focus();
        return false;
    }

    return true;
}


