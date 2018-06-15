import buiweex from 'bui-weex';
const Utils={
    dataPermField:"permVal",//数据权限值所在的字段
    operationDisplayField:"display",//部件操作是否显示的属性字段
    operationTermimalTypeField:"termimalType",//部件操作终端类型的属性字段
    permValues:{
        "view":1,
        "create":2,
        "edit":4,
        "del":8,
        "publish":16,
        "manage":32,
        "changeOwner":64
    },
    /**
     * 将userPermVal和operationPermVal求与，如果结果等于operationPermVal表示有权限，否则无权限
     * @param {*} userPermVal 用户的权限，二进制对应的整数表示
     * @param {*} operationPermVal 操作的权限，二进制对应的整数表示
     */
    hasPerm(userPermVal,operationPermVal){
        //如果数据没定义任何权限，那就不控制权限
        if(!userPermVal){
            return true;
        }
        return (userPermVal & operationPermVal)===operationPermVal;
    },
    /** 快捷方法，判断当前用户是否对item数据的btn操作有权限
     * @param {*} item 记录数据对象
     * @param {*} btn 操作对象
     */
    hasDataPerm(item,btn){
        let userPermVal=item[Utils.dataPermField];
        //如果数据没定义任何权限，那就不控制权限
        if(!userPermVal){
            return true;
        }
        let operationPermVal=btn[Utils.dataPermField];
        //如果未设置权限，则默认没有权限
        if(!operationPermVal){
            return false;
        }
        return Utils.hasPerm(userPermVal,operationPermVal);
    },
    pageEntry(){//页面渲染的入口页面
        return `${buiweex.getContextPath()}/page.weex.js`;
    },
    widgetMode:{
        editable:"editable",
        invisible:"invisible",
        readonly:"readonly",
        forceView:"forceView"//保留模式，流程表单暂不启用，兼容旧的强制查看模式
    },
    formatDate(dateObj,fmt){ //dateObj:new Date fmt:yyyy-MM-dd HH:mm
        //是否是合法的日期对象
        let isDate=dateObj instanceof Date && !isNaN(dateObj.valueOf());
        if(!isDate){
            //直接传递的合法的日期字符串，转换成日期
            if(typeof dateObj === 'string' || dateObj instanceof String){
                let dateObj2=new Date(dateObj);
                isDate=dateObj2 instanceof Date && !isNaN(dateObj2.valueOf());
                if(!isDate){//不合法的日期，返回原始值
                    return dateObj;
                }else{
                    dateObj=dateObj2;
                }
            }else{
                return '';
            }
        }
        fmt=fmt||'yyyy-MM-dd HH:mm:ss';
        var dateStr=fmt;
        var o = {
            "M+": dateObj.getMonth() + 1, //月份 
            "d+": dateObj.getDate(), //日 
            "H+": dateObj.getHours(), //小时 
            "m+": dateObj.getMinutes(), //分 
            "s+": dateObj.getSeconds(), //秒 
            "S": dateObj.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(dateStr)) {
            dateStr = dateStr.replace(RegExp.$1, (dateObj.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o){
            if (new RegExp("(" + k + ")").test(dateStr)) {
                dateStr = dateStr.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return dateStr;
    }
};
export default Utils;