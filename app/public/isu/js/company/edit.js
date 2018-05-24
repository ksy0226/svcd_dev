'use strict';

$(document).ready(function () {

    //그룹사구분 세팅
    setGroupFlag();

    //유지보수 기간 체크 
    checkDate();

    //회사주소 체크
    checkComAddress();
    
});

//그룹사구분 세팅
function setGroupFlag() {

    $('select[name="company[group_flag]"]').val($('#group_flag').val());

    if($('#user_flag').val() == '1'){
        $('#row_group_flag').slideDown(350);
        
    }else{
        $('#row_group_flag').slideUp(350);
               
    }
}

function checkDate(){
    //유지보수 기간 FROM ~ TO
    if($('input[name="company[date_from]"]').val() =="undefined"){
        $('input[name="company[date_from]"]').val(""); 
    }
    if($('input[name="company[date_to]"]').val() =="undefined"){
        $('input[name="company[date_to]"]').val(""); 
    }
}

function checkComAddress(){
    //회사주소 1, 회사주소 2
    if($('input[name="company[addr]"]').val() =="undefined"){
        $('input[name="company[addr]"]').val(""); 
    }
    if($('input[name="company[addr2]"]').val() =="undefined"){
        $('input[name="company[addr2]"]').val(""); 
    }
}