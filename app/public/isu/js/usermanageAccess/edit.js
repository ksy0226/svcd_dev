'use strict';

$(document).ready(function () {
    $('#user_flag').val(usermanageAccessObj.user_flag);
    $('#group_flag').val(usermanageAccessObj.group_flag);
    $('#access_yn').val(usermanageAccessObj.access_yn);
    $('#email_send_yn').val(usermanageAccessObj.email_send_yn);
    $('#using_yn').val(usermanageAccessObj.using_yn);
    //$('#company_cd').val(usermanageAccessObj.company_nm);
    $('#company_cd').val(usermanageAccessObj.company_cd);

});

function companyCd() {
    //선택된 회사 인덱스 값
    var sIdx = $('#company_cd option').index($('#company_cd option:selected'));
    sIdx = sIdx - 1; //'선택하세요' 인덱스값 1을 빼줌
    //선택값 매핑
    $('#company_nm').val($('#company_cd option:selected').text());
    $('input[name="usermanageAccess[dom_post_cd1]"]').val(companyObj[sIdx].zip_cd);
    $('input[name="usermanageAccess[dom_addr]"]').val(companyObj[sIdx].addr);
    $('input[name="usermanageAccess[dom_addr2]"]').val(companyObj[sIdx].addr2);
    $('input[name="usermanageAccess[office_tel_no]"]').val(companyObj[sIdx].tel_no);
}