const Utils = {
    _typeof (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    },
    isString (obj) {
        return typeof (obj) === 'string';
    },
    isNonEmptyArray (obj = []) {
        return obj && obj.length > 0 && Array.isArray(obj) && typeof obj !== 'undefined';
    },
    isEmpty(str){//字符串判空
        return str == null || str == undefined || str === ''
    },
    isObject (item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },
    isEmptyObject (obj) {
        return (obj == undefined) || ( Object.keys(obj).length === 0 && obj.constructor === Object);
    },

    handleException(errCode){
        /*    if (isObject(errCode)) {
         return JSON.stringify(errCode);
         }*/
        let str = errCode;
        switch (errCode) {
            case 500:
            case 502:
            case 503:
            case 501 :
                str = '服务器内部错误';
                break;
            case 404:
                str = "请求地址找不到";
                break;
            case 403:
                str = "访问被禁止";
                break;
            case 401:
                str = "权限认证失败";
                break
            case 400:
                str = "参数错误";
                break;
            case -1:
                str = "连接服务器失败";
                break;
        }
        return str
    },
    get_ymdhm_time(time){
        var publishTime = new Date(time);
        time = publishTime.getFullYear() + "-" + this.o(publishTime.getMonth() + 1) + "-" + this.o(publishTime.getDate())
            + " " + this.o(publishTime.getHours()) + ":" + this.o(publishTime.getMinutes());//xx-xx-xx格式
        return time;
    },
    formatToTime(time){
        var publishTime = new Date(time);
        time = this.o(publishTime.getHours()) + ":" + this.o(publishTime.getMinutes());//xx-xx-xx格式
        return time;
    },
    formatToDate(date){
        var publishTime = new Date(date);
        date = publishTime.getFullYear() + "-" + this.o(publishTime.getMonth() + 1) + "-" + this.o(publishTime.getDate());
        return date;
    },
    convertTime(time){
        let publishTime = new Date(time);
        this.$alert(time)
        time = publishTime.getFullYear() + "-" + this.o(publishTime.getMonth() + 1) + "-" + this.o(publishTime.getDate());//xx-xx-xx格式
        return time;
    },
    handleTime(time){
        time = time.replace(/(\+\d{2})(\d{2})$/, "$1:$2");
        var publishTime = new Date(time);
        time = publishTime.getFullYear() + "-" + this.o(publishTime.getMonth() + 1) + "-" + this.o(publishTime.getDate());//xx-xx-xx格式
        return time;
    },
    o(t){
        if (t < 10) {
            return "0" + t;
        }
        else {
            return t;
        }
    },
    getDateNow(){
        var publishTime = new Date();
        let time = publishTime.getFullYear() + "-" + this.o(publishTime.getMonth() + 1) + "-" + this.o(publishTime.getDate());//xx-xx-xx格式
        return time;
    },
    toHttpRequestParams(obj) {//contentType为
        var param = ""
        for (const name in obj) {
            if (typeof obj[name] != 'function') {
                param += "&" + name + "=" + encodeURI(obj[name])
            }
        }
        return param.substring(1)
    },

    generateUUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    },

    env: {
        isWeb () {
            const {platform} = weex.config.env;
            return typeof (window) === 'object' && platform.toLowerCase() === 'web';
        },
        isIOS () {
            const {platform} = weex.config.env;
            return platform.toLowerCase() === 'ios';
        },
        /**
         * 是否为 iPhone X
         * @returns {boolean}
         */
        isIPhoneX () {
            const {deviceHeight} = weex.config.env;
            if (Utils.env.isWeb()) {
                return typeof window !== undefined && window.screen && window.screen.width && window.screen.height && (parseInt(window.screen.width, 10) === 375) && (parseInt(window.screen.height, 10) === 812);
            }
            return Utils.env.isIOS() && deviceHeight === 2436;
        },
        isAndroid () {
            const {platform} = weex.config.env;
            return platform.toLowerCase() === 'android';
        },
        /**
         * 获取weex屏幕真实的设置高度，需要减去导航栏高度
         * @returns {Number}
         */
        getPageHeight () {
            const {env} = weex.config;
            const navHeight = Utils.env.isWeb() ? 0 : (Utils.env.isIPhoneX() ? 176 : 132);
            return env.deviceHeight / env.deviceWidth * 750 - navHeight;
        }
    },


};

export default Utils;
