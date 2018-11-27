//方便部件直接调用的方法--注册公共代码-需要和page-methods的方法对应以及部件内存在这个方法的实现 才有效
//这里的公共方法调用部件内的同名方法,原理只是去执行下page-methods下的遍历
//注意 执行的是所有有对同名方法的实现的部件import _ from '../../js/tool/lodash';
import i18n from '../../js/i18n/index';
import buiweex from "bui-weex";
import linkapi from "linkapi";
import Util from '../../js/utils'
import _ from '../../js/tool/lodash';
import ajax from '../../js/ajax.js';

var factoryApi = Object.assign({},buiweex,linkapi,{
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
    refresh(t){
        //全局部件刷新方法
        if(_.isFunction(t.refresh)&&t.widgetContainer){
            t.refresh()
        }else if(t.$parent){
            factoryApi.refresh(t.$parent)//寻找父级
        }
    },
    submitPromise(t,arry,funName){
        if(!arry){arry=[]}
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
    submit(t,arry){
        //检测全局部件提交表单方法
        let _submNumber = factoryApi.submitPromise(t,arry)
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
    formCheck(t){
        //检测全局部件表单校验方法
        return factoryApi.submitPromise(t,[],"formCheck");
    },
    getData(t){
        //检测全局部件获取数据表单数据方法
        return factoryApi.submitPromise(t,[],"getData");
    },
    pageScrollUpdate(t){
        //容器的滚动视图更新
        //全局部件刷新方法
        if(_.isFunction(t.pageScrollUpdate)&&t.widgetContainer){
            t.pageScrollUpdate()
        }else if(t.$parent){
            factoryApi.pageScrollUpdate(t.$parent)//寻找父级
        }
    },
    startLoading(t){
        //显示加载圈
        //全局部件刷新方法
        if(t.widgetContainer){
            //显示加载圈
            if(_.isEmpty(t.startLoadingNumber)){
                t.startLoadingNumber  = 0;
            }
            t.startLoadingNumber++;//需要累加的加载圈
            if(t.startLoadingNumber==1){
                //this.isShowLoading = true;
                linkapi.showLoading({title:"加载中"});
            }//只调用一次
        }else if(t.$parent){
            factoryApi.startLoading(t.$parent)//寻找父级
        }
    },
    stopLoading(t){
      //关闭加载圈
      //全局部件刷新方法
      if(t.widgetContainer){
          //关闭加载圈
          t.startLoadingNumber--;//需要累加的加载圈
          if(t.startLoadingNumber==0){
              //this.isShowLoading = false;
              linkapi.hideLoading();
          }
      }else if(t.$parent) {
        factoryApi.stopLoading(t.$parent)//寻找父级
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
