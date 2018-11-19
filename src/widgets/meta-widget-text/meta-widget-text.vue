<template>
    <div>
        <text :style="textStyle">{{widgetParams.text}}</text>
    </div>
</template>
<style>
    .text{ padding-left: 10px; font-size: 24px;}
</style>
<script>
    import buiweex from "bui-weex";
    module.exports = {
        props: {
            widgetParams: {
                type: Object,
                required: true
            }
        },
        computed: {
            "textStyle"(){
                return this.widgetParams.textStyle?JSON.parse(this.widgetParams.textStyle):{}
            }
        },
        data () {
            return {
            }
        },
        methods: {
        },
        mounted(){}
    }
</script>