//方便部件直接调用的方法--注册公共代码-需要和page-methods的方法对应以及部件内存在这个方法的实现 才有效
//这里的公共方法调用部件内的同名方法,原理只是去执行下page-methods下的遍历
//注意 执行的是所有有对同名方法的实现的部件import _ from '../../js/tool/lodash';
import i18n from '../../js/i18n/index';
import buiweex from "bui-weex";
var  factoryApi = {
    goback(context, $optInst) {
        //返回
        buiweex.$pop();
    },
    del:function(context,$optInst){
        //删除
        var id=getIdFromContext(context);
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
    refresh:function(t){
        //全局部件刷新方法
        if(_.isFunction(t.refresh)&&t.isWidgetPage){
            debugger
            t.refresh()
        }
        if(t.$parent){
            factoryApi.refresh(t.$parent)//寻找父级
        }
    },
    submitPromise:function(t,arry,funName){
        if(!arry){arry=[]}
        if(_.isFunction(t[funName])&&t.isWidgetPage){
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
    submit:function(t,arry){
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
    }
}

export default factoryApi
