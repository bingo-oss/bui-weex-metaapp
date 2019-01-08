import _ from '../../../js/tool/lodash';
import propParser from '../../../js/tool/prop_parser';
const storage = weex.requireModule('storage');
import factoryApi from '../../../widgets/libs/factory-api.js';
import Utils from '../../../js/tool/utils';
const linkapi = require('linkapi');
import commonOperation from './common_operation.js';
import buiweex from "bui-weex";
import ax from "../../../js/ajax.js";
import config from "../../../js/config.js";

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
    execution(operation,_widgetCtx,before_after,_this){
        //操作执行前后逻辑
        //operation.widgetContext = _widgetCtx;
        factoryApi.init(_this);
        return new Promise(function(resolve, reject) {
            if (!operation.hasPermission && operation.securityControllTypes && operation.securityControllTypes == 2) {
                //无权时-不能点击
                resolve(false)
            } else {
                utils.fnAnalysis(operation).then((res)=> {
                    let value = true;
                    if (operation[before_after]) {
                        if (_.isFunction(operation[before_after])) {
                            operation[before_after](_widgetCtx, factoryApi, resolve)
                        } else {
                            var onclick = Function('"use strict";return ' + operation[before_after])();
                            onclick(_widgetCtx, factoryApi, resolve);
                        }
                        //resolve(value);
                    } else {
                        resolve(value);
                    }
                });
            }
        });
    },
    getWidgetExportParams(_t,key,widgetCode){
        //读取对应部件暴露参数
        let _childWidgets = _t.$root.$children[0].$refs.childWidgets;//遍历下所有引入的部件
        let returnVal = "";
        if(widgetCode){
            _.each(_childWidgets,(cw)=>{
                if(_.isFunction(cw.getWidgetContext)){
                    let _data = cw.getWidgetContext();//部件自身暴露的参数
                    if((widgetCode&&widgetCode==cw.widgetParams.widgetCode)||widgetCode==""){
                        if(_data.widgetParams&&_data.widgetParams[key]){
                            //存了部件参数,从部件参数去取
                            returnVal = _data.widgetParams[key]
                        }else if(_data.selectedItem&&_data.selectedItem[key]){
                            //存在暴露selectedItem对象,
                            returnVal = _data.selectedItem[key]
                        }else{
                            returnVal = _data[key]
                        }
                    }
                }
            })
        }else{
            //需要传入自身部件模型上暴露函数
            function upward(_this){
                if(_this.getWidgetContext){
                    return _this.getWidgetContext;
                }else if(_this.widgetContainer){
                    //已经置顶不需要再循环了
                    return ""
                }else if(_this.$parent){
                    return upward(_this.$parent);
                }
            }
            let _exportParams = upward(_t);
            if(_.isFunction(_exportParams)){
                let _data = _exportParams()
                if(_data.widgetParams&&_data.widgetParams[key]){
                    //存了部件参数,从部件参数去取
                    returnVal = _data.widgetParams[key]
                }else if(_data.selectedItem&&_data.selectedItem[key]){
                    //存在暴露selectedItem对象,
                    returnVal = _data.selectedItem[key]
                }else{
                    returnVal = _data[key]
                }
            }
        }
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
                    let _key = prop.reflectedField,_widgetCode = "";
                    if(_key.indexOf(".")!=-1){
                        _widgetCode = _key.slice(0,(_key.indexOf(".")));
                        _key = _key.slice((_key.indexOf(".")+1))
                    }
                    urlParam[key] = utils.getWidgetExportParams(_t,_key,_widgetCode)
                }else if(prop.type=="script"){
                    let _script = prop.script;//执行的代码
                    //let _props = _script.match(/\{\{(.+?)\}\}/g);//解析需要提取的参数
                    let _props = _script.match(/com.\w*.\w*/g)
                    let _vals = [];
                    _.each(_props,(_prop)=>{
                        //_prop = _prop.replace("{{","").replace("}}","");
                        let _widgetCode = "",_key = ""
                        if(__props.length){
                            _widgetCode = __props[1];
                            _key = __props[2];
                        }
                        let _prop_val = (utils.getWidgetExportParams(_t,_key,_widgetCode));
                        //获取到的参数处理
                        if(_.isObject(_prop_val)){
                            _prop_val = JSON.stringify(_prop_val)
                        }else if(typeof _prop_val=="string"){
                            _prop_val = `"${_prop_val}"`;
                        }
                        _vals.push(_prop_val);//添加匹配到的值
                    });
                    var test = /com.\w*.\w*/g/*/\{\{(.+?)\}\}/g*/,_vals_index = -1;
                    urlParam[key] = _script.replace(test,function($0,$1,$2,$3) {
                        _vals_index+=1;
                        return _vals[_vals_index];
                    });
                }
            });
            storage.setItem("urlParam", JSON.stringify(urlParam));//存储起来需要传递的参数
        }
    },
    showOperation(operation,_this){
        factoryApi.init(_this);
        //具备校验函数--需要对按钮进行显隐控制
/*        if(operation.checkFunc){
            if (_.isFunction(operation.checkFunc)) {
                operation.checkFunc(operation,factoryApi);
            } else {
                var onclick = Function('"use strict";return ' + operation.checkFunc)();
                onclick(operation,factoryApi);
            }
        }*/
        return new Promise(function(resolve, reject) {
            if(!operation.hasPermission&&operation.securityControllTypes&&operation.securityControllTypes==1){
                //无权时-隐藏
                resolve(false)
            }else {
                let value = true;
                if (operation.checkFunc) {
                    if (_.isFunction(operation.checkFunc)) {
                        operation.checkFunc(operation, factoryApi, resolve);
                    } else {
                        var onclick = Function('"use strict";return ' + operation.checkFunc)();
                        onclick(operation, factoryApi, resolve);
                    }
                    //resolve(value);
                } else {
                    resolve(value);
                }
            }
        });
    },
    operationClick(_rowSingleData,_widgetCtx,_t){
        //部件按钮的对象,部件需要暴露给按钮操作的对象,_t自身模型
        //模拟按钮组件的方法执行--适用于列表部件单击
        factoryApi.init(_t);
        _widgetCtx.buttonInfo = _rowSingleData//按钮信息
        var operation=utils.expandOperation(_rowSingleData,{
            operation:_rowSingleData,
            widgetContext:_widgetCtx
        });
        //目前支持通用操作和脚本操作
        let commonOptName=operation.name;
        if(commonOptName&&commonOperation.createOperation(commonOptName)){
            let commonOpt=commonOperation.createOperation(commonOptName);
            if(commonOpt){
                operation= _.extend(operation,commonOpt);
                operation.onclick(_widgetCtx,factoryApi);
            }
        }else if(operation.onClick&&operation.operationType=="script"){//脚本操作
            utils.execution(operation,_widgetCtx,"beforeExecCode",_t).then((res)=>{
                if(_.isFunction(operation.onclick)){
                    operation.onClick(_widgetCtx,factoryApi);
                }else{
                    var onclick=Function('"use strict";return ' + operation.onClick  )();
                    onclick(_widgetCtx,factoryApi);
                }
                utils.execution(operation,_widgetCtx,"afterExecCode",_t)//执行后
            });
        }else if(operation.operationType=="execOperation"){//脚本操作
            function cellExecScript() {
                utils.execution(operation,_widgetCtx,"beforeExecCode",_t).then((res)=>{
                    if (_.isFunction(_t.implCode)) {
                        _t.implCode(_widgetCtx,factoryApi);
                    } else {
                        var onclick = Function('"use strict";return ' + _t.implCode)();
                        onclick(_widgetCtx,factoryApi);
                    }
                    utils.execution(operation,_widgetCtx,"afterExecCode",_t)//执行后
                });
            }
            if(_t.implCode){
                cellExecScript();
            }else {
                //获取执行代码
                config.readRuntimeConfig().then(runtimeConfig => {
                    ajax.get(runtimeConfig["service.metabase.endpoint"]+`/meta_operation/${operation.operationId}`).then(({data})=>{
                        _t.implCode=data.implCode;
                        cellExecScript();
                    });
                });
            }
        }else if(operation.operationType=="toPage"||operation.operationType=="toOperation"||operation.operationType=="toDynamicPage"){
            //赋予选择值
            var context = _.extend({},_widgetCtx, operation);
            if(!context.selectedItem&&context.selectedItems){
                //按钮放置的是在工具栏
                _t.selectedItem = context.selectedItems[(context.selectedItems.length-1)]
            }else{
                _t.selectedItem=context.selectedItem;
            }
            utils.setUrlParam(operation,_t);
            var pageId=operation.pageId,byOperation= false;
            if(operation.operationType=="toOperation"){
                byOperation = true;
            }
            utils.execution(operation,_widgetCtx,"beforeExecCode",_t).then((res)=>{
                utils.execution(operation,_widgetCtx,"afterExecCode",_t)//执行后
                if(operation.operationType=="toDynamicPage"){
                    /*_widgetCtx.selectedItem.actionParams={"ios":"[aaa] \n pageId=navbar \n entityId=abcdefgh","android":"[aaa] \n pageId=navber \n entityId=abcdefgh"}
                    operation.dynamicPageFunc = function(obj,factoryApi){
                        var _actionParams = {"type":"factoryApp", "pageId":"", "url":"", "params":{}}
                        if(obj.selectedItem&&obj.selectedItem.actionParams){
                            //存在跳入的配置页面
                            var actionParams = ""
                            if(weex.config.env.deviceModel.indexOf("iPhone")==-1){
                                actionParams = obj.selectedItem.actionParams.ios;
                            }else{
                                actionParams = obj.selectedItem.actionParams.android;
                            }
                            actionParams = actionParams.split("\n");
                            _.each(actionParams,function(param){
                                if(param.indexOf("=")!=-1){
                                    param = param.split("=");
                                    _actionParams.params[param[0].replace(/^\s+|\s+$/g,"")]= param[1].replace(/^\s+|\s+$/g,"");
                                }
                            })
                        }
                        return _actionParams
                    }//模拟校验方法*/
                    var pageParams={};
                    if(operation.dynamicPageFunc){
                        //进行数据解析
                        if (_.isFunction(operation.dynamicPageFunc)) {
                            _t.mustStopRepeatedClick = true;
                            pageParams = operation.dynamicPageFunc(_widgetCtx,factoryApi);
                        } else {
                            var dynamicPageFunc = Function('"use strict";return ' + operation.dynamicPageFunc)();
                            pageParams = dynamicPageFunc(_widgetCtx,factoryApi);
                        }
                    }
                    if(pageParams.type=="factoryApp"){
                        //跳入的是应用工厂应用
                        _t.$push(Utils.pageEntry(),Object.assign({pageId:pageParams.pageId},pageParams.params));
                    }else if(pageParams.type=="url"){
                        //跳入的是第三方url
                        let _urlParams = []
                        _.each(pageParams.params,(val,key)=>{
                            _urlParams.push(`${key}=${val}`);
                        });
                        if(pageParams.url.indexOf("?")==-1){pageParams.url+="?"}
                        linkapi.openLinkBroswer(pageParams.url+_urlParams.join("&"));
                    }
                }else{
                    var queryParam=_.extend({pageId:pageId,byOperation:byOperation}/*,getIdFromContext()*/);
                    _t.$push(Utils.pageEntry(),queryParam);
                }
            });
        }

    },
    fnAnalysis(button,resolve){
        //函数解析
        //beforeExecCode,afterExecCode,dynamicPageFunc,checkFunc,onClick--需要解析的函数
        var promises = [];
        _.each(["beforeExecCode","afterExecCode","dynamicPageFunc","checkFunc","onClick"],(name)=>{
            var str = button[name];
            if(button[name]&&button[name].indexOf("function(context,app,resolve){")!=0&&button[name].indexOf("function(context,api")!=0){
                str = `function(context,app,resolve){${button[name]}}`;
            }//button[name].replace("function()","function(context,app,resolve)");//函数插入参数
            //读取系统变量-解析实体操作的方法
            let res = new RegExp(/sys.\w*.\w*\(\)/,'g');
            let _res_com = new RegExp(/com.\w*.\w*/,'g');
            let _match = str.match(res);
            let _match_com = str.match(_res_com);
            if((_match&&_match.length)||(_match_com&&_match_com.length)){
                //引用了sys或者com的关键字
                //com方法
                str.replace(_res_com,function(_prop,b){
                    let __props = _prop.split(".");;
                    let _widgetCode = "",_key = ""
                    if(__props.length){
                        _widgetCode = __props[1];
                        _key = __props[2];
                    }
                    let _prop_val = (utils.getWidgetExportParams(_t,_key,_widgetCode));
                    //获取到的参数处理
                    if(_.isObject(_prop_val)){
                        _prop_val = JSON.stringify(_prop_val)
                    }else if(typeof _prop_val=="string"){
                        _prop_val = `"${_prop_val}"`;
                    }
                    str = str.replace(_prop,_prop_val);//添加匹配到的值
                });
                //sys方法
                str.replace(res,function(a,b){
                    //提取的格式可能是 sys.实体.操作code;
                    let strArrys = a.split(".");//截取格式数据
                    if(strArrys.length>=3){
                        let metaEntityName = strArrys[1],
                            operationCode = strArrys[2].replace("()","");
                        promises.push(new Promise(function(resolve, reject) {
                            //获取执行代码
                            config.readRuntimeConfig().then(runtimeConfig => {
                                ax.get(
                                    `${runtimeConfig["service.metabase.endpoint"]}/meta_operation`,
                                    {
                                        filters:`projectId eq ${button.projectId} and code eq ${operationCode} and metaEntityName eq ${metaEntityName}`
                                    }
                                ).then(({data}) => {
                                    var _code = data[0].implCode.replace(/\s+/g,"");//提除空格的
                                    if(_code.indexOf("function(){")===0){
                                        _code = _code.replace("function(){","");
                                        _code = _code.substring(0,_code.lastIndexOf("}"));//提除外层的function;
                                    }
                                    button[name] = str.replace(a,_code);//提取到的系统调用格式替换为操作的执行脚本
                                    resolve(true);
                                }).catch(()=>{
                                    resolve(true);
                                });
                            });
                        }));
                    }
                });

                if(!(_match&&_match.length)){
                    //不存在调用sys方法,直接输出
                    button[name] = str;
                    promises.push(new Promise(function(resolve,reject){resolve(true)}));
                }
            }else{
                //没有使用,
                button[name] = str;
                promises.push(new Promise(function(resolve,reject){resolve(true)}));
            }
        });
        return Promise.all(promises);
    }

};
export default utils;