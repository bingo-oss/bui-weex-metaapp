<template>
    <component :is="btnComponentName" :operation="operation"></component>
</template>
<script>
export default {
    props:{
        operation:{
            type:Object
        },
        btnType:{
            type:String,
            default:'normal'//normal,swipe-cell
        }
    },
    computed:{
        btnComponentName(){
            return `${this.btnType}-btn`;
        }
    },
    components:{
        "normal-btn":require('./normal_btn.vue'),
        "swipe-cell-btn":require('./swipe_cell_btn.vue')
    }
}
</script>
