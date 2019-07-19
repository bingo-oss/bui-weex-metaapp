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
                        <meta-operation v-if="mobileHeaderOperations[0].icon" btn-type="icon" :operation="mobileHeaderOperations[0]" :widget-context="getWidgetContext()"></meta-operation>
                        <meta-operation v-if="!mobileHeaderOperations[0].icon" :operation="mobileHeaderOperations[0]" :widget-context="getWidgetContext()" style="height: 50px; margin-left: -20px;"></meta-operation>
                    </template>
                    <bui-icon v-if="mobileHeaderOperations.length>1" name="ion-ios-more" color="white" @click="titleOperationClicked"></bui-icon>
                </div>
            </div>
        </bui-header>
        <bui-tabbar :titleSize="30" v-if="widgetParams.isViewMode&&(presetFilters.length>1)" :tabItems="presetFilters" showSelectedLine=true @change="onItemChange" v-model="currentTab" :background="'#fff'" :selectedBackground="'#fff'" :containerStyle="{'border-bottom-color': '#F2F2F2','border-bottom-width': '1px','border-bottom-style':'solid'}" ></bui-tabbar>
        <template v-for="searchbar in searchbars">
            <bui-searchbar-center v-if="widgetParams.showSearchbar" @search="onSearch" @clear="onSearchClear" placeholder="请输入搜索内容" @input="onInput"></bui-searchbar-center>
        </template>
        <list class="scroller">
            <refresh-wrapper @refresh="onrefresh" :isRefreshing="isRefreshing"></refresh-wrapper>
            <cell v-for="(o, index) in listData" @appear="buiCellAppear(o)">
                <bui-swipe-cell
                        @click="rowSingleClick(o)"
                        @swipeleft="cellSwiped(o.id)"
                        :items="[]"
                        :ref="o.id"
                        :height="o.swipeHeight>buiSwipeCellDefaultHeight?o.swipeHeight:buiSwipeCellDefaultHeight"
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
                    <div class="list-item" slot="content" :ref="'title_'+o.id">
                        <div class="list-item-row">
                            <text class="title-text">{{getFieldValue(o, p1)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text" :style="{'max-width':(p3?'400px':'700px')}">{{getFieldValue(o, p2)}}</text>
                            <text class="sub-text">{{getFieldValue(o, p3)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text" :style="{'max-width':(p5?'400px':'700px')}" style="text-align: right;">{{getFieldValue(o, p4)}}</text>
                            <text class="sub-text" style="text-align: right;">{{getFieldValue(o, p5)}}</text>
                        </div>
                    </div>
                </bui-swipe-cell>
            </cell>
            <cell class="list-item no-data" v-if="listData.length === 0">
                <text class="empty-tips">暂无数据</text>
            </cell>
            <loading-wrapper v-if="!isloadingHide&&listData.length>=10" @loading="onloading" :status="loadingStatus">
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
                isloadingHide:false,//是否隐藏加载更新
                searchbars:[1],//为了改变input的值不清空现象
                buiSwipeCellDefaultHeight:180,//默认列表高度
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
                this.selectedItem = rowData;//设置点击对象
                var _rowSingleClick=this.widgetParams.rowSingleClick[0];
                var _widgetCtx=this.getWidgetContext(rowData);
                if(!_rowSingleClick.show||_rowSingleClick.hide)return false;
                OperationUtils.setUrlParam(_rowSingleClick, this); //按钮输入参数处理
                OperationUtils.operationClick(_rowSingleClick,_widgetCtx,this);
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
                let _this = this;
                if (obj._data && obj._data[field]) {
                    // 对于引用实体字段，读取 _data 里的内容
                    // 参考返回的数据结构
                    let expandedData = obj._data[field];
                    for (let k in expandedData) {
                        return expandedData[k].title;
                    }
                } else {
                    // 对于非引用实体字段，针对日期作处理
                    let fieldDef = this.swaggerEntiyDef.properties&&this.swaggerEntiyDef.properties[field];

                    //处理一些字段的存储数据
                    if(fieldDef){
                        let inputType = fieldDef['x-input']
                        switch (inputType) {
                            case "SingleSelect": {
                                if(_this.metaEntity.fields[field]){
                                    let _inputTypeParams = _this.metaEntity.fields[field].inputTypeParams
                                    if(_inputTypeParams){
                                        let _textL = _inputTypeParams.options.filter((option)=>{return option.id==obj[field]});
                                        if(_textL&&_textL.length){
                                            return _textL[0].text;
                                        }

                                    }
                                }
                            }
                            default:
                        }
                    }

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
                if(this.widgetParams.pager){
                    this.queryParam.page_size = this.pageSize;
                    this.queryParam.page = page || 1;
                }
                let filtersParts = [];
                //最终参数里的 filters 由 this.filters, this.quickSearchFilters, this.selectedFilter 三大部分组成
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
                if (this.widgetParams && this.widgetParams.filters) {
                    //部件参数,过滤条件
                    filtersParts.push(this.widgetParams.filters);
                }
                this.queryParam.filters = filtersParts.join(' and ');
                this.queryParam.total=true;
                return ajax.get(this.dataUrlPath, this.queryParam).then(resp => {
                    factoryApp.stopLoading(this);//关闭加载圈
                    //this.isShowLoading = false
                    if(resp.headers){
                        this.dataCount = resp.headers["x-total-count"]
                    }
                    if(this.presetFilters[this.currentTab]){
                        if(this.presetFilters[this.currentTab].showCount) {//是否显示数字
                            this.presetFilters[this.currentTab].count = (resp.headers["x-total-count"]>0)?`(${resp.headers["x-total-count"]})`:"";
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
                    this.listData = this.changeData(data);
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
                let _this = this;
                if (this.loadingStatus == 'loading') return;
                this.loadingStatus = 'loading';
                if(!this.widgetParams.pager){
                    setTimeout(()=>{this.loadingStatus = 'init'},10);
                    return
                }
                this.fetchData(this.currentPage + 1).then(data => {
                    if (data.length) {
                        this.listData = this.changeData(this.listData.concat(data));
                        if(this.dataCount<=this.listData.length){
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
            onInput(event){
            },
            onSearch(keyword) {
                if(!keyword){
                    this.inputViewReset();
                }
                let filtersStr = keyword && this.quickSearchableField
                                .map(name => `${name} like '%${keyword}%'`).join(' or ')
                this.quickSearchFilters = filtersStr && `(${filtersStr})`; // and 优先级比 or 高，这里先用 () 包裹起来
                this.refreshData();
            },
            onSearchClear() {
                this.quickSearchFilters = '';
                this.refreshData();
                this.inputViewReset();
            },
            inputViewReset(){
                //重置搜索款结构--解决安卓无法删除输入的文字
                this.searchbars = [];
                setTimeout(()=>{
                    this.searchbars = [1];
            },1)
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
                    let _metabase = metabase.findMetaEntity(_selectedFilter.entityName);//获取设置当前实体
                    let params = {
                        filters: _selectedFilter.value, // 过滤
                        page_size:1,
                        page:1,
                        viewId:_selectedFilter.filterId,
                        orderby:_selectedFilter.orderby
                    };
                    let filtersParts = [];
                    if (_selectedFilter && _selectedFilter.value) {
                        filtersParts.push(_selectedFilter.value);
                    }
                    if (this.widgetParams && this.widgetParams.filters) {
                        //部件参数,过滤条件
                        filtersParts.push(this.widgetParams.filters);
                    }
                    params.filters = filtersParts.join('and');
                    params.total=true;
                    ajax.get(_metabase.engineUrl/*this.config.apiBaseUrl*/+_metabase.entityPath, params).then(resp => {
                        selectedFilter.count = (resp.headers["x-total-count"]>0)?`(${resp.headers["x-total-count"]})`:"";//对应标签的总数
                        selectedFilter.title =  `${this.presetFilters[_index].text}${this.presetFilters[_index].count}`;
                    });
                });
            },
            getView() {
                if(!this.widgetParams.pager){
                    this.isloadingHide = true;
                }//是否显示分页
                factoryApp.startLoading(this);//显示加载圈
                this.contextPath = this.$getContextPath();
                this.remainingPageParam = this.$getPageParams();
                let viewId = this.selectedFilter.viewId;
                // 获取视图定义
                this.metaEntity = metabase.findMetaEntity(this.selectedFilter.entityName);//获取设置当前实体
                this.metaEntity.resourceUrl = this.dataUrlPath = this.metaEntity.engineUrl/*this.config.apiBaseUrl*/+this.metaEntity.entityPath;//完整请求地址
                this.engineUrl = this.metaEntity.engineUrl;
                this.entityName = this.selectedFilter.entityName;
                this.entityId = "";
                let viewDef = this.selectedFilter.viewConfig
                this.viewDef = viewDef;
                this.queryParam = {
                    orderby:this.selectedFilter.orderby,
                    viewId:this.selectedFilter.filterId
                };
                // 支持关键字搜索字段
                if(viewDef.toolbar&&viewDef.toolbar.quicksearch&&viewDef.toolbar.quicksearch.fields){
                    this.quickSearchableField = viewDef.toolbar.quicksearch.fields;
                }
                //存在高级搜索
                if(viewDef.toolbar&&viewDef.toolbar.advanceSearchFields&&viewDef.toolbar.advanceSearchFields.length){
                    this.showFilterView = true;
                }
                /*viewDef.columns.forEach(col => {
                    if (col.key) {
                        this.quickSearchableField.push(col.key);
                    }
                    if(col.searchable){
                        this.showFilterView = true;//存在高级筛选 显示按钮
                    }
                });*/
                let layout = viewDef.columns;
                if(layout[0])this.p1 = layout[0]?layout[0].key:"";
                if(layout[1])this.p2 = layout[1]?layout[1].key:"";
                if(layout[2])this.p3 = layout[2]?layout[2].key:"";
                if(layout[3])this.p4 = layout[3]?layout[3].key:"";
                if(layout[4])this.p5 = layout[4]?layout[4].key:"";
                //定义下默认高度值
                if(!this.p4&&!this.p5){
                    this.buiSwipeCellDefaultHeight = 180;
                }else{
                    this.buiSwipeCellDefaultHeight = 200;
                }
                //this.refreshData();
                service.getSwaggerEntityDef(this.engineUrl, this.entityName).then(entityDef => {
                    for (let k in entityDef.properties) {
                        let p = entityDef.properties[k];
                        if (p['x-join-fields']) {
                            let entityRefProp = p['x-join-fields'][0];
                            let entityName = p['x-target-entity'].toLowerCase();
                            if (entityDef.properties[entityRefProp]) {
                                entityDef.properties[entityRefProp].entityResourceUrl = `${this.engineUrl}/${this.metaEntity.entityPath}`
                            }
                        }
                    }
                    this.swaggerEntiyDef = entityDef;
                    this.refreshData();
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
                    _obj.entityName = _t.metaEntity.name;
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
            },
            buiCellAppear(item){
                //列表--自适应高度
                let _this = this;
                if(_this.$refs[`title_${item.id}`]){
                    if(!item.set){
                        //只进行一次获取,影响性能
                        dom.getComponentRect(_this.$refs[`title_${item.id}`][0], option => {
                            item.swipeHeight = option.size.height;
                        item.set = true;
                        _this.$forceUpdate();
                    });
                    }
                }
            },
            changeData(data){
                //改变数据
                return data;
            }
        },
        created(){
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
            globalEvent.addEventListener("resume", e => {
                this.viewAppear();
            });
            this.pageSize  = this.widgetParams.pageSize||10;//设置的页数
            if(this.widgetParams.views){
                config.getMetabase().then(res=>{
                    //初始化实体信息
                    let contextPath = this.$getContextPath(),
                        _views = this.widgetParams.views,
                        _getMetaViewDefNumber = 0,
                        _t = this;
                        config.readRuntimeConfig(contextPath).catch(err => {}).then(runtimeConfig => {

                            factoryApp.init(this);//初始化全局api的指向
                            service.init(runtimeConfig.configServerUrl);
                            _t.config = runtimeConfig;
                            _t.presetFilters = _views;
                            _t.selectedFilter = _views[0];//默认选择第一个数据范围
                            _.each(_views,(view,_i)=>{
                                // 获取视图定义
                                view.text = view.title;//用于记录一下tap文字拼接
                                if(view.default){
                                    //默认选择的视图
                                    _t.selectedFilter = view;
                                    _t.currentTab = _i;
                                }
                                factoryApp.startLoading(this);//显示加载圈
                                //读取部件参数的设置
                                metabase.findMetaEntity(view.entityName).getPage(view.filterId).then((res)=>{
                                    //读取对应视图配置
                                    view.filterId = res.queryOptions.viewId;//内置条件
                                    view.value = res.queryOptions.filters;//自定义过滤条件
                                    view.viewConfig = res;//存入视图配置--方便切换
                                    if (res.defaultSort) {
                                        view.orderby = `${res.defaultSort.key} ${res.defaultSort.order}`
                                    }else{
                                        //view.orderby = "updatedAt desc";
                                    }//排序字段
                                    if(_views.length==(_i+1)){
                                        //请求完成后
                                        EventBus.$emit("widget-push-title","");
                                        this.getViewTotal();//获取数字
                                        this.getView();//获取视图配置和数据
                                    }
                                });
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
        /*max-width: 400px;*/
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


