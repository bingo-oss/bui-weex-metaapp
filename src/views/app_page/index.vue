<template>
    <meta-widget-page :widget-params="params"></meta-widget-page>
</template>
<script>
export default {
    data(){
        return {
            params:{}
        };
    },
    mounted(){
        var pageId=this.$getPageParams()['pageId'];
        this.params=Object.assign({pageId:pageId},this.params);
    }
}
</script>

