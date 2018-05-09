<template>
<div @click="gotoPage">
    <slot>
        <div class="btn-block">
            <text class="btn-text">{{operation.title}}</text>
        </div>
    </slot>
</div>
</template>
<script>
import _ from '../../js/tool/lodash.js';
import Utils from '../../js/tool/utils';
export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        operation:{//操作的定义，必传参数
            type:Object,
            required:true
        }
    },
    data(){
        if(!this.operation.page){
            this.$toast("page参数缺失");
        }
        return {

        };
    },
    methods:{
        gotoPage(){
            if(!this.operation.page){
                return;
            }
            var pageId=this.operation.page.id;
            var queryParam=_.extend({pageId:pageId},this.widgetContext.queryParams);
            this.$push(Utils.pageEntry(),queryParam);
        }
    }
}
</script>
<style lang="sass" src="../../styles/operation.scss"></style>
