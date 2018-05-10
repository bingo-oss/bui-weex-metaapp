<template>
    <div @click="opt1Click">
        <slot>
            <div class="btn-block">
                <text class="btn-text">{{operation.title}}</text>
            </div>
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
            this.$emit("close");
        }
    }
}
</script>
<style lang="sass" src="../../../styles/operation.scss"></style>
