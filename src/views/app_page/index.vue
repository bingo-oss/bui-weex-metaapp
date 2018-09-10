<template>
    <div class="full-column">
        <bui-header v-if="title&&!hideHeader" :leftItem="{icon: 'ion-ios-arrow-left'}" :title="title" @leftClick="() =>{this.$pop()}" :backgroundColor="themeBg"></bui-header>
        <meta-widget-page :widget-params="params"></meta-widget-page>
    </div>
</template>
<script>
import EventBus from '../../js/bus';
export default {
    data(){
        return {
            params:{},
            title:"",
            hideHeader:false
        };
    },
    computed:{
        headerTitle(){
            return this.title;
        }
    },
    created(){
        EventBus.$on("widget-push-title",(data) =>{
            this.title=data;
        });
    },
    mounted(){
        var pageId=this.$getPageParams()['pageId'];
        this.params=Object.assign({pageId:pageId},this.params);
    }
}
</script>
<style src="../../styles/common.css"></style>


