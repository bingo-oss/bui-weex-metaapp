<template>
    <div class="wrapper"ref="viewBox">
        <!--水印-->
        <div class="mark" v-if="waterMarkHide">
            <div class="water-mark">
                <text class="mark-text" v-for="item in markArr" style="margin-top: 120px;">#{{item.userName}}</text>
            </div>
            <div class="water-mark1">
                <text class="mark-text" v-for="item in markArr" style="margin-top: 120px;">#{{item.userName}}</text>
            </div>
            <div class="water-mark2">
                <text class="mark-text" v-for="item in markArr" style="margin-top: 120px;">#{{item.userName}}</text>
            </div>
            <div class="water-mark3">
                <text class="mark-text" v-for="item in markArr" style="margin-top: 120px;">#{{item.userName}}</text>
            </div>
        </div>

        <div class="details-header" v-if="titleInfo.title">
            <div class="escape" v-if="titleInfo.title">
                <text class="escape-in">{{titleInfo.title}}</text>
            </div>
            <div class="flex-row" style="margin-bottom: 25px;">
                <text class="warn" v-if="titleInfo.snapTime">抓拍时间：{{titleInfo.snapTime | timeformat}}</text>
                <text class="warn" v-if="titleInfo.title">预警状态：{{titleInfo.forewarningStatus ? '已处理':'未处理'}}</text>
            </div>
            <div class="flex-row" style="padding-bottom: 25px;">
                <text class="warn" v-if="titleInfo.Camera">摄像机：{{titleInfo.Camera}}</text>
            </div>
        </div>
        <div class="pic-compare" v-if="comparePic&&comparePic.similarityDegree" style="padding-left: 25px;">
            <div class="compare-title">
                <text style="font-size: 28px;">照片比对</text>
            </div>
            <div class="flex-row" style="padding-bottom: 10px">
                <text class="nonal" style="padding: 10px">相似度：</text>
                <text class="similar">{{comparePic.similarityDegree}}%</text>
            </div>
            <div class="pic-con flex-row" style="flex-wrap:wrap; padding-bottom: 15px;">
                <div class="_picture"  v-if="comparePic.snapPicture" v-for="picture in comparePic.snapPicture" @click="handlePreview(picture)">
                    <image class="_picture_img"
                           :src="Config.serverConfig.engineService+'/stream?filePath='+(picture.relativePath||picture.url)+'&width=300&height=400'" @click="handlePreview(picture)"></image>
                    <text class="nonal" style="text-align: center; margin-top: 15px;">抓拍图片</text>
                </div>
                <div class="_picture" v-if="comparePic.originalPicture" v-for="picture in comparePic.originalPicture" @click="handlePreview(picture)">
                    <image class="_picture_img"
                           :src="Config.serverConfig.engineService+'/stream?filePath='+(picture.relativePath||picture.url)+'&width=300&height=400'" @click="handlePreview(picture)"></image>
                    <text class="nonal" style="text-align: center; margin-top: 15px;">库中原图</text>
                </div>
                <div class="_picture" v-if="comparePic.snapPanorama" v-for="picture in comparePic.snapPanorama" @click="handlePreview(picture)">
                    <image class="_picture_img"
                           :src="Config.serverConfig.engineService+'/stream?filePath='+(picture.relativePath||picture.url)+'&width=300&height=400'" @click="handlePreview(picture)"></image>
                    <text class="nonal" style="text-align: center; margin-top: 15px;">抓拍全景图</text>
                </div>
            </div>
        </div>
        <div v-if="titleInfo.title" class="person-info">
            <div class="person-title">
                <text style="font-size: 28px; text-align: left; width: 600px;">人员信息</text>
                <text style="font-size: 28px; color: #3eb4ff; width: 80px; padding: 3px;" @click="infoShow">{{personInfo?"收起":"展开"}}</text>
            </div>
            <!--人员信息-->
            <div class="info-detail" v-if="personInfo">
                <div class="flex-row" v-if="titleInfo.personName" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">人员名称</text>
                    <text style="font-size: 28px">{{titleInfo.personName}}</text>
                </div>
                <div class="flex-row" v-if="infomation.identityNo" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">证件号</text>
                    <text style="font-size: 28px;">{{infomation.identityNo}}</text>
                </div>
                <div class="flex-row" v-if="infomation.belongLibCode" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">所在库</text>
                    <text style="font-size: 28px">{{infomation.belongLibCode}}</text>
                </div>
                <div class="flex-row" v-if="infomation.nation" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">民族</text>
                    <text style="font-size: 28px">{{infomation.nation}}</text>
                </div>
                <div class="flex-row" v-if="infomation.sex" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">性别</text>
                    <text style="font-size: 28px">{{(infomation.sex==1)?"男":"女"}}</text>
                </div>
                <div class="flex-row" v-if="infomation.birthday" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">出生日期</text>
                    <text style="font-size: 28px">{{infomation.birthday}}</text>
                </div>
                <!--<div class="flex-row" v-if="infomation.registryAddress" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">户籍地址</text>
                    <text style="font-size: 28px">{{infomation.registryAddress}}</text>
                </div>-->
                <div class="flex-row" v-if="infomation.executeControlLib" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">来源库</text>
                    <text style="font-size: 28px">{{infomation.executeControlLib}}</text>
                </div>
                <div class="flex-row" v-if="infomation.forewarningTime" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 140px;text-align: right;">预警时间</text>
                    <text style="font-size: 28px">{{infomation.forewarningTime | timeformat}}</text>
                </div>
                <div class="flex-row" v-if="infomation.snapCamera" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;width: 160px;">抓拍机名称</text>
                    <text style="font-size: 28px">{{infomation.snapCamera}}</text>
                </div>
            </div>
        </div>
        <!--处理结果-->
        <div class="results" v-if="titleInfo.forewarningStatus">
            <div class="person-title">
                <text style="font-size: 28px;">处理结果</text>
            </div>
            <div class="info-detail">
                <div class="flex-row" v-if="result.deal" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">处理人</text>
                    <text style="font-size: 28px">{{result.deal}}</text>
                </div>
                <div class="flex-row" v-if="result.department" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">所属部门</text>
                    <text style="font-size: 28px">{{result.department}}</text>
                </div>
                <div class="flex-row" v-if="result.processingTime" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">处理时间</text>
                    <text style="font-size: 28px">{{result.processingTime | timeformat}}</text>
                </div>
                <div class="flex-row" v-if="result.handlingOpinions" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">处理意见</text>
                    <text style="font-size: 28px; width:560px;">{{result.handlingOpinions}}</text>
                </div>
                <div class="flex-row" v-if="result.livePicture&&result.livePicture.length" style="padding-bottom: 18px;">
                    <text class="nonal" style="padding-right: 20px;">现场图片</text>
                    <div style="flex-direction:row;flex-wrap:wrap; flex: 1;">
                        <div v-for="picture in result.livePicture" style="margin:3px 0px 0px 3px;" @click="handlePreview(picture)">
                            <image style="width: 170px;height: 220px;" :src="Config.serverConfig.engineService+'/stream?filePath='+(picture.relativePath||picture.url)+'&width=180&height=220'" @click="handlePreview(picture)"></image>
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
    const globalEvent = weex.requireModule('globalEvent');
    import factoryApp from "../libs/factory-app";
    import linkapi from "linkapi"
    /*
    * 数据获取：通过实体id获取容器地址，拼接参数"数据id"去get
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
                resultshow: null,
                Config:config,
                waterMarkHide:true,
                metaEntit:{},
                markArr:[
                    {userName:""},
                    {userName:""},
                    {userName:""},
                    {userName:""},
                    {userName:""},
                    {userName:""},
                    {userName:""},
                    {userName:""}
                ]
            }
        },
        methods: {
            isIos(){
                if(weex.config.env.deviceModel.indexOf("iPhone") !== -1){//ios暂时先隐藏水印
                    this.waterMarkHide = false;
                }
            },
            infoShow() {
                this.personInfo = !this.personInfo;
            },
            getDetailsInfo() {
                factoryApp.startLoading(this);//显示加载圈
                let _this = this;
                    ajax.get(`${_this.metaEntit.project.engine.externalUrl}/${_this.metaEntit.name}/${_this.widgetParams.dataId}`).then(res => {
                        console.log(res);
                        let cameraId = res.data.cameraId;
                        _this.titleInfo.personName = res.data.personName;
                        _this.titleInfo.forewarningStatus = res.data.forewarningStatus; //预警状态
                        _this.titleInfo.snapTime = res.data.snapTime; //抓拍时间
                        _this.titleInfo.title = res.data.title; //预警标题

                        if(res.data._data&&res.data._data.cameraId){
                            _this.titleInfo.Camera = res.data._data.cameraId[cameraId].title; //摄像头
                        }
                        _this.infomation.identityNo = res.data.identityNo;  //证件号

                        let beCode = res.data.belongLibCode; //所在库编码
                        if(beCode){
                            _this.infomation.belongLibCode = res.data._data.belongLibCode[beCode].title;  //所在库
                        }
                        _this.infomation.nation = res.data.nation;  //名族
                        _this.infomation.sex = res.data.sex;  //性别
                        _this.infomation.birthday = res.data.birthday;  //出生日期
                        _this.infomation.forewarningTime = res.data.forewarningTime; //预警时间
                        _this.infomation.snapCamera = res.data.camera; //抓拍机名称

                        _this.infomation.executeControlLib = res.data.executeControlLib; //来源库

                        /*_this.infomation.registryAddress = res.data.registryAddress; */ //户籍所在地
                        /*_this.infomation.caseCause = res.data.caseCause;*/  //案由
                        _this.comparePic.similarityDegree = res.data.similarityDegree; //相似度
                        if(res.data.snapPicture){
                            if(_.isString(res.data.snapPicture)){
                                _this.comparePic.snapPicture = eval('(' + res.data.snapPicture + ')')  //抓拍图片
                            }else{
                                _this.comparePic.snapPicture = res.data.snapPicture;  //抓拍图片
                            }
                        }
                        if(res.data.snapPanorama){
                            if(_.isString(res.data.snapPanorama)){
                                _this.comparePic.snapPanorama = eval('(' + res.data.snapPanorama + ')')  //抓拍全景图
                            }else{
                                _this.comparePic.snapPanorama = res.data.snapPanorama;  //抓拍全景图
                            }
                        }
                        if(res.data.originalPicture){
                            if(_.isString(res.data.originalPicture)){
                                _this.comparePic.originalPicture = eval('(' + res.data.originalPicture + ')')  //库中图片
                            }else{
                                _this.comparePic.originalPicture = res.data.originalPicture;  //库中图片
                            }
                            /*let originalsrc = _this.comparePic.originalPicture[0].relativePath;
                            _this.comparePic.originalsrc = config.serverConfig.engineService + "/stream?filePath=" + originalsrc*/
                        }
                        factoryApp.stopLoading(this);//关闭加载圈
                        _this.$forceUpdate();//更新下视图
                        if (_this.titleInfo.forewarningStatus == 1) {
                            let params = {};
                            params.filters = "forewarningEntityId eq " + _this.widgetParams.entityId + " and forewarningId eq " + _this.widgetParams.dataId
                            ajax.get(`${_this.metaEntit.project.engine.externalUrl}/forewarningprocessingrecord`, params).then(res => {//处理结果
                                //1是已处理 0是未处理
                                if (res.data && res.data.length) {
                                    let operatorId = res.data[0].operatorId;
                                    let operatorOrgId1 = res.data[0].operatorOrgId;
                                    _this.result.processingTime = res.data[0].processingTime //处理时间
                                    _this.result.department = res.data[0]._data.operatorOrgId[operatorOrgId1].title;    //所属部门
                                    _this.result.deal = res.data[0]._data.operatorId[operatorId].title;    //处理人
                                    _this.result.handlingOpinions = res.data[0].handlingOpinions;  //处理意见
                                    _this.result.livePicture = res.data[0].livePicture;    //现场图片
                                    _this.$forceUpdate();//更新下视图
                                }
                                setTimeout(function(){
                                    factoryApp.pageScrollUpdate(_this);//需要更新滚动条的设置
                                },300)
                            });
                        }else{
                            setTimeout(function(){
                                factoryApp.pageScrollUpdate(_this);//需要更新滚动条的设置
                            },300)
                        }
                    })
            },
            refresh() {
                //部件刷新的实现
                this.getDetailsInfo();
            },
            getWidgetContext() { //本部件暴露的参数
                let _this = this;
                //return Object.assign({}, this.widgetParams, this.titleInfo);
                return Object.assign({},{
                    widgetParams: _this.widgetParams,
                    selectedItem: Object.assign({},_this.titleInfo,_this.infomation)
                })
            },
            handlePreview(file) {
                //预览
                linkapi.openLinkBroswer(file.name?file.name:"预览",`${config.serverConfig.engineService}/stream?filePath=${file.relativePath||file.url}`);
            }
        },
        filters: {
            timeformat(val) {  //时间格式转换
                return Utils.formatDate(val,"yyyy-MM-dd hh:mm");
            }
        },
        mounted(){
            let _this = this;
            service.init(config.serverConfig.configServerUrl); //初始化请求地址
            service.getMetaEntity(_this.widgetParams.entityId).then(res => {
                _this.metaEntit = res;
                _this.getDetailsInfo();
            });
            globalEvent.addEventListener("resume", e => {
                this.getDetailsInfo();
            });

            linkapi.getLoginInfo(function (res){
                //buiweex.alert(JSON.stringify(res.userName));
                _this.user = res.userName;
                for (let i = 0; i < _this.markArr.length; i++) {
                    _this.markArr[i].userName = res.userName;
                }
            });
        },
        created(){
            factoryApp.init(this);//初始化全局api的指向
            this.isIos();//判断ios或android
        }

    }
</script>
<style lang="css">
    template {
        font-size: 28px;
    }
    ._picture{
        justify-content:center;
        margin-top: 15px;
        margin-right: 20px;
        width: 300px;
    }
    ._picture_img{
        width: 300px;
        height: 400px;
    }
    .details-header {
       /*height: 200px;*/
        padding-left: 25px;
        padding-right: 25px;
        background-color: #4DA4FE
    }
    .wrapper {
        background-color: #FFF;
        border-bottom-color: #ececec;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        /*position: relative;*/
    }
    .flex-row {
        flex-direction: row;
    }
    .escape-in {
        color: #FFFFFF;
        font-size: 38px;
        padding-top: 10px;
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
        padding-left: 25px;
        padding-right: 25px;
    }
    .info-detail {
        padding-left: 25px;
        padding-right: 25px;
        padding-top: 20px;
        padding-bottom: 20px;
    }
    .mark{
    }
    .water-mark{
        position: fixed;
        top: 0px;
        left: 0px;
    }
    .water-mark1{
        position: fixed;
        top: -20px;
        left: 220px;
    }
    .water-mark2{
        position: fixed;
        top: -40px;
        left: 440px;
    }
    .water-mark3{
        position: fixed;
        top: -60px;
        left: 660px;
    }
    .mark-text{
        color: #666;
        font-size: 35px;
        opacity: 0.1;
        transform:rotate(-30deg);
        }

</style>