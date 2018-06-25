'use strict';


$(document).ready(function () {
    $('#title').val(incidentObj.title);
    $('#summernote').val(incidentObj.content);
    $('#higher_nm').val(incidentObj.higher_nm);
    $('#real_contact').val(incidentObj.real_contact);


    $('#higher_cd').on('change',function(){
        selectedHighProcess(this);
        $('#higher_nm').val($('#higher_cd option:selected').text());
    });

    $('.summernote').summernote({
        height: 450, // set editor height;
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: false // set focus to editable area after initializing summernote
        ,
        callbacks: {
            onImageUpload: function(files, editor, welEditable) {
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
        data.append("incident[attach-file]", files);
        $.ajax({
            data: data,
            type: "POST",
            url: '/incident/insertedImage',
            cache: false,
            contentType: false,
            processData: false,
            success: function(url) {
                $('#summernote').summernote("insertImage", url);
            }
        });
    }
    //$('.file-drop-zone').hide();

    $('#datepicker-rcd').datepicker({
        autoclose: true,
        todayHighlight: true,
        format: "yyyy-mm-dd"
    });

    $('#saveBtn').on('click',function(){
        if(checkValue()){
            if(confirm("등록하시겠습니까?")){
                $('#form').submit();
            }
        }
    })
    
});

function selectedHighProcess(obj){
    if($(obj).val() == 'H008'){
        $('#app_menu').slideDown(350);
        //$('#app_menu').attr('style','display:');
    }else{
        $('#app_menu').slideUp(350);            
    }
}

//필수값 체크
function checkValue(){
    if($('#higher_cd').val() == ''){
        alert("요청업무를 선택하세요.");
        $('#higher_cd').focus();
        return false;
    }

    if($('input[name="incident[real_register_mm]"]').val() == ''){
        alert("요청자를 입력하세요.");
        $('input[name="incident[real_register_mm]"]').focus();
        return false;
    }

    if($('input[name="incident[title]"]').val() == ''){
        alert("제목을 입력하세요.");
        $('input[name="incident[title]"]').focus();
        return false;
    }

    return true;
}

//summernote 이미지 업로드
/*
function sendFile(file, el) {
    var form_data = new FormData();
      form_data.append('insertedImage', file);
      $.ajax({
        data: form_data,
        type: "POST",
        url: '/incident/insertedImage',
        cache: false,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        success: function(img_name) {
              $(el).summernote('editor.insertImage', img_name);
        }
      });
}
*/




