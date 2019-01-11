<template>
    <div class="wrapper">
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
                            <text class="title-text">{{o.proc_name}}</text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text">{{o.send_name}}</text>
                            <text class="sub-text"></text>
                        </div>
                        <div class="list-item-row">
                            <text class="sub-text"></text>
                            <text class="sub-text"></text>
                        </div>
                    </div>
                </bui-swipe-cell>
            </cell>

            <cell class="list-item no-data" v-if="listData.length === 0">
                <text class="empty-tips">暂无数据</text>
            </cell>
            <loading-wrapper @loading="onloading" :status="loadingStatus">
            </loading-wrapper>
        </list>
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
    import EventBus from '../../js/bus';
    import factoryApp from '../libs/factory-app.js';

    const linkapi = require('linkapi');
    import buiweex from "bui-weex";

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
                queryParam: {}, // 获取 listData 的 queryParam
                listData: [],
                isRefreshing: false,
                loadingStatus: 'init',
                currentPage: 1,
                size: 10,
                remainingPageParam: {},
            }
        },
        computed: {
            grid(){
                return this;
            },
            code(){
                //企业code--目前对应企业的解析机制
                return this.widgetParams.code;
            }
        },
        methods: {
            toPage(queryParam){
              //跳转页面--暴露给外部使用
              buiweex.push(Utils.pageEntry(),queryParam);
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
                if(operation.onclick){//脚本操作
                    if(_.isFunction(operation.onclick)){
                        operation.onclick(Object.assign(_widgetCtx,operation),{operation:operation});
                    }else{
                        var onclick=Function('"use strict";return ' + operation.onclick  )();
                        onclick(Object.assign(_widgetCtx,operation),{operation:operation});
                    }
                }
            },
            /**
             * 获取指定页数的数据
             * @param  {Number} page 页码
             */
            fetchData(page) {
                let _t = this;
                _t.queryParam = Object.assign({
                    method:'GET',
                    body: {

                    },
                    type:"text"
                },_t.widgetParams.oaList);

                if(_t.queryParam.method=="GET"){
                    _t.queryParam.url +="&curpage="+page+"&pagesize="+_t.size;
                }
                _t.isShowLoading = true;
                return ajax.request(_t.queryParam).then((res)=>{
                    _t.isShowLoading = false;
                    let _data = [];
                    _.each(_t.getXmlTagNameContent(res.data,"item"),(item,index)=>{
                        _data.push({
                            Data_ID:_t.liftOff(_t.getXmlTagNameContent(item, "data_id").join(""),"data_id"),
                            Proc_ID:_t.liftOff(_t.getXmlTagNameContent(item, "proc_id").join(""),"proc_id"),
                            Entr_ID:_t.liftOff(_t.getXmlTagNameContent(item, "entr_id").join(""),"entr_id"),
                            Entr_Type:_t.liftOff(_t.getXmlTagNameContent(item, "entr_stat").join(""),"entr_stat"),
                            proc_name:_t.liftOff(_t.getXmlTagNameContent(item, "proc_name").join(""),"proc_name"),
                            send_name:_t.liftOff(_t.getXmlTagNameContent(item, "send_name").join(""),"send_name"),
                        });
                    });
                    return _data;
                });
            },
            refreshData() {
                if (this.isRefreshing) return;
                this.isRefreshing = true;
                this.fetchData(1).then(data => {
                    this.dataInited = true; // 控制 viewAppear 时是否刷新页面，只有获取数据成功过才刷新
                    this.listData = data;
                    this.isRefreshing = false;
                    this.currentPage = 1;
                    this.loadingStatus = 'init';
                }).catch(err => {
                    this.isRefreshing = false;
                    this.$alert(err);
                });
            },
            loadMore() {
                if (this.loadingStatus == 'loading') return;
                this.loadingStatus = 'loading';
                this.fetchData(this.currentPage + 1).then(data => {
                    if (data.length) {
                        this.listData = this.listData.concat(data);
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
            pop() {
                this.$pop();
            },
            viewAppear() {
                // 只在获取过数据，且筛选页面未打开的时候才刷新
                this.refreshData();
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
                this.remainingPageParam = this.$getPageParams();
                this.refreshData();
            },
            getWidgetContext(obj){
                //传入操作的上下文内容
                let _t = this,_obj = {};
                if(obj){
                    _obj.selectedId = obj.id;
                    _obj.selectedItem = obj;
                }
                return Object.assign({grid:_t},_obj);
            },
            reload(){
                this.refreshData();
            },
            getXmlTagNameContent(data,tagName){
                var reg = new RegExp(`<${tagName}>(.(?!${tagName}))+<\/${tagName}>`, "g");
                return data.match(reg)
            },
            liftOff(str,tagName){
                //提除多余字符
                return str.replace("<"+tagName+">","").replace("</"+tagName+">","").replace("<![CDATA[","").replace("]]>","")
            }
        },
        created(){
            EventBus.$emit("widget-push-title","待办");
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

