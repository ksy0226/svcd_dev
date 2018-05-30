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

//내용 매핑
function setCompany(dataObj) {
    //alert("dataObj.length : " + dataObj.length);
    
    if(dataObj.length >0) {
        for(var i=0; i< dataObj.length; i++){

            var addList = "";
            addList += "<tr><td><input class='cpChkBox' type='checkbox' id='cpChkBox'+"+ dataObj[i].length +"/></td><td width='14%'>&nbsp;" + dataObj[i].company_cd + "</td>";
            addList += "<td><input class='cpChkBox' type='checkbox' id='cpChkBox'+"+ dataObj[i+1].length +"/></td><td width='14%'>&nbsp;" + dataObj[i+1].company_cd + "</td>";
            addList += "<td><input class='cpChkBox' type='checkbox' id='cpChkBox'+"+ dataObj[i+2].length +"/></td><td width='14%'>&nbsp;" + dataObj[i+2].company_cd + "</td>";
            addList += "<td><input class='cpChkBox' type='checkbox' id='cpChkBox'+"+ dataObj[i+3].length +"/></td><td width='14%'>&nbsp;" + dataObj[i+3].company_cd + "</td>";
            addList += "<td><input class='cpChkBox' type='checkbox' id='cpChkBox'+"+ dataObj[i+4].length +"/></td><td width='14%'>&nbsp;" + dataObj[i+4].company_cd + "</td>";
            addList += "<td><input class='cpChkBox' type='checkbox' id='cpChkBox'+"+ dataObj[i+5].length +"/></td><td width='15%'>&nbsp;" + dataObj[i+5].company_cd + "</td>";
            addList += "<td><input class='cpChkBox' type='checkbox' id='cpChkBox'+"+ dataObj[i+6].length +"/></td><td width='15%'>&nbsp;" + dataObj[i+6].company_cd + "</td>";
            addList += "</tr>";
            
            $("#more_list").append(addList);
            i=i+7;
        }
    }
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
