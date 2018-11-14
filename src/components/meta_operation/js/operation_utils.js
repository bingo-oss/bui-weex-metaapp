import _ from '../../../js/tool/lodash';
import propParser from '../../../js/tool/prop_parser';
const storage = weex.requireModule('storage');

var utils={
    expandOperation:function(operation,ctx){
        var params={};
        _.each(operation.props,function(propValue,propKey){
            if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
                var parsedValue=propParser.parse(propValue,ctx);
                params[propKey]=parsedValue;
            }
        });
        //移动端配置的属性将覆盖上面的属性
        _.each(operation.mobileProps,function(propValue,propKey){
            if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
                var parsedValue=propParser.parse(propValue,ctx);
                params[propKey]=parsedValue;
            }
        });
        return _.extend(operation,params);
    },
    execution(operation,_widgetCtx,before_after){
        //操作执行前后逻辑
        return new Promise(function(resolve, reject) {
            let value=true;
            if(operation[before_after]) {
                if (_.isFunction(operation[before_after])) {
                    value = operation[before_after](_widgetCtx, this)
                } else {
                    value = Function('"use strict";return ' + operation[before_after])(_widgetCtx, this);
                }
                resolve(value);
            }else{
                resolve(value);
            }
        });
    },
    getWidgetExportParams(_t,key,widgetCode){
        //读取对应部件暴露参数
        let _childWidgets = _t.$root.$children[0].$refs.childWidgets;//遍历下所有引入的部件
        let returnVal = "";
        _.each(_childWidgets,(cw)=>{
            if(_.isFunction(cw.getExportParams)){
                let _data = cw.getExportParams();//部件自身暴露的参数
                if((widgetCode&&widgetCode==_data.widgetCode)||widgetCode==""){
                    returnVal = _data[key]
                }
            }
        })
        return returnVal;
    },
    setUrlParam(operation,_t){
        //传入按钮定义--判断是否具有跳转参数的加入--设置
        if(operation.props){
            //存在需要跳转的参数处理
            let urlParam = {};
            _.each(operation.props,(prop,key)=>{
                if(prop.type=="fixedValue"){
                    //固定值
                    urlParam[key] = prop.value;
                }else if(prop.type=="dynamicValue"){
                    let _key = prop.reflectedField;
                    if(_key.indexOf(".")!=-1){
                        _key = _key.slice((_key.indexOf(".")+1))
                    }
                    urlParam[key] = utils.getWidgetExportParams(_t,_key,prop.widgetCode)
                }else if(prop.type=="script"){
                    let _script = prop.script;//执行的代码
                    let _prop = _script.match(/\{\{(.+?)\}\}/g);//解析需要提取的参数
                    debugger
                    //let _key = prop.reflectedField;
                    /*if(_key.indexOf(".")!=-1){
                        _key = _key.slice((_key.indexOf(".")+1))
                    }*/
                    //urlParam[key] = utils.getWidgetExportParams(_t,_key,prop.widgetCode)
                }
            });
            storage.setItem("urlParam", JSON.stringify(urlParam));//存储起来需要传递的参数
        }
    }
};
export default utils;