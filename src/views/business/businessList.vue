<template>

    <div>
        <bui-header title="相关业务" :leftItem="leftItem"
                    @leftClick="back" :style="{'backgroundColor':themeBg}">
        </bui-header>

        <bui-searchbar-left @search="onSearch"></bui-searchbar-left>

        <list class="bui-list" loadmoreoffset="2">
            <cell class="cell-box" v-for="(item,index) in dataList" @click="onListItemClick(index)"
                  v-if="item.target!='ExtendPublicNotice'">
                <div class="bui-list-main">
                    <div class="flex-row row-center-left">
                        <div class="flex-row flex1 row-center-left">
                            <div class="center" style="width: 75px;height: 75px">
                                <bui-image style="width: 60px;height: 60px" :src="getImage(item)" radius="10"
                                           placeholder="/image/app_default.png"></bui-image>
                            </div>
                            <text class="title" :value="item.title"></text>
                        </div>
                        <div class="flex-row center">
                            <text style="font-size: 30px" :value="item.count"></text>
                            <bui-icon name="ion-ios-arrow-right" size="40px" color="#B9B8B8"></bui-icon>
                        </div>
                    </div>
                </div>
            </cell>
        </list>

    </div>
</template>

<!--引入bui-weex样式文件-->
<style lang="sass" src="bui-weex/src/css/buiweex.scss">
</style>
<style>
    .cell-box {
        border-bottom-style: solid;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        padding-left: 10px;
        padding-top: 20px;
        padding-bottom: 20px;
        background-color: #fff;
        margin: 10px;
    }

    .cell-box:active {
        background-color: #dedede;
    }

    .title {
        margin-left: 15px;
        font-size: 30px
    }

</style>
<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const linkapi = require("linkapi");
    var link = weex.requireModule("LinkModule");
    const stream = weex.requireModule('stream');
    import Util from '../../js/utils'
    import Config from '../../js/config'

    module.exports = {
        components: {},
        data () {
            return {
                leftItem: {
                    icon: 'ion-ios-arrow-left',
                },
                rightItem: {
                    text: '更多'
                },
                dataList: [],
                originalDataList: [],
                keyword: '',
                sourceId: '',
                esServiceList: [],
                activityInfo: {},
                isArchive: false
            }
        },
        methods: {
            "back": function () {
                this.$pop();
            },
            "rightclick": function () {
            },
            onSearch(value){
                this.keyword = value;
                if (value == "" || value == null) {
                    this.dataList = this.originalDataList;
                    return;
                }
                this.dataList = this.dataList.filter((item)=> {
                    return item.title.indexOf(value) > -1;
                });
            },
            onListItemClick(index){
                let item=this.dataList[index];
                let target = item.target;
                if (target == "Milestone"||target == "Staffing") {//大事记、人员报备
         /*           let params = {
                        appCode: 'meta_form',
                        appUrl: 'list.weex.js?viewId='+item.settings.viewShortId+'&activityId='+this.activityInfo.sourceId,
                    };
                    linkapi.runApp(params, null, null);
*/
                    let  params = "[OpenApp]\nappCode=meta_form\nappUrl=list.weex.js"+"\nviewId=" +item.settings.viewShortId + "\nactivityId=" + this.activityInfo.sourceId;
                    link.launchLinkService([params], null, null);
                } else {
                    if (this.esServiceList.length == 0) {
                        this.getEsServiceList();
                        return;
                    }
                    let json = this.esServiceList.find((item, index, arr) => {
                        return item.entityName == target;
                    });
                    if (json && json.actionParams) {
//                        link.launchLinkService([json.actionParams], null, null);
                        let actionParams = json.actionParams;
                        let _array = actionParams.split("\n");
                        if (_array.length < 2) {
                            _array = actionParams.split(" ");
                        }
                        let params = {
                            appCode: _array[1].split("=")[1],
                            appUrl: _array[2].split("=")[1],
                            data: {
                                parentId: this.activityInfo.sourceId,
                                parentEntityName: this.activityInfo.suiteId,
                                parentText: this.activityInfo.name,
                                E: target,
                                parentIdArray: JSON.stringify([{
                                    entityName: this.activityInfo.suiteId,
                                    id: this.activityInfo.sourceId
                                }]),
                                archive: this.isArchive
                            }
                        }
                        linkapi.runApp(params, null, null);
                    } else {
                        let params = {
                            appCode: 'crm',
                            appUrl: 'LinkOl/Modular/public/list.html',
                            data: {
                                parentId: this.activityInfo.sourceId,
                                parentEntityName: this.activityInfo.suiteId,
                                parentText: this.activityInfo.name,
                                E: target,
                                parentIdArray: JSON.stringify([{
                                    entityName: this.activityInfo.suiteId,
                                    id: this.activityInfo.sourceId
                                }]),
                                archive: this.isArchive
                            }
                        }
                        linkapi.runApp(params, null, null);
                    }
                }
            },
            getImageUrl(path){
                if (Util.isEmpty(path)) {
                    return "";
                }
                return Config.serverConfig.uamUrl + "/ui/download?filepath=" + path;
            },
            getImage(item){
                let entityName = item.target;
                let icon = item.icon;
                let url = "";
                switch (entityName) {
                    case 'ExtendWorktask':
                        url = '/image/related_task.png';
                        break;
                    case 'ExtendSchedule':
                        url = '/image/ralated_richeng.png';
                        break;
                    case 'ExtendNotify':
                        url = '/image/related_tongzhi.png';
                        break;
                    case 'ExtendDocument':
                        url = '/image/related_document.png';
                        break;
                    case 'ExtendQingShi':
                        url = '/image/related_qingshi.png';
                        break;
                    case 'ExtendHuiBao':
                        url = '/image/related_huibao.png';
                        break;
                    case 'Staffing':
                        url = '/image/related_jlbb.png';
                        break;
                    case 'ExtendQianDao':
                        url = '/image/related_qiaodao.png';
                        break;
                    case 'Milestone':
                        url = '/image/related_memorabilia.png';
                        break;
                    default:
                        url = this.getImageUrl(icon);
                        break;
                }

                return url;
            },
            getInternalCount(index){
                let item = this.dataList[index];
                let url = item.urlForCount;
                url = url.replace(":id", this.activityInfo.sourceId);
                if (url.indexOf("?") > -1) {
                    url = url + "&limit=1&total=true"
                } else {
                    url = url + "?limit=1&total=true"
                }
                linkapi.getToken().then(res => {//直接用stream，是因为要用到响应头，获取内部关系模块的数量放在响应头里面了。。
                    let token = res["accessToken"];
                    stream.fetch({
                        method: 'GET',
                        url: url,
                        type: 'json',
                        headers: {
                            'Authorization': 'Bearer' + token
                        }
                    }, ret=> {
                        if (ret.ok) {
                            let headers = ret.headers;//
                            if (headers['X-Total-Count']) {
                                let item = this.dataList[index];
                                item.count = headers['X-Total-Count'];
                                Vue.set(this.dataList, index, item)
                            }
                        }
                    }, null);
                });
            },
            getExternalCount(index){//外部关系模块数量
                let item = this.dataList[index];
                let url = item.urlForCount;
                url = url.replace(":id", this.activityInfo.sourceId);
                let params = {
                    url: Config.serverConfig.uamUrl + url,
                };
                linkapi.get(params).then((result) => {
                    if (result.success) {
                        item.count = result.result.dataCount;
                        Vue.set(this.dataList, index, item)
                    } else {
                        item.count = 0;
                        Vue.set(this.dataList, index, item)
                    }
                }).catch((error)=> {
                    //  this.$toast(Util.handleException(error))
                });
            },
            handleCount(){
                for (let i = 0; i < this.dataList.length; i++) {
                    if (this.dataList[i].type == 0) {//外部关系
                        this.getExternalCount(i)
                    } else {
                        this.getInternalCount(i)
                    }
                }
            },
            getEsServiceList(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/odata/getEsServiceList?$format=json&terminalType=1',
                };
                linkapi.get(params).then((result) => {
                    if (result.d && result.d.getEsServiceList) {
                        this.esServiceList = JSON.parse(result.d.getEsServiceList).r;
                    }
                }).catch((error)=> {
                    this.$toast(Util.handleException(error))
                });
            }
        },
        mounted(){
            Config.readRuntimeConfig(this.$getContextPath()).then(runtimeConfig => {
                let params = this.$getPageParams();
                if (params && params.data) {
                    this.originalDataList = JSON.parse(params.data);
                    this.dataList = this.originalDataList;
                    this.activityInfo = JSON.parse(params.activityInfo);
                    this.isArchive = eval(params.isArchive);
                    this.getEsServiceList();
                    this.handleCount();
                }
            }).catch(error => {
                this.$alert(error)
            });
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
        }
    }
</script>