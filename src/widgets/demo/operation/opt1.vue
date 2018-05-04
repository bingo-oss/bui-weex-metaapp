<template>
    <div @click="opt1Click">
        <slot>
            <bui-button type="primary"
                :value="operation.title" >
            </bui-button>
        </slot>
    </div>
</template>
<script>
export default {
    props:{
        operation:{
            type:Object,
            required:true
        },
        widgetContext:{
            type:Object,
            required:true
        }
    },
    data(){
        return {}
    },
    methods:{
        opt1Click(){
            this.$toast("我是一个自定义操作，类型为部件操作类型");
        }
    }
}
</script>

