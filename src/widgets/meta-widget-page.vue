<template>
    <div class="full-column" v-if="pageConfig">
        <div class="full-column" v-for="(col,colIndex) in pageConfig.style.columns" :key="colIndex">
            <template v-for="(widget,index) in pageConfig.widgets[colIndex]">
                <component class="full-column" ref="childWidgets" :is="widget.tagName" :key="index" :widget-params="widget.params" :vue-modal="vueModal"></component>
            </template>
        </div>
    </div>
</template>
<script>
    import pageService from '../js/page/page_service';
    import propParser from '../js/tool/prop_parser';
    import _ from '../js/tool/lodash';
    import pageMethods from './libs/page-methods';

    var co = require('co');
    export default {
        props: {
            widgetParams: {
                type: Object,
                required: true
            },
            query:{//模拟页面的query参数，页面部件比较特殊
                type:Object,
                default(){
                    return {};
                }
            },
            vueModal:{//弹窗模式传入的是存在弹窗的自身--方便控制弹窗的一些显隐
                type:Object,
                default(){
                    return {};
                }
            }
        },
        data(){
            return {
                pageConfig:null,
                isWidgetPage:true
            };
        },
        watch:{
            widgetParams(val){
                this.loadPageConfig();
            }
        },
        methods: _.extend({},pageMethods,{
            loadPageConfig(){
                var _this=this;
                if(this.widgetParams&&this.widgetParams.pageId){
                    pageService.get(this.widgetParams.pageId,this.widgetParams.byOperation).then(function(pageConfig){
                        _this.pageConfig=_this.convert(pageConfig);
                    });
                }
            },
            convert(pageConfig){
                var _this=this;
                let _layout;
                if(pageConfig.layout){
                    _layout = pageConfig.layout
                }else{
                    _layout = pageConfig
                }
                //每一列有自己的部件集合
                _.each(_layout.widgets,function(columnWidgets){
                    //遍历每一列的所有部件
                    _.each(columnWidgets,function(w){
                        var props={},operations={};
                        if(pageConfig.widgetParams&&pageConfig.widgetParams.length&&w.widgetId){
                            //存在对应部件参数的数据
                            pageConfig.widgetParams.filter((obj)=>{
                                if(w.widgetId==obj.widgetId){
                                //读取对应的部件参数进行设置
                                props = obj.params;
                                //操作
                                _.each(obj.buttons,(e)=>{
                                    if(!operations[e.location]){
                                        operations[e.location] = [];//不存在操作区域则声明
                                    }
                                    operations[e.location].push(e)
                                })
                                }
                            });
                        }else{
                            props=w.props,operations=w.operations;
                        }
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
                        //移动端处理是否隐藏头部
                        if(_this.widgetParams.hideHeader){
                            Object.assign(w.params,{hideHeader:true});
                        }
                    });
                });
                return _layout;
            }/*,
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
            }*/
        })
    }
</script>
<style src="../styles/common.css"></style>
