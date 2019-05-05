<template>
    <div class="member-card">
        <div  class="flex-row _title">
            <div class="flex1 title_l"><text class="_title_text">成员列表{{totalCount?'('+totalCount+')':''}}</text></div>
            <div class="flex-row flex1 title_r">
                <text class="_title_text" style="color: #999999" @click="allMember">全部</text>
                <bui-icon name="ion-ios-arrow-right" size="35" style="margin-right: 20px" color="#999" @click="allMember"></bui-icon></div>
        </div>
        <div  class="flex-row user_w">
            <div class="cell-box user add center" @click="selectMembers">
                <div style="width: 80px;height:80px" @click="selectMembers">
                    <bui-image @click="selectMembers" width="80" height="80px" :src="'/image/cy_new.png'" radius="50"></bui-image>
                </div>
                <div class="flex1">
                    <text style="color: #434343;font-size: 24px; margin-top: 10px;">添加</text>
                </div>
            </div>
            <div class="user" v-for="(item,index) in memberDatas" v-if="(lineNumber==-1)||(index<lineNumber)">
                <div class="cell-box center">
                        <div style="width: 80px;height:80px">
                            <bui-image width="80px" height="80px" :src="getImageUrl(item.picture)+'&width=80&height=80'" radius="50" @click="onAvatarClick(index,item)" placeholder="/image/usertp.png"></bui-image>
                        </div>
                        <div style="width:80px;">
                            <text style="color:#434343;font-size: 24px; margin-top: 10px;lines :1; text-overflow:ellipsis; word-break: normal; white-space:nowrap; text-align: center; ">{{item.name}}</text>
                        </div>
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
        padding-left: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
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
    import factoryApp from '../libs/factory-app.js';
    import ajax from '../../js/ajax.js';
    import buiweex from 'bui-weex';
    import service from '../../js/service.js';
    import engineService from "../../js/services/engine/engineservice";

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
                externalUrl:"",//引擎地址
                info: {},
                memberDatas: [],
                isSearching: false,
                refreshing: false,
                pageSize: 10,
                pageNo: 1,
                keyword: '',
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
                linkapi.startContactMulitSelector("邀请成员", 7, {}, result=> {
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
            }/*,
            exitMember(){
                //删除成员
                this.deleteMembers(this.currUserId, true);
            }*/,
            initData(type){//type1 刷新数据 2为加载更多
                let keyword = '';
                if (this.isSearching) {
                    keyword = this.keyword;
                }
                let params = {
                    //url: Config.serverConfig.uamUrl + '/extendApproval/getApprovalUserList',
                    url:this.externalUrl + '/meta_data_members/query_members',
                    data: {
                        /*sourceModule: this.info.entityId,
                        sourceId: this.info.dataId,*/
                        page: this.pageNo,
                        page_size: this.widgetParams.lines?this.widgetParams.lines*7:this.pageSize,
                        keyWord: keyword,
                        dataId:this.info.dataId,
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
                        } else if (type == 2) {
                            const length = result.data.resultSet.length;
                            if (length > 0) {
                                this.memberDatas = this.memberDatas.concat(result.data.resultSet)
                            }
                        }
                        let _this = this;
                        setTimeout(function(){factoryApp.pageScrollUpdate(_this)},300);//需要更新滚动条的设置
                    } else {
                        this.$toast('获取数据失败!');
                    }
                }).catch((error, text)=> {
                    factoryApp.stopLoading(this);//关闭加载圈
                    //this.$toast(Util.handleException(error));
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
            /*deleteMembers(ids, isSelf){
                if (Util.isEmpty(ids)) {
                    return;
                }
                this.isShowLoading = true;
                let datas = {
                    entityName: this.info.entityId,
                    sourceId: this.info.sourceId,
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
            },*/
            inviteMembers(userId, orgId, groupId, isRemoveExistsMembers){
                if (Util.isEmpty(userId) && Util.isEmpty(orgId) && Util.isEmpty(groupId)) {
                    return
                }
                this.isShowLoading = true;
                let params = {
                    url:this.externalUrl + '/meta_data_members',
                    //url: Config.serverConfig.uamUrl + '/extendApproval/sendApproval',
                    data: Util.toHttpRequestParams({
                        metaEntityId: this.info.entityId,
                        dataId: this.info.dataId,
                        userIds: userId,
                        orgIds: orgId,
                        groupIds: groupId,
/*                        userId: userId,
                        userIds: userId,
                        orgId: orgId,
                        orgIds: orgId,
                        groupId: groupId,
                        groupIds: groupId,
                        approvalUserIds: userId,*/
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
                        //this.initData(1);
                        factoryApp.refresh(this);
                        this.$toast("操作成功");
                    } else {
                        this.$toast("操作失败！");
                    }
                }, error=> {
                    factoryApp.stopLoading(this);//关闭加载圈
                    //this.isShowLoading = false;
                    //this.$toast(Util.handleException(error))
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
            },
            getWidgetContext(){
                //本部件暴露的参数
                return Object.assign({},this.widgetParams)
            },
            refresh(){
                //注册刷新事件是facoty-api的refresh方法的范围内
                this.initData(1);
            }
        },
        computed:{
            lineNumber(){
                return (this.widgetParams.lines||this.widgetParams.lines===0)?((this.widgetParams.lines*7)-1):-1
            }
            /*lineStyle(){
                //显示行数样式
                return (this.widgetParams.lines||this.widgetParams.lines===0)?{"height":(Number(this.widgetParams.lines)*180)}:{}
            }*/
        },
        mounted(){
            let params =this.widgetParams,_t = this;//页面参
            if (params != null && !Util.isEmpty(params.dataId)) {
                this.info.dataId = params.dataId;
                if(!Util.isEmpty(params.entityId)){
                    this.info.entityId = params.entityId;
                    //this.$alert(Config.serverConfig)
                    service.init(Config.serverConfig.configServerUrl);//初始化请求到的地址
                    /*service.getEngineUrlMeta(params.entityId).then(res=>{
                        _t.externalUrl = res;
                        _t.initData(1);
                    });//获取引擎地址*/
                    Config.readRuntimeConfig(this.$getContextPath()).catch(err => {}).then(runtimeConfig => {
                        _t.externalUrl = runtimeConfig.apiBaseUrl;
                        _t.initData(1);
                    })
                }else if(!Util.isEmpty(params.entityName)){
                    //只存在实体名称
                    engineService.getEntity(params.entityName).then((data)=>{
                        //获取实体id,引擎地址
                        _t.info.entityId = data.attrs.metaEntityId;
                        _t.externalUrl= data.engineUrl;
                    })
                }
            } else {
                //this.$toast("参数未传递");
            }
            storage.removeItem("exit");
            globalEvent.addEventListener("resume", e => {
                storage.getItem("exit", event => {//
                    if (event.result == "success") {
                        this.$pop();
                    }
                 });
                _t.initData(1);
            });//监听应用激活 刷新
        },
        created(){
            factoryApp.init(this);//初始化全局api的指向
        }
    }
</script>