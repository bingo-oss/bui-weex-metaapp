<template>
    <div>
        <div class="fixedStyleDiv" :style="fixedDivStyle" v-if="widgetParams.isFixed"></div>
        <div class="fixedStyle" :style="fixedStyle">
            <bui-header :leftItem="{icon: 'ion-ios-arrow-left'}" @leftClick="() =>{this.$pop()}" :backgroundColor="themeBg">
                <div slot="center" class="page-title-wrapper">
                    <text v-for="(tapLabel,index) in tapLabels" class="page-title" :style="{color:(tapLabel.highlight?highlight.color:'#ccc'),opacity:gradualChangeOpacity}" @click="goto(tapLabel,index)">{{tapLabel.name}}</text>
                </div>

                <div slot="right" class="">
                    <!--去聊天功能-->
                    <div class="flex-row">
                        <div v-if="widgetParams.isShowGroup" @click="openGroupChat">
                            <bui-image @click="openGroupChat" width="38px" height="38px" style="margin-right:20px"
                                       src="/image/chat.png"></bui-image>
                            <div class="center" @click="openGroupChat" v-if="unReadGroupMsgCount"
                                 style="position: absolute; right:0; top:0; width:30px;height:30px;border-radius: 14px;background-color: #eb4c52;">
                                <text style="color: #fff;font-size: 20px"
                                      :value="unReadGroupMsgCount>99?'99+':unReadGroupMsgCount"></text>
                            </div>
                        </div>
                        <div class="header-button">
                            <template v-if="mobileHeaderOperations.length===1">
                                <meta-operation btn-type="img" :operation="mobileHeaderOperations[0]" :widget-context="getWidgetContext()"></meta-operation>
                            </template>
                            <bui-icon v-if="mobileHeaderOperations.length>1" name="ion-ios-more" color="white" @click="titleOperationClicked"></bui-icon>
                        </div>
                    </div>
                </div>
            </bui-header>
        </div>

        <bui-dropdown ref="operationsDropdown" :center=false>
            <div v-for="(commonOpt,index) in mobileHeaderOperations" :key="index">
                <meta-operation class="full-column" btn-type="dropdown" :operation="commonOpt" :widget-context="getWidgetContext()">
                </meta-operation>
            </div>
        </bui-dropdown>
    </div>
</template>
<script>
    import service from '../../js/service.js';
    import ajax from '../../js/ajax.js';
    import Config from '../../js/config'
    import perm from '../../js/perm.js';
    import metabase from '../../js/metadata/metabase.js';
    import _ from '../../js/tool/lodash';
    import Utils from '../../js/tool/utils';
    import OperationUtils from '../../components/meta_operation/js/operation_utils';
    import commonOperation from '../../components/meta_operation/js/common_operation.js';
    import EventBus from '../../js/bus';
    import factoryApp from '../libs/factory-app.js';
    import buiweex from "bui-weex";
    const linkapi = require("linkapi");
    const dom = weex.requireModule('dom');
    var globalEvent = weex.requireModule('globalEvent');

    export default {
        props: {
            widgetParams: {
                type: Object,
                required: true
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
                highlight:{
                    //高亮属性
                    color:"#fff"
                },
                fixedStyle:{},
                gradualChangeOpacity:0,
                operationsDropdown:false,
                groupId:"",//群组id
                unReadGroupMsgCount: 0//聊天未读数
            };
        },
        computed:{
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
            fixedDivStyle(){
                return {height:((weex.config.env.deviceModel.indexOf("iPhone")==-1)?90:130)}
            }
        },
        watch:{
            groupId(curVal, oldVal){
                linkapi.registerReceiver(2, curVal);
                globalEvent.addEventListener(curVal, (e)=> {
                    linkapi.getUnreadMessageCountById(curVal, res=> {
                    this.unReadGroupMsgCount = res;
            })
            });
            },
            widgetParams(val){
            }
        },
        methods:{
            titleOperationClicked(e){
                //通用操作弹窗
                //if (this.widgetParams.commonOperations.length<2) return;
                this.$refs.operationsDropdown.show(e);
                this.operationsDropdown = true;
            },
            getWidgetContext(){
                //传入操作的上下文内容
                return {
                    widgetParams:this.widgetParams,
                    module:this,
                    metaEntity:this.metaEntity
                };
            },
            openGroupChat(){
                if (this.groupId == '') {
                    this.checkGroupIsExit(true);
                } else {
                    this.unReadGroupMsgCount = 0;
                    link.startGroupChat([this.groupId, '',false]);
                }
            },
            checkGroupIsExit(isOpen){
                Config.readRuntimeConfig().then(runtimeConfig => {
                    let params = {
                        url: `${runtimeConfig["service.metabase.endpoint"]}/meta_data_group/${this.widgetParams.entityId}/${this.widgetParams.dataId}`,
                        data: {}
                    };
                ajax.get(params.url).then(res => {
                    if (res.ok) {
                    if (!res.data) {
                        if (!isOpen) {
                            return;
                        }
                        this.createGroupAndOpen();
                    } else {
                        this.groupId = res.data;
                        if (isOpen) {
                            linkapi.startGroupChat(this.groupId, null, null)
                        }
                        linkapi.getUnreadMessageCountById(this.groupId, res=> {
                            this.unReadGroupMsgCount = res;
                    })
                    }
                }
            }).catch(error => {
                    //this.$toast(Utils.handleException(error))
                })
            })

            },
            createGroupAndOpen(){
                this.isShowLoading = true;
                this.loadingText = "创建群组中...";
                Config.readRuntimeConfig().then(runtimeConfig => {
                    let params = {
                        url: `${runtimeConfig["service.metabase.endpoint"]}/meta_data_group/${this.widgetParams.entityId}/${this.widgetParams.dataId}/create_group`,
                        data: {}
                    };
                ajax.post(params.url).then(res => {
                    this.isShowLoading = false;
                this.loadingText = "";
                if (res.ok) {
                    this.groupId = res.data;
                    linkapi.execSyncService(1, res=> {
                        linkapi.startGroupChat(this.groupId, null, null);
                }, error=> {
                        //this.$toast(error)
                    });
                    this.$toast("创建群组成功")
                } else {
                    //this.$toast(res.msg)
                }
            }).catch(error => {
                    this.isShowLoading = false;
                this.loadingText = "";
                //this.$toast(Utils.handleException(error))
            })
            })

            },
            goto(tapLabel,index){
                //滚到指定区域
                _.each(this.tapLabels,(tapLabel)=>{
                    tapLabel.highlight = false;
            });
                this.tapLabels[index].highlight = true;
                //const el = this.$parent.$refs.childWidgets[index];
                const el = this.$parent.$refs.childWidgets.filter((obj)=>{
                            if(obj==tapLabel.childWidget){
                    return obj
                }
            })[0];
                this.$parent.dom.scrollToElement(el, {});
                this.gotoOpt = false;
            },
            appear(widget){
                //进入视图
                if(widget){
                    _.each(this.tapLabels,(tapLabel,index)=>{
                        if(tapLabel.childWidget==widget&&!tapLabel.highlight){
                        //this.goto(tapLabel,index);
                        _.each(this.tapLabels,(tapLabel)=>{
                            tapLabel.highlight = false;
                    });
                        tapLabel.highlight = true;
                        return false;
                    }
                });
                }

            },
            disappear(widget,index){
                //离开视图
            },
            pageScrollHandler(e){
                //用于监听容器的滚动
                if(this.widgetParams.isGradualChange){
                    if(e&&(-e.contentOffset.y)<=50){
                        this.gradualChangeOpacity = - e.contentOffset.y/50;//滚动渐显效果
                    }else{
                        this.gradualChangeOpacity = 1;
                    }
                }
            }
        },
        created(){
            if(this.widgetParams.isFixed){
                this.fixedStyle.position="fixed";//进行悬浮
            }
            if(this.widgetParams.groupId)this.groupId = this.widgetParams.groupId;
        },
        mounted(){
            let _this = this;
            this.tapLabels = (this.widgetParams.tapLabels?this.widgetParams.tapLabels:[]);//读取
            this.gradualChangeOpacity = (this.widgetParams.isGradualChange?0:1);//是否开启渐变效果

            let _childWidgets = this.$parent.$refs.childWidgets.filter((obj)=>{
                        let _tagName = obj.$attrs.tagName;
            if(_tagName!="meta-widget-navbar"){
                return obj
            }
        });
            _.each(this.tapLabels,(tapLabel,index)=>{
                tapLabel.childWidget = _childWidgets[index];//记录标签对应的部件对象
            if(!tapLabel.name){
                //标签不存在名称--怎默认读取内嵌部件的名称
                let el = _childWidgets[index];
                if(el){
                    let _name = el.$attrs.widgetName;
                    let _tagName = el.$attrs.tagName;
                    tapLabel.name = _name;
                }
            }
            tapLabel.highlight = false;
        });
            this.tapLabels[0].highlight =  true;
            service.init(Config.serverConfig.configServerUrl); //初始化请求地址
            service.getMetaEntity(_this.widgetParams.entityId).then(res => {
                _this.metaEntity = res;
                _this.metaEntity.resourceUrl = `${_this.metaEntity.project.engine.externalUrl}/${metabase.lowerUnderscore(_this.metaEntity.name)}`;
        });
        }
    }
</script>
<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style src="../../styles/common.css"></style>
<style lang="css">
    .fixedStyleDiv{ height: 90px;}
    .fixedStyle{ top: 0; /*position: fixed;*/ width: 750px; opacity:}
    .page-title-wrapper{ flex-direction: row; flex: 1;}
    .page-title{ flex: 1; height: 90px; text-align: center; line-height: 90px; font-size: 32px; color: #fff;}
</style>
