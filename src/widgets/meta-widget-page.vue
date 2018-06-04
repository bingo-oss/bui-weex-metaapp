<template>
    <div class="full-column" v-if="pageConfig">
        <div class="full-column" v-for="(col,colIndex) in pageConfig.style.columns" :key="colIndex">
            <template v-for="(widget,index) in pageConfig.widgets[colIndex]">
                <component ref="childWidgets" :is="widget.tagName" :key="index" :widget-params="widget.params"></component>
            </template>
        </div>
    </div>
</template>
<script>
    import pageService from '../js/page/page_service';
    import propParser from '../js/tool/prop_parser';
    import _ from '../js/tool/lodash';
    var co = require('co');
    export default {
        props: {
            widgetParams: {
                type: Object,
                required: true
            }
        },
        data(){
            return {
                pageConfig:null
            };
        },
        watch:{
            widgetParams(val){
                this.loadPageConfig();
            }
        },
        methods:{
            loadPageConfig(){
                var _this=this;
                if(this.widgetParams&&this.widgetParams.pageId){
                    pageService.get(this.widgetParams.pageId).then(function(pageConfig){
                        _this.pageConfig=_this.convert(pageConfig);
                    });
                }
            },
           
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

                        //判断是否存入部件与字段的控制
                        if(_this.widgetParams.widgetSettings){
                            Object.assign(w.params,_this.widgetParams.widgetSettings[w.id]);
                        }
                    });
                });
                return pageConfig;
            },
            submit(){
                var submitWidgets=[];
                _.each(this.$refs.childWidgets,function(cw){
                    if(_.isFunction(cw.submit)){
                        submitWidgets.push(cw);
                    }
                });
                if(submitWidgets.length===0){
                    return Promise.resolve();
                }
                //利用co和generator函数顺序调用部件的submit
                function* nextSubmit(){
                    var toYield=[];
                    for(let i=0;i<submitWidgets.length;++i){
                        let sw=submitWidgets[i];
                        toYield.push(new Promise((resolve, reject)=>{
                            let res=sw.submit();
                            res.then((data)=>{resolve(data)},()=>{reject()});
                        }));
                    }
                    return yield toYield;
                }
                return co(nextSubmit);
            }
        }
    }
</script>
<style src="../styles/common.css"></style>
