<template>
<div @click="execScript" class="full-column">
    <slot>
        <meta-opt-btn :btn-type="btnType" :operation="operation"></meta-opt-btn>
    </slot>
</div>
</template>
<script>
import _ from '../../js/tool/lodash'
import ax from '../../js/ajax.js';
import config from '../../js/config.js';
import buiweex from 'bui-weex';
import OperationUtils from './js/operation_utils';
import factoryApi from '../../widgets/libs/factory-api.js';
export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        operation:{//操作的定义，必传参数
            type:Object,
            required:true
        },
        btnType:{//操作按钮的类型
            type:String
        }
    },
    data(){
        return {
            mustStopRepeatedClick:false,//阻止点击操作重复触发
            implCode:""//存入执行代码
        };
    },
    methods:{
        execScript(){
            let _t = this;
            if(this.mustStopRepeatedClick){
                return;
            }
            if(this.operation.onclick) {
                if (_.isFunction(this.operation.onclick)) {
                    this.mustStopRepeatedClick = true;
                    this.operation.onclick(Object.assign(this.widgetContext, this.operation),this,factoryApi);
                } else {
                    this.mustStopRepeatedClick = true;
                    var onclick = Function('"use strict";return ' + this.operation.onclick)();
                    onclick(Object.assign(this.widgetContext, this.operation), this,factoryApi);
                }
                this.mustStopRepeatedClick = false;
                this.$emit("triggered", "script");
            }else{
                if(_t.implCode){
                    _t.cellExecScript();
                }else {
                    //获取执行代码
                    config.readRuntimeConfig().then(runtimeConfig =>{
                        ax.get(runtimeConfig["service.metabase.endpoint"]+`/meta_operation/${_t.operation.operationId}`).then(({data})=>{
                            _t.implCode=data.implCode;
                            _t.cellExecScript();
                        });
                    });
                }
            }
        },
        cellExecScript(){
            var _widgetCtx = Object.assign(this.widgetContext, this.operation);
            OperationUtils.execution(this.operation,_widgetCtx,"beforeExecCode").then((res)=>{
                if(_.isFunction(this.implCode)){
                    this.mustStopRepeatedClick=true;
                    this.implCode(Object.assign(this.widgetContext,this.operation),this,factoryApi);
                }else{
                    this.mustStopRepeatedClick=true;
                    var onclick=Function('"use strict";return ' + this.implCode  )();
                    onclick(Object.assign(this.widgetContext,this.operation),this,factoryApi);
                }
                this.mustStopRepeatedClick=false;
                this.$emit("triggered","script");
                OperationUtils.execution(this.operation,_widgetCtx,"afterExecCode")//执行后
            });
        }
    }
}
</script>
<style src="../../styles/common.css"></style>