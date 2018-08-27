<template>

    <div class="flex-column" @viewappear="onViewAppear" @viewdisappear="onViewDisAppear">

        <!--头部导航区-->
        <div class="header-color">
            <div style="height: 40px;" v-if="iosFixed"></div>
            <div class="flex-row header-content">
                <div class="flex1 row-center-top header-left">
                    <bui-icon @click="onBack" name="ion-ios-arrow-left" size="48px" color="#ffffff"></bui-icon>
                </div>
                <div class="flex1 row-center-bottom header-right">
                    <div class="flex-row">
                        <bui-image v-if="isShowGroup" width="38px" height="38px" style="margin-left:30px"
                                   src="/image/chat.png" @click="openGroupChat"></bui-image>
                        <bui-image style="margin-left:30px;" @click="showAttentionDrop($event)" width="38px"
                                   height="38px"
                                   :src="isPersonalAttention?'/image/attention_checked.png':'/image/attention_unchecked.png'"></bui-image>
                        <bui-image width="38px" height="38px" style="margin-left:30px;" @click="showShareAction"
                                   src="/image/share.png"></bui-image>
                    </div>
                    <div v-if="unReadGroupMsgCount>0&&isShowGroup" class="center"
                         style="position: absolute;top: 15px;right: 140px;width:30px;height:30px;border-radius: 14px;background-color: #eb4c52;">
                        <text style="color: #fff;font-size: 20px"
                              :value="unReadGroupMsgCount>99?'99+':unReadGroupMsgCount"></text>
                    </div>
                </div>
            </div>
        </div>

        <!--头部内容区-->
        <div class="header-color" ref="header">
            <div class="head_content">
                <div class="flex-row" style="align-items: center">
                    <div v-if="isArchive"
                         style="background-color: #ff840c;padding-left: 10px;padding-right: 10px;padding-top: 5px;padding-bottom: 5px;margin-right: 20px;border-radius: 10px">
                        <text style="color: #ffffff;font-size: 32px">已归档</text>
                    </div>
                    <text class="head_content_title" :value="activityInfo.name" @click="openActivityDetail"></text>
                </div>
                <div class="flex-row"  @click="openActivityDetail">
                    <text v-if="activityInfo.startTime" class="head_content_subTitle" value="开始时间:"></text>
                    <text class="head_content_subTitle" :value="activityInfo.startTime"></text>
                    <text v-if="activityInfo.channelName" class="head_content_subTitle" style="margin-left: 30px" value="所属频道:"></text>
                    <text class="head_content_subTitle" style="flex: 1;lines:1;text-overflow: ellipsis;"
                          :value="activityInfo.channelName"></text>
                </div>
            </div>

            <div class="flex-row center option_list">
                <div class="flex1 flex-row center border-right" @click="openActivityDetail">
                    <bui-image class="members-img" width="26px" height="26px"
                               src="/image/combined.png"></bui-image>
                    <text class="option_font">详情</text>
                </div>
                <div class="flex1 flex-row center border-right" @click="openMemberList">
                    <bui-image class="members-img" width="26px" height="26px"
                               src="/image/members.png"></bui-image>
                    <text class="option_font" :value="getMemberCount"></text>
                </div>

                <div class="flex1 flex-row center border-right" @click="openNoticeList">
                    <bui-image class="members-img" width="26px" height="26px"
                               src="/image/notice.png"></bui-image>
                    <text class="option_font" :value="getNoticeCount"></text>
                </div>
                <div class="flex1 flex-row center" @click="onRelatedBusiness">
                    <bui-image class="members-img" width="26px" height="26px"
                               src="/image/related.png"></bui-image>
                    <text class="option_font" :value="getRelatedCount"></text>
                </div>
            </div>
        </div>

        <div class="flex1">
            <!--筛选-->
            <div v-if="isShowFilter" class="flex-row filter">
                <div class="flex1" style="margin-left: 30px;">
                    <text style="font-size: 25px;color: #9d9d9d">以下是根据条件筛选的结果</text>
                </div>
                <div>
                    <bui-icon name="ion-close-circled" size="30px"
                              style="margin-right: 20px" @click="clearFilter"></bui-icon>
                </div>
            </div>

            <!--动态tab栏-->
            <div v-if="!isShowFilter&&tabItems.length>0" class="flex-row tab_list">
                <div class="flex-row flex1 center" v-for="(item,index) in tabItems" style=""
                     @click="onTabClick(index,item,$event)">
                    <div class="flex1 center flex-row">
                        <div class="center flex-row"
                             :style="{'margin-top':'4px','height': '80px','border-bottom-width': '6px','border-bottom-style': 'solid','padding-left': '5px','padding-right': '5px','border-bottom-color': tabActive==index?'#0088fb':'transparent'}">
                            <text :class="[tabTextStyle(index)]">{{item.title}}</text>
                        </div>
                        <bui-icon v-if="index==5" name="ion-ios-arrow-down" size="30"></bui-icon>
                        <!--index==5为更多菜单更多菜单时显示-->
                    </div>
                    <!--<div class="separator_line2"></div>-->
                </div>
            </div>
            <!--更多-下拉菜单-->
            <bui-dropdown v-model="showDropdown" ref="dropdown">
                <div class="center dropDown-cell" v-for="(item,i) in tabMoreMenuList" @click="onMoreMenuClick(i)">
                    <text class="dropDown-text" :value="item.title"></text>
                </div>
            </bui-dropdown>

            <bui-dropdown v-model="showAttentionDropdown" ref="attentionDropdown">
                <div class="center">
                    <div class="center" style="height: 70px">
                        <text style="font-size: 28px" @click="personalConcern"
                              :value="isPersonalAttention?'取消个人关注':'个人关注'"></text>
                    </div>
                    <div class="center" style="height: 70px">
                        <text v-if="isAdmin" style="font-size: 28px;" @click="allConcern"
                              :value="isAllAttention?'取消全体关注':'全体关注'"></text>
                    </div>
                </div>
            </bui-dropdown>

            <bui-actionsheet
                    :items="shareItems"
                    v-model="showShareActionSheet"
                    title="请选择类型"
                    @itemClick="onSelectShareType"
                    ref="shareActionSheet"></bui-actionsheet>

            <!--置顶消息-->
            <div>
                <scroller style="max-height: 450px">
                    <div v-for="(item,i) in topMessageList"
                         style="margin-top: 2px;padding-left: 10px;background-color: #ffe3db;"
                         @click="onTopMessageClick(item,i)">
                        <div style="height:80px;align-items: center" class="flex-row"
                             v-if="(item.msgType==0||item.msgType==1)&&item.dataJson&&item.dataJson.blogInfo">
                            <div class="flex-row center flex1">
                                <text style="color:#0088fb;font-size: 30px"
                                      :value="item.msgType==0?item.dataJson.blogInfo.accountName:item.dataJson.currentCommentData.userName"></text>
                                <text style="color:#0088fb;font-size: 30px;margin-left:10px"
                                      :value="item.msgType==0?'@我':'回复我'"></text>
                                <div class="flex1" style="justify-content: center;">
                                    <text style="font-size: 30px;margin-left: 10px;color: #484848;lines:1;text-overflow: ellipsis;"
                                          :value="getBlogMsgContent(item)"></text>
                                </div>
                            </div>
                            <div class="row-right-bottom">
                                <bui-icon name="ion-ios-arrow-forward"></bui-icon>
                            </div>
                        </div>
                        <!--公告消息-->
                        <div style="height:100px;align-items: center" class="flex-row"
                             v-if="item.msgType==2&&item.dataJson">
                            <div>
                                <bui-image width="55px" height="55px" src="/image/notice2.png"></bui-image>
                            </div>
                            <div class="flex-column flex1" style="height: 100px;flex:1;justify-content:center;">
                                <div class="flex1 column-left-bottom">
                                    <text style="font-size: 32px;margin-left: 15px;color: #ff751f;lines:1;text-overflow: ellipsis;"
                                          :value="item.dataJson.title"></text>
                                </div>
                                <div class="flex1">
                                    <text style="font-size: 26px;margin-left: 15px;color: #727272;lines:1;text-overflow: ellipsis;"
                                          :value="item.dataJson.content"></text>
                                </div>
                            </div>
                            <div class="row-right-bottom" style="margin-right: 5px">
                                <bui-icon name="ion-ios-arrow-forward"></bui-icon>
                            </div>
                        </div>

                        <div style="background-color: #ffe3db;height:80px;align-items: center" class="flex-row"
                             v-if="item.msgType==3&&item.dataJson">
                            <div>
                                <text style="font-size: 30px;color: #0088fb"
                                      :value="item.dataJson.name+'通过分享链接申请加入'"></text>
                            </div>
                            <div class="flex1 row-right-bottom">
                                <bui-icon name="ion-ios-arrow-forward"></bui-icon>
                            </div>
                        </div>
                    </div>
                </scroller>
            </div>

            <!--动态内容-->
            <div style="flex: 1;">
                <dynamic-item ref="blog" :isAdmin="isAdmin" :isArchive="isArchive" @refresh="onRefresh"></dynamic-item>
            </div>

            <!--底部菜单-->
            <div class="flex-row bottom-box" v-if="isShowBottomMenu">
                <div class="flex1 flex-row center" @click="onWriteClick">
                    <bui-icon name="ion-navicon" size="30"></bui-icon>
                    <text class="bottom-text">撰写</text>
                </div>
                <div class="separator_line3" v-if="createMenuList.length>0"></div>
                <div class="flex1 flex-row center" @click="add" v-if="createMenuList.length>0">
                    <bui-icon name="ion-ios-arrow-right" size="30" v-if="createMenuList.length>1"></bui-icon>
                    <text class="bottom-text" :value="createMenuList.length==1?createMenuList[0].title:'更多'"></text>
                </div>
            </div>

            <!--撰写菜单-->
            <div v-if="isShowWriteMenu" @click="onWriteMenuClick"
                 class="write-menu-box">

                <div style="flex-direction: row;flex-wrap: wrap;opacity:0" ref="writeMenu">
                    <div class="center" v-for="(item,index) in writeMenuList" :style="{'width': 750/4+'px'}"
                         @click="onWriteMenuItemClick(item.target)">
                        <bui-image style="margin: 20px" width="120px" height="120px"
                                   @click="onWriteMenuItemClick(item.target)"
                                   :src="getWriteMenuImage(item.target)"></bui-image>
                        <text style="font-size: 28px" :value="item.title"></text>
                    </div>
                </div>

                <div class="write-menu-close">
                    <bui-icon name="ion-ios-close-outline" size="45px" color="#818181"
                              @click="onWriteMenuClose"></bui-icon>
                </div>
            </div>

            <dialog v-model="showDialog" @btnClick="onDialogCallback" title="提示" :buttonArray="buttonArray"
                    :dialogContent="dialogContent">
            </dialog>


            <div v-if="isAccessAuthority!=null&&!isAccessAuthority"
                 style="position: absolute;left: 0;right: 0;top: 0;bottom: 0;background-color: #fff;padding-right: 50px;padding-left: 50px"
                 class="center" @click="maskClick">
                <text style="font-size: 40px" value="您还不是该数据成员，无法查看数据，是否要申请加入？"></text>
                <div class="center apply-join-button" @click="applyJoinActivity">
                    <text style="color: #fff;" value="申请加入"></text>
                </div>
                <div class="center no-join-button" @click="onBack">
                    <text style="color: #fff;" value="返回"></text>
                </div>
            </div>

        </div>

        <bui-popupshow v-model="showUp" ref="upshow" bottom="50" left="475">
            <div class="center"
                 style="padding-bottom: 20px;padding-top: 20px;padding-left: 20px;padding-right: 20px;border-bottom-style: solid;border-bottom-color: #e7e7e7;border-bottom-width: 1px;width: 200px"
                 v-for="(item,i) in createMenuList" @click="onCreateMenuItemClick(item)">
                <text style="font-size: 30px;color: #515151" :value="item.title"></text>
            </div>
        </bui-popupshow>

        <!--<bui-loading ref="loading" :show="isShowLoading" :title="loadingText==''?'加载中':loadingText"></bui-loading>-->
        <bui-loading :show="isShowLoading" :loading-text="loadingText==''?'加载中...':loadingText"></bui-loading>

    </div>
</template>

<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>

<style>
    .wrapper {
        margin: 0;
        padding: 0;
    }

    .header-color {
        background-color: #4ca4fe
    }

    .header-content {
        height: 90px
    }

    .header-right {
        padding-right: 20px
    }

    .header-left {
        padding-left: 20px;
    }

    .circle {
        width: 120px;
        height: 120px;
        background-color: #9f83ff;
        -moz-border-radius: 60px;
        -webkit-border-radius: 60px;
        border-radius: 60px;
        margin: 20px;
    }

    .head_content {
        margin-top: 10px;
        margin-left: 50px
    }

    .separator_line1 {
        width: 1px;
        height: 30px;
        background-color: #dddddd;
        margin-top: 8px;
    }

    .separator_line2 {
        width: 3px;
        height: 40px;
        background-color: #ffffff;
        margin-top: 8px;
    }

    .dropDown-cell {
        height: 60px;
    }

    .dropDown-text {
        font-size: 28px;
        color: #313131;
    }

    .separator_line3 {
        width: 2px;
        background-color: #dddddd;
        text-align: center;
        align-items: center;
        margin-top: 25px;
        margin-bottom: 25px;
    }

    .head_content_title {
        color: #ffffff;
        font-size: 40px;
        lines: 1;
        text-overflow: ellipsis;
        flex: 1;
    }

    .head_content_subTitle {
        color: #e6e6e6;
        font-size: 25px;
        margin-top: 15px
    }

    .option_list {
        margin-top: 40px;
        margin-bottom: 20px;
    }

    .tab_list {
        background-color: #fff;
        height: 80px;
        align-items: center;
        border-bottom-color: #f3f3f3;
        border-bottom-width: 2px;
        border-bottom-style: solid;
    }

    .option_font {
        color: #fff;
        font-size: 26px
    }

    .tab_title_text {
        color: #8f8f8f;
        font-size: 28px
    }

    .tab_title_text_checked {
        color: #067ffb;
        font-size: 28px
    }

    .bottom-box {
        /*   position: fixed;
           bottom: 0px;
           left: 0px;
           right: 0px;*/
        border-width: 2px;
        height: 100px;
        border-color: #eeeaeb;
        margin-bottom: 1px;
        background-color: #fcfcfc
    }

    .bottom-text {
        font-size: 30px;
        color: #727272
    }

    .filter {
        background-color: #dbe8f2;
        height: 70px;
        align-items: center
    }

    .write-menu-close {
        position: absolute;
        top: 0;
        right: 0;
        padding-right: 20px;
        padding-top: 20px;
    }

    .write-menu-box {
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        width: 750px;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.9);
    }

    .members-img {
        margin-right: 5px
    }

    .border-right {
        border-right-color: #dddddd;
        border-right-style: solid;
        border-right-width: 1px
    }

    .apply-join-button {
        width: 600px;
        background-color: #3399ff;
        border-radius: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
        margin-top: 100px
    }

    .apply-join-button:active {
        background-color: #3181ff;
    }

    .no-join-button {
        width: 600px;
        background-color: #c1c1c1;
        border-radius: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
        margin-top: 50px
    }

    .no-join-button:active {
        background-color: #c1c1c1;
    }
</style>
<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const linkapi = require("linkapi");
    const storage = weex.requireModule('storage');
    var link = weex.requireModule("LinkModule");

    import dynamicItem from './dynamic/dynamic-item.vue'
    import dialog from './components/dialog.vue'
    import popupmenu from './components/bui-popupmenu.vue'
    import Util from '../js/utils'
    import Config from '../js/config'
    import buiweex from 'bui-weex'
    import _ from '../js/tool/lodash';
    import Utils from '../js/tool/utils';

    module.exports = {
        components: {'dynamic-item': dynamicItem, 'dialog': dialog, 'bui-popupshow': popupmenu},
        data () {
            return {
                testColor: 'red',
                header: {
                    leftItem: {
                        icon: 'ion-ios-arrow-left',
                    },
                    rightItem: {
                        icon: 'ion-ios-personadd-outline'
                    },
                },
                leftItem: {
                    icons: 'icon-back',
                },
                activityInfo: {
                    sourceId: '',//活动id
                    name: '',
                    channelName: '',
                    startTime: '',
                    createdBy: '',
                    icon: '',
                    projectId: '',
                    formShortId: '',
                    suiteId: ''//套件id
                },
                //当前选择的tab
                tabItems: [],
                tabMoreMenuList: [],
                showDropdown: false, //控制是否展开下拉框-更多菜单
                showAttentionDropdown: false,//管理员关注下拉框
                tabActive: 0,
                topicData: null,
                isShowFilter: false,
                isShowWriteMenu: false,
                writeMenuList: [],
                metaSuite: {},
                showShareActionSheet: false,
                shareItems: ['邀请新成员', '分享到聊天', '分享到动态'],
                isPersonalAttention: false,
                isAllAttention: false,
                currLabeId: '',
                memberNumber: 0,
                topMessageList: [],
                showDialog: false,
                buttonArray: [],
                dialogContent: '',
                isAdmin: null,
                isAccessAuthority: null,//是否有访问数据的权限
                dialogType: 0,//type1 管理员审批 2申请加入 3 是否创建群组
                applyId: '',
                groupId: '',
                createMenuList: [],
                noticeNumber: 0,
                pcHomeUrl: '',
                showUp: false,
                isShowLoading: false,
                isArchive: false,
                isShowBottomMenu: true,
                loadingText: '',
                unReadGroupMsgCount: 0,
                inviteUserIds: '',
                inviteNotExistsUserIds: '',
                isShowGroup:true
            }
        },
        methods: {
            maskClick(){
            },
            openGroupChat(){
                if (!this.isAccessAuthority)return;
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
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
                        sourceId: this.activityInfo.sourceId,
                        entityName: this.activityInfo.suiteId
                    }
                }
                linkapi.get(params).then(res => {
                    if (res.success) {
                        if (res.data.isShowTips) {
                            if (!isOpen) {
                                return;
                            }
                            /*       this.dialogContent = "是否要创建群组?";
                             this.buttonArray = [{type: 1, title: '取消'}, {type: 2, title: '确定'}];
                             this.dialogType = 3;
                             this.showDialog = true;*/
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
                    this.$toast(Util.handleException(error))
                })
            },
            createGroupAndOpen(){
                this.isShowLoading = true;
                this.loadingText = "创建群组中...";
                let params = {
                    url: Config.serverConfig.uamUrl + '/webWidget/getOrCreateGroup',
                    data: {
                        sourceId: this.activityInfo.sourceId,
                        entityName: this.activityInfo.suiteId,
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
                    this.$toast(Util.handleException(error))
                })
            },
            onDialogCallback(val){
                this.showDialog = false;
                if (this.dialogType == 2) {//申请加入
                    if (val.type == 1) {//返回
                        this.$pop()
                    }
                } else if (this.dialogType == 1) {//审批
                    if (val.type == 1) {//拒绝
                        this.approvalJoin(false)
                    } else if (val.type == 2) {
                        this.approvalJoin(true)
                    }
                } else if (this.dialogType == 3) {//创建群组
                    if (val.type == 1) {//取消
                    } else if (val.type == 2) {//确定
                        this.createGroupAndOpen();
                    }
                } else if (this.dialogType == 4) {//归档确认
                    if (val.type == 1) {//取消
                    } else if (val.type == 2) {//确定
                        this.setArchive();
                    }
                } else if (this.dialogType == 5) {//邀请用户
                    if (val.type == 1) {
                        this.inviteMembers(this.inviteNotExistsUserIds, '', '', 0)
                    } else if (val.type == 2) {
                        this.inviteMembers(this.inviteUserIds, '', '', 0)
                    }
                }
            },
            getIsHasApplyJoin(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/webApply/hasApplyInfo',
                    data: {
                        sourceId: this.activityInfo.sourceId,
                        entityName: this.activityInfo.suiteId
                    }
                }
                linkapi.get(params).then(res => {
                    if (res.s == 1 && res.r) {
                        this.dialogContent = "您的申请正在审核中，请稍后！";
                        this.buttonArray = [{type: 1, title: '返回'}];
                        this.dialogType = 2;
                        this.showDialog = true;
                    }

                }).catch(error => {
                    this.$toast(Util.handleException(error))
                })
            },
            applyJoinActivity(){//申请加入行动主页
                let params = {
                    url: Config.serverConfig.uamUrl + '/webApply/applyJoin',
                    data: Util.toHttpRequestParams({
                        sourceId: this.activityInfo.sourceId,
                        applyType: 1,//通过分享链接加入
                        entityName: this.activityInfo.suiteId
                    })
                };
                linkapi.post(params).then(result => {
                    if (result != null && result.r && result.r.result == 1) {
                        this.dialogContent = "你的申请已提交主页管理员审核，请稍后";
                        this.buttonArray = [{type: 1, title: '返回'}];
                        this.dialogType = 2;
                        this.showDialog = true;
                    } else {
                        this.$toast("申请失败:" + result.m)
                    }
                }).catch(error => {
                    this.$toast(Util.handleException(error))
                });
            },
            openActivityDetail(){//行动详情
                if (!this.isAccessAuthority)return;
                if (this.isArchive && !this.isAdmin) {
                    this.$toast("已归档,不可操作!");
                    return;
                }
                let isReadOnly = this.isArchive ? true : !this.isAdmin;
                /*let  params = "[OpenApp]\nappCode=meta_form\nappUrl=form.weex.js"+"\nformId=" + this.activityInfo.formShortId + "\nentityId=" + this.activityInfo.sourceId + "\nreadOnly=" + isReadOnly;
                link.launchLinkService([params], null, null);*/
                let params = this.$getPageParams();
                if(params.formDetailParam){
                    //读取指定的详情调整参数
                    this.toPage(Object.assign({dataId:params.dataId},JSON.parse(params.formDetailParam)));
                }
            },
            getBlogMsgContent(item){//指定消息内容
                let content = '';
                if (!Util.isEmpty(item.srcBlogId)) {
                    content = item.dataJson.currentCommentData.content
                } else {
                    content = item.dataJson.blogInfo.content
                }

                var reg = new RegExp("@(\\{[\\s\\S]*?\\})", "g")
                var s = content;
                s.replace(reg, function (a, b) {
                    var b;
                    b = a.replace("@", "");
                    if (typeof b == "string") {
                        b = eval('(' + b + ')')
                    }
                    s = s.replace(a, '@' + b.name);//先把匹配到的替换成数组标记
                });
                return s;

            },
            onTopMessageClick(item, index){//置顶消息点击事件处理
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                this.setRead(item.id);
                if (item.msgType == 0 || item.msgType == 1) {//@我或回复我消息,跳转到动态
                    let id = '';
                    if (!Util.isEmpty(item.srcBlogId)) {
                        id = item.srcBlogId;
                    } else {
                        id = item.dataId;
                    }
                    linkapi.openMicroblogDetail(id);
                } else if (item.msgType == 2) {//公告
                    this.openNoticeDetail(item);
                } else if (item.msgType == 3) {//申请加入主页,审批
                    this.applyId = item.dataId;
                    let name = item.dataJson.name
                    this.dialogContent = "您是否同意" + name + "申请加入成为该数据成员？";
                    this.buttonArray = [{type: 1, title: '拒绝'}, {type: 2, title: '同意'}];
                    this.dialogType = 1;
                    this.showDialog = true;
                }
                if (!item.isLingering || item.isLingering == "false") {
                    this.topMessageList.splice(index, 1);
                }
            },
            openNoticeDetail(item){
                if (!this.isAccessAuthority)return;
                let params = item.actionParams;
                if (!Util.isEmpty(params)) {
                    let _array = params.split("\n");
                    _array.splice(3, 0, "param=");
                    params = _array.join("\n");
                    link.launchLinkService([params], result=> {
                    }, error=> {
                    });
                }
            },
            approvalJoin(isApproved){//审核申请
                let params = {
                    url: Config.serverConfig.uamUrl + '/webApply/approveApplyJoin',
                    data: Util.toHttpRequestParams({
                        dataId: this.applyId,
                        isApproved: isApproved,
                    })
                };
                linkapi.post(params).then(result => {
                    if (result != null) {
                        if (result.r == 1) {
                            this.$toast("审批成功")
                        } else {
                            this.$toast(result.m)
                        }
                    } else {
                        this.$toast("审批失败!")
                    }
                }).catch(error => {
                    this.$toast(Util.handleException(error))
                });
            },
            onWriteMenuClick(){
                this.isShowWriteMenu=false
            },
            onCreateMenuItemClick(item){
                this.showUp = false;
                let target = item.settings.target;
                switch (target) {
                    case 'Milestone':
                        var params = {
                            activityId: this.activityInfo.sourceId
                        };
                        var url = this.$getContextPath() + "/milestoneForm.weex.js";
                        this.$push(url, params);
                        break;
                    case 'Archive':
                        this.confirmArchive();
                        break;
                    case 'ExtendPublicNotice':
                        this.createBulletin();
                        break;
                }
            },
            add(){
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                if (this.createMenuList.length == 1) {
                    let target = this.createMenuList[0].settings.target;
                    switch (target) {
                        case 'Milestone':
                            var params = {
                                activityId: this.activityInfo.sourceId
                            };
                            var url = this.$getContextPath() + "/milestoneForm.weex.js";
                            this.$push(url, params);
                            break;
                        case 'Archive':
                            this.confirmArchive();
                            break;
                        case 'ExtendPublicNotice':
                            this.createBulletin();
                            break;
                    }
                } else {
                    this.showUp = true;
                }
            },
            onWriteClick(){//打开撰写菜单
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                this.isShowWriteMenu = true;
                this.$nextTick(()=> {
                    weex.requireModule('animation').transition(this.$refs.writeMenu, {
                        styles: {
                            opacity: 1
                        },
                        duration: 1000, //ms
                        timingFunction: 'ease',
                        needLayout: false,
                        delay: 0 //ms
                    }, ()=> {
                    })
                });

            },
            onWriteMenuClose(){//关闭撰写菜单
                this.isShowWriteMenu = false;
            },
            onWriteMenuItemClick(val){//撰写菜单item点击
                this.isShowWriteMenu = false;
                if (val === 'ExtendComment') {
                    this.publishBlog()
                } else if (val === 'ExtendQianDao') {
                    let params = {
                        appCode: 'crm',
                        appUrl: 'LinkOl/Modular/quick/quickForm.html',
                        data: {
                            parentId: this.activityInfo.sourceId,
                            parentEntityName: this.activityInfo.suiteId,
                            parentText: this.activityInfo.name,
                            quick: true,
                            closePage: true,
                            E: 'ExtendQianDao'
                        }
                    }
                    linkapi.runApp(params, null, null)
                } else {
                    var params = {};
                    var url = this.$getContextPath() + "/publishForm.weex.js";
                    params.entityName = val;
                    if (this.topicData != null) {
                        params.sourceId = this.topicData.sourceId;
                    }
                    params.activityInfo = JSON.stringify(this.activityInfo)
                    this.$push(url, params);
                }
            },
            onBack() {
                this.$pop();
            },
            openDropdown(event) {//更多下拉菜单
                this.showDropdown = true;
                this.$refs.dropdown.show(event);
            },
            tabTextStyle(index){//tab选中样式
                if (index == this.tabActive) {
                    return 'tab_title_text_checked';
                } else {
                    return 'tab_title_text';
                }
            },
            onTabClick(index, item, event){
                if (this.isArchive && !this.isAdmin) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                this.tabActive = index;
                if (index == 0) {
                    this.currLabeId = ''
                    this.$refs.blog.requestData(this.activityInfo, this.currLabeId)
                } else if (index == 5) {
                    this.openDropdown(event);
                } else if(item.target=="filter"){
                    let _array = this.metaSuite.relations.filter(item => {
                         return item.createBlog;
                    });
                    let params = {
                        data: JSON.stringify(_array)
                    };
                    let url = this.$getContextPath() + "/filterBlog.weex.js";
                    this.$push(url, params);
                } else {
                    this.currLabeId = item.target;
                    this.$refs.blog.requestData(this.activityInfo, this.currLabeId)
                }
            },
            publishBlog(){//发送评论
                if (this.topicData == null) {
                    this.getTopicInfo();
                    return;
                }
                let labelIds = "";
                if (this.topicData.labels != null) {
                    labelIds = this.topicData.labels.join(",")
                }
                var params = {
                    blogScopeType: 5,
                    privateType: 3,
                    content: '',
                    labelIds: labelIds,
                    privateInstanceID: this.topicData.sourceId,
                    privateName: this.topicData.title,
                    enableAtProjectMembers: true
                };
                let datas = Object.assign({}, this.topicData, params);
                linkapi.publishMicroblog(datas, result => {
                    this.sendCommentHint(result.blogId);
                    this.$refs.blog.initData(1);//更新列表数据
                }, (result) => {
                })
            },
            sendCommentHint(id){//发送评论提醒
                let datas = {
                    sourceId: this.activityInfo.sourceId,
                    blogId: id,
                    entityName: this.activityInfo.suiteId
                };
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendMessage/sendComment',
                    data: Util.toHttpRequestParams(datas)
                };
                linkapi.post(params).then(res=> {
//                    this.$alert(JSON.stringify(res))
                }).catch(null);
            },
            onMoreMenuClick(index){//tab更多菜单
                this.showDropdown = false;
                let _array = this.metaSuite.relations.filter(item => {
                    return item.createBlog;
                });
                if (index == this.tabMoreMenuList.length - 1) {
                    let params = {
                        data: JSON.stringify(_array)
                    };
                    let url = this.$getContextPath() + "/filterBlog.weex.js";
                    this.$push(url, params);
                } else {
                    this.currLabeId = this.tabMoreMenuList[index].target;
                    this.$refs.blog.requestData(this.activityInfo, this.currLabeId)
                }
            },
            clearFilter(){
                this.isShowFilter = false;
                this.$refs.blog.clearFilterData();
            },
            onViewAppear(){
                storage.getItem("filterParams", event => {//不为空时，则为筛选条件页面回来的
                    if (event.result == "success" && event.data != null && event.data != '') {
                        this.filterParams = JSON.parse(event.data);
                        this.isShowFilter = true;
                        this.$refs.blog.searchBlogData(this.filterParams);
                    }
                });
                storage.getItem("blogRefreshList", event => {//
                    if (event.result == "success" && event.data != null && event.data != '') {
                        this.$refs.blog.requestData(this.activityInfo, this.currLabeId);
                    }
                });
                storage.getItem("exit", event => {//
                    if (event.result == "success") {
                        this.$pop();
                    }
                });
            },
            onViewDisAppear(){
                storage.removeItem("filterParams");
                storage.removeItem("blogRefreshList");
                storage.removeItem("exit");
            },
            openMemberList(){//成员管理页面
                if (!this.isAccessAuthority)return;
                if (this.isArchive && !this.isAdmin) {
                    this.$toast("已归档,不可操作!")
                    return;
                }

                let params = {
                    data: JSON.stringify(this.activityInfo),
                    isArchive: this.isArchive
                };
                let url = this.$getContextPath() + "/memberList.weex.js";
                this.$push(url, params);
            },
            openNoticeList(){//公告列表
                if (!this.isAccessAuthority)return;
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                let params = {
                    appCode: 'crm',
                    appUrl: 'LinkOl/Modular/public/list.html',
                    data: {
                        parentId: this.activityInfo.sourceId,
                        parentEntityName: this.activityInfo.suiteId,
                        parentText: this.activityInfo.name,
                        E: 'ExtendPublicNotice',
                        parentIdArray: JSON.stringify([{
                            entityName: this.activityInfo.suiteId,
                            id: this.activityInfo.sourceId
                        }])
                    }
                }
                linkapi.runApp(params, null, null);
            },
            onRelatedBusiness(){//相关页面
                if (!this.isAccessAuthority)return;
                if (this.isArchive && !this.isAdmin) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                let params = {
                    data: this.metaSuite.relations ? JSON.stringify(this.metaSuite.relations) : '',
                    activityInfo: JSON.stringify(this.activityInfo),
                    isArchive: this.isArchive
                };
                let url = this.$getContextPath() + "/businessList.weex.js";
                this.$push(url, params);
            },
            handleWriteMenu(){
                let _array = this.metaSuite.settings.tools;
                this.writeMenuList = _array.filter(item => {//过滤需要显示tab菜单的数据
                    return item.terminal == 2 || item.terminal == 3;
                });
                let commentItem = {
                    title: "评论",
                    target: "ExtendComment",
                    terminal: 2,
                    icon: "social-twitch-outline",
                    color: "rgb(238, 126, 115)"
                };
                this.writeMenuList.unshift(commentItem);//固定第一个菜单为评论
            },
            getMetaSuite(fun){//获取套件信息
                let params = {
                    url: Config.serverConfig.engineService + '/metaservice/meta_suite/' + this.activityInfo.suiteId,
                };
                linkapi.get(params).then((result) => {
                    this.isShowLoading = false;
                    if (result.id) {
                        this.metaSuite = result;
                        this.activityInfo.projectId = this.metaSuite.projectId;
                        this.activityInfo.formShortId = this.metaSuite.formShortId;
                        this.pcHomeUrl = this.metaSuite.project.homeUrl
                        this.activityInfo.icon = this.metaSuite.appParams.appIconFilePath;
                        this.$refs.blog.requestData(this.activityInfo, '');
                        this.getTopicInfo();
                        this.handleWriteMenu();
                        this.handleTabMenu();
                        this.handleCreateMenu();
                        if(fun){fun(result)}
                    }
                }).catch((error)=> {
                    this.isShowLoading = false;
                    this.$toast("获取套件信息失败：" + Util.handleException(error))
                });
            },
            getActivityInfo(){//获取活动信息
                let params = {
                    url: this.metaSuite.project.engine.externalUrl + '/'+this.metaSuite.metaEntityName+'/' + this.activityInfo.sourceId,
                };
                linkapi.get(params).then((result) => {
                    if (result != null) {
                        this.activityInfo.name = result.title;
                        this.activityInfo.createdBy = result.createdBy;
                        this.activityInfo.startTime = result.begin?Util.handleTime(result.begin):"";//开始时间
                        if (result._data && result.channelId && result._data.channelId && result._data.channelId[result.channelId]) {
                            this.activityInfo.channelName = result._data.channelId[result.channelId].title
                        }
                        this.getLoginInfo();
                        this.isShowLoading = false;
                    }
                }).catch((error)=> {
                    this.isShowLoading = false;
                    this.$toast("获取详情信息失败：" + Util.handleException(error))
                });
            },
            getTopicInfo(){//用于发送动态的数据
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/getTopic',
                    data: {
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                linkapi.get(params).then((result) => {
                    if (result.success) {
                        this.topicData = result.data;
                    } else {
                        this.$toast("获取topic数据失败：" + JSON.stringify(result));
                    }
                }).catch((error)=> {
                });
            },
            setRead(id){
                let params = {
                    url: Config.serverConfig.uamUrl + '/webTopMessage/setRead',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        id: id
                    }
                };
                linkapi.get(params).then((result) => {
                }).catch((error)=> {
                });
            },
            handleCreateMenu(){
                let _array = this.metaSuite.operations;
                this.createMenuList = _array.filter(item => {//过滤需要显示tab菜单的数据
                    return item.terminalType == 2 || item.terminalType == 3;
                });
                if (this.isAdmin) {//管理员才有归档权限
                    this.createMenuList.push({
                        title: '归档',
                        settings: {
                            target: "Archive",
                            title: "归档",
                        },
                    })
                }
            },
            handleTabMenu(){//初始化tab菜单数据与更多菜单数据
                let val = this.metaSuite.relations;
                let _array = val.filter(item => {//过滤需要显示tab菜单的数据
                    return item.createBlog;
                });
                //固定第一个菜单为全部，最后一个菜单为高级选筛选
                _array.unshift({
                    title: '全部',
                    createBlog: true,
                    target: "all"
                });
                _array.push({
                    title: '高级筛选',
                    createBlog: true,
                    target: "filter"
                });
                let len = _array.length;
                this.tabItems = _array.splice(0, 5);
                if (len > 5) {//tab菜单数量超过5个则添加更多菜单，以下拉菜单方式展示剩余菜单数据
                    this.tabItems.push({title: '更多'});
                    this.tabMoreMenuList = _array.splice(0, _array.length);
                }
            },
            showAttentionDrop(event){
                if (!this.isAccessAuthority)return;
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                if (!this.isAdmin) {
                    this.personalConcern();
                    return
                }
                this.showAttentionDropdown = true;
                this.$refs.attentionDropdown.show(event);
            },
            showShareAction(){
                if (!this.isAccessAuthority)return;
                if (this.isArchive) {
                    this.$toast("已归档,不可操作!")
                    return;
                }
                this.showShareActionSheet = true;
                this.$refs.shareActionSheet.show();
            },
            selectMembers(){
                let extraParams = {
                    extraHeadItems: [{
                        title: '我的事务',
                        action: '[OpenApp]\nappCode=businesscenter\nappUrl=select.weex.js'
                    }],
                    searchScope: 1 //0：本企业和好友,1所有企业用户 2：本企业
                };
                linkapi.startContactMulitSelector("邀请成员", 7, extraParams, result=> {
                    if (!result || JSON.stringify(result) == "{}") {
                        return;
                    }
                    let _array = [];
                    let groupArray = result.group;
                    let userArray = result.user;
                    let orgArray = result.organization;
                    let projectArray = result.other||result.others;
                    let groupIds = [];
                    let userIds = [];
                    let orgIds = [];
                    let projectIds = [];
                    for (let item of groupArray) {
                        groupIds.push(item.groupId)
                    }
                    for (let item of userArray) {
                        userIds.push(item.userId)
                    }
                    for (let item of orgArray) {
                        orgIds.push(item.orgId)
                    }
                    for (let item of projectArray) {
                        projectIds.push(item.id)
                    }
                    if (projectIds.length > 0) {
                        this.getProjectMembers(projectIds, userIds, orgIds, groupIds);
                    } else {
                        this.inviteMembers(userIds.join(","), orgIds.join(","), groupIds.join(","), 1);
                    }
                }, error=> {
                })
            },
            inviteMembers(userId, orgId, groupId, isRemoveExistsMembers){
                if (Util.isEmpty(userId) && Util.isEmpty(orgId) && Util.isEmpty(groupId)) {
                    return
                }
                this.isShowLoading = true;
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/sendApproval',
                    data: Util.toHttpRequestParams({
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                        userId: userId,
                        userIds: userId,
                        orgId: orgId,
                        orgIds: orgId,
                        groupId: groupId,
                        groupIds: groupId,
                        approvalUserIds: userId,
                        isRemoveExistsMembers: isRemoveExistsMembers,
                        isCheckDuplicateUser: isRemoveExistsMembers
                    })
                };
                linkapi.post(params).then((result)=> {
                    this.isShowLoading = false;
                    if (result.success) {
                        if (result.data && JSON.stringify(result.data) != "{}" && result.data.existsUserIds) {
                            let existsUserNames = result.data.existsUserNames;
                            this.inviteUserIds = result.data.existsUserIds;
                            if (!Util.isEmpty(result.data.notExistsUserIds)) {
                                this.inviteNotExistsUserIds = result.data.notExistsUserIds;
                                this.inviteUserIds = this.inviteUserIds + "," + result.data.notExistsUserIds;
                            }
                            if (!Util.isEmpty(this.inviteUserIds) && this.inviteUserIds.length > 0) {
                                if (existsUserNames.length > 10) {
                                    this.dialogContent = '你已经邀请过' + existsUserNames.slice(0, 10).join(',') + ' 等成员，是否继续提醒用户？'
                                } else {
                                    this.dialogContent = '你已经邀请过' + existsUserNames.join(',') + '，是否继续提醒用户？'
                                }
                                this.buttonArray = [{type: 1, title: '取消'}, {type: 2, title: '确定'}];
                                this.dialogType = 5;
                                this.showDialog = true;
                                return;
                            }
                        }
                        this.getActivityMemberCount();
                        this.$toast("操作成功");
                    } else {
                        this.$toast("操作失败！");
                    }
                }, error=> {
                    this.isShowLoading = false;
                    this.$toast(Util.handleException(error))
                });
            },
            onSelectShareType(item){
                let index = this.shareItems.indexOf(item);
                /*let pcUrl = this.pcHomeUrl + '#/' + this.activityInfo.projectId + '/metasuite/' + this.activityInfo.suiteId + '/' + this.activityInfo.sourceId + '/apply';*/
                let params = this.$getPageParams();
                if(params.formDetailParam){
                    //读取指定的详情调整参数
                    params.formDetailParam = JSON.parse(params.formDetailParam);
                }
                let pcUrl = this.pcHomeUrl.substring(0,this.pcHomeUrl.indexOf("cddc_web")) +"app-factory/index.html#/" + this.activityInfo.projectId + '/metasuite/' + this.activityInfo.suiteId + '/' + this.activityInfo.sourceId + '/page/' + params.formDetailParam.pageId +"/1?";
                var arr = [];
                for (let i in params.formDetailParam) {
                    arr.push(i+"="+params.formDetailParam[i]); //属性
                }
                pcUrl+=arr.join("&");
                if (index == 0) {//邀请成员
                    this.selectMembers();
                } else if (index == 1) {//分享聊天
                    let extraParams = {
                        extraHeadItems: [{
                            title: '项目',
                            action: '[OpenApp]\nappCode=businesscenter\nappUrl=select.weex.js'
                        }]
                    };
                    let content = {
                        action_params: "[OpenApp]\nappCode=metaapp\nappUrl=home.weex.js?metaSuiteId=" + this.activityInfo.suiteId + "&dataId=" + this.activityInfo.sourceId + "&formDetailParam="+ JSON.stringify(params.formDetailParam) + '\npcHomeUrl=' + pcUrl+"\npcNoTitleWindow=1",/*"[OpenApp]\nappCode=linksuite\nappUrl=actionIndex.weex.js?metaSuiteId=" + this.activityInfo.suiteId + "&id=" + this.activityInfo.sourceId + '\npcHomeUrl=' + pcUrl + "\npcNoTitleWindow=1,"*/
                        icon: this.activityInfo.icon,
                        dsec: this.activityInfo.name,
                        title: this.activityInfo.name,
                        brief: this.activityInfo.name,
                    }
                    linkapi.startContactMulitSelector("选择联系人", 3, null, result=> {
                        if (!result || JSON.stringify(result) == "{}") {
                            return;
                        }
                        let groups = result.group;
                        let users = result.user;
                        let projects = result.other;
                        for (let item of users) {
                            let msg = {
                                toCompany: null,
                                toId: item.userId,
                                toName: '',
                                toType: 1,
                                content: JSON.stringify(content),
                                msgType: 11,
                            };
                            linkapi.sendMessage(msg, success=> {
                            }, error=> {
                            })
                        }
                        for (let item of groups) {
                            let msg = {
                                toCompany: null,
                                toId: item.groupId,
                                toName: item.name,
                                toType: 2,
                                content: JSON.stringify(content),
                                msgType: 11,
                            };
                            linkapi.sendMessage(msg, success=> {
                            }, error=> {
                            })
                        }
                        this.$toast("已分享")

                    }, null);
                    /*                    let params = {
                     type: 'ACTION',
                     content: "[OpenApp]\nappCode=linksuite\nappUrl=actionIndex.weex.js?metaSuiteId=" + this.activityInfo.suiteId + "&id=" + this.activityInfo.sourceId + '\npcHomeUrl=' + pcUrl,
                     icon: this.activityInfo.icon,
                     title: this.activityInfo.name,
                     };
                     linkapi.shareToMessage(params, null, null);*/
                } else if (index == 2) {//分享动态
                    let params = {
                        resources: [
                            {
                                resourceType: 5,
                                resourceUrl: "[OpenApp]\nappCode=linksuite\nappUrl=actionIndex.weex.js?metaSuiteId=" + this.activityInfo.suiteId + "&id=" + this.activityInfo.sourceId + '\npcHomeUrl=' + pcUrl + "\npcNoTitleWindow=1",
                                resourceDescription: this.activityInfo.name,
                                resourceThumb: this.activityInfo.icon
                            }
                        ]
                    };
                    linkapi.publishMicroblog(params, null, null)
                }
            },
            getProjectMembers(projectIds, userIds, orgIds, groupIds){
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/queryAllMemberIdsByApprovalIds',
                    data: {
                        approvalIds: projectIds.join(",")
                    }
                };
                linkapi.get(params).then((result) => {
                    if (result.s == 1) {
                        for (let item of result.r) {
                            if (userIds.indexOf(item.id) == -1) {
                                userIds.push(item.id);
                            }
                        }
                        this.inviteMembers(userIds.join(","), orgIds.join(","), groupIds.join(","), 1);
                    }
                }).catch((error)=> {
                });
            },
            getAttentionStatus(){//获取关注状态
                let params = {
                    url: Config.serverConfig.uamUrl + '/webConcern/status',
                    data: {
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                linkapi.get(params).then((result) => {
                    if (result.s == 1) {
                        this.isPersonalAttention = result.r.user == 1 ? true : false;
                        this.isAllAttention = result.r.data == 1 ? true : false;
                    }
                }).catch((error)=> {
                });
            },
            personalConcern(){
                this.showAttentionDropdown = false;
                if (this.isPersonalAttention) {
                    this.attentionAction(2);
                } else {
                    this.attentionAction(1);
                }
            },
            allConcern(){
                this.showAttentionDropdown = false;
                if (this.isAllAttention) {
                    this.attentionAction(4);
                } else {
                    this.attentionAction(3);
                }
            },
            attentionAction(type){//1个人关注 2个人取消关注 3全体关注 4取消全体关注
                let url = '';
                if (type == 1) {
                    url = '/webConcern/concern';
                } else if (type == 2) {
                    url = '/webConcern/cancel';
                } else if (type == 3) {
                    url = '/webConcern/all/concern';
                } else if (type == 4) {
                    url = '/webConcern/all/cancel';
                }
                let params = {
                    url: Config.serverConfig.uamUrl + url,
                    data: Util.toHttpRequestParams({
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    })
                };
                linkapi.post(params).then((result) => {
                    if (result.s == 1) {
                        if (type == 1) {
                            this.isPersonalAttention = true;
                            this.$toast("您已个人关注");
                        } else if (type == 2) {
                            this.isPersonalAttention = false;
                            this.$toast("您已取消个人关注");
                        } else if (type == 3) {
                            this.isAllAttention = true;
                            this.isPersonalAttention = true;
                            this.$toast("您已全体关注");
                        } else if (type == 4) {
                            this.isAllAttention = false;
                            this.isPersonalAttention = false;
                            if (!this.isArchive) {//归档要取消全体关注，不应提示
                                this.$toast("您已取消全体关注");
                            }
                        }
                    }

                }).catch((error)=> {
                    this.$toast(Util.handleException(error))
                });
            },
            getTopMessage(){//置顶消息数据
                let params = {
                    url: Config.serverConfig.uamUrl + '/webTopMessage/list',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                linkapi.get(params).then((data) => {
                    if (data.success) {
                        this.topMessageList = data.result;
//                        this.setRead();
                    }
                }).catch((error)=> {
//                    this.$toast(Util.handleException(error))
                });
            },
            getActivityMemberCount(){//成员数量
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/getApprovalUserList',
                    data: {
                        sourceModule: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                        page: 0,
                        pageSize: 0
                    }
                };
                linkapi.get(params).then((result) => {
                    if (result.success) {
                        this.memberNumber = result.data.totalCount;
                    }
                }, (error) => {
                });
            },
            getAdminInfo(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/isAdmin',
                    data: {
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                linkapi.get(params).then((result)=> {
                    if (result != undefined && result.success) {
                        this.isAdmin = result.data;
                    }
                    this.getArchive(true);
                    //this.getMetaSuite();
                }, error=> {
                    //this.getMetaSuite();
                });
            },
            isHasAccessAuthority(){//是否有访问该行动主页的权限
                this.isShowLoading = true;
                let params = {
                    url: Config.serverConfig.uamUrl + '/webApply/hasAccessAuthorityToData',
                    data: {
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                linkapi.get(params).then((data) => {
                    if (data.r) {
                        this.isAccessAuthority = true;
                        this.getActivityInfo();
                        this.getAttentionStatus();
                        this.getActivityMemberCount();
                        this.getNoticeNumber();
                        this.getTopMessage();
                        this.checkGroupIsExit(false);
                        if (!this.iosFixed) {
                            linkapi.cancelMsgNtfByCategoryId(this.activityInfo.sourceId);//清除通知栏消息
                        }
                        this.clearYwdtUnreadMsg();
                    } else {
                        buiweex.alert(data);
                        this.isShowLoading = false;
                        this.getIsHasApplyJoin();
                        this.getActivityName();
                        this.isAccessAuthority = false;
                    }
                }).catch((error)=> {
                    this.isShowLoading = false;
                    this.$toast(Util.handleException(error))
                });
            },
            getActivityName(){//获取活动信息
                let params = {
                    url: this.metaSuite.project.engine.externalUrl + '/'+this.metaSuite.metaEntityName+'/' + this.activityInfo.sourceId,
                };
                linkapi.get(params).then((result) => {
                    if (result != null) {
                        this.activityInfo.name = result.title;
                        this.activityInfo.channelName = "XXX";//需要隐藏
                        this.activityInfo.startTime = "XXX";

                    }
                }).catch((error)=> {
                });
            },
            clearYwdtUnreadMsg(){//清除业务大厅的未读消息
                let params = {
                    url: Config.serverConfig.uamUrl + "/webBusiness/clearUnread/" + this.activityInfo.suiteId + "/" + this.activityInfo.sourceId
                };
                linkapi.get(params).then(null).catch(null);
            },
            getNoticeNumber(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/webCommon/' + this.activityInfo.suiteId + '/' + this.activityInfo.sourceId + '/ExtendPublicNotice/list',
                };
                linkapi.get(params).then(res => {
                    if (res.success) {
                        this.noticeNumber = res.result.dataCount
                    }
                }).catch(error => {
                })
            },
            createBulletin(){//创建公告
                let params = {
                    appCode: 'crm',
                    appUrl: 'LinkOl/Modular/public/fullPage.html',
                    data: {
                        parentId: this.activityInfo.sourceId,
                        parentEntityName: this.activityInfo.suiteId,
                        parentText: this.activityInfo.name,
                        E: 'ExtendPublicNotice',
                        parentIdArray: JSON.stringify([{
                            entityName: this.activityInfo.suiteId,
                            id: this.activityInfo.sourceId
                        }])
                    }
                }
                linkapi.runApp(params, null, null);
            },
            confirmArchive(){
                this.dialogContent = "归档后所有数据不可变更，确认是否归档?";
                this.buttonArray = [{type: 1, title: '取消'}, {type: 2, title: '确定'}];
                this.dialogType = 4;
                this.showDialog = true;
            },
            setArchive(){
                let params = {
                    url: Config.serverConfig.engineService + '/metaservice/meta_suite_data_setting/archive',
                    data: Util.toHttpRequestParams({
                        dataId: this.activityInfo.sourceId,
                        suiteId: this.activityInfo.suiteId,
                    })
                };
                linkapi.post(params).then(result => {
                    if (result != null) {
                        this.isArchive = true;
                        this.$toast("操作成功")
                        this.attentionAction(4)
                    }
                }).catch(error => {
                    this.$toast(Util.handleException(error))
                });
            },
            getArchive(isQuit){//是否归档
                let params = {
                    url: Config.serverConfig.engineService + '/metaservice/meta_suite_data_setting/' + this.activityInfo.sourceId,
                };
                linkapi.get(params).then((result) => {
                    if (result) {
                        this.isArchive = result.isArchive;
                    }
                }).catch((error)=> {
                });
            },
            getWriteMenuImage(entityName){
                let url = ""
                switch (entityName) {
                    case 'ExtendWorktask':
                        url = '/image/publish_task.png';
                        break;
                    case 'ExtendSchedule':
                        url = '/image/publish_schedule.png';
                        break;
                    case 'ExtendNotify':
                        url = '/image/publish_notify.png';
                        break;
                    case 'ExtendDocument':
                        url = '/image/publish_document.png';
                        break;
                    case 'ExtendQingShi':
                        url = '/image/publish_qingshi.png';
                        break;
                    case 'ExtendHuiBao':
                        url = '/image/publish_huibao.png';
                        break;
                    case 'ExtendQianDao':
                        url = '/image/publish_qiaodao.png';
                        break;
                    case 'ExtendComment':
                        url = '/image/publish_comment.png';
                        break;
                }
                return url;

            },
            getIsAdmin(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/isAdmin',
                    data: {
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                linkapi.get(params).then((result)=> {
                    if (result.success) {
                        this.isAdmin = result.data;
                        this.handleCreateMenu();
                    }
                }, error=> {
                });
            },
            onRefresh(){
                this.getTopMessage();
                this.clearYwdtUnreadMsg();
                linkapi.cancelMsgNtfByCategoryId(this.activityInfo.sourceId);//清除通知栏消息
            },
            getLoginInfo(){
                linkapi.getLoginInfo((result)=> {
//                    this.currUserId = result.userId;
                    if (result.userId == this.activityInfo.createdBy) {//创建人即管理员
                        this.isAdmin = true;
                        //this.getMetaSuite();
                        this.getArchive(true);
                    } else {
                        this.getAdminInfo();
                    }
                });
            },
            toPage(queryParam){
                //跳转页面--暴露给外部使用
                buiweex.push(Utils.pageEntry(),queryParam);
            }
        },
        computed: {
            writeMenuRow(){//撰写菜单行数
                return Math.ceil(this.writeMenuList.length / 4);
            },
            iosFixed () {
                return weex.config.env.platform.toLowerCase() === "ios";
            },
            getRelatedCount(){//相关数量
                if (Util.isEmptyObject(this.metaSuite) || Util.isEmptyObject(this.metaSuite.relations)) {
                    return "相关(0)"
                }
                return "相关(" + this.metaSuite.relations.length + ")";
            },
            getMemberCount(){
                return "成员(" + this.memberNumber + ")";
            },
            getNoticeCount(){
                return "公告(" + this.noticeNumber + ")";
            }
        },
        mounted(){
            Config.readRuntimeConfig(this.$getContextPath()).then(runtimeConfig => {
                let params = this.$getPageParams(),_t = this;//页面参
                if (params != null && !Util.isEmpty(params.dataId) && !Util.isEmpty(params.metaSuiteId)) {
                    this.activityInfo.sourceId = params.dataId;
                    this.activityInfo.suiteId = params.metaSuiteId;
                    this.getMetaSuite(function(res){
                        _t.isHasAccessAuthority();
                    })
                    if (params.fromGroup){
                        this.isShowGroup=false
                    }
                } else {
                    this.$toast("参数未传递")
                    this.$pop();
                }
                linkapi.registerReceiver(5, "YWDT");
                globalEvent.addEventListener("YWDT", (e)=> {
                    if (this.isAccessAuthority && JSON.parse(JSON.parse(e.message).content).groupBy.sourceId == this.activityInfo.sourceId) {//只处理此活动的业务大厅消息
                        let cmd = JSON.parse(JSON.parse(e.message).content).extendAction;
                        if (cmd == 0 || cmd == 1) {//撰写时，发出的指令
                            this.getTopMessage();
                            this.getIsAdmin();
                            if (this.$refs.blog != null) {
                                this.$refs.blog.refreshData();
                            }
                        } else if (cmd == 2) {

                        } else if (cmd == 3) {
                            this.isArchive = true;
                            if (this.$refs.blog != null) {
                                this.$refs.blog.refreshData();
                            }
                        } else if (cmd == 4) {
                            if (this.groupId == "") {
                                this.checkGroupIsExit(false);
                            }
                        }
//                    this.clearYwdtUnreadMsg();
//                    linkapi.cancelMsgNtfByCategoryId(this.activityInfo.sourceId);//清除通知栏消息
                    }
                });

                globalEvent.addEventListener("androidback", e => {
                    this.$pop();
                });

                globalEvent.addEventListener("keyboardStatus", e => {
                    if (e.status == 'show') {
                        this.isShowBottomMenu = false;
                    } else {
                        this.isShowBottomMenu = true;
                    }
                });

            }).catch(error => {
                this.$alert(error)
            });

        },
        watch: {
            groupId(curVal, oldVal){
                linkapi.registerReceiver(2, curVal);
                globalEvent.addEventListener(curVal, (e)=> {
                    linkapi.getUnreadMessageCountById(curVal, res=> {
                        this.unReadGroupMsgCount = res;
                    })
                });
            }
        }
    }
</script>