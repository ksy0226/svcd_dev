var mongoose = require('mongoose');
var moment = require('moment');

var processStatusSchema = mongoose.Schema({
  status_cd: {type:String, required:true, unique:true},
  status_nm: {type:String},
  sort_lvl: {type:Number}, //정렬순서
  delete_flag : { type : String, default : 'N' }, //삭제여부  
  createdAt : {type:String},
  updatedAt : { type : Date },
  deletedAt : { type : Date }  
});

processStatusSchema.pre("save", setCreateAt);

function setCreateAt(next){
    var schema = this;
    var m = moment();    
    var date = m.format("YYYY-MM-DD HH:mm:ss");
    schema.createdAt = date;
    return next();
}

module.exports = mongoose.model('processStatus',processStatusSchema);

