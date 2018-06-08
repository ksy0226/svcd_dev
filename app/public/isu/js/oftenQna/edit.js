'use strict';

$(document).ready(function () {
    //alert(JSON.stringify(oftenqnaObj));
    
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

    
    $('#pop_yn').on('click', function () {

        if($('input:checkbox[name="oftenqna[pop_yn]"]').is(':checked') == true){
            $('input:checkbox[name="oftenqna[pop_yn]"]').val("Y");
        }else{
            //alert("11111 : "+ $('input:checkbox[name="oftenqna[pop_yn]"]').is(':checked'));
            $('input:checkbox[name="oftenqna[pop_yn]"]').val("N");
        }
        
        //alert("bbbbb : " +$('input:checkbox[name="oftenqna[pop_yn]"]').val());

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
        alert("click-click");
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


function getCompany(higherCdVal) {
    alert("param : "+ higherCdVal);
    //$("#more_list").html('');

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
            
            setCompany(dataObj);
        }
    });
}
function checkFunc(){
    if($("#checkAll").prop("checked")){
        $("input[name=cpChkBox]").prop("checked",true);
    }else{
        $("input[name=cpChkBox]").prop("checked",false);
    }
}
//내용 매핑
function setCompany(dataObj) {

    $("#more_list tr").remove();
    //$("#more_list").remove();
    //alert("dataObj : " + JSON.stringify(dataObj));
    alert("dataObj.length : " + dataObj.length);         //4-> 건설erp
    
                
    var addList = "";
    
    //var iCnt = 0;
    //var jCnt = 0;
    var j = 0; 

    for(var i=0; i<dataObj.length; i++){
        if(i==0){
            addList += "<tr><td><input class='cpChkBox' type='checkbox' id='checkAll' onClick='checkFunc()'/></td><td> 전체선택 </td></tr><hr/>";
            addList += "<tr>";
        }
        
        if($.isEmptyObject(dataObj[i].company_nm)){
            //iCnt++;
        }else{
            addList += "<td><input class='cpChkBox' type='checkbox' name='cpChkBox'/></td><td id='test'>" +dataObj[i].company_nm[0].company_nm + "</td>";

            if((dataObj[i].company_nm[0].company_nm).length>0){
                j++;
            }
              
            if(j%4==0){
                addList += "<tr>";
            }
        }
    }
    $("#more_list").append(addList);
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

//summernote 이미지 업로드

function sendFile(files, editor, welEditable) {
    data = new FormData();
    data.append("oftenqna[attach-file]", files);
    $.ajax({
        data: data,
        type: "POST",
        url: '/oftenqna/insertedImage',
        cache: true,
        contentType: false,
        processData: false,
        success: function(url) {
            $('#summernote').summernote("insertImage", url);
        }
    });
}
