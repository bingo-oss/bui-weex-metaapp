<template>
    <div class="wrapper">
        <bui-header v-if="widgetParams.showHeader" :leftItem="{icon: 'ion-ios-arrow-left'}" @leftClick="pop" :backgroundColor="themeBg">
            <div  @click="titleClicked" slot="center" class="page-title-wrapper">
                <text :ref="'titleText'" class="page-title">{{widgetParams.isViewMode?widgetParams.headerTitle:title}}</text>
                <bui-icon @click="titleClicked" style="margin-top: 2px;" v-if="!widgetParams.isViewMode&&presetFilters.length&&!showDropdown" name="ion-android-arrow-dropdown" color="white" size=38></bui-icon>
                <bui-icon @click="titleClicked" style="margin-top: 2px;" v-if="!widgetParams.isViewMode&&presetFilters.length&&showDropdown" name="ion-android-arrow-dropup" color="white" size=38></bui-icon>
                <!--<div @click="titleClicked" style="position: absolute; flex: 1; background-color: #000; left: 0; top: 0;"></div>-->
            </div>
            <div slot="right" class="header-right-wrapper">
                <div class="header-button" @click="filterClicked" v-if="widgetParams.showFilterView&&showFilterView">
                    <bui-icon name="ion-funnel" color="white" @click="filterClicked"></bui-icon>
                </div>
                <div class="header-button">
                    <template v-if="mobileHeaderOperations.length===1">
                        <meta-operation v-if="mobileHeaderOperations[0].icon" btn-type="img" :operation="mobileHeaderOperations[0]" :widget-context="getWidgetContext()"></meta-operation>
                        <meta-operation v-if="!mobileHeaderOperations[0].icon" :operation="mobileHeaderOperations[0]" :widget-context="getWidgetContext()" style="height: 50px; margin-left: -20px;"></meta-operation>
                    </template>
                    <bui-icon v-if="mobileHeaderOperations.length>1" name="ion-ios-more" color="white" @click="titleOperationClicked"></bui-icon>
                </div>
            </div>
        </bui-header>
        <bui-searchbar-center v-if="widgetParams.showSearchbar" @search="onSearch" @clear="onSearchClear" placeholder="请输入搜索内容"></bui-searchbar-center>

        <bui-tabbar :titleSize="30" v-if="widgetParams.isViewMode&&(presetFilters.length>1)" :tabItems="presetFilters" showSelectedLine=true @change="onItemChange" v-model="currentTab" :background="'#fff'" :selectedBackground="'#fff'" :containerStyle="{'border-bottom-color': '#F2F2F2','border-bottom-width': '1px','border-bottom-style':'solid'}" ></bui-tabbar>

        <list class="scroller">
            <refresh-wrapper @refresh="onrefresh" :isRefreshing="isRefreshing"></refresh-wrapper>
            <cell v-for="(o, index) in listData" :key="index">
                <bui-swipe-cell :height="buiSwipeCellHeight"
                    @click="rowSingleClick(o)"
                    @swipeleft="cellSwiped(o.id)"
                    :ref="o.id"
                    :items="[]"
                    >
                    <template slot="action">
                        <meta-operation class="bui-list-swipe-btn-custom" v-for="(commonOpt,index) in widgetParams.listOperations" :key="index" @triggered="closeSwipeCell(o)" @on_btn_click="selectedItemChange(o)" @successed="onrefresh" btn-type="swipe-cell" :operation="commonOpt" :widget-context="getWidgetContext(o)">
                        </meta-operation>
                    </template>
                    <!-- 布局 0 默认 -->
<!--                    <div class="list-item" v-if="layoutType == '0'" slot="content">
                        <div class="list-item-row">
                            <text class="title-text">{{o.id}}</text>
                        </div>
                    </div>-->
                    <!-- 布局 1 -->
                    <div class="list-item" slot="content">
                        <div class="list-item-row">
                            <text class="title-text">{{getFieldValue(o, p1)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text">{{getFieldValue(o, p2)}}</text>
                            <text class="sub-text">{{getFieldValue(o, p3)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text" style="text-align: right;">{{getFieldValue(o, p4)}}</text>
                            <text class="sub-text" style="text-align: right;">{{getFieldValue(o, p5)}}</text>
                        </div>
                    </div>
                </bui-swipe-cell>
            </cell>
            <cell class="list-item no-data" v-if="listData.length === 0">
                <text class="empty-tips">暂无数据</text>
            </cell>
            <loading-wrapper v-if="!isloadingHide" @loading="onloading" :status="loadingStatus">
            </loading-wrapper>
        </list>

        <bui-dropdown ref="operationsDropdown" :center=false>
            <div v-for="(commonOpt,index) in mobileHeaderOperations" :key="index">
                <meta-operation class="full-column" btn-type="dropdown" :operation="commonOpt" :widget-context="getWidgetContext()">
                </meta-operation>
            </div>
        </bui-dropdown>

        <bui-dropdown ref="dropdown" :center=true>
            <bui-cell v-for="filter in presetFilters" :key="filter.id" :title="filter.title" @cellClick="presetFilterChosen(filter)"></bui-cell>
        </bui-dropdown>


        <bui-popup v-model="showPopup" pos="right" width=600>
            <filter-view
                :filter-check="true"
                :filters="filters"
                :viewDef="viewDef"
                :swaggerEntiyDef="swaggerEntiyDef"
                :engineUrl="engineUrl"
                @filter="customFilterSet"
                @cancel="showPopup = false">
            </filter-view>
        </bui-popup>

<!--
        <bui-loading :show="isShowLoading" :loading-text="loadingText==''?'加载中...':loadingText"></bui-loading>
-->

    </div>
</template>

<script>

import service from '../js/service.js';
import ajax from '../js/ajax.js';
import config from '../js/config.js';
import perm from '../js/perm.js';
import metabase from '../js/metadata/metabase.js';
import _ from '../js/tool/lodash';
import Utils from '../js/tool/utils';
import OperationUtils from '../components/meta_operation/js/operation_utils';
import commonOperation from '../components/meta_operation/js/common_operation.js';
import EventBus from '../js/bus';
import factoryApp from './libs/factory-app.js';
import buiweex from "bui-weex";

const linkapi = require('linkapi');

const globalEvent = weex.requireModule('globalEvent');
const dom = weex.requireModule('dom');

module.exports = {
    props:{
        widgetParams:{
            type:Object,
            required:true
        }
    },
    data() {
        return {
            engineUrl: '',
            entityName: '',
            dataUrlPath: '', // 获取 listData 的 url 路径，不包含 queryParam
            queryParam: {}, // 获取 listData 的 queryParam
            listData: [],
            dataCount:0,//数据总数
            viewDef: {},
            selectFields: [],
            quickSearchableField: [],
            swaggerEntiyDef: {},
            layoutType: "0",
            p1: 'title',
            p2: '',
            p3: '',
            p4: '',
            p5: '',
            presetFilters: [],
            filters: {}, // 高级搜索 filter
            quickSearchFilters: '', // 快捷搜索 filter
            selectedFilter: null, // 预设 filter
            //showDropdown: false,
            showPopup: false,
            showOperationsDropdown:false,
            isRefreshing: false,
            loadingStatus: 'init',
            currentPage: 1,
            pageSize: 10,
            remainingPageParam: {},
            loadingText:"",
            //isShowLoading:false,
            showFilterView:false,//判断是否设置了支持高级搜索的字段
            currentTab:0,//默认选择第一个
            selectedItem:{},//记录选择对象--合并暴露对象
            isloadingHide:false//是否隐藏加载更新
        }
    },
    computed: {
        title() {
            if (this.selectedFilter) {
                return this.selectedFilter.title;
            }
            return '全部'; // 无可用分类时，默认显示‘全部’
        },
        /*presetFilters(){
            return this.widgetParams.views;
        },*/
        grid(){
            return this;
        },
        getDeviceHeight(){
            return ((750/weex.config.env.deviceWidth*weex.config.env.deviceHeight)-70);
        },
        mobileHeaderOperations(){
            var opts=(this.widgetParams&&this.widgetParams.commonOperations);
            var _opts=[];
            _.each(opts,function(opt){
                var terminalType=opt[Utils.operationTermimalTypeField];
                if(terminalType!==1){
                    _opts.push(opt);
                }
            });
            return _opts;
        },
        showDropdown(){
            return this.$refs.dropdown.value
        }
    },
    methods: {
        toPage(queryParam){
            //跳转页面--暴露给外部使用
            buiweex.push(Utils.pageEntry(),queryParam);
        },
        filterClicked() {
            this.showPopup = true;
        },
        customFilterSet(result) {
            // this.$alert(result);
            this.showPopup = false;
            this.filters = result;
            this.refreshData();
        },
        //单击行执行
        rowSingleClick(rowData) {
            var _rowSingleClick=this.widgetParams.rowSingleClick[0];
            var _widgetCtx=this.getWidgetContext(rowData);
            if(!_rowSingleClick.show||_rowSingleClick.hide)return false;
            OperationUtils.operationClick(_rowSingleClick,_widgetCtx,this);
/*
            //目前支持通用操作和脚本操作
            let commonOptName=operation.name;
            if(commonOptName&&commonOperation.createOperation(commonOptName)){
                let commonOpt=commonOperation.createOperation(commonOptName);
                if(commonOpt){
                    operation= _.extend(operation,commonOpt);
                    operation.onclick(_widgetCtx,factoryApp);
                }
            }else if(operation.onClick){//脚本操作
                OperationUtils.execution(operation,_widgetCtx,"beforeExecCode").then((res)=>{
                    if(_.isFunction(operation.onclick)){
                        operation.onClick(_widgetCtx,factoryApp);
                    }else{
                        var onclick=Function('"use strict";return ' + operation.onClick  )();
                        onclick(_widgetCtx,factoryApp);
                    }
                    OperationUtils.execution(operation,_widgetCtx,"afterExecCode")//执行后
                });
            }else if(operation.operationType=="execOperation"){//脚本操作
                let _t = this;
                function cellExecScript() {
                    OperationUtils.execution(operation,_widgetCtx,"beforeExecCode").then((res)=>{
                        if (_.isFunction(_t.implCode)) {
                            _t.implCode(Object.assign(_widgetCtx, operation),factoryApp);
                        } else {
                            var onclick = Function('"use strict";return ' + _t.implCode)();
                            onclick(Object.assign(_widgetCtx, operation),factoryApp);
                        }
                        OperationUtils.execution(operation,_widgetCtx,"afterExecCode")//执行后
                    });
                }
                if(_t.implCode){
                    cellExecScript();
                }else {
                    //获取执行代码
                    config.readRuntimeConfig().then(runtimeConfig => {
                        ajax.get(runtimeConfig["service.metabase.endpoint"]+`/meta_operation/${operation.operationId}`).then(({data})=>{
                            _t.implCode=data.implCode;
                            cellExecScript();
                        });
                    });
                }
            }else if(operation.operationType=="toPage"||operation.operationType=="toOperation"||operation.operationType=="toDynamicPage"){
                //赋予选择值
                var context = _.extend(_widgetCtx, operation);
                if(!context.selectedItem&&context.selectedItems){
                    //按钮放置的是在工具栏
                    this.selectedItem = context.selectedItems[(context.selectedItems.length-1)]
                }else{
                    this.selectedItem=context.selectedItem;
                }
                OperationUtils.setUrlParam(operation,this);
                var pageId=operation.pageId,byOperation= false;
                if(operation.operationType=="toOperation"){
                    byOperation = true;
                }
                OperationUtils.execution(operation,_widgetCtx,"beforeExecCode").then((res)=>{
                    OperationUtils.execution(operation,_widgetCtx,"afterExecCode")//执行后
                    if(operation.operationType=="toDynamicPage"){
                        this.selectedItem.actionParams={"ios":"[aaa] \n pageId=navbar \n entityId=abcdefgh","android":"[aaa] \n pageId=navber \n entityId=abcdefgh"}
                        operation.dynamicPageFunc = function(obj,factoryApp){
                            var _actionParams = {"type":"factoryApp", "pageId":"", "url":"", "params":{}}
                            if(obj.selectedItem&&obj.selectedItem.actionParams){
                                //存在跳入的配置页面
                                var actionParams = ""
                                if(weex.config.env.deviceModel.indexOf("iPhone")==-1){
                                    actionParams = obj.selectedItem.actionParams.ios;
                                }else{
                                    actionParams = obj.selectedItem.actionParams.android;
                                }
                                actionParams = actionParams.split("\n");
                                _.each(actionParams,function(param){
                                    if(param.indexOf("=")!=-1){
                                        param = param.split("=");
                                        _actionParams.params[param[0].replace(/^\s+|\s+$/g,"")]= param[1].replace(/^\s+|\s+$/g,"");
                                    }
                                })
                            }
                            return _actionParams
                        }//模拟校验方法

                        var pageParams={};
                        if(operation.dynamicPageFunc){
                            //进行数据解析
                            if (_.isFunction(operation.dynamicPageFunc)) {
                                this.mustStopRepeatedClick = true;
                                pageParams = operation.dynamicPageFunc(_widgetCtx,factoryApp);
                            } else {
                                var dynamicPageFunc = Function('"use strict";return ' + operation.dynamicPageFunc)();
                                pageParams = dynamicPageFunc(_widgetCtx,factoryApp);
                            }
                        }
                        if(pageParams.type=="factoryApp"){
                            //跳入的是应用工厂应用
                            this.$push(Utils.pageEntry(),Object.assign({pageId:pageParams.pageId},pageParams.params));
                        }else if(pageParams.type=="url"){
                            //跳入的是第三方url
                            let _urlParams = []
                            _.each(pageParams.params,(val,key)=>{
                                _urlParams.push(`${key}=${val}`);
                            });
                            if(pageParams.url.indexOf("?")==-1){pageParams.url+="?"}
                            linkapi.openLinkBroswer(pageParams.url+_urlParams.join("&"));
                        }
                    }else{
                        var queryParam=_.extend({pageId:pageId,byOperation:byOperation}/!*,getIdFromContext()*!/);
                        this.$push(Utils.pageEntry(),queryParam);
                    }
                });
            }
*/
        },
        titleClicked(e) {
            // 没有分类则无动作
            if (!this.presetFilters.length) return;
            if(this.widgetParams.isViewMode) return;
            if(!this.dropdownE){
                dom.getComponentRect(this.$refs.titleText, option => {
                    e.position.x = option.size.left;
                    e.position.width = option.size.width;
                    this.dropdownE = e;//记录下节点的信息.
                    this.$refs.dropdown.show(e);
                });
            }else{
                this.$refs.dropdown.show(this.dropdownE);//不需要再去获取
            }
            //this.showDropdown = true;
        },
        titleOperationClicked(e){
            //通用操作弹窗
            //if (this.widgetParams.commonOperations.length<2) return;
            this.$refs.operationsDropdown.show(e);
            this.operationsDropdown = true;
        },
        presetFilterChosen(filter) {
            this.$refs.dropdown.hide();
            this.selectedFilter = filter;
            this.getView();//获取视图配置和数据
            //this.queryParam.viewId = filter.viewId;
            //this.refreshData();
        },
        onItemChange(index){
            //tap标签模式的切换
            this.selectedFilter = this.presetFilters[index];
            this.getView();//获取视图配置和数据
        },
        // 一些字段的值是 id，通过这个方法将其转换为对应的用于显示的值
        getFieldValue(obj, field) {
            if (obj._data && obj._data[field]) {
                // 对于引用实体字段，读取 _data 里的内容
                // 参考返回的数据结构
                let expandedData = obj._data[field];
                for (let k in expandedData) {
                    return expandedData[k].title;
                }
            } else {
                // 对于非引用实体字段，针对日期作处理
                let fieldDef = this.swaggerEntiyDef.properties[field];
                if (fieldDef&&obj[field]) {
                    //只对格林时间格式处理
                    //undefined
                    try{
                        if(obj[field].indexOf("T")==-1){
                            return obj[field];
                        }
                    }catch (e){

                    }
                    switch (fieldDef.format) {
                        case 'date-time':
                            let d = new Date(obj[field]);
                            var year=d.getFullYear();
                            var moth=d.getMonth()+1;
                            if(moth<10){moth="0"+moth}
                            let date=d.getDate();
                            if(date<10){date="0"+date;}
                            let hour=d.getHours();
                            if(hour<10){hour="0"+hour;}
                            let minute=d.getMinutes();
                            if(minute<10){minute="0"+minute;}
                            let second=d.getSeconds();
                            if(second<10){second="0"+second;}
                            return year+"-"+moth+"-"+date+" "+hour+":"+minute/*d.toLocaleString(undefined, {hour12: false})*/
                        default:

                    }
                }
                return obj[field];
            }
        },
        /**
         * 获取指定页数的数据
         * @param  {Number} page 页码
         */
        fetchData(page) {
            this.queryParam.page_size = this.pageSize;
            this.queryParam.page = page || 1;
            let filtersParts = [];
            // 最终参数里的 filters 由 this.filters, this.quickSearchFilters, this.selectedFilter 三大部分组成
            if (this.filters) {
                for (let k in this.filters) {
                    if (this.filters[k]) filtersParts.push(this.filters[k]);
                }
            }
            if (this.quickSearchFilters) {
                filtersParts.push(this.quickSearchFilters);
            }
            if (this.selectedFilter && this.selectedFilter.value) {
                filtersParts.push(this.selectedFilter.value);
            }
            this.queryParam.filters = filtersParts.join(' and ');
            this.queryParam.total=true;
            return ajax.get(this.dataUrlPath, this.queryParam).then(resp => {
                 factoryApp.stopLoading(this);//关闭加载圈
                //this.isShowLoading = false
                if(resp.headers){
                    this.dataCount = resp.headers["X-Total-Count"]
                }
                if(this.presetFilters[this.currentTab]){
                    if(this.presetFilters[this.currentTab].showCount) {//是否显示数字
                        this.presetFilters[this.currentTab].count = (resp.headers["X-Total-Count"]>0)?`(${resp.headers["X-Total-Count"]})`:"";
                        this.presetFilters[this.currentTab].title = `${this.presetFilters[this.currentTab].text}${this.presetFilters[this.currentTab].count}`;
                    }
                }
                return resp.data;
            });
        },
        refreshData() {
            if (this.isRefreshing) return;
            this.isRefreshing = true;
            this.fetchData(1).then(data => {
                this.dataInited = true; // 控制 viewAppear 时是否刷新页面，只有获取数据成功过才刷新
                this.listData = [];
                this.$forceUpdate();//更新下视图
                //console.log(data);
                let _this = this;
                setTimeout(function(d){
                    //滑块不会进行初始化--需要清空下数据更新视图后再设置
                    _this.listData = data;
                    _this.$forceUpdate();//更新下视图
                },1);
            //this.$forceUpdate();//更新下视图
                this.isRefreshing = false;
                this.currentPage = 1;
                this.loadingStatus = 'init';
                if(this.dataCount<=this.listData.length){
                    this.isloadingHide = true;
                }else{
                    this.isloadingHide = false;
                }
            }).catch(err => {
                this.isRefreshing = false;
                this.$alert("请求失败,请重试");
                //this.$alert(err);
            });
        },
        loadMore() {
            if (this.loadingStatus == 'loading') return;
            this.loadingStatus = 'loading';
            this.fetchData(this.currentPage + 1).then(data => {
                if (data.length) {
                    this.listData = this.listData.concat(data);
                    if(this.dataCount>=this.listData.length){
                        this.isloadingHide = true;
                    }else{
                        this.isloadingHide = false;
                    }
                    this.loadingStatus = 'init';
                    this.currentPage++;
                } else {
                    this.loadingStatus = 'noMore';
                }
            }).catch(err => {
                this.loadingStatus = 'init';
            })
        },
        onrefresh() {
            this.refreshData();
        },
        onloading() {
            this.loadMore();
        },
        onSearch(keyword) {
            let filtersStr = keyword && this.quickSearchableField
                .map(name => `${name} like '%${keyword}%'`)
                .join(' or ')
            this.quickSearchFilters = filtersStr && `(${filtersStr})`; // and 优先级比 or 高，这里先用 () 包裹起来
            this.refreshData();
        },
        onSearchClear() {
            this.quickSearchFilters = '';
            this.refreshData();
        },
        pop() {
            this.$pop();
        },
        viewAppear() {
            // 只在获取过数据，且筛选页面未打开的时候才刷新
            if (this.dataInited && !this.showPopup) {
                this.refreshData();
            }
        },
        viewDisappear() {
            // BUG: Android 上如果绑定 viewdisappear，push 再 pop 页面会报错
        },
        cellSwiped(id) {
            // 当一个 cell 被 swipe 的时候，将之前 open 的 cell close()
            if (this.lastSwipeCellId && this.lastSwipeCellId !== id) {
                let ref = this.$refs[this.lastSwipeCellId][0]; // TODO: 不知道为什么 this.$refs[id] 获得的是一个数组……
                ref.close();
            }
            this.lastSwipeCellId = id;
        },
        closeSwipeCell(o){//操作触发后，需要还原向左滑动出来的按钮区
            let swipeCell = this.$refs[o.id][0];
            swipeCell&&swipeCell.close();
        },
        selectedItemChange(o){
            this.selectedItem = o;//设置下选中数据;
        },
        getViewTotal(){
            //只用于获取数据总数
            _.each(this.presetFilters,(selectedFilter,_index)=>{
                if(!selectedFilter.showCount)return false;//是否显示数字
                let _selectedFilter = selectedFilter;
                let pageParam = this.$getPageParams();
                let viewId = _selectedFilter.viewId;
                let readRuntimeConfigPromise;
                let mobileType = "";
                if((weex.config.env.deviceModel.indexOf("iPhone")!=-1)){
                    mobileType = 2
                }else if((weex.config.env.deviceModel.indexOf("iPhone")==-1)){
                    mobileType = 1
                }
                let setData={terminalType:mobileType};
                if(!viewId&&pageParam.entity){
                    //不存在视图id--则存入实体id
                    setData.getDefaultForm = true;
                    viewId = pageParam.entity;
                }
                let contextPath = this.$getContextPath();
                readRuntimeConfigPromise = config.readRuntimeConfig(contextPath).catch(err => {
                }).then(() => {
                    // 获取视图定义
                    service.getMetaViewDef(viewId,setData).then(viewDef => {
                        if(setData.getDefaultForm&&viewDef.viewFields){
                            //取的是默认视图
                            viewDef = viewDef.viewFields
                        }
                        this.viewDef = viewDef;
                        this.formId = viewDef.metaFormShortId;
                        let params = {
                            filters: viewDef.config.filters, // 过滤
                        };
                        // 排序
                        if (viewDef.config.orderby&&viewDef.config.orderby.length) {
                            params.orderby = viewDef.config.orderby.map(o => `${o.name} ${o.type}`).join(',')
                        }
                        if(_selectedFilter.filterId){
                            params.viewId = _selectedFilter.filterId;
                        }
                        params.page_size = 1;
                        params.page = 1;
                        let filtersParts = [];
                        if (_selectedFilter && _selectedFilter.value) {
                            filtersParts.push(_selectedFilter.value);
                        }
                        params.filters = filtersParts.join('and');
                        params.total=true;
                        service.getEngineUrl(viewDef.projectId).then(engineUrl => {
                            var a = `${engineUrl}/${viewDef.metaEntityName.toLowerCase()}`;
                                ajax.get(`${engineUrl}/${viewDef.metaEntityName.toLowerCase()}`, params).then(resp => {
                                    this.presetFilters[_index].count = (resp.headers["X-Total-Count"]>0)?`(${resp.headers["X-Total-Count"]})`:"";//对应标签的总数

                                    this.presetFilters[_index].title =  `${this.presetFilters[_index].text}${this.presetFilters[_index].count}`;
                                });
                        });
                    });

                });
            });

        },
        getView() {
                factoryApp.startLoading(this);//显示加载圈
                //this.isShowLoading = true;
                this.contextPath = this.$getContextPath();
                globalEvent.addEventListener("androidback", e => {
                    this.$pop();
                });
                globalEvent.addEventListener("resume", e => {
                    this.viewAppear();
                });
                let pageParam = this.$getPageParams();

                let viewId = this.selectedFilter.viewId;
                // 以下变量由外部配置
                // 获取这些变量之后，将其从 pageParam 里删除，pageParam 剩下的参数将会被透传
                //let viewId = pageParam.viewId;
                //delete pageParam.viewId;

                // TODO: 暂时写死删除 title 键，聆客启动时写死带上了这个参数
                //delete pageParam.title;

                this.remainingPageParam = pageParam;

                let readRuntimeConfigPromise;
                /*if (!viewId) {
                    this.$alert('缺少参数 viewId');
                    return;
                }*/
                let mobileType = "";
                if((weex.config.env.deviceModel.indexOf("iPhone")!=-1)){
                    mobileType = 2
                }else if((weex.config.env.deviceModel.indexOf("iPhone")==-1)){
                    mobileType = 1
                }
                let setData={terminalType:mobileType};
                if(!viewId&&pageParam.entity){
                    //不存在视图id--则存入实体id
                    setData.getDefaultForm = true;
                    viewId = pageParam.entity;
                }
                let contextPath = this.$getContextPath();
                config.readRuntimeConfig(contextPath)
                .catch(err => {
                        //this.$alert(err);
                        //this.$toast('读取运行时配置失败');
                }).then(runtimeConfig => {
                    service.init(runtimeConfig.configServerUrl);
                    // 获取视图定义
                    service.getMetaViewDef(viewId,setData).then(viewDef => {
                    if(setData.getDefaultForm&&viewDef.viewFields){
                        //取的是默认视图
                        viewDef = viewDef.viewFields
                    }
                    this.viewDef = viewDef;
                    this.formId = viewDef.metaFormShortId;
                    let params = {
                        filters: viewDef.config.filters, // 过滤
                    };
                    // 选择字段
                    let fields = new Set();
                    fields.add('_data'); // _data 字段里会有冗余信息
                    fields.add('id'); // id 是一定要获取的，否则删改操作都无法进行
                    viewDef.viewFields.forEach(col => {
                        fields.add(col.fieldName)
                        /*if (col.quicksearchable) {
                            this.quickSearchableField.push(col.fieldName);
                        }*/
                        if (col.key) {
                            this.quickSearchableField.push(col.fieldName);
                        }
                        if(col.searchable){
                            this.showFilterView = true;//存在高级筛选 显示按钮
                        }
                    });
                    /*if (viewDef.config.mLayout) {
                        // 处理手机端布局
                        this.layoutType = viewDef.config.mLayout.template;
                        if (this.layoutType == '1') {
                            let layout = viewDef.config.mLayout.params;
                            this.p1 = layout.p1;
                            this.p2 = layout.p2;
                            this.p3 = layout.p3;
                            this.p4 = layout.p4;
                            this.p5 = layout.p5;
                            fields.add(this.p1);
                            fields.add(this.p2);
                            fields.add(this.p3);
                            fields.add(this.p4);
                            fields.add(this.p5);
                        }
                    }*/
                    let layout = viewDef.viewFields;
                    if(layout[0])this.p1 = layout[0]?layout[0].fieldName:"";
                    if(layout[1])this.p2 = layout[1]?layout[1].fieldName:"";
                    if(layout[2])this.p3 = layout[2]?layout[2].fieldName:"";
                    if(layout[3])this.p4 = layout[3]?layout[3].fieldName:"";
                    if(layout[4])this.p5 = layout[4]?layout[4].fieldName:"";
                    fields.add(this.p1);
                    fields.add(this.p2);
                    fields.add(this.p3);
                    fields.add(this.p4);
                    fields.add(this.p5);
                    if(!this.p4&&!this.p5){
                        this.buiSwipeCellHeight = "150"
                    }else{
                        this.buiSwipeCellHeight = "200"
                    }
                    //params.select = Array.from(fields).join(',');
                    // 排序
                    if (viewDef.config.orderby) {
                        params.orderby = viewDef.config.orderby.map(o => `${o.name} ${o.type}`).join(',')
                    }
                    // 预设的过滤器
                    /*if (viewDef.config.multipleFilters.support) {
                     this.presetFilters = viewDef.config.multipleFilters.filters;
                     this.selectedFilter = this.presetFilters.find(f => f.checked);
                     if (this.selectedFilter) {
                     params.viewId = this.selectedFilter.viewId;
                     }
                     }*/
                    if(this.selectedFilter.filterId){
                        params.viewId = this.selectedFilter.filterId;
                    }else if(this.selectedFilter.filterVal){

                    }

                    metabase.initMetabase(viewDef.projectId,true).then(ddd=>{
                        var mentity=metabase.findMetaEntity(viewDef.metaEntityName/*'Activity'*/);
                        this.metaEntity = mentity;
                        this.metaEntity.metaEntityId = viewDef.metaEntityId;
                        this.metaEntity.resourceUrl = this.dataUrlPath;//引擎地址
                    });

                    service.getEngineUrl(viewDef.projectId).then((engineUrl)=>{
                        this.engineUrl = engineUrl;
                        this.entityName = viewDef.metaEntityName;
                        this.entityId = viewDef.metaEntityId;
                        // 转成小写，否则不认
                        this.dataUrlPath = `${engineUrl}/${metabase.lowerUnderscore(viewDef.metaEntityName)}`;
                        this.queryParam = params;
                        service.getSwaggerEntityDef(engineUrl, this.entityName).then(entityDef => {
                            // 对于实体类型的字段，这里构造其 entityResourceUrl，参考以下 swagger.json 片段
                            // "channelId": {
                            //     "x-input": "RefEntity",
                            // },
                            // "channel": {
                            //     "x-target-entity": "Channel",
                            //     "x-join-fields": [
                            //         "channelId"
                            //     ],
                            // },
                            for (let k in entityDef.properties) {
                                let p = entityDef.properties[k];
                                if (p['x-join-fields']) {
                                    let entityRefProp = p['x-join-fields'][0];
                                    let entityName = p['x-target-entity'].toLowerCase();
                                    if (entityDef.properties[entityRefProp]) {
                                        entityDef.properties[entityRefProp].entityResourceUrl = `${engineUrl}/${entityName}`
                                    }
                                }
                            }
                            this.swaggerEntiyDef = entityDef;
                            // 对于 pageParam 里的 query，遇到属于字段的 query 要在获取实体数据时带上
                            /*for (let k in this.swaggerEntiyDef.properties) {
                                if (pageParam[k]) {
                                    params[k] = pageParam[k];
                                }
                            }*/
                            this.refreshData();
                        });
                    });
                })
            }).catch(err => {
                console.log(err)
                //this.$alert(err);
            });
        },
        getWidgetContext(obj){
            //传入操作的上下文内容
            let _t = this,_obj = {};
            if(obj){
                _obj.selectedId = obj.id;
                _obj.selectedItem = obj;//选择的数据对象
            }else{
                _obj.selectedId = _t.selectedItem.id;
                _obj.selectedItem = _t.selectedItem;//选择的数据对象
            }
            if(_t.metaEntity){
                _obj.metaEntity = _t.metaEntity;
                _obj.metaEntityId = _t.metaEntity.metaEntityId;
            }
            _obj.model = this//模型自身
             _obj.widgetParams = _t.widgetParams;//部件参数
            return _obj;
        },
        reload(){
            this.refreshData();
        },
        refresh(){
          //注册刷新事件是facoty-api的refresh方法的范围内
          this.refreshData();
        }
    },
    created(){
        //读取部件参数的设置
        this.pageSize  = this.widgetParams.pageSize||10;//设置的页数

        if(!this.widgetParams.pager){
            this.isloadingHide = true;
        }//是否显示分页

        if(this.widgetParams.views){
            let contextPath = this.$getContextPath(),
                _views = this.widgetParams.views, _getMetaViewDefNumber = 0,_t = this,
                readRuntimeConfigPromise = config.readRuntimeConfig(contextPath).catch(err => {
                        //this.$alert(err);
                        //this.$toast('读取运行时配置失败');
                }).then(runtimeConfig => {
                        factoryApp.init(_t);//初始化全局api的指向
                        service.init(runtimeConfig.configServerUrl);
                        _t.presetFilters = _views;
                        _t.selectedFilter = _views[0];
                        _.each(_views,(view,_i)=>{
                            // 获取视图定义
                            view.text = view.title;//用于记录一下tap文字拼接
                            if(view.default){
                                //默认选择的视图
                                _t.selectedFilter = view;
                                _t.currentTab = _i;
                            }
                            /*if((_i+1)==_views.length){
                                EventBus.$emit("widget-push-title","");
                                _t.getView();//获取视图配置和数据
                            }*/
                            service.getMetaViewFilter(view.filterId).then((res)=>{
                                _getMetaViewDefNumber++;
                                if(res.type==1){
                                    //系统过滤条件
                                    view.filterId = res.queryViewId;
                                }else{
                                    //自定义过滤条件
                                    view.filterId = "";
                                    view.value = res.value;
                                }
                                if(_views.length==_getMetaViewDefNumber){
                                    //请求完成后
                                    EventBus.$emit("widget-push-title","");
                                    _t.getViewTotal();//获取数字
                                    _t.getView();//获取视图配置和数据
                                }
                            });
                        });
                });
            }//获取对应视图下的过滤条件

             _.each(this.widgetParams.rowSingleClick,(button)=>{
                button.show = true;
                button.hide = false;
                button.widgetContext = this.getWidgetContext();
                OperationUtils.showOperation(button).then(res=>{
                    button.show = res;
                })
            });//不是调用 meta-operation 渲染的按钮-需要单独执行校验函数 和显隐处理--会返回

        //滑块默认色调
        _.each(this.widgetParams.listOperations,(button,index)=>{
            if(!index%2){
                button.btnType = "primary"
            }else if(!index%3){
                button.btnType = "success"
            }else{
                button.btnType = "error"
            }
        });//需要设置下默认值

    },
    components: {
        'filter-view': require('../views/filter.vue')
    },
    mounted(){
    }
}
</script>
<style lang="css">
.wrapper{
    flex: 1;
}
.scroller{
    flex: 1;
}
.page-title-wrapper {
    flex-direction: row;
}

.header-right-wrapper {
    flex-direction: row;
    position: relative;
    left: 20px;
}

.page-title {
    color: white;
    font-size: 34px;

}

.header-button {
    padding-bottom: 20px;
    padding-top: 20px;
    /*padding-left: 20px;*/
    padding-right: 20px;
}

.list-item {
    flex-direction: column;
    padding-top: 10px;
    padding-bottom: 20px;
    padding-right: 40px;
}
.list-item-row {
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
}

.title-text {
    color: black;
    font-weight: 500;
    font-size: 33px;
    margin-bottom: 5px;
    flex: 1;
/*
    lines:1;
*/
}

.sub-text {
    font-size: 32px;
    max-width: 400px;
    color: #BEBCBC;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    lines:1;
}

.empty-tips {
    font-size: 32px;
    /*margin-top: 20px;*/
    /*width: 750px;*/
    text-align: center;
    color: #BEBCBC;
}
.no-data{
    /*flex: 1;*/
    height:400px;
    align-items: center;
    justify-content: center;
}
</style>
<style lang="sass" src="bui-weex/src/css/list.scss"></style>
<style src="../styles/common.css"></style>


