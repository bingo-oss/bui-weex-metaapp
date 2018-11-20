<template>
    <div class="wrapper">
        <div  v-if="startVal" class="mybtn_d">
            <div class="mybtn" @click="startDuty" :style="bgstyle">
                <text class="btntext" style="font-size: 34px;color: #FFFFFF;">开始值班</text>
            </div>
            <div class="tips">
                <text class="tipcolor">点击开始值班</text>
                <text class="tipcolor">值班期间将实时收到预警消息</text>
            </div>
        </div>

        <div  v-if="endVal" class="mybtn_d">
            <div class="mybtn"  @click="endDuty" :style="bgstyle">
                <text class="btntext" style="font-size: 34px;color: #FFFFFF;">结束值班</text>
            </div>
            <div class="timetips">
                <text class="tipval">已值班：{{ondutytime}}</text>
            </div>
        </div>
    </div>
</template>
<script>
    import service from '../../js/service.js';
    import ajax from '../../js/ajax.js';
    import config from '../../js/config.js';
    import Utils from '../../js/tool/utils.js';

    const linkapi = require('linkapi');
    const globalEvent = weex.requireModule('globalEvent');
    import _ from '../../js/tool/lodash';

    import buiweex from "bui-weex";
    /*
    * 初始化发请求，判断什么状态 值班中or未值班
    * 未值班状态：startVal=true;正在值班：endVal=true;
    * 未值班状态：点击发送请求（时间给后台）;
    * 值班状态： 获取开始值班时间， 获取当前时间，求出值班时长;
    * */
    module.exports = {
        props: {
            widgetParams: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                startVal: null, //初始化应该为null
                endVal: null,  //初始化应该为null
                classObject: {
                    activecolor: true
                },
                currentTime: '', //点击开始值班记录的开始时间
                timer: null, //开始值班的定时器,值班中的定时器
                ondutytime: "", //页面显示值班时长
                begintime: null,
                min: 0, //分
                hour: 0, //小时
                viewConfigInfo: null, //视图配置信息
                engineUrl: null,
                orgId: null,
                onDutyPersonId: null,
                dutyId: null,
                stopClick:false
            }
        },
        methods: {
            startDuty: function () { //开始值班
                if(this.stopClick){
                    return false;
                }
                let _this = this;
                var curtime = Utils.realTime(new Date().getTime()); //当前的时间
                var startTime = this.timeformat(curtime);

                //orgId=c72ab416-16d2-4f0c-aaf9-1ebadb416ca8
                //onDutyPersonId=e4cfb2ca-7b83-44d5-a32d-1f0c0fc6c94f
                let params = {
                    "isOnDuty": 1,
                    "startTime": startTime,
                    "orgId": this.orgId,
                    "onDutyPersonId": this.onDutyPersonId
                }

                _this.startVal = false;
                _this.endVal = true;
                _this.stopClick = true;
                _this.ondutytime = "";
                ajax.post(`${this.engineUrl}/${this.viewConfigInfo.metaEntityName.toLowerCase()}`, params).then(res => {
                    this.dutyId = res.data["$id"]
                    this.begintime = Utils.realTime(new Date(res.data.startTime).getTime());//转换成时间戳
                    this.stopClick = false;
                    //请求成功后开始获取当前时间，和开始计算时长；
                    this.currentTime = Utils.realTime(new Date().getTime());
                    _this.timer = setInterval(_this.computtime, 1000); //计算正在值班的时间时长
                });

            },
            endDuty: function () { //结束值班
                if(this.stopClick){
                    return false;
                }
                var curtime = Utils.realTime(new Date().getTime()); //当前的时间
                var now = this.timeformat(curtime);
                let params = {
                    "endTime": now,
                    "duration": "值班历时时长:"+this.ondutytime,
                    "isOnDuty": 0
                }
                let _this = this;
                _this.stopClick = true;
                clearInterval(_this.timer);

                ajax.patch(`${this.engineUrl}/${this.viewConfigInfo.metaEntityName.toLowerCase()}/${this.dutyId}`, params).then(res => {
                    _this.stopClick = false;
                    //this.$alert(res); duration  endTime
                    _this.startVal = !_this.startVal;
                    _this.endVal = !_this.endVal;
                    _this.currentTime = 0;
                });
            },
            getDutyInfo: function () { //获取值班信息
                /**
                 * 1.通过视图viewId,获取视图的配置信息
                 * 2.通过prrojectid，获取到容器的地址,然后拼接上实体名，去get值班信息
                 * 3.get的时候添加条件参数params:值班人是当前用户+是否正在值班=是  (查询后data[]为0 则表示没有值班)
                 *
                 *  viewShortId:sU7SEtExK8gNRvFc8xGmbM
                 * */
                let _this = this;
                let viewId = this.widgetParams.viewShortId; //视图id
                let mobileType = "";
                if ((weex.config.env.deviceModel.indexOf("iPhone") != -1)) {
                    mobileType = 2
                } else if ((weex.config.env.deviceModel.indexOf("iPhone") == -1)) {
                    mobileType = 1
                }
                let setData = {terminalType: mobileType};
                let contextPath = this.$getContextPath();
                config.readRuntimeConfig(contextPath).catch(err => {
                }).then(runtimeConfig => {
                    service.init(runtimeConfig.configServerUrl);    //初始化请求到的地址

                    service.getMetaViewDef(viewId, setData).catch(err => {
                    }).then(viewConfigInfo => {    //获取视图配置的一些信息
                        //存储起来，以便后续发请求使用
                        _this.viewConfigInfo = viewConfigInfo;
                        let params = {};
                        params.filters = "onDutyPersonId eq " + _this.onDutyPersonId + " and isOnDuty eq 1"
                        service.getEngineUrl(_this.viewConfigInfo.projectId).then(engineUrl => {
                            //存储起来，以便后续发请求使用
                            _this.engineUrl = engineUrl;
                            ajax.get(`${engineUrl }/${_this.viewConfigInfo.metaEntityName.toLowerCase()}`, params).then(res => { //需要拼接上实体名
                                if ((_.isArray(res.data)&&(res.data.length==0))||res.data.id) { //无数据说明没有值班，有数据说明值班中
                                    _this.startVal = true;
                                } else { //有数据 获取数据的开始值班时间startTime 然后获取当前的时间 计算出时间
                                    var _data;
                                    if(_.isArray(res.data)){
                                        _data = res.data[0];
                                    }else{
                                        _data = res.data;
                                    }
                                    _this.dutyId = _data.id
                                    let begindutyTime = _data.startTime //开始值班的时间
                                    _this.begintime = Utils.realTime(new Date(begindutyTime).getTime());//转换成时间戳
                                     _this.currentTime = _this.begintime;

                                    /*function starting() {
                                        var curtime = Utils.realTime(new Date().getTime()); //当前的时间
                                        var timerdif = curtime - _this.begintime; //时间差（时间戳）

                                        //转换成时分秒
                                        _this.hour = parseInt((timerdif % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                        _this.min = parseInt((timerdif % (1000 * 60 * 60)) / (1000 * 60));
                                        var seconds = parseInt((timerdif % (1000 * 60)) / 1000);
                                        _this.ondutytime = (this.hour?(this.hour + '小时:'):'') + (this.min?(this.min + '分钟:'):'') + seconds + '秒'
                                    }*/

                                    //循环计时
                                    _this.timer = setInterval(this.computtime, 1000);

                                    //更改样式
                                    _this.startVal = false;
                                    _this.endVal = true;
                                }
                            });
                        });
                    })
                })

            },
            computtime: function () {    //计算时长(当前的时间 - 开始值班的时间)
                var newcurtime = Utils.realTime(new Date().getTime());
                var timelength = newcurtime - this.currentTime;
                //var seconds = parseInt((timelength % (1000 * 60)) / 1000);  //时间戳转换为秒
                this.hour = parseInt((timelength % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                this.min = parseInt((timelength % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = parseInt((timelength % (1000 * 60)) / 1000);
                /*if (seconds === 0) {
                    this.min += 1;
                }
                if (this.min > 59) {
                    this.hour += 1;
                    this.min = 0;
                }*/
                this.ondutytime = (this.hour?(this.hour + '小时:'):'') + (this.min?(this.min + '分钟:'):'') + seconds + '秒'
            },
            timeformat: function (curtime) { //参数为时间戳 转换时间格式为：“2018-11-17 13:58:02”
                var date = new Date(curtime);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
                var Y = date.getFullYear() + '-';
                var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                var D = date.getDate() + ' ';
                var h = (date.getHours()<10?("0"+date.getHours()):date.getHours()) + ':';
                var m = (date.getMinutes()<10?("0"+date.getMinutes()):date.getMinutes()) + ':';
                var s = (date.getSeconds()<10?("0"+date.getSeconds()):date.getSeconds());
                return Y + M + D + h + m + s;
            }
        },
        computed: {
            bgstyle() { //更改按钮背景色
                return {
                    backgroundColor: this.startVal ? '#4EC3F2' : '#009900'
                }
            }
        },
        mounted() {
            globalEvent.addEventListener("androidback", e => {
                this.$pop();
            });
        },
        beforeMount() {
            let _this = this;
            linkapi.getLoginInfo(function (data) { //需要link客户端才能获取到信息
                _this.orgId = data.orgId;
                _this.onDutyPersonId = data.userId;
                _this.getDutyInfo();
            });
        },
        created() {

        },
        destroyed() {
            //当跳转到其他页面的时候，要在生命周期的destroyed里清空this.timerID
            clearInterval(this.timer);
        }

    }
</script>
<style lang="css">
    .wrapper {
        padding-top: 20px;
        padding-bottom: 40px;
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-bottom-color: #f1f1f1;
    }

    .mybtn_d{
        width: 750px;
        justify-content: center;
        align-items: center;
    }
    .mybtn {
        justify-content: center;
        align-items: center;
        width: 256px;
        height: 256px;
        border-radius: 300px;
        margin-top: 38px;
        margin-bottom: 25px;
    }

    .tips {
      justify-content: center;
          align-items: center;
    }

    .timetips {
        flex-direction: row;
        justify-content: center;
    }

    .tipcolor {
        font-size: 32px;
        color: #ccc;
    }

    .tipval {
        font-size: 32px;
        color: #ccc;
    }

</style>