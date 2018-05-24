'use strict';

var mongoose = require('mongoose');
var moment = require('moment');

var higherProcessSchema = mongoose.Schema({
    higher_cd: { type: String, required: true, unique:true },    //상위업무코드
    higher_nm: { type: String},                     //상위업무명
    description: { type: String, },                  //설명
    company_cd: { type: String },                   //회사코드
    company_nm: { type: String },                   //회사코드
    sabun: { type: String },                        //사번
    user_nm: { type: String , default : '관리자'},     //등록자
    created_at: { type: String },  //생성일자 
    use_yn: { type: String , default : '사용'}        //사용여부
});

higherProcessSchema.pre("save", setCreateAt);

function setCreateAt(next){
    var schema = this;
    var m = moment();    
    var date = m.format("YYYY-MM-DD HH:mm:ss");
    schema.created_at = date;
    return next();
}

var HigherProcess = mongoose.model('higherProcess', higherProcessSchema);
module.exports = HigherProcess;