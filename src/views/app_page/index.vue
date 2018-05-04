<template>
    <div v-if="pageConfig">
        <div v-for="(col,colIndex) in pageConfig.style.columns" :key="colIndex">
            <template v-for="(widget,index) in pageConfig.widgets[colIndex]">
                <component :is="widget.id" :key="index" :widget-params="widget.params"></component>
            </template>
        </div>
    </div>
</template>
<script>
import pageService from '../../js/page/page_service';
import propParser from '../../js/tool/prop_parser';
import _ from '../../js/tool/lodash'
export default {
    data(){
        return {
            pageConfig:null
        };
    },
    created(){
        var pageId=this.$getPageParams()['pageId'];
        pageService.get(pageId).then((pageConfig)=>{
            this.pageConfig=this.convert(pageConfig);
        });
    },
    methods:{
        convert(pageConfig){
            var _this=this;
            //每一列有自己的部件集合
            _.each(pageConfig.widgets,function(columnWidgets){
                //遍历每一列的所有部件
                _.each(columnWidgets,function(w){
                    var props=w.props,operations=w.operations;
                    w.params={};
                    //遍历每一个部件的属性
                    _.each(props,function(propValue,propKey){
                        var parsedValue=propParser.parse(propValue,_this);
                        w.params[propKey]=parsedValue;
                    });
                    //遍历每一个部件的操作区
                    _.each(operations,function(optValue,optKey){
                        w.params[optKey]=optValue;
                    });
                });
            });
            return pageConfig;
        }
    }
}
</script>

