<template>
<div class="full-column">
    <component :widget-context="widgetContext" :btn-type="btnType" :operation="operation" :is="operation.widget" @triggered="triggered" @successed="successed">
        <slot>
        </slot>
    </component>
</div>
</template>
<script>
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
        triggered(optType){
            this.$emit("triggered",optType);
        },
        successed(optType){
            this.$emit("successed",optType);
        }
    }
}
</script>
<style src="../../styles/common.css"></style>