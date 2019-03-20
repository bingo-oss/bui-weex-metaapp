<template>
    <div class="full-column">
        <!--<bui-header v-if="title&&!hideHeader" :leftItem="{icon: 'ion-ios-arrow-left'}" :title="title" @leftClick="() =>{this.$pop()}" :backgroundColor="themeBg"></bui-header>-->
        <template v-for="page in pages" >
            <meta-widget-page :widget-params="params"></meta-widget-page>
        </template>
    </div>
</template>
<script>
import EventBus from '../../js/bus';
const globalEvent = weex.requireModule('globalEvent');

export default {
    data(){
        return {
            pages:[1],
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
        let _this = this;
        EventBus.$on("widget-push-title",(data) =>{
            this.title=data;
        });
        EventBus.$on("reload",(data) =>{
            //重新加载
            if(data){
                this.pages = null;
                setTimeout(function(){
                    _this.pages = [1];
                },1);
            }
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


