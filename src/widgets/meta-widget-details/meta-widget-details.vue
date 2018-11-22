<template>
    <div class="wrapper">
        <div class="details-header" v-if="titleInfo.title">
            <div class="escape">
                <text class="escape-in">{{titleInfo.title}}：{{titleInfo.personName}}</text>
            </div>
            <div class="flex-row" style="padding-bottom: 25px;">
                <text class="warn">预警时间：{{titleInfo.forewarningTime | timeformat}}</text>
                <text class="warn">预警状态：{{titleInfo.forewarningStatus ? '已处理':'未处理'}}</text>
            </div>
            <div class="flex-row" style="padding-bottom: 25px;">
                <text class="warn">摄像机：</text>
                <!--<text class="warn">成员：</text>-->
            </div>
        </div>
        <div class="pic-compare" v-if="comparePic&&comparePic.similarityDegree" style="padding-left: 25px;">
            <div class="compare-title">
                <text style="font-size: 28px;">照片比对</text>
            </div>
            <div class="flex-row">
                <text class="nonal" style="padding: 10px;">相似度：</text>
                <text class="similar">{{comparePic.similarityDegree}}</text>
            </div>
            <div class="pic-con flex-row" style="">
                <div v-if="comparePic.snapsrc" style="justify-content: center;width: 300px;height: 440px;">
                    <image style="width: 300px;height: 400px; padding: 10px;"
                           :src="comparePic.snapsrc"></image>
                    <text class="nonal" style="text-align: center;">抓拍图片</text>
                </div>
                <div v-if="comparePic.originalsrc" style="justify-content: center;width: 300px;height: 440px;">
                    <image style="width: 300px;height: 400px; padding: 10px;"
                           :src="comparePic.originalsrc"></image>
                    <text class="nonal" style="text-align: center;">库中原图</text>
                </div>
            </div>
        </div>
        <div v-if="titleInfo.title" class="person-info">
            <div class="person-title">
                <text style="font-size: 28px; text-align: left; width: 600px;">人员信息</text>
                <text style="font-size: 28px; padding:5px; color: #3eb4ff; width: 80px;" @click="infoShow">{{personInfo?"收起":"展开"}}</text>
            </div>
            <!--人员信息-->
            <div class="info-detail" v-if="personInfo">
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">人员名称</text>
                    <text style="font-size: 28px">{{titleInfo.personName}}</text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">证件号</text>
                    <text style="font-size: 28px;">{{infomation.identityNo}}</text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">所在库</text>
                    <text style="font-size: 28px">{{infomation.belongLib}}</text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">民族</text>
                    <text style="font-size: 28px">{{infomation.nation}}</text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">性别</text>
                    <text style="font-size: 28px">{{infomation.sex}}</text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">出生日期</text>
                    <text style="font-size: 28px">{{infomation.birthday}}</text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">户籍地址</text>
                    <text style="font-size: 28px">{{infomation.registryAddress}}</text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">案由</text>
                    <text style="font-size: 28px; width:560px;">{{infomation.caseCause}}</text>
                </div>
            </div>
        </div>
        <!--处理结果-->
        <div class="results" v-if="this.titleInfo.forewarningStatus">
            <div class="person-title">
                <text style="font-size: 28px;">处理结果</text>
            </div>
            <div class="info-detail">
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">处理人</text>
                    <text style="font-size: 28px"></text>
                </div>
                <div class="flex-row" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">所属部门</text>
                    <text style="font-size: 28px"></text>
                </div>
                <div class="flex-row" v-if="result.processingTime" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">处理时间</text>
                    <text style="font-size: 28px">{{result.processingTime | timeformat}}</text>
                </div>
                <div class="flex-row" v-if="result.handlingOpinions" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">处理意见</text>
                    <text style="font-size: 28px; width:560px;">{{result.handlingOpinions}}</text>
                </div>
                <div class="flex-row" v-if="result.result&&result.result.liveSrc.length" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">现场图片</text>
                    <div style="flex-direction:row;flex-wrap:wrap; flex: 1;" >
                        <div v-for="src in result.liveSrc">
                            <image style="width: 180px;height: 220px; padding:5px 0 0 5px;"
                                   :src="src"></image>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import service from '../../js/service.js';
    import ajax from '../../js/ajax.js';
    import config from '../../js/config.js';
    import Utils from '../../js/tool/utils.js';
    import _ from '../../js/tool/lodash';
    import buiweex from "bui-weex";

    /*
    * 数据获取：通过实体id获取容器地址，拼接参数"数据id"去get
    *
    * 已经创建的实例，需要使用vue.set方法，才能响应data里的数据
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
                personInfo: true,
                entityName: "",
                infomation: {},  //人员信息
                result: {},  //处理结果
                comparePic: {},  //照片对比
                titleInfo: {},  //详情顶部信息
                resultshow: null
            }
        },
        methods: {
            infoShow() {
                this.personInfo = !this.personInfo;
            },
            getDetailsInfo() {
                service.init(config.serverConfig.configServerUrl); //初始化请求地址
                let _this = this;
                service.getMetaEntity(this.widgetParams.entityId).then(res => {
                    //console.log(res.name);
                    //console.log(res.project.engine.externalUrl);
                    let externalUrl = res.project.engine.externalUrl;
                    ajax.get(`${externalUrl}/${res.name}/${_this.widgetParams.dataId}`).then(res => {
                        _this.$set(_this.titleInfo, 'personName', res.data.personName)
                        _this.titleInfo.forewarningStatus = res.data.forewarningStatus; //预警状态
                        _this.titleInfo.forewarningTime = res.data.forewarningTime; //预警时间
                        _this.titleInfo.title = res.data.title; //预警标题

                        _this.$set(_this.infomation, 'identityNo', res.data.identityNo)  //证件号
                        _this.infomation.belongLib = res.data.belongLib;  //所在库
                        _this.infomation.nation = res.data.nation;  //名族
                        _this.infomation.sex = res.data.sex;  //性别
                        _this.infomation.birthday = res.data.birthday;  //出生日期
                        _this.infomation.registryAddress = res.data.registryAddress;  //户籍所在地
                        _this.infomation.caseCause = res.data.caseCause;  //案由

                        _this.$set(_this.comparePic, 'similarityDegree', res.data.similarityDegree)  //相似度
                        _this.comparePic.snapPicture = eval('(' + res.data.snapPicture + ')')  //抓拍图片
                        if (_this.comparePic.snapPicture && _this.comparePic.snapPicture.length > 0) {
                            let snapsrc = _this.comparePic.snapPicture[0].relativePath;
                            _this.comparePic.snapsrc = config.serverConfig.engineService + "/stream?filePath=" + snapsrc
                        }
                        if (_this.comparePic.originalPicture && _this.comparePic.originalPicture.length > 0) {
                            _this.comparePic.originalPicture = eval('(' + res.data.originalPicture + ')')  //库中图片
                            let originalsrc = _this.comparePic.originalPicture[0].relativePath;
                            _this.comparePic.originalsrc = config.serverConfig.engineService + "/stream?filePath=" + originalsrc
                        }

                        if (_this.titleInfo.forewarningStatus == 1) {
                            let params = {};
                            params.filters = "forewarningEntityId eq " + _this.widgetParams.entityId + " and forewarningId eq " + _this.widgetParams.dataId
                            ajax.get(`${externalUrl}/forewarningprocessingrecord`, params).then(res => {//处理结果
                                //1是已处理 0是未处理
                                //_this.$set(_this.result, '', res.data);   //处理人
                                //_this.result = res.data;    //所属部门
                                if(res.data&&res.data.length){
                                    _this.result.processingTime = res.data[0].processingTime
                                    _this.result.handlingOpinions = res.data[0].handlingOpinions;  //处理意见
                                    _this.result.livePicture = res.data[0].livePicture;    //现场图片
                                    /*这里需要判断图片>2两张才遍历*/
                                    _this.result.liveSrc = [];
                                    _.each(res.data[0].livePicture, (val, i) => {
                                        _this.result.liveSrc.push(config.serverConfig.engineService + "/stream?filePath=" + val.relativePath);
                                });
                                }


                            })
                        }
                    })
                })
            },
            getResultInfo() {  //获取处理结果信息
                service.init(config.serverConfig.configServerUrl); //初始化请求地址
                let _this = this;
                let params = {};
                params.filters = "forewarningEntityId eq " + _this.onDutyPersonId + " and forewarningId eq 1"
                service.getMetaEntity(this.widgetParams.entityId).then(res => {
                    ajax.get(`${res.project.engine.externalUrl }/${res.name}/${_this.widgetParams.dataId}`, params).then(res => {

                    })
                })
            },
            refresh(){
                //部件刷新的实现
                this.getDetailsInfo();
            },
            exportParams() { //本部件暴露的参数
                return Object.assign({}, this.widgetParams, this.titleInfo);
            }
        },
        component: {},
        filters: {
            timeformat(val) {  //时间格式转换
                return Utils.formatDate(val);

            }
        },
        created() {
            this.getDetailsInfo();
            globalEvent.addEventListener("resume", e => {
                this.getDetailsInfo();
            });
        }

    }
</script>
<style lang="css">
    template {
        font-size: 28px;
    }

    .details-header {
        height: 180px;
        padding-left: 25px;
        background-color: #4DA4FE
    }
    .wrapper{
        background-color: #FFF;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        border-bottom-style: solid;
    }

    .flex-row {
        flex-direction: row;
    }

    .escape-in {
        color: #FFFFFF;
        font-size: 38px;
        padding-bottom: 25px;
    }

    .warn {
        font-size: 28px;
        color: #C4E1FE;
        padding-right: 40px;
    }

    .compare-title {
        padding-top: 30px;
        padding-bottom: 30px;
    }

    .nonal {
        font-size: 28px;
        color: #c6c7c8;
    }

    .similar {
        font-size: 40px;
        color: crimson;
    }

    .person-title {
        border-bottom-color: #f1f1f1;
        border-bottom-width: 1px;
        border-bottom-style: solid;

        border-top-color: #f1f1f1;
        border-top-width: 1px;
        border-top-style: solid;

        flex-direction: row;
        padding-top: 20px;
        padding-bottom: 20px;
        padding-left: 25px; padding-right: 25px;
    }

    .info-detail{ padding-left: 25px; padding-right: 25px; padding-top: 20px; padding-bottom: 20px;}

</style>