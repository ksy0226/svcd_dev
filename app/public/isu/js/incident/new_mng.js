'use strict';


$(document).ready(function () {

    //$('input[name="incident[app_menu]"]').val();

    $('#higher_cd').on('change',function(){
        selectedHighProcess(this)
    });

    $('.summernote').summernote({
        height: 450, // set editor height
        minHeight: null, // set minimum height of editor
        maxHeight: null, // set maximum height of editor
        focus: false // set focus to editable area after initializing summernote
        ,callbacks: {
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

    function sendFile(file, editor, welEditable) {
        data = new FormData();
        data.append("incident[attach-file]", file);
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
    });   
});

function selectedHighProcess(obj){

    if($('#higher_cd').val() != '*'){
        $('#higher_nm').val($('#higher_cd option:selected').text());
    }

    if($(obj).val() == 'H008'){
        $('#app_menu').slideDown(350);
        //$('#app_menu').attr('style','display:');
    }else{
        $('#app_menu').slideUp(350);            
    }
}

//필수값 체크
function checkValue(){
    //alert($('input[name="incident[request_nm]"]').val());

    if($('input[name="incident[request_nm]"]').val() == ''){
        alert("요청자를 입력하세요.");
        $('input[name="incident[real_register_mm]"]').focus();
        return false;
    }

    if($('select[name="incident[higher_cd]"]').val() == '*' || $('select[name="incident[higher_cd]"]').val() === null){
        alert("업무구분을 선택하세요.");
        $('#higher_cd').focus();
        return false;
    }

    if($('input[name="incident[title]"]').val() == ''){
        alert("제목을 입력하세요.");
        $('input[name="incident[title]"]').focus();
        return false;
    }

    return true;
}


//요청자
$(function() {
    $('#request_info').autocomplete({
        source: function( request, response ) {
            $.ajax({  
                type: "GET",        
                url: "/usermanage/userJSON/",
                data: 'searchText='+encodeURIComponent($('#request_info').val()),
                dataType: "json", 
                error: function (request, status, error) {
                    alert("autocomplete error : " + error+ " "+request.responseText);
                },         
                success: function( data ) { 
                    response( $.map( data, function( item ) { 
                        if (item.employee_nm.toLowerCase().indexOf($('#request_info').val().toLowerCase()) >= 0)
                        {   
                            return {
                                label: item.employee_nm.toLowerCase().replace($( '#request_info' ).val().toLowerCase(),"<span style='font-weight:bold;color:Blue;'>" + $( '#request_info' ).val().toLowerCase() + "</span>"),                                 
                                value: item.employee_nm,
                                company_cd: item.company_cd,
                                company_nm: item.company_nm,
                                dept_cd:item.dept_cd,
                                dept_nm:item.dept_nm,
                                position_nm:item.position_nm,
                                office_tel_no:item.office_tel_no,
                                hp_telno:item.hp_telno,
                                email:item.email
                            }        
                        }                     
                    }));
                }             
            });         
        },
        autoFocus:true,   
        //delay:2,
        minLength: 1,         
        select: function( event, ui ) {                
            setUserInfo(ui.item);   
        }, 
        focus : function(event, ui){
            //$('#request_info').val(ui.item.value);
            return false;
            //event.preventDefault();
        },     
        open: function() {          
            $( this ).autocomplete("widget").width("580px");             
            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );         
        },         
        close: function() {             
            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );         
        },         
        error: function(xhr, ajaxOptions, thrownError){ alert(thrownError);  alert(xhr.responseText); } 
    })     
    .data('uiAutocomplete')._renderItem = function( ul, item ) {    
        return $( "<li style='cursor:hand; font-size:10pt'></li>" )          
        .data( "item.autocomplete", item ).append("<a onclick=\"#\">" +unescape(item.label)+"&nbsp;"+ unescape(item.company_nm)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +unescape(item.dept_nm)+"&nbsp;&nbsp;&nbsp;" +unescape(item.position_nm)+"&nbsp;&nbsp;&nbsp;" +unescape(item.office_tel_no)+ "</a>")      
        .appendTo( ul );  
    }; 
});

//요청자(업체포함) 조회결과값 세팅 
function setUserInfo(item){
    //$('input[name=request_info]').val(item.employee_nm);   
    $('input[name="incident[request_company_cd]"]').val(item.company_cd);
    $('input[name="incident[request_company_nm]"]').val(item.company_nm);
    $('input[name="incident[request_dept_cd]"]').val(item.dept_cd);
    $('input[name="incident[request_dept_nm]"]').val(item.dept_nm);
    $('input[name="incident[request_position_nm]"]').val(item.position_nm);
    //$('input[name="incident[request_id]"]').val(item.sabun);
    $('input[name="incident[request_id]"]').val(item.email);
    $('input[name="incident[request_email]"]').val(item.email);
    $('input[name="incident[request_hp_telno]"]').val(item.hp_telno);
    $('input[name="incident[request_office_tel_no]"]').val(item.office_tel_no);
    $('input[name="incident[request_nm]"]').val(item.value);
    setHighProcess(item.company_cd);
}

//요청자 회사에 상위업무를 조회
function setHighProcess(company_cd){

    var reqParam = 'company_cd=' + encodeURIComponent(company_cd) ;
    
    $.ajax({          
        type: "GET",
        async: true,
        url: "/companyProcess/getCompanyProcess/",
        contentType: "application/json",
        //data: 'company_cd='+company_cd,
        data : reqParam,
        dataType: "json", 
        error: function (request, status, error) {
            alert("set higherProcess error : " + error+ " "+request.responseText);
        },         
        success: function( data ) { 
            addOption(data);
            
        }             
    }); 
}

//상위업무 세팅
function addOption(data){

    $('#higher_cd').empty();
    $('#higher_cd').append("<option value='*'>선택하세요</option>");

    for(var i=0; i<data.length; i++){
        $('#higher_cd').append("<option value='"+data[i]["higher_cd"]+"'>"+data[i]["higher_nm"]+"</option>");
    }
}

//summernote 이미지 업로드
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


