const DetailsUtils = {
    findValueByJSON(kv, json) {
        if (kv.value) {
            return
        }
        if(json==null){
            json = [];
        }
        if (typeof json == 'string') {
            return
        } else if (json.length) {
            for (var index in json) {
                DetailsUtils.findValueByJSON(kv, json[index])
            }
        } else {
            for (var keyTemp in json) {
                if (kv.key == keyTemp) {
                    kv.value = json[keyTemp]
                    return
                } else {
                    DetailsUtils.findValueByJSON(kv, json[keyTemp])
                }
            }
        }
    },

    /**
     * 浅层数据优先
     */
    findValueFromJSONByDeep(kv, json) {
        if (kv.value) {
            return
        }
        if(json==null){
            json = [];
        }
        if (typeof json == 'string') {
            return
        } else if (json.length) {
            for (var index in json) {
                DetailsUtils.findValueByJSON(kv, json[index])
            }
        } else {
            if (json[kv.key]) {
                kv.value = json[kv.key]
            } else {
                for (var key in json) {
                    DetailsUtils.findValueByJSON(kv, json[key])
                }
            }
        }
    },

    findValuesByJSON(kvs, json) {
        if (DetailsUtils.isAllKeyHasValue(kvs)) {
            return
        }
        if (typeof json == 'string') {
            return
        } else if (json.length) {
            for (var index in json) {
                DetailsUtils.findValuesByJSON(kvs, json[index])
            }
        } else {
            for (var keyTemp in json) {
                if (!DetailsUtils.searchKeyAndSetValue(kvs, keyTemp, json[keyTemp])) {
                    DetailsUtils.findValuesByJSON(kvs, json[keyTemp])
                }
            }
        }
    },

    findValuesByKeys(keys, json) {
        var kvs = []
        for (var index in keys) {
            var kv = {key: keys[index]}
            DetailsUtils.findValueByJSON(kv, json)
            kvs.push(kv)
        }
        return kvs
    },


    searchKeyAndSetValue(kvs, keyTarget, value) {

        var res = false
        if (kvs.length) {

            for (var index in kvs) {
                res = res & DetailsUtils.searchKeyAndSetValue(kvs[index], keyTarget, value)
                if (res) {
                    break
                }
            }
        } else {

            if (keyTarget == kvs.titleKey) {
                kvs[kvs.titleKey] = value
                res = true

            } else if (keyTarget == kvs.valueKey) {
                kvs[kvs.valueKey] = value
                res = true

            }
        }

        return res
    },
    isAllKeyHasValue(kvs) {
        var res = true
        if (!kvs) {
            res = false
        } else if (typeof kvs == 'string') {
            if (!kvs) {
                res = false
            }
        } else if (kvs.length) {
            for (var index in kvs) {
                res = res && DetailsUtils.isAllKeyHasValue(kvs[index])
                if (!res) {
                    break
                }
            }
        } else {
            for (var key in kvs) {
                res = res && DetailsUtils.isAllKeyHasValue(kvs[key])
                if (!res) {
                    break
                }
            }
        }
        return res
    },


    traversingJson(key, json) {
        var res
        if(json==null){
            json = [];
        }
        if (typeof json == 'string') {

        } else if (json.length) {
            for (var index in json) {
                res = DetailsUtils.traversingJson(key, json[index])
                if (res) {
                    break
                }
            }
        } else {
            if (json[key]) {
                res = json[key]
            } else {
                for (var tKey in json) {
                    res = DetailsUtils.traversingJson(key, json[tKey])
                    if (res) {
                        break
                    }
                }
            }
        }
        return res
    },

    findValuesByKeysFromJson(keys, json) {
        var res = []
        if(json==null){
            json = [];
        }
        if (typeof json == 'string') {

        } else if (json.length) {
            for (var index in json) {
                var tRes = DetailsUtils.traversingJson(key, json[index])
                if (tRes) {
                    Array.prototype.push.apply(res, tRes);
                }
            }
        } else {
            for (var index in keys) {
                var key = keys[index]
                if (json[key]) {
                    var kv = {}
                    kv[key] = json[key]
                    res.push(kv)
                    keys[index] = '~~~~~~~~'
                    index--
                } else {
                    for (var tKey in json) {
                        var tRes = DetailsUtils.traversingJson(key, json[tKey])
                        if (tRes) {
                            Array.prototype.push.apply(res, tRes);
                        }
                    }
                }
            }
        }
        return res
    },

    getAllJsonKeys(json) {
        var keys = []
        for (var key in json) {
            keys.push(key)
        }
        return keys
    },

    dateFormat(fmt, date) {
        var o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

};
export default DetailsUtils;
