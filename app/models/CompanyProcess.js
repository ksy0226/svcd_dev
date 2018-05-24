'use strict';

var mongoose = require('mongoose');
var moment = require('moment');

var CompanyProcessSchema = mongoose.Schema({
    company_cd: { type: String, required: true, unique:true },     //회사
    higher_cd : {type: String, required:true, unique:true},        //상위코드
    higher_nm : {type: String},        //상위코드
    created_at: {type: String},    //생성일자 
    user_flag: { type: String }                      //사용여부(1:사용, 0:미사용)
});

CompanyProcessSchema.pre("save", setCreateAt);

function setCreateAt(next){
    var schema = this;
    var m = moment();    
    var date = m.format("YYYY-MM-DD HH:mm:ss");
    schema.created_at = date;
    return next();
}

module.exports = mongoose.model('companyProcess', CompanyProcessSchema);