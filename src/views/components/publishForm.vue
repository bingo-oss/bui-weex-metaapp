<template>

    <div class="flex-column" style="background-color: #f6f6f6" @viewappear="onViewAppear"
         @viewdisappear="onViewDisAppear">
        <bui-header :title="title" :leftItem="leftItem" :rightItem="rightItem"
                    @leftClick="back" @rightClick="onSubmit" :style="{'backgroundColor':themeBg}">
        </bui-header>
        <scroller style="flex:1;">
            <div style="background-color: #fff;padding: 20px;">
                <textarea style="height: 200px;" autofocus="false" rows="10" :placeholder="placeholder"
                          v-model="form.content"
                          ref="input"
                          @blur="onBlur"
                          @input="onInput"></textarea>

                <div style="margin-top: 10px">
                    <div v-for="(item,i) in fileResources">
                        <div class="flex-row row-center-left"
                             style="background-color: #f2f2f2;margin-top: 10px;padding: 20px;margin-left: 5px">
                            <bui-image width="60px" height="60px" :src="getImageUrl(item.resourceUrl)"
                                       :placeholder="item.resourceType==5||item.resourceType==6?'/image/app_default.png':'/image/icon-diskFile.png'"></bui-image>
                            <text style="font-size: 25px;color: #696969;margin-left: 10px"
                                  :value="item.resourceDescription">
                            </text>
                        </div>
                        <bui-icon name="ion-minus-circled" @click="onDeleteAttachment(item)"
                                  style="position: absolute;top: 15px;right: 5px;"></bui-icon>
                    </div>
                </div>

                <div class="flex-fluid flex-row">
                    <div class="center" v-for="(item,index) in imageResources"
                         style="height: 140px;width: 140px;margin-top: 20px;margin-left: 20px">
                        <image style="width: 140px;height: 150px" :src="getImageURI(item)"></image>
                        <bui-icon v-if="isDeleteStatus" name="ion-minus-circled" @click="onDeleteImage(item)"
                                  style="position: absolute;top: 0px;right: 0px;" color="#505050"></bui-icon>
                    </div>

                    <div class="flex-row" v-if="isMayAddImage">
                        <div class="center add-image">
                            <bui-icon name="ion-ios-plus-empty" size="120px"
                                      @click="showImageActionSheet"
                                      color="#B9B8B8"></bui-icon>
                        </div>
                        <div class="center add-image" v-if="imageResources.length>0">
                            <bui-icon :name="isDeleteStatus?'ion-ios-close-empty':'ion-ios-minus-empty'" size="120px"
                                      @click="showDeleteImage"
                                      color="#B9B8B8"></bui-icon>
                        </div>
                    </div>

                </div>
            </div>

            <!--通知-->
            <div v-if="entityName=='ExtendNotify'" style="margin-top: 50px;">
                <text class="notice-title">发送方式</text>
                <div class="flex-row center notice-type border-bootom" @click="onNoticeType(1)">
                    <div class="flex1">
                        <text class="notice-value" value="邮件"></text>
                    </div>
                    <div class="flex-row row-right-bottom center" v-if="noticeType.email">
                        <bui-icon name="ion-android-done" size="48px" color="#767676"
                                  style="margin-right: 30px"></bui-icon>
                    </div>
                </div>
                <div class="flex-row center notice-type" @click="onNoticeType(2)">
                    <div class="flex1">
                        <text class="notice-value" value="短信"></text>
                    </div>
                    <div class="flex-row row-right-bottom center" v-if="noticeType.sms">
                        <bui-icon name="ion-android-done" size="48px" color="#767676"
                                  style="margin-right: 30px"></bui-icon>
                    </div>
                </div>
            </div>

            <!--日程-->
            <div v-if="entityName=='ExtendSchedule'">
                <div class="schedule-div" style="margin-top: 30px;">
                    <div class="flex-row center border-bootom" style="height: 100px;">
                        <div class="flex-row">
                            <text style="font-size: 30px;" value="开始时间"></text>
                        </div>
                        <div class="flex1 flex-row row-right-bottom" @click="onDateClick(1)">
                            <text style="font-size: 32px" :value="form.startDate" @click="onDateClick(1)"></text>
                            <text v-if="!form.isAllDay" style="margin-left: 20px;font-size: 32px"
                                  :value="form.startTime" @click="onTimeClick(1)"></text>
                            <bui-icon name="ion-ios-arrow-forward" size="45px" color="#818181"></bui-icon>
                        </div>
                    </div>
                    <div class="flex-row center" style="height: 100px;">
                        <div class="flex-row">
                            <text style="font-size: 30px;" value="结束时间"></text>
                        </div>
                        <div class="flex1 flex-row row-right-bottom" @click="onDateClick(2)">
                            <text style="font-size: 32px" :value="form.endDate" @click="onDateClick(2)"></text>
                            <text v-if="!form.isAllDay" style="margin-left: 20px;font-size: 32px" :value="form.endTime"
                                  @click="onTimeClick(2)"></text>
                            <bui-icon name="ion-ios-arrow-forward" size="45px" color="#818181"></bui-icon>
                        </div>
                    </div>
                </div>
                <div class="schedule-div" style="margin-top: 10px;">
                    <div class="flex-row center"
                         style="height: 100px;">
                        <div class="flex1">
                            <text style="font-size: 30px;" value="是否全天"></text>
                        </div>
                        <div class="flex-row center">
                            <switch :checked="this.form.isAllDay" @change="switchChange"></switch>
                        </div>
                    </div>
                </div>
            </div>


        </scroller>

        <!--表情-->
        <emoji-express v-if="isShowExpression" @faceSelected="onFaceSelected"></emoji-express>

        <div class="flex-row tab-bottom-div">
            <div class="flex1 center">
                <bui-image width="60px" height="60px" src="/image/mb_btn_face_selector0.png"
                           @click="onSelectFaces"></bui-image>
            </div>
            <div class="flex1 center">
                <bui-image width="60px" height="60px" src="/image/mb_btn_at_selector0.png"
                           @click="onAtClick"></bui-image>
            </div>
            <div class="flex1 center">
                <bui-image width="60px" height="60px" src="/image/mb_btn_disk_selector.png"
                           @click="showFileActionSheet"></bui-image>
            </div>
            <div class="flex1 center">
                <bui-image width="60px" height="60px" src="/image/app_service.png"
                           @click="onSelectApp"></bui-image>
            </div>
        </div>

        <bui-actionsheet
                :items="imageTypeItems"
                v-model="showImageBar"
                title="请选择类型"
                @itemClick="onSelectImageType"
                ref="imageActionSheet"></bui-actionsheet>

        <bui-actionsheet
                :items="fileTypeItems"
                v-model="showFileBar"
                title="请选择类型"
                @itemClick="onSelectFileType"
                ref="fileActionSheet"></bui-actionsheet>

        <bui-loading ref="loading" :show="isShowLoading" title="提交中"></bui-loading>

        <dialog v-model="showDialog" @btnClick="onDialogCallback" title="提示" :buttonArray="buttonArray"
                :dialogContent="dialogContent">
        </dialog>


    </div>

</template>

<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss"></style>
<style>
    .add-image {
        height: 140px;
        width: 140px;
        border-style: dashed;
        border-color: #dedddd;
        border-width: 1px;
        margin-top: 20px;
        margin-left: 20px
    }

    .border-bootom {
        border-bottom-color: #e3e3e3;
        border-bottom-width: 1px;
        border-bottom-style: solid
    }

    .notice-type {
        height: 90px;
        background-color: #fff;
    }

    .notice-title {
        margin-left: 20px;
        margin-bottom: 5px
    }

    .notice-value {
        font-size: 30px;
        margin-left: 20px
    }

    .schedule-div {
        background-color: #fff;
        padding-left: 20px;
        padding-right: 20px
    }

    .tab-bottom-img {
        width: 60px;
        height: 60px
    }

    .tab-bottom-div {
        padding-top: 15px;
        padding-bottom: 15px;
        background-color: #fff
    }
</style>
<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const linkapi = require("linkapi");
    var picker = weex.requireModule('picker');
    var moment = require('moment');
    const storage = weex.requireModule('storage')
    import emojiExpression from '../components/emojiExpression.vue'
    import Util from '../../js/utils'
    import Config from '../../js/config'
    import loading from './loading.vue'
    import dialog from '../components/dialog.vue'

    module.exports = {
        components: {'emoji-express': emojiExpression, 'bui-loading': loading, 'dialog': dialog},
        data () {
            return {
                placeholder: '',
                title: '',
                leftItem: {
                    icon: 'ion-ios-arrow-left',
                },
                rightItem: {
                    text: '确定'
                },
                entityName: '',
                form: {
                    content: '',
                    startTime: '',
                    endTime: '',
                    startDate: '',
                    endDate: '',
                    isAllDay: false
                },
                isSowTime: true,
                publishForm: {},
                isShowExpression: false,
                imageTypeItems: ['拍照', '选择图片'],
                fileTypeItems: ['本地文件', '云盘文件'],
                showImageBar: false,
                showFileBar: false,
                lastInputContent: '',
                lastSelectionPosition: 0,
                atArray: [],
                atAccountIds: [],
                activityInfo: {},
                sourceId: '',
                memberIds: [],
                allResources: [],
                isDeleteStatus: false,
                isMayAddImage: true,
                noticeType: {
                    email: true,
                    sms: false,
                },
                atAll: false,
                memberDatas: [],
                isShowLoading: false,
                smsMaxCount: 0,
                smsResidueCount: 0,
                memberNumber: 0,
                showDialog: false,
                buttonArray: [],
                dialogContent: '',
            }
        },
        methods: {
            "back": function () {
                this.$pop();
            },
            onDialogCallback(val){
                this.showDialog = false;
                if (this.dialogType == 2) {
                    if (val.type == 1) {//返回
                        this.$pop()
                    }
                }
            },
            onNoticeType(type){//1为邮件 2为sms
                if (type == 1) {
                    this.noticeType.email = !this.noticeType.email;
                } else if (type == 2) {
                    this.noticeType.sms = !this.noticeType.sms;
                }
            },
            closeKeyboard(){
                this.$refs.input.blur();
            },
            convertTime(date, time){
                let value = (date + ' ' + time).trim();
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
            },
            switchChange(value){
                this.form.isAllDay = !this.form.isAllDay;
            },
            handleForm(){
                switch (this.entityName) {
                    case 'ExtendWorktask':
                        break;
                    case 'ExtendSchedule':
                        this.publishForm.startTime = this.convertTime(this.form.startDate, this.form.startTime);
                        this.publishForm.endTime = this.convertTime(this.form.endDate, this.form.endTime);
                        this.publishForm.isAllDay = this.form.isAllDay;
                        if (this.publishForm.startTime == "") {
                            this.$toast("开始时间不能为空!");
                            return false;
                        }
                        if (this.publishForm.endTime == "") {
                            this.$toast("结束时间不能为空!");
                            return false;
                        }
                        if (this.publishForm.endTime < this.publishForm.startTime) {
                            this.$toast("结束时间不能小于开始时间!");
                            return false;
                        }
                        break;
                    case 'ExtendNotify':
                        this.publishForm.sendType = ''
                        if (this.noticeType.email) {
                            this.publishForm.sendType = '1'
                        }
                        if (this.noticeType.sms) {
                            if (this.publishForm.sendType != '') {
                                this.publishForm.sendType = this.publishForm.sendType + ',2'
                            } else {
                                this.publishForm.sendType = '2'
                            }
                        }
                        if (this.noticeType.sms && this.form.content.length > 120) {
                            this.$toast("内容字数不能超过120个字符!")
                            return false;
                        }
                        this.publishForm.content = this.form.content;
                        this.publishForm.title = moment(new Date).format('MM[月]DD[号]') + '通知';
                        break;
                    case 'ExtendDocument':
                        this.publishForm.fillUserId = this.form.userId;
                        if (this.form.content.length > 120) {
                            this.$toast("内容字数不能超过200个字符!")
                            return false;
                        }
                        break;
                    case 'ExtendQingShi':
                        break;
                    case 'ExtendHuiBao':
                        break;
                }
                if (this.form.content == '') {
                    this.$toast("内容不能为空!");
                    return false;
                }
                if (this.form.content.length > 2000) {
                    this.$toast("内容字数不能超过2000个字符!")
                    return false;
                }
                return true;
            },
            onSubmit() {
                this.closeKeyboard();
                if (!this.handleForm()) {
                    return;
                }
                let content = this.handleContent();
                if (this.entityName == "ExtendNotify" && this.publishForm.sendType.indexOf("2") > -1 && this.atAccountIds.length > 0) {//校验短信数量
                    if (this.atAll) {
                        if (this.memberNumber + this.atAccountIds.length - 1 > this.smsResidueCount) {
                            this.$alert("由于您发送的免费短信条数已达到" + this.smsMaxCount + "条上限，无法发送成功，如需购买请咨询在线客服!");
                            return
                        }
                    } else {
                        if (this.atAccountIds.length > this.smsResidueCount) {
                            this.$alert("由于您发送的免费短信条数已达到" + this.smsMaxCount + "条上限，无法发送成功，如需购买请咨询在线客服!");
                            return
                        }
                    }
                }
                let params = {
                    url: Config.serverConfig.uamUrl + '/webCommon/' + this.entityName + '/saveOrUpdate',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        relations: {},
                        relationsData: {},//用于发表通知
                        blogContent: content,
                        entity: this.publishForm,
                        atAll: this.atAll,
                        atAccountIds: this.atAccountIds,
                        resources: this.allResources,
                    },
                };
//                return;
                let json = {};
                json[this.activityInfo.sourceId] = this.activityInfo.name;
                params.data.relations[this.activityInfo.suiteId] = json;
                this.isShowLoading = true;
                linkapi.post(params).then((result) => {
                    if (result.success) {
                        if (this.entityName == 'ExtendNotify' && this.atAccountIds.length > 0 && this.publishForm.sendType != "") {
                            if (this.isContainAtAll()) {
                                this.getMemberDatas(result.result.id, this.publishForm.sendType);
                            } else {
                                this.sendNotify(result.result.id, this.publishForm.sendType, this.atAccountIds.join(","));
                            }
                        } else {
                            this.isShowLoading = false;
                            this.$toast("发表成功");
                            storage.setItem("blogRefreshList", true);
                            this.back();
                        }
                    } else {
                        this.isShowLoading = false;
                        this.$toast("发表失败:" + result.msg);
                    }

                }).catch((error)=> {
                    this.isShowLoading = false;
                    this.$toast("发表失败:" + Util.handleException(error))
                })
            },
            checkedSmsMaxCount(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/notify/getCurrentECSmsParent',
                };
                linkapi.get(params).then((result)=> {
                    if (result.s == 1) {
                        for (let item of result.r) {
                            if (item.code == "SMS_ENTERPRISE_MAX_COUNT") {
                                this.smsMaxCount = parseInt(item.name);
                            } else if (item.code == "SMS_REMAINING_COUNT") {
                                this.smsResidueCount = parseInt(item.name);
                            }
                        }
                    }
                }).catch((error)=> {
                });
            },
            isContainAtAll(){
                let index = this.atAccountIds.indexOf("all");
                if (index > -1) {
                    return true;
                }
                return false;
            },
            sendNotify(id, sendType, userIds){
                let params = {
                    url: Config.serverConfig.uamUrl + '/notify/sendNotify',
                    data: Util.toHttpRequestParams({
                        notityId: id,
                        sendType: sendType,
                        userIds: userIds,
                    }),
                };
                linkapi.post(params).then((result) => {
                    this.isShowLoading = false;
                    if (result.success) {
                        let emailSendSuccessCount = result.data.emailSendSuccess;
                        let smsSendSuccessCount = result.data.smsSendSuccess;
                        storage.setItem("blogRefreshList", true);
                        this.dialogContent = "发送成功！其中给" + smsSendSuccessCount + "人成功发送短信，" + emailSendSuccessCount + "人成功发送邮件，其他由于邮件地址/手机号信息不全导致无法发送";
                        this.buttonArray = [{type: 1, title: '确定'}];
                        this.dialogType = 1;
                        this.showDialog = true;
                        //   this.$pop()
                    } else {
                        this.$toast("发表失败:" + JSON.stringify(result));
                    }
                }).catch((error)=> {
                    this.isShowLoading = false
                    this.$toast("发表失败:" + Util.handleException(error))
                })
            },
            handleContent(){
                let content = this.form.content;
                this.atAccountIds = [];
                for (let item of this.atArray) {
                    let json = {
                        id: item.userId,
                        name: item.name,
                        type: 0,
                    };
                    let text = "@" + item.name;
                    let index = content.indexOf(text);
                    if (index > -1) {
                        content = content.replace(text, "@" + JSON.stringify(json));
                        content = content.replace("@" + JSON.stringify(json) + " ", "@" + JSON.stringify(json));
                        this.atAccountIds.push(item.userId);
                        if (item.userId == "all") {
                            this.atAll = true;
                        }
                    }
                }
                content = content.trim();
                return content;
            },
            onBlur(e){
            },
            onAtClick(){
                let params = {
                    idForAtProjectMembers: this.sourceId,
                    onlyAtProjectMembers: true
                };
                linkapi.startContactMulitSelector("选择@对象", 1, params, result => {
                    if (result.user) {
                        for (let i in result.user) {
                            if (result.user[i].userId == "all") {
                                result.user[i].name = "全体成员"
                            }
                            this.atArray.push(result.user[i]);
                            let prefix = this.form.content.substring(0, this.lastSelectionPosition);
                            let suffix = this.form.content.substring(this.lastSelectionPosition, this.form.content.length);
                            this.form.content = prefix + "@" + result.user[i].name + " " + suffix;
                            this.lastSelectionPosition = this.form.content.length - suffix.length;
                        }
                    }
                }, error => {
                    this.$alert(error)
                })
            },
            onInput(event){//监听输入
                let newContent = event.value;
                let len = newContent.length - this.lastInputContent.length;

                this.$refs.input.getSelectionRange((e) => {
                    if (e.selectionStart != 0) {
                        this.lastSelectionPosition = e.selectionStart;
                    }
                    if (len > 0) {
                        let text = newContent.substring(this.lastSelectionPosition - 1, this.lastSelectionPosition);
                        if (text === '@') {//at选人
                            let params = {
                                idForAtProjectMembers: this.sourceId,
                                onlyAtProjectMembers: true
                            };
                            linkapi.startContactMulitSelector("选择@对象", 1, params, result => {
                                if (result.user) {
                                    for (let i in result.user) {
                                        if (result.user[i].userId == "all") {
                                            result.user[i].name = "全体成员"
                                        }
                                        this.atArray.push(result.user[i])
                                        if (i == 0) {
                                            let prefix = this.form.content.substring(0, this.lastSelectionPosition);
                                            let suffix = this.form.content.substring(this.lastSelectionPosition, this.form.content.length);
                                            this.form.content = prefix + result.user[i].name + " " + suffix;
                                            this.lastSelectionPosition = this.form.content.length - suffix.length;
                                        } else {
                                            let prefix = this.form.content.substring(0, this.lastSelectionPosition);
                                            let suffix = this.form.content.substring(this.lastSelectionPosition, this.form.content.length);
                                            this.form.content = prefix + "@" + result.user[i].name + " " + suffix;
                                            this.lastSelectionPosition = this.form.content.length - suffix.length;
                                        }
                                    }
                                    this.$nextTick(function () {
                                        this.$refs.input.setSelectionRange(this.lastSelectionPosition, this.lastSelectionPosition);
                                    })
                                }
                            }, null)
                        }
                    }
                });
                this.lastInputContent = newContent;
            },
            onFaceSelected(val){
                let prefix = this.form.content.substring(0, this.lastSelectionPosition);
                let suffix = this.form.content.substring(this.lastSelectionPosition, this.form.content.length);
                this.form.content = prefix + val + suffix;
                this.lastSelectionPosition = prefix.length + val.length;
            },
            onDateClick(type){
                picker.pickDate({
                    value: this.date
                }, (event)=> {
                    if (event.result == 'success') {
                        if (type == 1) {
                            this.form.startDate = event.data;
                            if (this.form.startTime == "" && !this.form.isAllDay) {
                                this.onTimeClick(1)
                            }
                        } else {
                            this.form.endDate = event.data;
                            if (this.form.endTime == "" && !this.form.isAllDay) {
                                this.onTimeClick(2)
                            }
                        }
                    }
                });
            },
            onTimeClick(type){
                picker.pickTime({
                    value: this.date
                }, (event)=> {
                    if (event.result == 'success') {
                        if (type == 1) {
                            this.form.startTime = event.data;
                            if (this.form.startDate == '') {
                                this.form.startDate = Util.getDateNow();
                            }
                        } else {
                            this.form.endTime = event.data;
                            if (this.form.endDate == '') {
                                this.form.endDate = Util.getDateNow();
                            }
                        }
                    }
                });
            },
            getLoginInfo(){
                linkapi.getLoginInfo((result)=> {
                    this.form.userId = result.userId;
                    this.form.userName = result.userName;
                    this.form.orgName = result.orgName;
                    this.form.orgId = result.orgId;

                    this.publishForm.fillUserId = result.userId;
                    this.publishForm.responsiblePersonId = result.userId;
                    this.publishForm.orgId = result.orgId;
                });
            },
            getImageURI(item){
                let uri = "file://" + item.resourceLocal
                return uri;
            },
            getImageUrl(path){
                if (path == "" || path == null) {
                    return "";
                }
                return Config.serverConfig.uamUrl + "/ui/download?filepath=" + path;
            },
            onSelectApp(){
                var url = this.$getContextPath() + "/appList.weex.js";
                this.$push(url, {});
            },
            onSelectFaces(){
                this.isShowExpression = !this.isShowExpression;
                this.closeKeyboard();
            },
            handleAppParams(e){
                let _resourceUrl = {};
                let actionParams = e.actionParams;
                actionParams = actionParams.replace(":id", this.activityInfo.sourceId);
                switch (e.terminalType) {
                    case 1:
                        _resourceUrl = {'android': actionParams};
                        break;
                    case 2:
                        _resourceUrl = {'ios': actionParams};
                        break;
                    case 3:
                        _resourceUrl = {'android': actionParams, 'ios': actionParams};
                        break;
                    case 4:
                        _resourceUrl = {'pc': actionParams, 'web': actionParams};
                        break;
                }
                this.allResources.push({
                    "resourceType": 6, // 0、图片，1、视频，2、声音，3、文件，4、网页，5、终端操作（[OpenApp] appCode=xxx appUrl=xxx），6、多端操作（{"android":"[OpenApp] appCode=xxx appUrl=xxx","ios":"[OpenApp] appCode=xxx appUrl=xxx","pc":"[OpenUrl] url=xxx","web":"[OpenUrl] url=xxx"}
                    "resourceUrl": JSON.stringify(_resourceUrl),
                    "resourceOrder": this.allResources.length,
                    "resourceThumb": e.icon,
                    "resourceDescription": e.name,
                    "resourceSize": null,
                    "extraInfo": JSON.stringify({'id': e.ID, 'type': 'esService'})
                });
                this.publishForm.linkedApp = e.ID;
            },
            onViewAppear(){
                storage.getItem("appData", event => {
                    if (event.result == "success" && event.data != null && event.data != '') {//用于判断是否从选择应用页面返回到该表单页面
                        let appData = JSON.parse(event.data);
                        this.handleAppParams(appData)
                    }
                });
            },
            onViewDisAppear(){
                storage.removeItem("appData");
            },
            onDeleteAttachment(item){
                let index = this.allResources.indexOf(item);
                if (index > -1) {
                    this.allResources.splice(index, 1)
                }
            },
            onDeleteImage(item){
                let index = this.allResources.indexOf(item);
                if (index > -1) {
                    this.allResources.splice(index, 1)
                }
            },
            onSelectFile(type){
                linkapi.selectFiles(type, (result) => {
                    this.$toast("上传中....")
                    this.uploadFile(result.resource)
                }, (error)=> {
                });
            },
            uploadFile(resArray){
                linkapi.uploadFiles(resArray, (result) => {
                    this.allResources = this.allResources.concat(JSON.parse(result.resource));
                    if (this.entityName == "ExtendDocument") {
                        if (this.fileResources.length > 0) {
                            if (this.form.content == "") {
                                this.form.content = this.fileResources[0].resourceDescription;
                            } else if (this.form.content == this.fileResources[0].resourceDescription) {
                                this.form.content = this.fileResources[0].resourceDescription + "等" + this.fileResources.length + "文件";
                            }
                        }
                    }
                }, (error)=> {
                    this.$toast("上传文件失败");
                });
            },
            showDeleteImage(){
                this.isDeleteStatus = !this.isDeleteStatus
            },
            showImageActionSheet(){
                this.isDeleteStatus = false;
                this.closeKeyboard();
                if (this.imageResources.length >= 9) {
                    this.$alert("最多只能上传9张图片!");
                    return;
                }
                this.showImageBar = true;
                this.$refs.imageActionSheet.show();
            },
            showFileActionSheet(){
                this.closeKeyboard();
                this.showFileBar = true;
                this.$refs.fileActionSheet.show();
            },
            onSelectImageType(item){
                let index = this.imageTypeItems.indexOf(item);
                if (index == 0) {
                    this.onSelectFile(0)
                } else if (index == 1) {
                    this.onSelectFile(1)
                } else if (index == 2) {
                    linkapi.openVideoRecord();
                }
            },
            onSelectFileType(item){
                let index = this.fileTypeItems.indexOf(item);
                if (index == 0) {
                    this.onSelectFile(2)
                } else if (index == 1) {
                    this.onSelectFile(3)
                }
            },
            handlePublishType(){
                switch (this.entityName) {
                    case 'ExtendWorktask':
                        this.title = "发表任务";
                        this.placeholder = "请输入任务内容";
                        break;
                    case 'ExtendSchedule':
                        this.title = "发表日程";
                        this.placeholder = "请输入日程内容";
                        this.form.startDate = moment(new Date()).utc().zone(-8).format('YYYY-MM-DD');
                        this.form.startTime = moment(new Date()).utc().zone(-8).format('HH:mm');
                        this.form.endDate = moment(new Date()).utc().zone(-8).format('YYYY-MM-DD');
                        this.form.endTime = moment(new Date()).utc().zone(-8).format('HH:mm');
                        break;
                    case 'ExtendNotify':
                        this.title = "发表通知";
                        this.placeholder = "请输入通知内容";
                        this.checkedSmsMaxCount();
                        this.getActivityMemberCount();
                        break;
                    case 'ExtendDocument':
                        this.title = "发表文档";
                        this.placeholder = "请输入文档内容";
//                        this.isMayAddImage=false;
                        this.showFileActionSheet();
                        break;
                    case 'ExtendQingShi':
                        this.title = "发表请示";
                        this.placeholder = "请输入请示内容";
                        break;
                    case 'ExtendHuiBao':
                        this.title = "发表汇报";
                        this.placeholder = "请输入汇报内容";
                        break;
                }
            },
            getMemberDatas(id, sendType){//type1 刷新数据 2为加载更多
                let params = {
                    url: Config.serverConfig.uamUrl + '/extendApproval/getApprovalUserList',
                    data: {
                        sourceModule: this.activityInfo.suiteId,
                        sourceId: this.activityInfo.sourceId,
                    }
                };
                linkapi.get(params).then((result)=> {
                    if (result.success) {
                        this.memberDatas = result.data.resultSet;
                        if (this.memberDatas.length > 0) {
                            let userIds = '';
                            for (let item of this.memberDatas) {
                                if (userIds == "") {
                                    userIds = item.userId;
                                } else {
                                    userIds = userIds + "," + item.userId;
                                }
                            }
                            for (let item of this.atAccountIds) {
                                if (item != "all" && userIds.indexOf(item) == -1) {
                                    userIds = userIds + "," + item;
                                }
                            }
                            this.sendNotify(id, sendType, userIds);
                        }
                    }
                }).catch((error)=> {
                    //this.$toast(Util.handleException(error));
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
            getFileSuffix(name){
                let suffix = "";
                if (name != "") {
                    if (name.lastIndexOf(".") > -1) {
                        suffix = name.substring(name.lastIndexOf(".") + 1)
                    }
                }
                return suffix;
            },
            getFileSize(strSize){
                let size = 0;
                if (!Util.isEmpty(strSize)) {
                    strSize = strSize + "";
                    if (strSize.endsWith("KB")) {
                        let s = strSize.substring(0, strSize.length - 2)
                        size = parseInt(parseFloat(s) * 1024);
                    } else if (strSize.endsWith("MB")) {
                        size = parseInt(parseFloat(strSize.substring(strSize.length - 2)) * 1024 * 1024);
                    } else if (strSize.endsWith("B")) {
                        size = parseInt(parseFloat(strSize.substring(strSize.length - 2)));
                    }
                }
                return size;
            }
        },
        computed: {
            imageResources(){
                let _array = this.allResources.filter((item ,index)=> {

                    return (item.resourceType == 0);
                });
                return _array
            },

            fileResources(){
                let _array = this.allResources.filter(item => {
                    if (item.resourceType != 0) {
                        item.extension = this.getFileSuffix(item.resourceDescription)
                        item.resourceSize = this.getFileSize(item.resourceSize)
                    }
                    return item.resourceType != 0;
                });
                return _array
            },
        },
        mounted(){
            Config.readRuntimeConfig(this.$getContextPath()).then(runtimeConfig => {
                let params = this.$getPageParams();
                if (params != null) {
                    this.entityName = params.entityName;
                    this.sourceId = params.sourceId;
                    this.activityInfo = JSON.parse(params.activityInfo);
                    this.getLoginInfo();
                    this.handlePublishType();
                }
            }).catch(error => {
                this.$alert(error)
            });

            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
            globalEvent.addEventListener("keyboardStatus", e => {//键盘监听
                if (e.status == 'show') {
                    this.isShowExpression = false;
                }
            });
        }
    }
</script>