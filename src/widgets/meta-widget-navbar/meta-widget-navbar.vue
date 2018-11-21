<template>
    <div>
        <div class="fixedStyleDiv" v-if="widgetParams.isFixed"></div>
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
    import factoryApi from '../libs/factory-api.js';
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
                    JSON.stringify
                });
                return _opts;
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
                   module:this
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
                let params = {
                    url: Config.serverConfig.uamUrl + '/webWidget/getOrCreateGroup',
                    data: {
                        sourceId: this.widgetParams.dataId,//数据id
                        entityName: this.widgetParams.entityId//实体id
                    }
                }
                linkapi.get(params).then(res => {
                    if (res.success) {
                        if (res.data.isShowTips) {
                            if (!isOpen) {
                                return;
                            }
                            this.createGroupAndOpen();
                        } else {
                            this.groupId = res.data.groupId;
                            if (isOpen) {
                                linkapi.startGroupChat(this.groupId, null, null)
                            }
                            linkapi.getUnreadMessageCountById(this.groupId, res=> {
                                this.unReadGroupMsgCount = res;
                            })
                        }
                    }
                }).catch(error => {
                    this.$toast(Utils.handleException(error))
                })
            },
            createGroupAndOpen(){
                this.isShowLoading = true;
                this.loadingText = "创建群组中...";
                let params = {
                    url: Config.serverConfig.uamUrl + '/webWidget/getOrCreateGroup',
                    data: {
                        sourceId: this.widgetParams.dataId,//数据id
                        entityName: this.widgetParams.entity,//实体id
                        isConfirmCreate: 1
                    }
                }
                linkapi.get(params).then(res => {
                    this.isShowLoading = false;
                    this.loadingText = "";
                    if (res.success) {
                        this.groupId = res.data.groupId;
                        linkapi.execSyncService(1, res=> {
                            linkapi.startGroupChat(this.groupId, null, null);
                        }, error=> {
                            this.$toast(error)
                        });
                        this.$toast("创建群组成功")
                    } else {
                        this.$toast(res.msg)
                    }
                }).catch(error => {
                    this.isShowLoading = false;
                    this.loadingText = "";
                    this.$toast(Utils.handleException(error))
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
            appear(widget,index){
                //进入视图
                _.each(this.tapLabels,(tapLabel)=>{
                    tapLabel.highlight = false;
                });
                _.each(this.tapLabels,(tapLabel,index)=>{
                    if(tapLabel.childWidget==widget){
                        //this.goto(tapLabel,index);
                        tapLabel.highlight = true;
                    }
                });
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
            },
            exportParams(){
                //本部件暴露的参数
                return Object.assign({},this.widgetParams)
            }
        },
        created(){
            if(this.widgetParams.isFixed){
                this.fixedStyle.position="fixed";//进行悬浮
            }
            if(this.widgetParams.groupId)this.groupId = this.widgetParams.groupId;
        },
        mounted(){

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
