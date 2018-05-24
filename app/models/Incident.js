var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var moment = require('moment');
var logger = require('log4js').getLogger('app');

var IncidentSchema = new Schema({
    register_num            : {type : Number, require : true},                                                                                                                      
    status_cd               : {type : String, default : '1'},  //진행상태(processStatus 모델)  
    status_nm               : {type : String, default : '접수대기'},  //진행상태명            
    process_speed           : {type : String},  //긴급구분                                                                   
    course_flag             : {type : String},                                                                           
    title                   : {type : String, required : true, validate : [isEmpty, "제목은 꼭 입력해주세요."] }, //제목 
    content                 : {type : String},  //내용                                                                       
    request_company_cd      : {type : String},  //요청자 회사코드
    request_company_nm      : {type : String},  //요청자 회사명                                                              
    request_dept_cd         : {type : String},  //요청자 부코드
    request_dept_nm         : {type : String},  //요청자 부서명 
    request_id              : {type : String},  //요청자 계정
    request_nm              : {type : String},  //요청자 명                                                               
    request_complete_date   : {type : String},  //완료요청일
    register_company_cd     : {type : String},  //등록자 회사코드  
    register_company_nm     : {type : String},  //등록자 회사명                                                              
    register_sabun          : {type : String},  //등록자 사번 
    register_nm             : {type : String},  //등록자 명                                                                
    register_date           : {type : String},  //등록일                                                                     
    register_yyyy           : {type : String},  //등록년                                                                     
    register_mm             : {type : String},  //등록월
    register_dd             : {type : String},  //등록일자 
    real_register_mm        : {type : String},  //실제요청자
    real_contact            : {type : String},  //실제요청자 연락처   
    app_menu                : {type : String, default : 'ServiceDesk'},  //문의 메뉴 경로                                                                                                                                             
    receipt_content         : {type : String},  //접수내용                                                                         
    manager_company_cd      : {type : String},  //담당자 회사코드
    manager_company_nm      : {type : String},  //담당자 회사명
    manager_nm              : {type : String, default:'담당미지정'},  //담당자 명
    manager_dept_cd         : {type : String},  //담당자 부코드
    manager_dept_nm         : {type : String, default : ''},  //담당자 부서명
    manager_position        : {type : String, default : ''},  //담당자 직위명
    manager_email           : {type : String, default : ''},  //담당자 이메일
    manager_phone           : {type : String},  //담당자 전화
    receipt_date            : {type : String},  //접수일
    business_level          : {type : String},  //난이도
    complete_reserve_date   : {type : String, default : ''},  //완료예정일
    solution_flag           : {type : String, default : 'Y'},  //해결여부
    complete_content        : {type : String},  //완료 코멘트
    add_complete_content    : {type : String},  //추가 완료 코멘트                                                                         
    program_id              : {type : String},                                                                           
    delay_reason            : {type : String},  //지연사유                                                                           
    work_time               : {type : Number},  //작업시간                                                                         
    complete_date           : {type : String, default : ''},  //완료일                                                                       
    reading_cnt             : {type : Number},                                                                           
    complete_open_flag      : {type : String, default : 'N'},  //완료후공개여부                                                                     
    higher_cd               : {type : String},  //상위업무 코드
    higher_nm               : {type : String},  //상위업무 이름                                             
    lower_cd                : {type : String},  //하위업무 코드
    lower_nm                : {type : String},  //하위업무 이름
    customer_flag           : {type : String},                                                                           
    add_solution_content    : {type : String},                                                                           
    process_cd              : {type : String},  //처리구분 (processGubun Model)
    process_nm              : {type : String},  //처리구분내용                                                                        
    valuation               : {type : Number, default : 0},  //평가점수                                                                         
    valuation_content       : {type : String}, //평가내용                                                                           
    approval_gbn            : {type : String},                                                                           
    modify_yn               : {type : String, default : 'N'},                                                                           
    sharing_content         : {type : String},  //내부공유사항                                                              
    delete_flag             : {type : String, default : 'N' }, //삭제여부
    attach_file             : [{    fieldname       : {type : String},
                                    originalname    : {type : String},
                                    encoding        : {type : String},
                                    mimetype        : {type : String},
                                    destination     : {type : String},
                                    filename        : {type : String},
                                    path            : {type : String},
                                    size            : {type : Number}
                                }], //첨부이미지

    hold_content        : {type : String},  //협의필요 코멘트
    hold_date           : {type : String, default : ''},  //협의필요 코멘트일 
    nc_content        : {type : String},  //미처리 코멘트
    nc_date           : {type : String, default : ''},  //미처리 코멘트일 

    created_at              : {type : String},
    updated_at              : {type : Date},
    deleted_att             : {type : Date}
});

IncidentSchema.pre("save", setCreateAt);

function isEmpty(value){
    var isValid = false;
    if(value){
        isValid = true;
    }
    return isValid;
}

IncidentSchema.virtual('getDate').get(function(){
    var date = new Date(this.createdAt);
    return {
        year : date.getFullYear(),
        month : date.getMonth()+1,
        day : date.getDate()
    };
});

IncidentSchema.pre("save", setCreateAt);

function setCreateAt(next){
    var schema = this;
    var m = moment();    
    var date = m.format("YYYY-MM-DD HH:mm:ss");

    schema.created_at = date;
    schema.register_date = date;
    
    schema.register_yyyy = m.format("YYYY");
    schema.register_mm = m.format("MM");
    schema.register_dd = m.format("DD");

    return next();
}

autoIncrement.initialize(mongoose.connection);
IncidentSchema.plugin( autoIncrement.plugin , { model : "incident", field : "register_num" , startAt : 51100 } );
module.exports = mongoose.model('incident' , IncidentSchema);


/*
IncidentSchema.pre("save", function setDateFormat(next){
    var incidentDate = this;
    var new_date = new Date();
    // moment를 초기화 한다
    var m = moment();

    var new_year = new_date.getFullYear();
    var new_month = new_date.getMonth()+1;
    var new_day = new_date.getDate();
   

    // format으로 출력한다
    var created_at = new_date.toLocaleString();//m.format("YYYY-MM-DD HH:mm:ss");
    //console.log("created_at<<<<"+created_at);  // => 2016년07월12일 12:34:56 Wednesday     


    //var created_at = new_date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    //created_at = new_date.toISOString().format('YYYY-MM-DD hh:mm:ss a');
    //console.log("created_at 2 >>>>>>>>>>>"+created_at);
    incidentDate.register_yyyy = new_year;
    incidentDate.register_mm = new_month;
    incidentDate.register_dd = new_day;
    return next();
});
*/