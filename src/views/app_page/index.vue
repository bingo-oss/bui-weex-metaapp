<template>
    <div class="full-column">
        <!--<bui-header v-if="title&&!hideHeader" :leftItem="{icon: 'ion-ios-arrow-left'}" :title="title" @leftClick="() =>{this.$pop()}" :backgroundColor="themeBg"></bui-header>-->
        <meta-widget-page :widget-params="params"></meta-widget-page>
    </div>
</template>
<script>
import EventBus from '../../js/bus';
const globalEvent = weex.requireModule('globalEvent');

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
        var byOperation=this.$getPageParams()['byOperation'];
        this.params=Object.assign({pageId:pageId,byOperation:byOperation},this.params);

        globalEvent.addEventListener("androidback", e => {
            this.$pop();
        });

    }
}
</script>
<style src="../../styles/common.css"></style>


