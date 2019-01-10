<template>
    <div class="full-column" v-if="pageConfig" >
        <scroller class="full-column" style="background-color:#F8F8F8" @scroll="scrollHandler">
            <div :style="scrollerStyle">
                <template v-for="(widget,index) in pageConfig.columnWidgets" :style="{
                    width:widget.frame.width+'px',
                    'margin':widget.frame.margin+'px'
                    }">
                    <text v-if="widget.frame&&widget.frame.isFrame&&widget.frame.title" class="frame_name">{{widget.frame.title}}</text>
                    <component :style="{height:(widget.frame.height?widget.frame.height+'px':'')}" :is="widget.tagName" ref="childWidgets" :key="index" :widget-params="widget.params" :vue-modal="vueModal" :tag-name="widget.tagName" :widget-name="widget.widgetName"></component>
                </template>
            </div>
            <!--<div class="full-column" v-for="(col,colIndex) in pageConfig.style.columns" :key="colIndex">
                <component class="full-column" v-for="(widget,index) in pageConfig.widgets[colIndex]" @appear="appear(widget,index)" @disappear="disappear(widget,index)" ref="childWidgets" :is="widget.tagName" :key="index" :widget-params="widget.params" :vue-modal="vueModal" :tag-name="widget.tagName" :widget-name="widget.widgetName"></component>
            </div>-->
        </scroller>
        <bui-loading :show="isShowLoading" :loading-text="'加载中...'"></bui-loading>
    </div>
</template>
<script>
    import pageService from '../js/page/page_service';
    import propParser from '../js/tool/prop_parser';
    import _ from '../js/tool/lodash';
    import pageMethods from './libs/page-methods';
    import buiweex from 'bui-weex';
    const dom = weex.requireModule('dom');
    const storage = weex.requireModule('storage');
    import linkapi from "linkapi";

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
            var scrollerHeight = ((750/weex.config.env.deviceWidth)*weex.config.env.deviceHeight);
            return {
                pageConfig:null,
                widgetContainer:true,//用于判断是否是部件容器
                isShowLoading:false,
                dom:dom,//方便其他部件调用滚动
                urlParam:{},//存储的页面参数
                scrollerStyle:{"flex":1,height:scrollerHeight},//ios的scroller标签内的flex不生效-需要做个兼容
                frameStyle:{},//窗口样式
                widgetsInfo:[]//用于存入出现过的部件信息（高度）
            };
        },
        watch:{
            widgetParams(val){
                this.loadPageConfig();
            }
        },
        created(){
            let _this = this;
            storage.getItem("urlParam", (res)=>{
                if(res.data&&res.data!="undefined"){
                    _this.urlParam = JSON.parse(res.data);
                }
            });//存储起来需要传递的参数
        },
        methods:Object.assign({},pageMethods,{
            loadPageConfig(){
                var _this=this;
                //linkapi.showLoading({"title":"加载中"})
                if(this.widgetParams&&this.widgetParams.pageId){
                    pageService.get(this.widgetParams.pageId,this.widgetParams.byOperation).then(function(pageConfig){
                        _this.pageConfig=_this.convert(pageConfig);
                        _this.pageScrollUpdate();
                    },(erro)=>{
                        buiweex.toast("请求失败,请重试")
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
                _layout.columnWidgets = []//合并到一行内,布局处理
                //每一列有自己的部件集合
                _.each(_layout.widgets,function(columnWidgets){
                    //遍历每一列的所有部件
                    _.each(columnWidgets,function(w){
                        var props={},operations={};
                        //设置默认值
                        w.frame  = {
                            isFrame:false,
                            title:"",//名称
                            height:"",//高度
                            width:"",//宽度
                            margin:0//外边距
                        };
                        if(pageConfig.widgetParams&&pageConfig.widgetParams.length&&w.widgetParamId){
                            //存在对应部件参数的数据
                            pageConfig.widgetParams.filter((obj)=>{
                                if(w.widgetParamId==obj.id){
                                    //读取对应的部件参数进行设置
                                    props = obj.params;
                                    //操作
                                    _.each(obj.buttons,(e)=>{
                                        if(!operations[e.location]){
                                            operations[e.location] = [];//不存在操作区域则声明
                                        }
                                        operations[e.location].push(e)
                                    });
                                    //部件窗体信息
                                    if(obj.frame){
                                        Object.assign(w.frame,obj.frame);
                                    };
                                }
                            });
                        }else{
                            props=w.props,operations=w.operations;
                        }
                        w.params={widgetCode: w.widgetCode?w.widgetCode:""};//传入部件code--用于读取页面参数
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
                        /*//移动端处理是否隐藏头部
                        if(_this.widgetParams.hideHeader){
                            Object.assign(w.params,{hideHeader:true});
                        }*/
                        _.each(_this.urlParam,function(propValue,propKey){
                            if(((propKey.indexOf(".")!=-1)&&(propKey.indexOf(w.widgetCode)!=-1))||propKey.indexOf(".")==-1){
                                //特定code的组件参数 以及 code.key标符的就直接都传入
                                let _key = propKey;
                                if(_key.indexOf(".")!=-1){
                                    _key = _key.slice((_key.indexOf(".")+1))
                                }
                                if(_.isEmpty(w.params[_key])){
                                    //过滤已经在部件上定值和从url上取到值的部件参数
                                    w.params[_key] = propValue;
                                }
                            }
                        });
                        _layout.columnWidgets.push(w);//添加组装好的部件
                    });
                });
                storage.removeItem("urlParam");//取出后立即清除-防止参数错乱
                return _layout;
            },
            viewEvent(widget,Event){
                //if(widget.tagName=="meta-widget-navbar")return false;
                _.each(this.$refs.childWidgets,(cw,index)=>{
                    if(_.isFunction(cw[Event])){
                        cw[Event](widget,index);
                    }
                });
            },
            scrollHandler(e){
                //滚动触发
                _.each(this.$refs.childWidgets,(cw,index)=>{
                    if(this.widgetsInfo[index].widget == cw){
                        if(this.widgetsInfo[index].info&&/*this.widgetsInfo[index+1]&&*/
                            ((-e.contentOffset.y)<=(this.widgetsInfo[index].info.size.top+this.widgetsInfo[index].info.size.height))&&
                            ((-e.contentOffset.y)>(this.widgetsInfo[index].info.size.top))){
                            this.viewEvent(cw,"appear");
                        }
                    }
                    if(_.isFunction(cw.pageScrollHandler)){
                        cw.pageScrollHandler(e);
                    }
                });
            },
            pageScrollUpdate(){
                //需要部件去调用下更新
                var _this=this;
                //特殊处理-暂时先这样定义高度的变化--不然没法兼容
                var _setTimeout = setTimeout(function(){
                    let _widgetHeights = 0;
                    if(_this.pageConfig&&_this.$refs.childWidgets.length==_this.pageConfig.columnWidgets.length){
                        _.each(_this.$refs.childWidgets,(cw)=>{
                            dom.getComponentRect(cw,function(res){
                                //存入部件信息
                                _this.widgetsInfo.push({widget:cw,info:res});
                                //计算下当前部件的总高--若超出则不需要定制高度
                                _widgetHeights+=res.size.height;
                                if(_widgetHeights>(_this.scrollerStyle.height)){
                                    _this.scrollerStyle = {};
                                    _this.$forceUpdate();//更新下视图
                                }
                            });
                        });
                    }else{
                        _setTimeout();
                    }
                },1000);
            }
            /*,
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
<style lang="sass" scoped>
    .frame_name{ padding:15px; background-color: #f1f1f1; font-size: 26px;}
</style>
