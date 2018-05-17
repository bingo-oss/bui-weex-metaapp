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

        };
    },
    methods:{
        execScript(){
            if(_.isFunction(this.operation.onclick)){
                this.operation.onclick(this.widgetContext);
            }else{
                var onclick=Function('"use strict";return ' + this.operation.onclick  )();
                onclick(this.widgetContext);
            }
            this.$emit("triggered","script");
        }
    }
}
</script>
<style src="../../styles/common.css"></style>