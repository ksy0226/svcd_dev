'use strict';

$(document).ready(function () {

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

    $('#saveBtn').on('click', function () {
        if (checkValue()) {
            if (confirm("등록하시겠습니까?")) {
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
function sendFile(file, el) {
    var form_data = new FormData();
    form_data.append('insertedImage', file);
    $.ajax({
        data: form_data,
        type: "POST",
        url: '/oftenqna/insertedImage',
        cache: false,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        success: function (img_name) {
            $(el).summernote('editor.insertImage', img_name);
        }
    });
}
