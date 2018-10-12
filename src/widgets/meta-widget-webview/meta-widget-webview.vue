<template>
    <div class="flex-column">
        <web style="position: absolute; width: 100%; height: 100%;" :src="widgetParams.url"></web>
    </div>
</template>
<style lang="css"></style>
<script>
    import EventBus from '../../js/bus';
    export default {
        props:{
            widgetParams:{
                type:Object,
                required:true
            }
        },
        data () {
            return {
            }
        },
        methods: {
        },
        computed: {
        },
        mounted(){
            EventBus.$emit("widget-push-title",this.widgetParams.title||"");
        }
    }
</script>
