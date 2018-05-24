var mongoose = require('mongoose');
var bcrypt   = require("bcrypt-nodejs");
const logger = require('log4js').getLogger('app');
var moment = require('moment');

var usermanageSchema = mongoose.Schema({
    userCompany_nm   : { type : String , default : ''},
    company_cd       : { type : String , default : ''},
    company_nm       : { type : String , default : '미승인'},
    email            : { type : String , required: true, unique:true },
    user_id          : { type : String },
    password         : { type : String , required: true },
    employee_nm      : { type : String },
    dept_cd          : { type : String , default : ''},
    dept_nm          : { type : String , default : ''},
    jikchk_nm        : { type : String , default : ''},
    position_nm      : { type : String , default : ''},
    dom_post_cd1     : { type : String , default : ''},
    dom_addr         : { type : String , default : ''},
    dom_addr2        : { type : String , default : ''},
    office_tel_no    : { type : String , default : ''},
    hp_telno         : { type : String , default : ''},
    img_path         : { type : String , default : ''},
    alarm_minute     : { type : Number , default : ''},
    register_id      : { type : String },
    register_date    : { type : String , default : ''},
    modify_id        : { type : String },
    modify_date      : { type : String , default : ''},
    email_ref        : { type : String },
    email_send_yn    : { type : String , default : 'N'},
    sabun            : { type : String },
    access_yn        : { type : String , default : 'N'},
    using_yn         : { type : String , default : 'Y'},
    user_flag        : { type : String , default : 9 },
    group_flag       : { type : String , default : 'out' },
    created_at       : { type : String , default : ''},
    updated_at       : { type : String , default : ''}
});

usermanageSchema.pre("save", hashPassword);
usermanageSchema.pre("findOneAndUpdate", function hashPassword(next){
    var user = this._update;
    if(user.password == ''){ //새 비밀번호가 없을 시 비밀번호는 변경하지 않음.
        var user = this._update;
        delete user.password;
        return next();
    } else {
        var user = this._update;
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

/**
 * 비밀번호 비교
 */
usermanageSchema.methods.authenticate = function (password) {
    var user = this;
    try{
        
        return bcrypt.compareSync(password, user.password);


    }catch(e){
        logger.debug(e);
        return false;
    }
};

/**
 * 비밀번호 해쉬 값
 */
usermanageSchema.methods.hash = function (password) {
    return bcrypt.hashSync(password);
};

/**
 * 비밀번호를 해쉬로 바꿈
 * @param {*} next 
 */
function hashPassword(next){
    var user = this;

    var m = moment();    
    var date = m.format("YYYY-MM-DD HH:mm:ss");

    user.created_at = date;
    user.register_date = date;
    user.modify_date = date;

    if(!user.isModified("password")){
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
}

var Usermanage = mongoose.model('usermanage', usermanageSchema);
module.exports = Usermanage;