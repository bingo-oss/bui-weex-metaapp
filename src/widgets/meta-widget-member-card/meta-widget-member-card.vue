<template>
    <div class="member-card">
        <div  class="flex-row _title">
            <div class="flex1 title_l"><text class="_title_text">成员列表{{totalCount?'('+totalCount+')':''}}</text></div>
            <div class="flex-row flex1 title_r">
                <text class="_title_text" style="color: #999999" @click="allMember">全部</text>
                <bui-icon name="ion-ios-arrow-right" size="35" style="margin-right: 20px" color="#999" @click="allMember"></bui-icon></div>
        </div>
        <div  class="flex-row user_w" :style="lineStyle">
            <div class="cell-box user add center" @click="selectMembers">
                <div style="width: 100px;height:100px" @click="selectMembers">
                    <bui-image @click="selectMembers" width="100px" height="100px" :src="'/image/cy_new.png'" radius="50"></bui-image>
                </div>
                <div class="flex1">
                    <text style="color: #434343;font-size: 26px; margin-top: 10px;">添加</text>
                </div>
            </div>
            <div class="user" v-for="(item,index) in memberDatas">
                <!--<div v-if="index==0&&memberDatas[index].isAdmin"
                     style="background-color: #f5f5f5;border-top-style: solid;border-top-color: #e9e9e9;border-top-width: 1px">
                    <text style="font-size: 28px;margin-left: 10px;color: #5b5b5b;padding-top: 5px;padding-bottom: 5px"
                          :value="'管理员（'+adminNumber+'人）'"></text>
                </div>
                <div v-if="(index==0&&!memberDatas[index].isAdmin)||(!memberDatas[index].isAdmin&&memberDatas[index-1].isAdmin)"
                     style="background-color: #f5f5f5">
                    <text style="font-size: 28px;margin-left: 10px;color: #5b5b5b;padding-top: 5px;padding-bottom: 5px"
                          :value="'其他成员（'+otherNumber+'人）'"></text>
                </div>-->
                <div class="cell-box center">
                        <div style="width: 100px;height:100px">
                            <bui-image width="100px" height="100px" :src="getImageUrl(item.picture)" radius="50" @click="onAvatarClick(index,item)" placeholder="/image/usertp.png"></bui-image>
                        </div>
                        <div class="flex1">
                            <text style="color: #434343;font-size: 26px; margin-top: 10px;">{{item.userName}}</text>
                            <!--<text style="margin-left: 15px;font-size: 28px;color: #919191">{{item.orgName}}</text>-->
                        </div>
                        <!--<div v-if="item.approvalStatus==0"
                             style="margin-left: 10px;margin-right: 20px;background-color: #c5c5c5;border-radius: 5px;padding-right: 10px;padding-left: 10px;">
                            <text style="font-size: 30px;color: #fff">待审</text>
                        </div>-->
                </div>
            </div>
        </div>
        <dialog v-model="showDialog" @btnClick="onDialogCallback" title="提示" :buttonArray="buttonArray"
                :dialogContent="dialogContent">
        </dialog>
    </div>
</template>

<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss">
    .ma {
        width: 200px;
        height: 100px;
        margin-right: 30px;
        background-color: red;
    }

</style>
<style>
    .member-card{ background-color: #fff; margin-top: 20px;
        border-style: solid;
        border-color: #ececec;
        border-width: 1px;
    }
    ._title{
        height:80px;
        border-bottom-style: solid;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        align-items: center;
        justify-content: center;
    }
    ._title_text{ font-size: 30px;}
    .title_l{ flex: 1; padding-left: 15px;}
    .title_r{ flex: 1; align-items: flex-end; justify-content: flex-end;}
    .user_w{
        flex-direction:row;
        flex-wrap:wrap;
        align-items:center;
        overflow: hidden;
    }
    .cell-box {
        /*border-bottom-style: solid;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        border-bottom-style: solid;*/
        padding-left: 15px;
/*
        padding-right: 10px;
*/
        padding-top: 20px;
        padding-bottom: 20px;
        /*background-color: #fff;*/
    }
</style>

<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const linkapi = require("linkapi");
    import Util from '../../js/utils'
    import Utils from '../../js/tool/utils';
    import Config from '../../js/config'
    import loading from '../../components/common/bui-loading.vue'
    import dialog from '../../components/common/dialog.vue'
    const storage = weex.requireModule('storage');
    import factoryApi from '../libs/factory-api.js';
    import ajax from '../../js/ajax.js';
    import buiweex from 'bui-weex';

    module.exports = {
        components: {'dialog': dialog},
        props: {
            widgetParams: {
                type: Object,
                required: true
            }
        },
        data () {
            return {
                activityInfo: {},
                memberDatas: [],
                isSearching: false,
                refreshing: false,
                pageSize: 10,
                pageNo: 1,
                keyword: '',
                isAdmin: false,
                isShowSelected: false,
                operationType: 0,
                currUserId: '',
                isArchive: false,
                showDialog: false,
                buttonArray: [],
                dialogContent: '',
                existsUserIds: '',
                notExistsUserIds: '',
                isShowLoading: false,
                adminNumber: 0,
                otherNumber: 0,
                totalCount: 0
            }
        },
        methods: {
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
                    this.$alert(JSON.stringify(error));
                })
            },
            getProjectMembers(projectIds, userIds, orgIds, groupIds){
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/queryAllMemberIdsByApprovalIds',
                    data: {
                        approvalIds: projectIds.join(",")
                    }
                };
                ajax.get(params.url,params.data).then((result) => {
                    result = result.data;
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
            onAvatarClick(index, item){
                //跳入名片
                linkapi.startUserChat(item.userId, null, null)
            },
            exitMember(){
                //删除成员
                this.deleteMembers(this.currUserId, true);
            },
            initData(type){//type1 刷新数据 2为加载更多
                let keyword = '';
                if (this.isSearching) {
                    keyword = this.keyword;
                }
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/getApprovalUserList',
                    data: {
                        sourceModule: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                        page: this.pageNo,
                        pageSize: this.pageSize,
                        keyword: keyword
                    }
                };
                ajax.get(params.url,params.data).then((result)=> {
                    result = result.data;
                    if (result.success) {
                        if (type == 1) {
                            this.memberDatas = result.data.resultSet;
                            this.adminNumber = result.adminNum;
                            this.otherNumber = result.otherNum;
                            this.totalCount = result.data.totalCount;
                        } else if (type == 2) {
                            const length = result.data.resultSet.length;
                            if (length > 0) {
                                this.memberDatas = this.memberDatas.concat(result.data.resultSet)
                            }
                        }
                    } else {
                        this.$toast('获取数据失败!');
                    }
                }).catch((error, text)=> {
                    this.$toast(Util.handleException(error));
                });
            },
            onDialogCallback(val){
                this.showDialog = false;
                if (val.type == 1) {
                    this.inviteMembers(this.notExistsUserIds, '', '', 0)
                } else if (val.type == 2) {
                    this.inviteMembers(this.existsUserIds, '', '', 0)
                }
            },
            getImageUrl(url){
                if (Util.isEmpty(url)) {
                    return "";
                }
                let _array = url.split("||");
                if (Array.isArray(_array)) {
                    if (_array.length > 0) {
                        return Config.serverConfig.uamUrl + "/ui/download?filepath=" + _array[0];
                    } else {
                        return Config.serverConfig.uamUrl + "/ui/download?filepath=" + url;
                    }
                } else {
                    return url;
                }
            },
            getAdminInfo(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/isAdmin',
                    data: {
                        entityName: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                ajax.get(params.url,params.data).then((result)=> {
                    result = result.data;
                    if (result.success) {
                        this.isAdmin = result.data;
                        if (this.isAdmin) {
                            this.optionItems = ['设置管理员', '取消管理员', '邀请新成员', '移除成员', '退出成员'];
                        } else {//普通成员
                            this.optionItems = ['邀请新成员', '退出成员'];
                        }
                    } else {
                    }
                }, error=> {
                });
            },
            deleteMembers(ids, isSelf){
                if (Util.isEmpty(ids)) {
                    return;
                }
                this.isShowLoading = true;
                let datas = {
                    entityName: this.activityInfo.suiteId,
                    sourceId: this.activityInfo.sourceId,
                    id: ids,
                };
                if (isSelf) {
                    datas.ignoreEcode = 1;
                }
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/deleteApprovalUser',
                    data: Util.toHttpRequestParams(datas)
                };

                linkapi.post(params).then((result)=> {
                    this.isShowLoading = false;
                    if (result.success) {
                        this.$toast("操作成功");
                        if (isSelf) {
                            storage.setItem("exit", true);
                            this.$pop();
                        } else {
                            this.pageNo = 1;
                            this.initData(1);
                        }
                    } else {
                        this.$toast("操作失败！");
                    }
                }, error=> {
                    this.isShowLoading = false;
                    this.$toast(Util.handleException(error))
                });
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
                        isCheckDuplicateUser:isRemoveExistsMembers
                    })
                };
                linkapi.post(params).then((result)=> {
                    this.isShowLoading = false;
                    if (result.success) {
                        if (result.data && JSON.stringify(result.data) != "{}" && result.data.existsUserIds) {
                            let existsUserNames = result.data.existsUserNames;
                            this.existsUserIds = result.data.existsUserIds;
                            if (!Util.isEmpty(result.data.notExistsUserIds)) {
                                this.notExistsUserIds = result.data.notExistsUserIds;
                                this.existsUserIds = this.existsUserIds + "," + result.data.notExistsUserIds;
                            }
                            if (!Util.isEmpty(this.existsUserIds) && this.existsUserIds.length > 0) {
                                if (existsUserNames.length > 10) {
                                    this.dialogContent = '你已经邀请过' + existsUserNames.slice(0, 10).join(',') + ' 等成员，是否继续提醒用户？'
                                } else {
                                    this.dialogContent = '你已经邀请过' + existsUserNames.join(',') + '，是否继续提醒用户？'
                                }
                                this.buttonArray = [{type: 1, title: '取消'}, {type: 2, title: '确定'}];
                                this.showDialog = true;
                                return;
                            }
                        }
                        this.pageNo = 1;
                        this.initData(1);
                        this.$toast("操作成功");
                    } else {
                        this.$toast("操作失败！");
                    }
                }, error=> {
                    this.isShowLoading = false;
                    this.$toast(Util.handleException(error))
                });
            },
            allMember(){
                //跳入操作--全部成员
                this.$push(Utils.pageEntry(),{
                    pageId:"0cba6128-5f77-443b-941c-428c111a69cf",
                    byOperation:false,
                    dataId:this.widgetParams.dataId,
                    entityId:this.widgetParams.entityId
                });
            }
        },
        computed:{
            lineStyle(){
                //显示行数样式
                return (this.widgetParams.lines||this.widgetParams.lines===0)?{"height":(Number(this.widgetParams.lines)*180)}:{}
            }
        },
        mounted(){
            let params =this.widgetParams,_t = this;//页面参
            if (params != null && !Util.isEmpty(params.dataId) && !Util.isEmpty(params.entityId)) {
                this.activityInfo.sourceId = params.dataId;
                this.activityInfo.suiteId = params.entityId;
                this.initData(1);
            } else {
                //this.$toast("参数未传递");
            }
        }
    }
</script>