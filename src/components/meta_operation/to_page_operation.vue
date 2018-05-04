<template>
<div @click="gotoPage">
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
            // if(!this.operation.page){
            //     return;
            // }
            // var _query=_.extend({},this.widgetContext.queryParams);
            // var pageId=this.operation.page.id;
            // var _params=_.extend({pageId:pageId},this.widgetContext.pathParams);
            // router.push({name:"defaultPageIndex",query:_query,params:_params});
        }
    }
}
</script>

