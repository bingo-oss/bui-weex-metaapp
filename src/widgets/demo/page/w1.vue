<template>
    <div class="widget-con">
        <div v-if="widgetParams&&widgetParams.commonOperations" 
            v-for="(commonOpt,index) in widgetParams.commonOperations" :key="index" class="common-operation">
            <meta-operation :operation="commonOpt" :widget-context="getWidgetContext(index)">
                <bui-button type="primary"
                    :value="commonOpt.title" >
                </bui-button>
            </meta-operation>
        </div>
        <div style="text-align:center;">
            <text>我是一个部件w1</text>
        </div>
    </div>
</template>
<script>
export default {
    props:{
        widgetParams:{
            type:Object,
            required:true
        }
    },
    data(){
        return {
            i:1
        }
    },
    methods:{
        getWidgetContext(index){
            //var metaEntity=this.$metaBase.findMetaEntity("Activity");
            var metaEntity={name:"Activity"};
            return {
                selectedId:index%2?'K1rwgeV7D':'2ywLEmlpZ',
                selectedItem:'',
                selectedItems:'',
                metaEntity:metaEntity,
                grid:''
            };
        }
    }
}
</script>
<style lang="css" scoped>
.common-operation{
    display:inline-block;
    vertical-align: middle;
    padding:5px;
}
.widget-con{
    border:1px solid #ccc;
    margin:5px 5px 5px 5px;
    padding:10px;
}
</style>


