<template>
<div v-if="commonOperation">
    <!--有onclick的普通操作-->
    <div v-if="commonOperation&&!commonOperation.renderComponent" @click="buttonClick">
        <slot>
            <bui-button type="primary" 
                :value="commonOperation.title" >
            </bui-button>
        </slot>
    </div>
    <!--有renderComponent的普通操作-->
    <component v-if="commonOperation&&commonOperation.renderComponent" :widget-context="widgetContext" :operation="commonOperation" :is="commonOperation.renderComponent">
        <slot></slot>
    </component>
</div>
</template>
<script>
import commonOperation from './js/common_operation.js';
import _ from '../../js/tool/lodash.js';
export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        operation:{//操作的定义，必传参数
            type:Object,
            required:true
        }
    },
    data(){
        let commonOptName=this.operation.name;
        let commonOpt=commonOperation.createOperation(commonOptName);
        let _this=this;
        if(commonOpt){
            //覆盖通用操作的某些属性
            _.each(["title","icon"],function(k){
                if(_this.operation[k]){
                    commonOpt[k]=_this.operation[k];
                }
            });
        }
        return {
            commonOperation:commonOpt
        };
    },
    methods:{
        buttonClick(){
            if(this.commonOperation&&this.commonOperation.onclick){
                this.commonOperation.onclick(this.widgetContext,this);
            }
        }
    }
}
</script>

