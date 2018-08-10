<template>

    <div>
        <bui-header title="请选择应用" :leftItem="leftItem"
                    @leftClick="back">
        </bui-header>

        <bui-searchbar-left @search="onSearch"></bui-searchbar-left>

        <list class="bui-list" loadmoreoffset="2">
            <!--刷新组件-->
            <!--           <refresh class="bui-refresh" @refresh="onRefresh" @pullingdown="onPullingdown($event)"
                                :display="refreshing ? 'show' : 'hide'">
                           <bui-icon :name="refreshIcon" size="40px" style="margin-right: 5px;"></bui-icon>
                           <text class="bui-refresh-indicator">{{refreshText}}</text>
                       </refresh>-->
            <!--列表内容组件-->
            <cell class="cell-box" v-for="(item,index) in appList" @click="onListItemClick(index)">
                <div class="bui-list-main">
                    <div class="flex-row" style="align-items: center">
                        <div style="width: 75px;height: 75px">
                            <bui-image style="width: 75px;height: 75px" :src="getImageUrl(item.icon)" radius="10"
                                       placeholder="/image/app_default.png"></bui-image>
                        </div>
                        <text style="margin-left: 15px;font-size: 32px;">{{item.name}}</text>
                    </div>
                </div>
            </cell>
            <!--加载更多-->
            <!--      <loading class="bui-loading" @loading="onLoading" :display="showLoading ? 'show' : 'hide'">
                      <text class="bui-loading-indicator" v-if="showLoading">{{loadingText}}</text>
                      <loading-indicator class="bui-indicator"></loading-indicator>
                  </loading>-->
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
        padding-right: 20px;
        padding-top: 20px;
        padding-bottom: 20px;
        background-color: #fff;
        margin: 10px;
    }

    .cell-box:active {
        background-color: #dedede;
    }

</style>
<script>
    //引入bui-weex模块
    var globalEvent = weex.requireModule('globalEvent');
    const linkapi = require("linkapi");
    const storage = weex.requireModule('storage')
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
                appList: [],
                originalAppList: [],
                keyword: '',
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
                if (Util.isEmpty(value)) {
                    this.appList = this.originalAppList;
                    return;
                }
                this.appList = this.appList.filter((item)=> {
                    return item.name.indexOf(value) > -1;
                });
            },
            onListItemClick(index){
                let params = this.appList[index];
                storage.setItem("appData", params);
                this.$pop();
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
            getAppData(){
                let params = {
                    url: Config.serverConfig.uamUrl + '/esService/esServiceList/mobile',
                    data: {}
                };
                linkapi.get(params).then((result) => {
                    if (result.success == 1) {
                        this.originalAppList = result.result;
                        this.appList = this.originalAppList
                    } else {
                        this.$toast(JSON.stringify(result));
                    }
                }).catch((error)=> {
                    this.$toast(Util.handleException(error));
                });
            }
        },
        mounted()
        {
            Config.readRuntimeConfig(this.$getContextPath()).then(runtimeConfig => {
                this.getAppData();
            }).catch(error => {
                this.$alert(error)
            });
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
        }
    }
</script>