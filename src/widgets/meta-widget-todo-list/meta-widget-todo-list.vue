<template>
    <div class="wrapper">
        <bui-header :leftItem="{icon: 'ion-chevron-left'}" @leftClick="pop">
            <div slot="center" class="page-title-wrapper" @click="titleClicked">
                <text class="page-title" @click="titleClicked">{{title}}</text>
                <bui-icon v-if="presetFilters.length" name="ion-chevron-down" color="white" @click="titleClicked"></bui-icon>
            </div>
            <div slot="right" class="header-right-wrapper">
                <!--<div class="header-button" @click="filterClicked">
                    <bui-icon name="ion-funnel" color="white" @click="filterClicked"></bui-icon>
                </div>-->
                <div class="header-button">
                    <template v-if="mobileHeaderOperations.length===1">
                        <meta-operation  btn-type="icon" :operation="mobileHeaderOperations[0]" :widget-context="getWidgetContext()"></meta-operation>
                    </template>
                    <bui-icon v-if="mobileHeaderOperations.length>1" name="ion-ios-more" color="white" @click="titleOperationClicked"></bui-icon>
                </div>
            </div>
        </bui-header>
        <!--<bui-searchbar-center @search="onSearch" @clear="onSearchClear" placeholder="请输入搜索内容"></bui-searchbar-center>-->
        <list class="scroller">
            <refresh-wrapper @refresh="onrefresh" :isRefreshing="isRefreshing"></refresh-wrapper>

            <cell v-for="(o, index) in listData" :key="index">
                <bui-swipe-cell height="200px"
                                @click="rowSingleClick(o)"
                                @swipeleft="cellSwiped(o.id)"
                                :ref="o.id"
                >
                    <template slot="action">
                        <meta-operation class="bui-list-swipe-btn-custom" v-for="(commonOpt,index) in widgetParams.singleOperations" :key="index" @triggered="closeSwipeCell(o.id)" btn-type="swipe-cell" :operation="commonOpt" :widget-context="getWidgetContext(o)">
                        </meta-operation>
                    </template>

                    <div class="list-item" slot="content">
                        <div class="list-item-row">
                            <text class="title-text">{{getFieldValue(o.processInstance, p1)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text">{{getFieldValue(o.processInstance, p2)}}</text>
                            <text class="sub-text">{{getFieldValue(o.processInstance, p3)}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text">{{getFieldValue(o, p4)}}</text>
                            <text class="sub-text">{{getFieldValue(o.processInstance, p5)}}</text>
                        </div>
                    </div>
                </bui-swipe-cell>
            </cell>

            <cell class="list-item no-data" v-if="listData.length === 0">
                <text class="empty-tips">暂无数据</text>
            </cell>
            <!-- 在数据长度小于 size 时，说明已经没有更多数据了 -->
            <loading-wrapper v-if="listData.length && listData.length >= size" @loading="onloading" :status="loadingStatus">
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


        <!--<bui-popup v-model="showPopup" pos="right" width=600>
            <filter-view
                    :filters="filters"
                    :viewDef="viewDef"
                    :swaggerEntiyDef="swaggerEntiyDef"
                    :engineUrl="engineUrl"
                    @filter="customFilterSet"
                    @cancel="showPopup = false">
            </filter-view>
        </bui-popup>-->
    </div>
</template>

<script>

    import service from '../../js/service.js';
    import ajax from '../../js/ajax.js';
    import config from '../../js/config.js';
    import perm from '../../js/perm.js';
    import metabase from '../../js/metadata/metabase.js';
    import _ from '../../js/tool/lodash.js'
    import Utils from '../../js/tool/utils';
    import OperationUtils from '../../components/meta_operation/js/operation_utils';
    import commonOperation from '../../components/meta_operation/js/common_operation.js';

    const linkapi = require('linkapi');
    const buiweex = require('bui-weex');

    const globalEvent = weex.requireModule('globalEvent');

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
                selectFields: [],
                quickSearchableField: [],
                swaggerEntiyDef: {},
                p1: 'name',
                p2: 'processDefinitionName',
                p3: 'startUserName',
                p4: 'name',
                p5: {
                    key:"startDate",
                    type:"date-time"
                },
                //presetFilters: [],
                filters: {}, // 高级搜索 filter
                quickSearchFilters: '', // 快捷搜索 filter
                selectedFilter: null, // 预设 filter
                showDropdown: false,
                showPopup: false,
                showOperationsDropdown:false,
                isRefreshing: false,
                loadingStatus: 'init',
                currentPage: 1,
                size: 10,
                remainingPageParam: {},
            }
        },
        computed: {
            title() {
                if (this.selectedFilter) {
                    return this.selectedFilter.title;
                }
                return '全部'; // 无可用分类时，默认显示‘全部’
            },
            presetFilters(){
                return this.widgetParams.views||[];
            },
            grid(){
                return this;
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
            // 查看选中记录的主页
            rowSingleClick(rowData) {
                if(!this.widgetParams.rowSingleClick)return
                var _rowSingleClick=this.widgetParams.rowSingleClick;
                var _widgetCtx=this.getWidgetContext(rowData);
                var operation=OperationUtils.expandOperation(_rowSingleClick,{
                    operation:_rowSingleClick,
                    widgetContext:_widgetCtx
                });
                let commonOptName=operation.name;
                let commonOpt=commonOperation.createOperation(commonOptName);
                if(commonOpt){
                    operation= _.extend(operation,commonOpt);
                    operation.onclick(_widgetCtx,{operation:operation});
                }
            },
            titleClicked(e) {
                // 没有分类则无动作
                if (!this.presetFilters.length) return;
                this.$refs.dropdown.show(e);
                this.showDropdown = true;
            },
            titleOperationClicked(e){
                //通用操作弹窗
                //let _t = this;
                if (!this.widgetParams.commonOperations.length<2) return;
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
                if (obj && typeof field=="string") {
                    return obj[field]
                } else if(typeof field!="string") {
                    // 对于非直接调用的字段处理
                    switch (field.type) {
                        case 'date-time':
                            let d = new Date(obj[field.key]);
                            return Utils.formatDate(d);
                        default:
                    }
                    return obj[field.key];
                }
            },
            /**
             * 获取指定页数的数据
             * @param  {Number} page 页码
             */
            fetchData(page) {
                this.queryParam.size = this.size;
                this.queryParam.page = page || 0;
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
                    filtersParts.push(this.selectedFilter.value)
                }
                this.queryParam.filters = filtersParts.join(' and ');
                this.queryParam.total = true;
                return ajax.get(this.dataUrlPath, this.queryParam).then(resp => {
                    return resp.data;
                })
            },
            refreshData() {
                if (this.isRefreshing) return;
                this.isRefreshing = true;
                this.fetchData(0).then(data => {
                    this.dataInited = true; // 控制 viewAppear 时是否刷新页面，只有获取数据成功过才刷新
                    this.listData = data["_embedded"]["qTasks"];
                    this.isRefreshing = false;
                    this.currentPage = 1;
                    this.loadingStatus = 'init';
                }).catch(err => {
                    this.isRefreshing = false;
                    this.$alert(err);
                })
            },
            loadMore() {
                if (this.loadingStatus == 'loading') return;
                this.loadingStatus = 'loading';
                this.fetchData(this.currentPage + 1).then(data => {
                    if (data&&data["_embedded"]&&data["_embedded"]["qTasks"].length) {
                        this.listData = this.listData.concat(data["_embedded"]["qTasks"]);
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
                let filtersStr = keyword && this.quickSearchableField.map(name => `${name} like '%${keyword}%'`).join(' or ')
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
            closeSwipeCell(id){//操作触发后，需要还原向左滑动出来的按钮区
                let swipeCell = this.$refs[id][0];
                swipeCell&&swipeCell.close();
            },
            getView() {
                this.contextPath = this.$getContextPath();
                globalEvent.addEventListener("androidback", e => {
                    this.$pop();
                });
                globalEvent.addEventListener("resume", e => {
                    this.viewAppear();
                });
                this.remainingPageParam = this.$getPageParams();;
                let contextPath = this.$getContextPath();
                config.readRuntimeConfig(contextPath).catch(err => {
                    this.$alert(err);
                    this.$toast('读取运行时配置失败');
                }).then(runtimeConfig => {
                    this.dataUrlPath = runtimeConfig["service.activiti.runtime.endpoint"]+'/v1/tasks/todo';
                    this.refreshData();
                })
            },
            getWidgetContext(obj){
                //传入操作的上下文内容
                let _t = this,_obj = {};
                if(obj){
                    _obj.selectedId = obj.id;
                    _obj.selectedItem = obj;
                }
                return Object.assign({grid:_t,metaEntity:_t.metaEntity,entityName:_t.entityName},_obj);
            },
            reload(){
                this.refreshData();
            }
        },
        created(){
            if(this.widgetParams.defaultView) {
                this.selectedFilter = this.widgetParams.defaultView;
            }
            this.getView();//获取数据
        },
        components: {
            'filter-view': require('../../views/filter.vue')
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
        padding-left: 20px;
        padding-right: 20px;
    }

    .list-item {
        flex-direction: column;
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
    }

    .sub-text {
        font-size: 32px;
        max-width: 400px;
        color: #BEBCBC;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .empty-tips {
        font-size: 32px;
        /*margin-top: 20px;*/
        /*width: 750px;*/
        text-align: center;
        color: #BEBCBC;
    }
    .no-data{
        flex: 1;
        align-items: center;
        justify-content: center;
    }
</style>
<style lang="sass" src="bui-weex/src/css/list.scss"></style>
<style src="../../styles/common.css"></style>

