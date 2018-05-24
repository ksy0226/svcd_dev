'use strict';

function get2digits(num) {
    return ("0" + num).slice(-2);
}

module.exports = {

    getCreatedDate : function () {
        var date = this.createdAt;
        return date.getFullYear() + "-" + get2digits(date.getMonth() + 1) + "-" + get2digits(date.getDate());
    },

    getCreatedTime : function () {
        var date = this.createdAt;
        return get2digits(date.getHours()) + ":" + get2digits(date.getMinutes()) + ":" + get2digits(date.getSeconds());
    },

};