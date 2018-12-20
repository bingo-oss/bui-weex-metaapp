//方便部件直接调用的方法--注册公共代码-需要和page-methods的方法对应以及部件内存在这个方法的实现 才有效
//这里的公共方法调用部件内的同名方法,原理只是去执行下page-methods下的遍历
//注意 执行的是所有有对同名方法的实现的部件import _ from '../../js/tool/lodash';
import i18n from '../../js/i18n/index';
import buiweex from "bui-weex";
import linkapi from "linkapi";
import Util from '../../js/utils'
import _ from '../../js/tool/lodash';
import ajax from '../../js/ajax.js';
var _this=this;//用于初始化指向
var factoryApi = Object.assign({},buiweex,linkapi,{
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
            factoryApi.refresh()//寻找父级
        }
    },
    submitPromise(t,arry,funName){
        if(!arry){arry=[]}
        if(!t){return}
        if(_.isFunction(t[funName])&&t.widgetContainer){
            arry.push(t[funName]())
        }
        if(t.$parent){
            //let _arry = factoryApi.submitPromise(t.$parent,arry,funName);
            /*if(_arry.length){
             arry.concat(_arry)//寻找父级
             }*/
            return factoryApi.submitPromise(t.$parent,arry,funName);
        }else{
            return arry;
        }
    },
    submit(arry){
        //检测全局部件提交表单方法
        let _submNumber = factoryApi.submitPromise(_this,arry,"submit")
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
        return factoryApi.submitPromise(_this,[],"formCheck");
    },
    getData(){
        //检测全局部件获取数据表单数据方法
        return factoryApi.submitPromise(_this,[],"getData");
    },
    pageScrollUpdate(){
        //容器的滚动视图更新
        //全局部件刷新方法
        if(_.isFunction(_this.pageScrollUpdate)&&_this.widgetContainer){
            _this.pageScrollUpdate()
        }else if(_this.$parent){
            _this = _this.$parent;//转移指向
            factoryApi.pageScrollUpdate()//寻找父级
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
            factoryApi.startLoading()//寻找父级
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
          factoryApi.stopLoading()//寻找父级
      }
    },
    post(params){
        return new Promise((resolve, reject) => {
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
    }
});

export default factoryApi
