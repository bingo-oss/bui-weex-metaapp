<template>
    <div class="full-column" ref="page">
        <scroller class="full-column" style="background-color:#F8F8F8" @scroll="scrollHandler" v-if="pageShow">
            <div :style="scrollerStyle">
                <template v-for="(widget,index) in columnWidgets" :style="{
                    width:widget.frame.width+'px',
                    'margin':widget.frame.margin+'px'
                    }" v-if="!widget.hide">
                    <text v-if="widget.frame&&widget.frame.isFrame&&widget.frame.title" class="frame_name">{{widget.frame.title}}</text>
                    <component :style="{height:(widget.frame.height?widget.frame.height+'px':'')}" :is="widget.tagName" ref="childWidgets" :key="index" :widget-params="widget.params" :vue-modal="vueModal" :tag-name="widget.tagName" :widget-name="widget.widgetName" v-if="!widget.params.mode||(['view','editable'].indexOf(widget.params.mode)!=-1)"></component>
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
    import EventBus from '../js/bus';
    import factoryApp from './libs/factory-app.js';

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
                pageShow:false,
                pageConfig:null,
                widgetContainer:true,//用于判断是否是部件容器
                isShowLoading:false,
                dom:dom,//方便其他部件调用滚动
                urlParam:null,//存储页面间输出参数
                scrollerStyle:{"flex":1,height:scrollerHeight},//ios的scroller标签内的flex不生效-需要做个兼容
                frameStyle:{},//窗口样式
                widgetsInfo:[],//用于存入出现过的部件信息（高度）
                pageEvent:{
                    beforeCreate:"",
                    created:"",
                    beforeMount:"",
                    mounted:"",
                    beforeUpdate:"",
                    updated:"",
                    beforeDestroy:"",
                    destroyed:""
                },//存储页面事件
                pageParams:{},//定义在页面配置的参数
                columnWidgets:[]//解析出排版的所有部件
            };
        },
        watch:{
            widgetParams(val){
                this.loadPageConfig();
            }
        },
        beforeCreate: function () {
            console.log('beforeCreate 创建前状态===============》');
        },
        created(){
            let _this = this;
            storage.getItem("urlParam", (res)=>{
                if(res.data&&res.data!="undefined"&&res.data!="{}"){
                    _this.urlParam = JSON.parse(res.data);
                }
                if(!EventBus.historyParam)EventBus.historyParam = {};//初始化数据
                let historyTime = _this.$getPageParams()['_t']//获取历史参数
                if (_this.urlParam && !EventBus.historyParam[historyTime]&&historyTime) {
                    //记录下页面参数
                    EventBus.historyParam[historyTime] = _this.urlParam
                } else if (!_this.urlParam && EventBus.historyParam[historyTime]) {
                    //没有页面参数,但存在历史记录,则判断为返回操作
                    _this.urlParam = EventBus.historyParam[historyTime]
                }
            });//存储起来需要传递的参数
            this.loadPageConfig();
            this.hookExecution("created")
        },
        beforeMount: function () {
            console.log('beforeMount 挂载前状态===============》');
            this.hookExecution("beforeMount")
        },
        mounted: function () {
            console.log('mounted 挂载结束状态===============》');
            this.hookExecution("mounted")
        },
        beforeUpdate: function () {
            console.log('beforeUpdate 更新前状态===============》');
            this.hookExecution("beforeUpdate")
        },
        updated: function () {
            console.log('updated 更新完成状态===============》');
            this.hookExecution("updated")
        },
        beforeDestroy: function () {
            console.log('beforeDestroy 销毁前状态===============》');
            this.hookExecution("beforeDestroy")
        },
        destroyed: function () {
            console.log('destroyed 销毁完成状态===============》');
            this.hookExecution("destroyed")
        },
        methods:Object.assign({},pageMethods,{
            loadPageConfig(){
                var _this=this;
                //linkapi.showLoading({"title":"加载中"})
                this.isShowLoading=true;//显示加载圈
                _this.pageShow = false;
                if(this.widgetParams&&this.widgetParams.pageId){
                    pageService.get(this.widgetParams.pageId,this.widgetParams.byOperation).then(function(pageConfig){
                        _this.convert(pageConfig);
                        //_this.pageConfig=_this.convert(pageConfig);
                        _this.isShowLoading=false//关闭加载圈
                        _this.pageScrollUpdate();
                        setTimeout(function(){
                            _this.pageShow = true;
                        },100)
                    },(erro)=>{
                        buiweex.toast("请求失败,请重试");
                        _this.isShowLoading=false//关闭加载圈
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
                //页面事件
                _.each(_this.pageEvent,(val,key)=>{
                    if(pageConfig[`${key}Event`]){
                        _this.pageEvent[key] = pageConfig[`${key}Event`];
                    }
                });
                //页面定义参数
                _this.pageParams = pageConfig.params;
                this.getOrSetWidget(pageConfig);
                storage.removeItem("urlParam");//取出后立即清除-防止参数错乱
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
                let _setTimeout = "";
                //特殊处理-暂时先这样定义高度的变化--不然没法兼容
                try{
                    dom.getComponentRect(_this.$refs.page,function(size){
                        _this.scrollerStyle.height = size.size.height;
                        _setTimeout = setTimeout(function(){
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
                                clearTimeout(_setTimeout);
                            }
                        },1000);
                    });
                }catch (e){

                }
            },
            hookExecution(name){
                //钩子执行
                let fun = this.pageEvent[name];
                try{
                    if (_.isFunction(fun)) {
                        fun(this, factoryApp);
                    } else if(fun){
                        var onclick = Function('"use strict";return ' + fun)();
                        onclick(this, factoryApp);
                    }
                }catch (e){
                    this.$toast("脚本语法有误");
                }
            },
            setWidgetParams(widget,toRoute){
                //处理配置的部件参数且处理页面参数
                let _this = this;
                var props = widget.params, operations = {}

                widget.frame  = {
                    isFrame:false,
                    title:"",//名称
                    height:"",//高度
                    width:"",//宽度
                    margin:0//外边距
                };

                _.each(widget.buttons, (e) => {
                    if (!operations[e.location]) {
                        operations[e.location] = []//不存在操作区域则声明
                    }
                    operations[e.location].push(e)
                });

                widget.widgetParams = {widgetCode: widget.widgetCode ? widget.widgetCode : ''}//传入部件code--用于读取页面参数
                //遍历每一个部件的属性
                _.each(props,function(propValue,propKey){
                    var parsedValue=propParser.parse(propValue,_this);
                    widget.params[propKey]=parsedValue;
                });
                //遍历每一个部件的操作区
                _.each(operations,function(optValue,optKey){
                    widget.params[optKey]=optValue;
                });

                //判断是否存入部件与字段的控制
                if(_this.widgetParams.widgetSettings){
                    Object.assign(widget.params,_this.widgetParams.widgetSettings[widget.id]);
                }

                _.each(_this.urlParam,function(propValue,propKey){
                    if(((propKey.indexOf(".")!=-1)&&(propKey.indexOf(widget.widgetCode)!=-1))||propKey.indexOf(".")==-1){
                        //特定code的组件参数 以及 code.key标符的就直接都传入
                        let _key = propKey;
                        if(_key.indexOf(".")!=-1){
                            _key = _key.slice((_key.indexOf(".")+1))
                        }
                        if(_.isEmpty(widget.params[_key])){
                            //过滤已经在部件上定值和从url上取到值的部件参数
                            widget.params[_key] = propValue;
                        }
                    }
                });
                this.columnWidgets.push(widget);//添加组装好的部件
                this.pageConfig = {columnWidgets:this.columnWidgets};//向下兼容下配置脚本-部件显隐
            },
            getOrSetWidget(layout,toRoute){
                //获取并且设置按钮脚本
                _.each((layout.layout||layout),(widget)=>{
                    if(_.isArray(widget)){
                        this.getOrSetWidget(widget)
                    }else if(widget&&widget.widgetCode){
                        this.setWidgetParams(widget,toRoute);
                    }
                    this.hookExecution("beforeUpdate");
                });
            }
        })
    }
</script>
<style src="../styles/common.css"></style>
<style lang="sass" scoped>
    .frame_name{ padding:15px; background-color: #f1f1f1; font-size: 26px;}
</style>
