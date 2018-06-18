'use strict';

var mongoose = require('mongoose');
var moment = require('moment');

var oftenqnaSchema = mongoose.Schema({
    higher_cd:      { type: String, required: true },
    higher_nm:      { type: String, required: true },
    title:          { type: String, required: true },
    content:        { type: String },
    reading_cnt:    { type: Number, default : 0 },
    register_company_cd:     { type: String },
    register_company_nm:     { type: String },
    sabun:          { type: String },
    user_nm:        { type: String },
    attach_file : [{ 
        fieldname:      {type : String},
        originalname:   {type : String},
        encoding:       {type : String},
        mimetype:       {type : String},
        destination:    {type : String},
        filename:       {type : String},
        path:           {type : String},
        size:           {type : Number} }], 
    created_at:     {type : String},
    updated_at:     { type: Date },
    pop_yn:         { type: String },       //추가
    user_id:        { type: String },       //추가
    company_cd:     { type: String },
    company_nm:     { type: String }
});

oftenqnaSchema.pre("save", setCreateAt);

function setCreateAt(next){
    var schema = this;
    var m = moment();    
    var date = m.format("YYYY-MM-DD HH:mm:ss");
    schema.created_at = date;
    return next();
}

var Oftenqna = mongoose.model('oftenqna', oftenqnaSchema);
module.exports = Oftenqna;