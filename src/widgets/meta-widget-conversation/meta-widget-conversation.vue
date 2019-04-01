<template>
    <div class="wrapper">
        <bui-header :leftItem="{icon: 'ion-ios-arrow-left'}" @leftClick="pop" :backgroundColor="themeBg">
            <div slot="center" class="page-title-wrapper">
                <text :ref="'titleText'" class="page-title">{{widgetParams.headerTitle}}</text>
            </div>
            <div slot="right" class="header-right-wrapper">
                <div class="header-button" @click="filterClicked" v-if="showFilterView">
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

        <!--<template v-for="searchbar in searchbars">
            <bui-searchbar-center v-if="widgetParams.showSearchbar" @search="onSearch" @clear="onSearchClear" placeholder="请输入搜索内容" @input="onInput"></bui-searchbar-center>
        </template>-->

        <list class="scroller">
            <refresh-wrapper @refresh="onrefresh" :isRefreshing="isRefreshing"></refresh-wrapper>
            <cell v-for="(o, index) in listData" @appear="buiCellAppear(o)">
                <bui-swipe-cell
                        @swipeleft="cellSwiped(o.id)"
                        :items="[]"
                        :ref="o.id"
                        :height="buiSwipeCellDefaultHeight"
                >
                    <template slot="action">
                        <meta-operation class="bui-list-swipe-btn-custom" v-for="(commonOpt,index) in widgetParams.listOperations" :key="index" @triggered="closeSwipeCell(o)" @on_btn_click="selectedItemChange(o)" @successed="onrefresh" btn-type="swipe-cell" :operation="commonOpt" :widget-context="getWidgetContext(o)">
                        </meta-operation>
                    </template>

                    <div class="list-item-row" slot="content" :ref="'title_'+o.id"
                         @click.stop="rowSingleClick(o)"
                         @touchstart.stop="start(o)"
                         @touchend.stop="end">
                        <div class="list-item-image" v-if="widgetParams.iconField">
                            <bui-image :src="Config.serverConfig.engineService+'/stream?filePath='+o[widgetParams.iconField]" width="80px" height="80px" style="border-radius:40px;"></bui-image>
                        </div>
                        <div class="list-item">
                            <div class="list-item-row">
                                <text class="title-text" :style="{'max-width':(p2?'350px':'600px')}">{{o[widgetParams.aggregateField+"DisplayValue"]}}</text>
                                <text class="sub-text" style="text-align: right;">{{getFieldValue(o, p2)}}</text>
                            </div>
                            <div class="list-item-row">
                                <text class="sub-text" :style="{'max-width':'540px'}">{{getFieldValue(o, p1)}}</text>
                                <div class="sub-text" @click.stop="setRead(o)" :style="{'text-align':'right'}" v-if="widgetParams.countNumber">
                                    <text class="fillet" :style="{'width':((o['_count']>99)?'60px':'40px')}" v-if="o['_count']">{{(o["_count"]>99?'99+':o["_count"])}}</text>
                                </div>
                            </div>
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


        <!--单行事件-->
        <meta-operation class="bui-list-swipe-btn-custom" v-for="(commonOpt,index) in [widgetParams.rowSingleClick[0]]" :ref="'metaOperationRow'" :key="index" :operation="commonOpt" :widget-context="getWidgetContext()">
            <div></div>
        </meta-operation>

        <!--长按事件-->
        <meta-operation class="bui-list-swipe-btn-custom" v-for="(commonOpt,index) in [widgetParams.longPressClick[0]]" :ref="'metaOperationLongPress'" :key="index" :operation="commonOpt" :widget-context="getWidgetContext()">
            <div></div>
        </meta-operation>


    </div>
</template>
<script>

    import service from '../../js/service.js';
    import ajax from '../../js/ajax.js';
    import config from '../../js/config.js';
    import perm from '../../js/perm.js';
    import metabase from '../../js/metadata/metabase.js';
    import _ from '../../js/tool/lodash';
    import Utils from '../../js/tool/utils';
    import OperationUtils from '../../components/meta_operation/js/operation_utils';
    import commonOperation from '../../components/meta_operation/js/common_operation.js';
    import EventBus from '../../js/bus';
    import factoryApp from '../libs/factory-app.js';
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
            let _this = this;
            return {
                Config:config,
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
                selectedItem:{},//记录选择对象--合并暴露对象
                isloadingHide:false,//是否隐藏加载更新
                searchbars:[1],//为了改变input的值不清空现象
                buiSwipeCellDefaultHeight:130,//默认列表高度
                isShow:"",
                conversationParams:{
                    "mainEntity":{
                        "entityName":"",//实体名称
                        "alias":""//别名
                    },
                    "viewId":"",//视图id
                    "filters":"isRead eq 1",//过滤条件
                    "aggregateField":_this.widgetParams.aggregateField||"",//汇总字段名
                    "selectFields":[],// 选中字段，视图的第一个和第二个字段
                    "iconField":_this.widgetParams.iconField||"",// 图标字段名
                    "countNumber":_this.widgetParams.countNumber||true,
                    "countFilters":_this.widgetParams.countFilters||"",// 统计数字角标时的过滤条件
                    "orderBy":_this.widgetParams.orderBy||[],  // 排序字段
                    "page":{}
                },//会话请求参数
                longPressClick:false//标记是否长按操作
            }
        },
        computed: {
            title() {
                if (this.selectedFilter) {
                    return this.selectedFilter.title;
                }
                return '全部'; // 无可用分类时，默认显示‘全部’
            },
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
            setRead(item){
                //设置已读
                let _this = this;
                buiweex.confirm("是否确定全部标为已读?",function(res){
                    if(res=="确定"){
                        return ajax.post(`${_this.engineUrl}/${metabase.lowerUnderscore(_this.entityName)}/${item[_this.widgetParams.aggregateField]}/read`,{}).then(resp => {
                            _this.refresh();//刷新数据
                        });
                    }
                });
            },
            start(rowData) {
                //数据长按
                const self = this;
                self.longPressClick = false;//标记是否长按操作
                self.isShow = setTimeout(()=>{
                    self.longPressClick = true;//标记是否长按操作
                    self.selectedItem = rowData;//设置点击对象
                    if(self.$refs.metaOperationLongPress&&self.$refs.metaOperationLongPress.length){
                        var _operation = self.$refs.metaOperationLongPress[0].$children[0];
                        if(_operation){
                            if(_operation.openMenu)_operation.openMenu();
                            if(_operation.execScript)_operation.execScript();
                        }
                    }
                    //var _longPressClick=self.widgetParams.longPressClick[0];
                    //var _widgetCtx=self.getWidgetContext(rowData);
                    //if(!_longPressClick.show||_longPressClick.hide)return false;
                    //OperationUtils.setUrlParam(_longPressClick, self); //按钮输入参数处理
                    //OperationUtils.operationClick(_longPressClick,_widgetCtx,self);
                },1000);
            },
            end () {
                //结束
                clearTimeout(this.isShow);
                //this.longPressClick = false;//标记是否长按操作

            },
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
                if(this.longPressClick){
                    return false;
                }
                clearTimeout(this.isShow);
                this.selectedItem = rowData;//设置点击对象
                /*var _rowSingleClick=this.widgetParams.rowSingleClick[0];
                var _widgetCtx=this.getWidgetContext(rowData);
                if(!_rowSingleClick.show||_rowSingleClick.hide)return false;
                OperationUtils.setUrlParam(_rowSingleClick, this); //按钮输入参数处理
                OperationUtils.operationClick(_rowSingleClick,_widgetCtx,this);*/
                if(this.$refs.metaOperationRow&&this.$refs.metaOperationRow.length){
                    var _operation = this.$refs.metaOperationRow[0].$children[0];
                    if(_operation){
                        if(_operation.openMenu)_operation.openMenu();//菜单-按钮
                        if(_operation.execScript)_operation.execScript();//脚本-按钮
                    }
                }
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
                if(this.widgetParams.pager){
                    //是否显示分页
                    this.queryParam.page = {index:(page||1),size:this.pageSize}
                }else{
                    delete this.queryParam.page
                }
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
                if (this.widgetParams && this.widgetParams.filters) {
                    //部件参数,过滤条件
                    filtersParts.push(this.widgetParams.filters);
                }
                this.queryParam.filters = filtersParts.join(' and ');
                this.queryParam.total=true;
                return ajax.post(this.dataUrlPath,this.queryParam).then(resp => {
                        factoryApp.stopLoading(this);//关闭加载圈
                        //this.isShowLoading = false
                        if(resp.headers){
                            this.dataCount = resp.headers["X-Total-Count"]
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
                        this.listData = this.listData.concat(data);
                        /*var concat_listData = this.listData.concat(data);
                         this.listData = [];
                         this.$forceUpdate();//更新下视图
                         setTimeout(function(d){
                         //滑块不会进行初始化--需要清空下数据更新视图后再设置
                         _this.listData = concat_listData;
                         _this.$forceUpdate();//更新下视图
                         },1);*/
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
            getView() {
                if(!this.widgetParams.pager){
                    this.isloadingHide = true;
                }//是否显示分页
                factoryApp.startLoading(this);//显示加载圈
                this.contextPath = this.$getContextPath();
                globalEvent.addEventListener("androidback", e => {
                    this.$pop();
                });
                globalEvent.addEventListener("resume", e => {
                    this.viewAppear();
                });
                let pageParam = this.$getPageParams();
                let viewId = this.selectedFilter.viewId;
                this.remainingPageParam = pageParam;
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
                config.readRuntimeConfig(contextPath).catch(err => {
                }).then(runtimeConfig => {
                    service.init(runtimeConfig.configServerUrl);
                    service.getMetaViewDef(viewId,setData).then(viewDef => {
                        if(setData.getDefaultForm&&viewDef.viewFields){
                            //取的是默认视图
                            viewDef = viewDef.viewFields
                        }
                        this.viewDef = viewDef;
                        this.formId = viewDef.metaFormShortId;
                        let params = Object.assign({},this.conversationParams,{
                            "mainEntity":{
                                "entityName":viewDef.metaEntityName,//实体名称
                                "alias":""//别名
                            }
                        });//组装会话部件请求的参数
                        // 选择字段
                        let fields = new Set();
                        fields.add('_data'); // _data 字段里会有冗余信息
                        fields.add('id'); // id 是一定要获取的，否则删改操作都无法进行
                        viewDef.viewFields.forEach(col => {
                            fields.add(col.fieldName);
                            if (col.key) {
                                this.quickSearchableField.push(col.fieldName);
                            }
                            if(col.searchable){
                                this.showFilterView = true;//存在高级筛选 显示按钮
                            }
                        });
                        let layout = viewDef.viewFields;
                        if(layout[0])this.p1 = layout[0]?layout[0].fieldName:"";
                        if(layout[1])this.p2 = layout[1]?layout[1].fieldName:"";
                        fields.add(this.p1);
                        fields.add(this.p2);

                        //设置参数的选择字段,对应视图配置的第1,第2个字段
                        params.selectFields.push(this.p1)
                        params.selectFields.push(this.p2)
                        // 排序
                        if (viewDef.config.orderby) {
                            //合并过滤条件
                            var _orderBy = viewDef.config.orderby;
                            _.each(_orderBy,(orderBy,index)=>{
                                orderBy.orderType = orderBy.type;
                            });
                            params.orderBy = this.widgetParams.orderBy.concat(_orderBy);
                        }

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
                            this.dataUrlPath = `${engineUrl}/aggregate/${metabase.lowerUnderscore(viewDef.metaEntityName)}/latest_info`;
                            this.queryParam = params;
                            service.getSwaggerEntityDef(engineUrl, this.entityName).then(entityDef => {
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
                                this.refreshData();
                            });
                        });
                    })
                }).catch(err => {});
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
            }
        },
        created(){
            //读取部件参数的设置
            this.pageSize  = this.widgetParams.pageSize||10;//设置的页数
            if(this.widgetParams.view){
                if(_.isString(this.widgetParams.view)){
                    this.widgetParams.view = eval('('+this.widgetParams.view+')');
                }
                let contextPath = this.$getContextPath(),
                        _view = this.widgetParams.view, _getMetaViewDefNumber = 0,_t = this,
                readRuntimeConfigPromise = config.readRuntimeConfig(contextPath).catch(err => {}).then(runtimeConfig => {
                  factoryApp.init(_t);//初始化全局api的指向
                  service.init(runtimeConfig.configServerUrl);
                  _t.selectedFilter = _view;
                    service.getMetaViewFilter(_view.filterId).then((res)=>{
                            _getMetaViewDefNumber++;
                            if(res.type==1){
                                //系统过滤条件
                                _view.filterId = res.queryViewId;
                            }else{
                                //自定义过滤条件
                                _view.filterId = "";
                                _view.value = res.value;
                            }
                            _t.getView();//获取视图配置和数据

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
            'filter-view': require('../../views/filter.vue')
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
        flex: 1;
        flex-direction: column;
        padding-top: 20px;
        padding-bottom: 20px;
        padding-right: 40px;
    }
    .list-item-image{
        width: 100px;
        padding-top: 16px;
    }
    .list-item-row {
        flex-direction: row;
        justify-content: space-between;
    }

    .title-text {
        color: black;
        font-weight: 500;
        font-size: 32px;
        margin-bottom: 5px;
        /*flex: 1;*/
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        lines:1;
    }

    .sub-text {
        font-size: 28px;
        max-width: 250px;
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
    .fillet{ border-radius: 80px; background-color: red; color: #fff; font-size: 22px; text-align: center;
        padding-top:8px;
        /*padding-left:8px;
        padding-right:8px;*/
        padding-bottom:8px;
    }
</style>
<style lang="sass" src="bui-weex/src/css/list.scss"></style>
<style src="../../styles/common.css"></style>


