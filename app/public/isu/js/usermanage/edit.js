'use strict';

$(document).ready(function () {
    $('#user_flag').val(usermanageObj.user_flag);
    $('#group_flag').val(usermanageObj.group_flag);
    $('#access_yn').val(usermanageObj.access_yn);
    $('#email_send_yn').val(usermanageObj.email_send_yn);
    $('#using_yn').val(usermanageObj.using_yn);
    //$('#company_cd').val(usermanageObj.company_nm);
    $('#company_cd').val(usermanageObj.company_cd);
       
    $('#company_cd').on("change",function(){
        displaySabun(this);
    });

    displaySabun($('#company_cd'));

    //회사주소 체크 
    checkCompanyAddress();
    
});

/**
 * 회사주소 체크
 */
function checkCompanyAddress(){
    if($('input[name="usermanage[dom_addr2]"]').val() =="undefined"){
        $('input[name="usermanage[dom_addr2]"]').val(""); 
    }
}


/**
 * 회사코드 선택 시 사번등록 항목 DISPLAY여부
 * @param {* 회사코드} obj 
 */
function displaySabun(obj){
    if($(obj).val() == 'ISU_ST'){
        $('#row_sabun').slideDown(350);
        $('input[name="usermanage[sabun]"]').attr('required');
    }else{
        $('#row_sabun').slideUp(350);
        $('input[name="usermanage[sabun]"]').removeAttr('required');          
    }
}


function companyCd() {
    //선택된 회사 인덱스 값
    var sIdx = $('#company_cd option').index($('#company_cd option:selected'));
    sIdx = sIdx - 1; //'선택하세요' 인덱스값 1을 빼줌
    //선택값 매핑
    $('#company_nm').val($('#company_cd option:selected').text());
    $('input[name="usermanage[dom_post_cd1]"]').val(companyObj[sIdx].zip_cd);
    $('input[name="usermanage[dom_addr]"]').val(companyObj[sIdx].addr);
    $('input[name="usermanage[dom_addr2]"]').val(companyObj[sIdx].addr2);
    $('input[name="usermanage[office_tel_no]"]').val(companyObj[sIdx].tel_no);
}