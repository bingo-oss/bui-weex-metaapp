//方便部件直接调用的方法--注册公共代码-需要和page-methods的方法对应以及部件内存在这个方法的实现 才有效
//这里的公共方法调用部件内的同名方法,原理只是去执行下page-methods下的遍历
//注意 执行的是所有有对同名方法的实现的部件import _ from '../../js/tool/lodash';
import i18n from '../../js/i18n/index';
import buiweex from "bui-weex";
import linkapi from "linkapi";
import Util from '../../js/utils'
import Utils from "../../js/tool/utils";
import _ from '../../js/tool/lodash';
import ajax from '../../js/ajax.js';
import service from '../../js/service.js';
import metabase from '../../js/metadata/metabase.js';

var _this=this;//用于初始化指向
var factoryApp = Object.assign({},buiweex,linkapi,{
    init(t){
      _this = t;
    },
    goback(context, $optInst) {
        //返回
        buiweex.pop();
    },
    del(context,$optInst){
        //删除
        var id=context.selectedId;
        var metaEntity=context.metaEntity;
        if(!id){
            var selectedItem=context.selectedItem;
            if(selectedItem){
                //计算id字段
                var idField=null;
                if( !_.isEmpty(metaEntity)){
                    idField=metaEntity.getIdField();
                }
                id=selectedItem[idField];
            }
        }
        if(!id){
            $optInst.mustStopRepeatedClick = false;
            buiweex.alert(i18n.dataIdNotSet);
            return;
        }
        var metaEntity=context.metaEntity;
        var resource=metaEntity.dataResource();
        buiweex.confirm(i18n.confirmDelete,function(ok){
            if(ok==="确定"){
                resource.delete(id).then(function (re) {
                    $optInst.mustStopRepeatedClick = false;
                    $optInst.$emit("successed","del");
                },()=>{
                    $optInst.mustStopRepeatedClick = false;
                });
            }else{
                $optInst.mustStopRepeatedClick = false;
            }
        });
    },
    refresh(){
        //全局部件刷新方法
        if(_.isFunction(_this.refresh)&&_this.widgetContainer){
            _this.refresh()
        }else if(_this.$parent){
            _this = _this.$parent;//转移指向
            factoryApp.refresh()//寻找父级
        }
    },
    submitPromise(t,arry,funName){
        if(!arry){arry=[]}
        if(!t){return}
        if(_.isFunction(t[funName])&&t.widgetContainer){
            arry.push(t[funName]())
        }
        if(t.$parent){
            //let _arry = factoryApp.submitPromise(t.$parent,arry,funName);
            /*if(_arry.length){
             arry.concat(_arry)//寻找父级
             }*/
            return factoryApp.submitPromise(t.$parent,arry,funName);
        }else{
            return arry;
        }
    },
    submit(arry){
        //检测全局部件提交表单方法
        let _submNumber = factoryApp.submitPromise(_this,arry,"submit")
        return new Promise(function(resolve, reject){
            let formData = [];
            if(_submNumber.length){
                _.each(_submNumber,(res,index)=>{
                    res.then((data)=>{
                        if(data){
                            formData.push(data);
                        }
                        if((index+1)==_submNumber.length){
                            resolve(formData)
                        }
                    })
                })
            }else{
                resolve(formData)
            }
        });
    },
    formCheck(){
        //检测全局部件表单校验方法
        return factoryApp.submitPromise(_this,[],"formCheck");
    },
    getData(){
        //检测全局部件获取数据表单数据方法
        return factoryApp.submitPromise(_this,[],"getData");
    },
    pageScrollUpdate(){
        //容器的滚动视图更新
        //全局部件刷新方法
        if(_.isFunction(_this.pageScrollUpdate)&&_this.widgetContainer){
            _this.pageScrollUpdate()
        }else if(_this.$parent){
            _this = _this.$parent;//转移指向
            factoryApp.pageScrollUpdate()//寻找父级
        }
    },
    startLoading(){
        //显示加载圈
        //全局部件刷新方法
        if(_this.widgetContainer){
            //显示加载圈
            if(_.isEmpty(_this.startLoadingNumber)){
                _this.startLoadingNumber  = 0;
            }
            _this.startLoadingNumber++;//需要累加的加载圈
            if(_this.startLoadingNumber==1){
                _this.isShowLoading = true;
                //linkapi.showLoading({title:"加载中"});
            }//只调用一次
        }else if(_this.$parent){
            _this = _this.$parent;//转移指向
            factoryApp.startLoading()//寻找父级
        }
    },
    stopLoading(){
      //关闭加载圈
      //全局部件刷新方法
      if(_this.widgetContainer){
          //关闭加载圈
          _this.startLoadingNumber--;//需要累加的加载圈
          if(_this.startLoadingNumber==0){
              _this.isShowLoading = false;
              //linkapi.hideLoading();
          }
      }else if(_this.$parent) {
          _this = _this.$parent;//转移指向
          factoryApp.stopLoading()//寻找父级
      }
    },
    post(params){
        return new Promise((resolve, reject) => {
            try{
                if(_.isString(params.data)){
                    params.data = JSON.parse(params.data)
                }
            }catch(e){}
            ajax.post(params.url, params.data, params.headers).then((res)=>{
                if(res.ok) {
                    resolve(res.data);
                }else{
                    reject(res)
                }
            },erro=>{
                reject(erro)
            })
        })
    },
    get(params){
        return new Promise((resolve, reject) => {
            try{
                if(_.isString(params.data)){
                    params.data = JSON.parse(params.data)
                }
            }catch(e){}
            ajax.get(params.url, params.data, params.headers).then((res)=>{
                if(res.ok){
                    resolve(res.data);
                }else{
                    reject(res)
                }
            },erro=>{
                reject(erro)
            })
        })
    },
    delete(params){
        return new Promise((resolve, reject) => {
            try{
                if(_.isString(params.data)){
                    params.data = JSON.parse(params.data)
                }
            }catch(e){}
            ajax.delete(params.url, params.data).then((res)=>{
                if(res.ok){
                    resolve(res.data);
                }else{
                    reject(res)
                }
            },erro=>{
                reject(erro)
            })
        })
    },
    patch(params){
        return new Promise((resolve, reject) => {
            try{
                if(_.isString(params.data)){
                    params.data = JSON.parse(params.data)
                }
            }catch(e){}
            ajax.patch(params.url, params.data).then((res)=>{
                if(res.ok){
                    resolve(res.data);
                }else{
                    reject(res)
                }
            },erro=>{
                reject(erro)
            })
        })
    },
    alert(msg){
        /**
         * 弹出警告
         * @param msg {string} 提示文本
         */
        buiweex.alert(msg);
    },
    confirm(msg, callback, option){
        /**
         * 弹出确认框
         * @param msg {string} 提示文本
         * @param callback {function} 点击确定/取消后回调函数
         * @param option {object} 参数
         * @param option.okTitle {string} 确定按钮文本
         * @param option.cancelTitle {string} 取消按钮文本
         */
        buiweex.confirm(msg, callback, option);
    },
    toPage(pageId,option){
        /**
         * 跳转页面
         * @param pageId {string} 页面id
         * @param option {object} 参数
         * @param option.openType {string} 打开方式,默认是新窗口 0, 1弹出
         * @param option.displayRegion {Object} 窗口模式
         * width: 宽度
         * height: 高度
         * title:"名称"
         */
        /*app.toPge("test",{
         openType:1,
         displayRegion:{
         width:500,
         height:500
         }
         })*/
        if(option&&option.openType==1){
            //弹出窗口
            _this.modalInfo.width = option.displayRegion&&option.displayRegion.width||500;
            _this.modalInfo.height = option.displayRegion&&option.displayRegion.height||340;
            //_this.modalInfo.height = option.displayRegion&&option.displayRegion.title||_this.modalInfo.title;
            _this.modalInfo.pageParams = {"pageId" :pageId};
            _this.modalInfo.show = true;
        }else{
            //跳入新页面
            _this.$push(Utils.pageEntry(), {pageId:pageId,byOperation:false});
        }
    },
    api(apiInfo,data){
        /**
         * 运行api
         * @param apiInfo {Object} api信息
         * @data data {Object} 请求参数
         */
        if(typeof apiInfo=="string"){
            apiInfo = JSON.parse(apiInfo);
        }
        return service.getEngineUrl(apiInfo.projectId).then(function(res){
          apiInfo.path.replace(/\{\w*\}/g,function(a,b){
              var field = a.replace("{","").replace("}","");
              apiInfo.path = apiInfo.path.replace(a,data[field]);
          });
          var _params = {url:`${res}${apiInfo.path}`,data:JSON.stringify(data)}
          if(["PATCH"].indexOf(apiInfo.method)!=-1){
              _params.headers = {"x-http-method-override":apiInfo.method}
              apiInfo.method = "POST"
          }
          return factoryApp[apiInfo.method.toLowerCase()](_params);
        });
    }
});

export default factoryApp
