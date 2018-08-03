<template>
<div @click="execScript" class="full-column">
    <slot>
        <meta-opt-btn :btn-type="btnType" :operation="operation"></meta-opt-btn>
    </slot>
</div>
</template>
<script>
import _ from '../../js/tool/lodash'
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
            mustStopRepeatedClick:false//阻止点击操作重复触发
        };
    },
    methods:{
        execScript(){
            if(this.mustStopRepeatedClick){
                return;
            }
            if(_.isFunction(this.operation.onclick)){
                this.mustStopRepeatedClick=true;
                this.operation.onclick(Object.assign(this.widgetContext,this.operation),this);
            }else{
                this.mustStopRepeatedClick=true;
                var onclick=Function('"use strict";return ' + this.operation.onclick  )();
                onclick(Object.assign(this.widgetContext,this.operation),this);
            }
            this.mustStopRepeatedClick=false;
            this.$emit("triggered","script");
        }
    }
}
</script>
<style src="../../styles/common.css"></style>