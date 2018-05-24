'use strict';

$(document).ready(function () {
    usermanageNew();

    //계정신청 모달 저장버튼 클릭 시
    $('#usermanageNewSaveBtn').on('click', function () {
        receiptSave();
    });
});

//계정신청 폼 초기화
function usermanageNew() {
    $('#usermanageNew_form').find('input').val('');
    $('#usermanageNew_form').find('select').val('');
}

//계정신청 저장
function receiptSave() {

    if (checkValue()) {
        if (confirm("등록하시겠습니까?")) {
            var reqParam = $('#usermanageNew_form').serialize();
            //var reqParam = "usermanage=aaa";
            /*
            reqParam += "&usermanage[userCompany_nm]=" + $('input[name = "usermanage[userCompany_nm]"]').val() 
                      + "&usermanage[company_cd]=" + $('input[name = "usermanage[company_cd]"]').val()
                      + "&usermanage[email]=" + $('input[name = "usermanage[email]"]').val()
                      + "&usermanage[password]=" + $('input[name = "usermanage[password]"]').val()
                      + "&usermanage[employee_nm]=" + $('input[name = "usermanage[employee_nm]"]').val()
                      + "&usermanage[dept_nm]=" + $('input[name = "usermanage[dept_nm]"]').val()
                      + "&usermanage[position_nm]=" + $('input[name = "usermanage[position_nm]"]').val()
                      + "&usermanage[hp_telno]=" + $('input[name = "usermanage[hp_telno]"]').val();
            */

            try {
                $.ajax({
                    type: "POST",
                    async: true,
                    url: "/new",
                    dataType: "json",
                    timeout: 30000,
                    cache: false,
                    data: reqParam,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    error: function (request, status, error) {
                        alert("receiptSave ajax error : " + error);
                    },
                    beforeSend: function () {
                    },
                    success: function (dataObj) {
                        if (dataObj.gubun == 'N') {
                            alert("중복된 계정이 존재합니다.");
                        } else {
                            alert("계정 신청이 완료되었습니다.");
                            $('#usermanageNew_modal').modal('hide');
                            usermanageNew();
                        }
                    }
                });
            } catch (error) {
                logger.debug("receiptSave catch error : ", error);
            }
        }
    }
}

//입력값 체크
function checkValue() {
    if ($('input[name="usermanage[userCompany_nm]"]').val() == '') {
        alert("회사명을 입력하세요.");
        return false;
    }

    if ($('input[name="usermanage[email]"]').val() == '') {
        alert("Email (ID)를 입력하세요.");
        $('input[name="usermanage[email]"]').focus();
        return false;
    }

    if ($('input[name="usermanage[password]"]').val() == '') {
        alert("비밀번호를 입력하세요.");
        $('input[name="usermanage[password]"]').focus();
        return false;
    }

    if ($('input[name="usermanage[password]"]').val() != $('input[name="usermanage[passwordChk]').val()) {
        alert("비밀번호가 일치하지 않습니다.");
        $('input[name="usermanage[passwordChk]"]').focus();
        return false;
    }

    if ($('input[name="usermanage[employee_nm]"]').val() == '') {
        alert("이름을 입력하세요.");
        $('input[name="usermanage[employee_nm]"]').focus();
        return false;
    }

    if ($('input[name="usermanage[dept_nm]"]').val() == '') {
        alert("부서명을 입력하세요.");
        $('input[name="usermanage[dept_nm]"]').focus();
        return false;
    }

    if ($('input[name="usermanage[position_nm]"]').val() == '') {
        alert("직위를 입력하세요.");
        $('input[name="usermanage[position_nm]"]').focus();
        return false;
    }

    if ($('input[name="usermanage[hp_telno]"]').val() == '') {
        alert("연락처를 입력하세요.");
        $('input[name="usermanage[hp_telno]"]').focus();
        return false;
    }

    return true;
}