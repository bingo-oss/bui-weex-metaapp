<template>
    <div class="flex-column" style="flex: 1;">
        <web style="position: absolute; width: 100%; height: 100%;" :src="widgetParams.url"></web>
    </div>
</template>
<style lang="css"></style>
<script>
    import EventBus from '../../js/bus';
    import factoryApp from '../libs/factory-app.js';

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
            factoryApp.refresh(this);
            EventBus.$emit("widget-push-title",this.widgetParams.title||"");
        }
    }
</script>
