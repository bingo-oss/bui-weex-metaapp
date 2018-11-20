<template>

    <div class="flex-column" style="background-color: #f5f5f5; flex: 1;">
        <bui-header :title="'成员('+totalCount+'人)'" :leftItem="leftItem" :rightItem="rightItem"
                    @leftClick="onBack" @rightClick="rightclick" :backgroundColor="themeBg">
        </bui-header>

        <bui-searchbar-left @search="onSearch" ref="search"></bui-searchbar-left>

        <list class="bui-list" loadmoreoffset="2">
            <refresh class="bui-refresh" @refresh="onRefresh" @pullingdown="onPullingdown($event)"
                     :display="refreshing ? 'show' : 'hide'">
                <bui-icon :name="refreshIcon" size="40px" style="margin-right: 5px;"></bui-icon>
                <text class="bui-refresh-indicator">{{refreshText}}</text>
            </refresh>

            <cell v-for="(item,index) in memberDatas" @click="onListItemClick(index,item)">
                <div v-if="index==0&&memberDatas[index].isAdmin"
                     style="background-color: #f5f5f5;border-top-style: solid;border-top-color: #e9e9e9;border-top-width: 1px">
                    <text style="font-size: 28px;margin-left: 10px;color: #5b5b5b;padding-top: 5px;padding-bottom: 5px"
                          :value="'管理员（'+adminNumber+'人）'"></text>
                </div>
                <div v-if="(index==0&&!memberDatas[index].isAdmin)||(!memberDatas[index].isAdmin&&memberDatas[index-1].isAdmin)"
                     style="background-color: #f5f5f5">
                    <text style="font-size: 28px;margin-left: 10px;color: #5b5b5b;padding-top: 5px;padding-bottom: 5px"
                          :value="'其他成员（'+otherNumber+'人）'"></text>
                </div>
                <div class="cell-box flex-row center">
                    <div v-if="isMayShowRadio(item)">
                        <div v-if="item.select">
                            <bui-icon @click="onSelected(index,false)" size="48px" name="ion-ios-checkmark"
                                      color="#00cc66"></bui-icon>
                        </div>
                        <div v-if="!item.select">
                            <bui-icon @click="onSelected(index,true)" size="48px" name="ion-ios-checkmark-outline"
                                      color="#9ea7b4"></bui-icon>
                        </div>
                    </div>

                    <div class="bui-list-main">
                        <div class="flex-row" style="align-items: center">
                            <div style="width: 75px;height: 75px">
                                <bui-image width="75px" height="75px" :src="getImageUrl(item.picture)" radius="10"
                                           @click="onAvatarClick(index,item)"
                                           placeholder="/image/usertp.png"></bui-image>
                            </div>
                            <div class="flex1">
                                <text style="margin-left: 15px;color: #434343;font-size: 32px">{{item.name}}</text>
                                <text style="margin-left: 15px;font-size: 28px;color: #919191">{{item.orgName}}</text>
                            </div>
                            <div v-if="item.approvalStatus==0"
                                 style="margin-left: 10px;margin-right: 20px;background-color: #c5c5c5;border-radius: 5px;padding-right: 10px;padding-left: 10px;">
                                <text style="font-size: 30px;color: #fff">待审</text>
                            </div>
                        </div>
                    </div>
                </div>
            </cell>

            <loading class="bui-loading" @loading="onLoading" :display="showLoading ? 'show' : 'hide'">
                <text class="bui-loading-indicator" v-if="showLoading">{{loadingText}}</text>
                <loading-indicator class="bui-indicator"></loading-indicator>
            </loading>
        </list>

        <bui-actionsheet
                :items="optionItems"
                v-model="showOptionBar"
                title="请选择操作类型"
                @itemClick="onSelectOptionType"
                ref="optionActionSheet"></bui-actionsheet>

        <dialog v-model="showDialog" @btnClick="onDialogCallback" title="提示" :buttonArray="buttonArray"
                :dialogContent="dialogContent">
        </dialog>

        <bui-loading ref="loading" :show="isShowLoading" title="处理中"></bui-loading>

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
    .cell-box {
        border-bottom-style: solid;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        padding-left: 10px;
        padding-right: 10px;
        padding-top: 20px;
        padding-bottom: 20px;
        background-color: #fff;
    }
</style>

<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const linkapi = require("linkapi");
    import Util from '../../js/utils'
    import Config from '../../js/config'
    import loading from '../../components/common/bui-loading.vue'
    import dialog from '../../components/common/dialog.vue'
    const storage = weex.requireModule('storage');
    import factoryApi from '../libs/factory-api.js';
    import service from '../../js/service.js';
    import ajax from '../../js/ajax.js';

    module.exports = {
        props: {
            widgetParams: {
                type: Object,
                required: true
            }
        },
        components: {'dialog': dialog, 'bui-loading': loading},
        data () {
            return {
                externalUrl:"",
                leftItem: {
                    icon: 'ion-ios-arrow-left',
                },
                rightItem: {
                    /*text: '更多',*/
                    icon: 'ion-ios-more',
                },
                activityInfo: {},
                memberDatas: [],
                isSearching: false,
                showDropdown: false,
                refreshing: false,
                showLoading: false,
                refreshIcon: "icon-todown",
                refreshText: "下拉刷新...",
                loadingText: "加载更多数据...",
                pageSize: 10,
                pageNo: 1,
                keyword: '',
                isAdmin: false,
                isSuperAdmin: false,//项目创建人
                optionItems: [],
                showOptionBar: false,
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
            onBack(){
                this.$pop();
            },
            onSelected(index, val){
                if (this.isMayShowRadio(this.memberDatas[index])){
                    this.memberDatas[index].select = val;
                    Vue.set(this.memberDatas, index, this.memberDatas[index])
                }
            },
            rightclick(){
                this.$refs.search.hideKeyboard();
                if (this.isArchive) {
                    this.$toast("该行动已归档,不可操作!")
                    return;
                }
                if (!this.isShowSelected) {
                    this.showOptionBar = true;
                    this.$refs.optionActionSheet.show();
                } else {
                    this.isShowSelected = false;
                    this.rightItem.text = "";
                    this.rightItem.icon = 'ion-ios-more';
                    if (this.operationType == 1) {//设置管理员
                        this.setAdmin(this.getSelectedUserId(), 1)
                    } else if (this.operationType == 2) {//取消管理员
                        this.setAdmin(this.getSelectedUserId(), 0)
                    } else if (this.operationType == 3) {//移除成员
                        this.deleteMembers(this.getSelectedId(), false)
                    }
                }
            },
            getSelectedUserId(){
                let _array = [];
                for (let item of this.memberDatas) {
                    if (item.select) {
                        _array.push(item.userId)
                    }
                }
                if (_array.length > 0) {
                    return _array.join(",");
                }
                return "";
            },
            getSelectedId(){
                let _array = [];
                for (let item of this.memberDatas) {
                    if (item.select) {
                        _array.push(item.userId);//这里添加了需要移除的成员userId
                    }
                }
                if (_array.length > 0) {
                    return _array.join(",");
                }
                return "";
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
                ajax.post(params.url,params.data).then((result) => {
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

            onSelectOptionType(item){
                switch (item) {
                    case '设置管理员':
                        this.isShowSelected = true;
                        this.operationType = 1;
                        this.rightItem.icon = 'ion-android-done';
                        //this.rightItem.text = '确定';
                        break;
                    case '取消管理员':
                        this.isShowSelected = true;
                        this.operationType = 2;
                        this.rightItem.icon = 'ion-android-done';
                        //this.rightItem.text = '确定';
                        break;
                    case '邀请新成员':
                        this.selectMembers();
                        break;
                    case '移除成员':
                        this.isShowSelected = true;
                        this.operationType = 3;
                        this.rightItem.icon = 'ion-android-done';
                        //this.rightItem.text = '确定';
                        break;
                    case '退出成员':
                        this.exitMember();
                        break;
                }
            },
            onListItemClick(index, item){
                if (this.isShowSelected) {
                    this.onSelected(index, !item.select)
                }
            },
            onAvatarClick(index, item){
                if (this.isShowSelected) {
                    this.onSelected(index, !item.select)
                } else {
                    linkapi.startUserChat(item.userId, null, null)
                }
            },
            exitMember(){
                this.deleteMembers(this.currUserId, true);
            },
            onSearch(value){
                this.keyword = value;
                this.isSearching = true;
                this.pageNo = 1;
                this.initData(1);
            },
            initData(type){//type1 刷新数据 2为加载更多
                let keyword = '';
                if (this.isSearching) {
                    keyword = this.keyword;
                }
                let params = {
                    url:this.externalUrl + '/meta_data_members/query_members',
                    data: {
                        page: this.pageNo,
                        page_size: this.pageSize,
                        keyWord: keyword,
                        dataId:this.activityInfo.dataId,
                        tota:true
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
                            this.refreshIcon = "icon-checkbox-on";
                            this.refreshText = "刷新成功";
                            this.refreshing = false;
                        } else if (type == 2) {
                            this.showLoading = false;
                            const length = result.data.resultSet.length;
                            if (length > 0) {
                                this.memberDatas = this.memberDatas.concat(result.data.resultSet)
                            } else {
                                this.loadingText = '没有更多数据了'
                                this.$toast('没有更多数据了');
                            }
                        }
                    } else {
                        this.refreshing = false;
                        this.showLoading = false;
                        this.$toast('获取数据失败!');
                    }
                }).catch((error, text)=> {
                    this.refreshing = false;
                    this.showLoading = false;
                    this.$toast(Util.handleException(error));
                });
            },

            //refresh下拉放手后的文字与图标
            "onRefresh": function (e) {
                this.refreshing = true;
                this.pageNo = 1;
                this.initData(1);
            },
            //refresh下拉放手前的文字与图标
            "onPullingdown": function (e) {
                //默认refresh文字与图标
                this.refreshIcon = "icon-todown";
                this.refreshText = "下拉可以刷新...";
                //下拉一定距离时文字与图标
                if (Math.abs(e.pullingDistance) > 60) {
                    console.log("松开即可刷新");
                    this.refreshIcon = "icon-toup";
                    this.refreshText = "松开即可刷新...";
                }
            },
            "onLoading": function (e) {
                //  this.$toast("loading");
                if (!this.showLoading) {
                    this.showLoading = true;
                    this.loadingText = '加载更多数据...';
                    this.pageNo++;
                    this.initData(2)
                }
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
                    url: this.externalUrl + '/meta_data_members/is_admin',
                    data: {
                        metaEntityId: this.activityInfo.entityId,
                        dataId: this.activityInfo.dataId,
                    }
                };
                ajax.get(params.url,params.data).then((result)=> {
                    result = result.data;
                    if (result) {
                        this.isAdmin = result;
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
            getLoginInfo(){
                linkapi.getLoginInfo((result)=> {
                    this.currUserId = result.userId;
                    if (result.userId == this.activityInfo.createdBy) {
                        this.isSuperAdmin = true;
                        this.optionItems = ['设置管理员', '取消管理员', '邀请新成员', '移除成员']
                    } else {
                        this.getAdminInfo();//获取当前用户是否是管理员
                    }
                });
            },
            //设置或取消管理员
            setAdmin(userIds, type){//type 0取消 1设置管理员
                if (Util.isEmpty(userIds)) {
                    return;
                }
                this.isShowLoading = true;
                let params = {
                    url: this.externalUrl+(type?"/meta_data_members/setup_admin":"meta_data_members/deregister_admin"),
                    data:Util.toHttpRequestParams({
                        metaEntityId: this.activityInfo.entityId,
                        dataId: this.activityInfo.dataId,
                        userId: userIds,
                    })
                };
                ajax.patch(params.url,params.data).then((result)=> {
                    this.isShowLoading = false;
                    if (result) {
                        this.$toast("操作成功");
                        this.pageNo = 1;
                        this.initData(1);
                    } else {
                        this.$toast("操作失败！");
                    }
                }, error=> {
                    this.isShowLoading = false;
                    this.$toast(Util.handleException(error))
                });
            },
            deleteMembers(ids, isSelf){
                this.$alert(ids)
                if (Util.isEmpty(ids)) {
                    return;
                }
                this.isShowLoading = true;
/*                let datas = {
                    entityName: this.activityInfo.suiteId,
                    sourceId: this.activityInfo.sourceId,
                    members: ids,
                };
                if (isSelf) {
                    datas.ignoreEcode = 1;
                }*/
                let params = {
                    url: this.externalUrl + `/meta_data_members?metaEntityId=${this.activityInfo.entityId}&dataId=${this.activityInfo.dataId}&members=${ids}`,
                    /*data: datas*/
                };
                ajax.delete(params.url).then((result)=> {
                    this.isShowLoading = false;
                    if (result) {
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
                    url:this.externalUrl + '/meta_data_members',
                    data: Util.toHttpRequestParams({
                        metaEntityId: this.activityInfo.entityId,
                        dataId: this.activityInfo.dataId,
                        userIds: userId,
                        orgIds: orgId,
                        groupIds: groupId,
                        approvalUserIds: userId,
                        isRemoveExistsMembers: isRemoveExistsMembers,
                        isCheckDuplicateUser:isRemoveExistsMembers
                    })
                };
                ajax.post(params.url,params.data).then((result)=> {
                    result = result.data;
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
            isMayShowRadio(item){
                if (this.isShowSelected) {
                    if (item.userId == this.currUserId || item.userId == this.activityInfo.createdBy) {
                        return false;
                    } else if (this.operationType == 1) {
                        return !item.isAdmin
                    } else if (this.operationType == 2) {
                        return item.isAdmin
                    } else {
                        return true;
                    }
                }
                return false;
            },
        },
        mounted(){
/*
            Config.readRuntimeConfig(this.$getContextPath()).then(runtimeConfig => {
                let params = this.$getPageParams();
            if (params != null) {
                this.activityInfo = JSON.parse(params.data);
                this.isArchive = eval(params.isArchive)
                this.getLoginInfo();
                this.initData(1);
            }
        }).catch(error => {
                this.$alert(error)
        });
*/
            let params =this.widgetParams,_t = this;//页面参
            if (params != null && !Util.isEmpty(params.dataId) && !Util.isEmpty(params.entityId)) {
                this.activityInfo.dataId = params.dataId;
                this.activityInfo.entityId = params.entityId;
                //this.initData(1);
                Config.readRuntimeConfig(this.$getContextPath()).then(runtimeConfig => {
                    service.init(runtimeConfig.configServerUrl);//初始化请求到的地址
                    service.getEngineUrlMeta(params.entityId).then(res=>{
                        _t.externalUrl = res;
                        _t.initData(1);
                        _t.getAdminInfo();
                    });//获取引擎地址
                });

            } else {
                this.$toast("参数未传递");
                this.$pop();
            }


            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
        }
    }
</script>