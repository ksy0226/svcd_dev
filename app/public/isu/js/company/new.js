'use strict';

$(document).ready(function () {

    //그룹사구분 세팅
    setGroupFlag();
   
});

//그룹사구분 세팅
function setGroupFlag() {

    if($('#user_flag').val() == '1'){
        $('#row_group_flag').slideDown(350);
        
    }else{
        $('#row_group_flag').slideUp(350);
               
    }
}
