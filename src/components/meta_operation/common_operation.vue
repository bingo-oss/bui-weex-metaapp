<template>
<div v-if="extendedOperation" class="full-column">
    <!--有onclick的普通操作-->
    <div v-if="extendedOperation&&!extendedOperation.renderComponent" @click="buttonClick" class="full-column">
        <slot>
            <meta-opt-btn :btn-type="btnType" :operation="extendedOperation"></meta-opt-btn>
        </slot>
    </div>
    <!--有renderComponent的普通操作-->
    <component v-if="extendedOperation&&extendedOperation.renderComponent" :widget-context="widgetContext" :operation="extendedOperation" :is="extendedOperation.renderComponent">
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
        },
        btnType:{//操作按钮的类型
            type:String
        }
    },
    computed:{
        extendedOperation:function(){
            let commonOptName=this.operation.name;
            let commonOpt=commonOperation.createOperation(commonOptName);
            if(commonOpt){
                return _.extend(this.operation,commonOpt);
            }
            return null;
        }
    },
    data(){
        return {
            mustStopRepeatedClick:false//阻止点击操作重复触发
        };
    },
    methods:{
        buttonClick(){
            if(this.mustStopRepeatedClick){
                return;
            }
            if(this.extendedOperation&&this.extendedOperation.onclick){
                this.mustStopRepeatedClick=true;
                this.extendedOperation.onclick(this.widgetContext,this);
            }
            this.$emit("triggered",this.operation.name);
        }
    }
}
</script>
<style src="../../styles/common.css"></style>

