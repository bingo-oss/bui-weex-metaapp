<template>
    <div class="full-column">
        <bui-header :leftItem="{icon: 'ion-chevron-left'}" :title="title" @leftClick="() =>{this.$pop()}">
            <div slot="right" class="header-right-wrapper">
                <div class="header-button">
                    <!--头部为上拉菜单操作区域-->
                    <template v-if="mobileHeaderOperations().length===1">
                        <meta-operation  btn-type="icon" :operation="mobileHeaderOperations()[0]" :widget-context="getWidgetContext()"></meta-operation>
                    </template>
                    <bui-icon v-if="mobileHeaderOperations().length>1" name="ion-ios-more" color="white" @click="titleOperationClicked"></bui-icon>
                </div>
            </div>
        </bui-header>

        <div class="full-column">
            <scroller class="full-column" style="background-color: #F8F8F8;">
                <div class="panel">
                    <text class="panel-header">基本信息</text>
                    <div class="panel-body-form">
                        <meta-widget-page ref="formPage" :query="{dataId:params.dataId}" :widget-params="params"></meta-widget-page>
                    </div>
                </div>
                <div class="panel">
                    <text class="panel-header">附件</text>
                    <div class="panel-body">
                        <attachment v-model="attachmentObject.list"></attachment>
                    </div>
                </div>
                <div class="panel">
                    <text class="panel-header">正文</text>
                    <div class="panel-body">
                        <attachment v-model="formalArticleObject"></attachment>
                    </div>
                </div>
                <div class="panel">
                    <text class="panel-header">审批轨迹</text>
                    <div class="panel-body">
                        <approval-trail :widget-params="abstract" v-if="abstract.procInstId"></approval-trail>
                    </div>
                </div>
            </scroller>
        </div>

        <!--表单底部为公共操作区域-->
        <div class="action-bar">
            <meta-operation v-for="(toolbarBtn,index) in widgetParams.commonOperations" :operation="toolbarBtn" :widget-context="getWidgetContext(toolbarBtn)" :key="index" class="full-column" style="flex: 1"></meta-operation>
        </div>

        <!--下拉弹出窗口-->
        <actionsheet-wrapper
                ref="actionsheet"
                v-model="showActionsheet"
        >
            <div v-for="(commonOpt,index) in mobileHeaderOperations()" :key="index">
                <meta-operation class="full-column" btn-type="dropdown" :operation="actionsheetStyle(commonOpt,index)" :widget-context="getWidgetContext()" @triggered="actionsheetTriggered" @successed="actionsheetSuccessed"></meta-operation>
            </div>
        </actionsheet-wrapper>

    </div>
</template>

<script>
    import service from './js/service';
    import buiweex from 'bui-weex';
    import EventBus from '../../js/bus';
    import Utils from '../../js/tool/utils';
    import _ from '../../js/tool/lodash.js'

    export default {
        props: {
            widgetParams: {
                // 表单组件的定义
                type: Object,
                required: true
            }
        },
        data() {
            return {
                abstract:{},
                params:{
                    hideHeader:true//隐藏内嵌的部件头部
                },
                title:"详情",
                leftItem: {
                    icon: 'ion-chevron-left'
                },
                attachmentObject:{
                    list:[],//用于存储附件组件返回的数据结构
                    oList:[]//存储附件数据,用于过滤新数据结构
                },
                formalArticleObject:{},//正文对象
                showActionsheet: false
            }
        },
        created(){
            //EventBus.$emit("widget-push-title",this.title);
        },
        computed: {
            subParams(){
                let _t = this;
                return {
                    taskId:_t.params.taskId,
                    processDefinitionKey:_t.params.procDefKey,
                    businessKey:_t.params.businessKey,
                    variables: {
                        hrPass: true
                    },
                    localVariables:{
                        opinion:""
                    },
                    "payloadType":"CompleteTaskPayload"
                }
            }
        },
        methods:{
            getWidgetContext(item){
                return {
                    processLauncher:this
                }
            },
            approveProcess(param){
                let formPromise=this.$refs.formPage.submit();
                let _t=this;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        var formData=data&&data[0];
                        if(_t.abstract.processInstance) {
                            service.taskComplete(param).then((res) => {
                                resolve(res);
                                _t.$toast('提交成功');
                                _t.back();
                            })
                        }else{
                            //需要对没有关联任务的数据进行初始化信息
                            param.businessKey = _t.widgetParams.businessKey;
                            param.procDefKey = _t.widgetParams.procDefKey;
                            param.payloadType = "StartProcessPayload";
                            service.startProcessInstanceCmd(param).then((res)=> {
                                resolve();
                                _t.$toast('提交成功');
                                _t.back();
                            })
                        }
                    },(erro)=>{
                        reject();
                        _this.$toast(erro);
                    })
                },(erro)=>{
                    reject();
                    _this.$toast(erro);
                })
            },
            dismissProcess(){
                //驳回流程
                let formPromise=this.$refs.formPage.submit();
                let _t=this;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        var formData=data&&data[0];
                        service.taskReject(_t.subParams).then((res)=>{
                            resolve(res);
                            _t.$toast('驳回成功');
                            _t.back();
                        },(erro)=>{
                            buiweex.alert(erro)
                        });
                    });
                })
            },
            processFormSave(){
                //表单保存
                let formPromise=this.$refs.formPage.submit();
                let _this=this;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        resolve();
                        _this.$toast('编辑成功');
                    },(erro)=>{
                        reject();
                        _this.$toast(erro);
                    });
                },(erro)=>{
                    reject();
                    _this.$toast(erro);
                });
            },
            back:function(){
                this.$pop();
            },
            formatDateTime(obj){
                let d = new Date(obj);
                return Utils.formatDate(d);
            },
            mobileHeaderOperations(){
                var opts=(this.widgetParams&&this.widgetParams.actionsheetOperation);
                //下拉菜单操作
                var _opts=[];
                _.each(opts,function(opt){
                    var terminalType=opt[Utils.operationTermimalTypeField];
                    if(terminalType!==1){
                        _opts.push(opt);
                    }
                });
                return _opts;
            },
            titleOperationClicked(){
                this.showActionsheet = true;
            },
            actionsheetTriggered(type){
                //针对下拉菜单显隐处理--部件类型操作比较特殊
                if(type=="widget"){
                    this.$refs.actionsheet.hide();
                }else{
                    this.$refs.actionsheet._maskClick()
                }
            },
            actionsheetSuccessed(type){
                //针对下拉菜单显隐处理--部件类型操作比较特殊
                this.$refs.actionsheet._maskClick()
            },
            actionsheetStyle(item,index){
                //处理按钮样式
                item.style={
                    "color":"#4CA4FE",
                    "font-size":"30px"
                }
                return item;
            }
        },
        mounted(){
            let _this = this,_params = this.params,_businessKey,_procDefKey;
            if(_this.widgetParams.taskId=="undefined"){_this.widgetParams.taskId=""}
            if(_this.widgetParams.businessKey=="undefined"){_this.widgetParams.businessKey=""}
            service.getTaskInfo(_this.widgetParams.taskId,_this.widgetParams.businessKey).then((res) =>{
                //任务信息
                _this.abstract = Object.assign(res,{"procInstId":res.processInstanceId});
                if(res.processInstance){
                    _businessKey = res.processInstance.businessKey
                }else if(_this.widgetParams.businessKey){
                    _businessKey = _this.widgetParams.businessKey
                }
                if(res.processDefinitionId) {
                    _procDefKey = res.processInstance.processDefinitionKey
                }else {
                    _procDefKey = _this.widgetParams.procDefKey;
                }
                Object.assign(_params,{"dataId":_businessKey,"taskId":res.id});//设置下数据id--表单部件接受的参数
                service.getProcdefSetting(_procDefKey,res.taskDefinitionKey).then(function (res) {
                    //获取流程配置
                    if (res.settings) {
                        Object.assign(_params, res.settings);
                    }
                    _this.params = Object.assign({} ,_this.widgetParams,_params);
                })
                service.getAttachment(_params.taskId,_businessKey).then((res) =>{
                    //获取对应任务下的附件
                    let _attachment=[];
                    _.each(res.data,(item,index)=>{
                        if(item.attachmentType==1){
                            //正文
                            _this.formalArticleObject = [item];
                        }else{
                            _attachment.push(item)
                        }
                    });
                    //_this.attachmentObject.oList = Object.assign([],_attachment);
                    _this.attachmentObject.list = _attachment;
                })

            });
        },
        components: {
            //流程处理轨迹部件
            approvalTrail: require("./components/approval-trail/approval-trail.vue")
        }
    };
</script>
<style src="../../styles/common.css"></style>
<style lang="css">
    .action-bar {
        border-top-color: #e6e4e4;
        border-top-width: 1px;
        border-top-style: solid;
        padding-top:15px;
        padding-bottom: 15px;
        padding-left: 10px;
        padding-right: 10px;
        flex-direction: row;
    }
    .slider-item{flex-direction: column;}
    .action-button {
        height: 100px;
        flex-direction: row;
        align-items: center;
        flex: 1;
        background-color: #F9F9F9;
        border-top-style: solid;
        border-top-width: 2px;
        border-top-color: #CCCCCC;
    }
    .action-button-text{
        flex: 1;
        text-align: center;
        font-size: 34px;
        color: #86868D;
        border-left-color: #BEBCBC;
        border-left-width: 1px;
        border-left-style: solid;
    }
    .widget-operation{
        background-color: #000;
    }
    .pageSize1{
        font-size: 34px;
    }
    .pageSize2{
        font-size: 28px;
        color: #666;
    }
    .process_abstract{
        flex-direction: column;
        align-items: flex-start;
        margin-left: 20px;
        margin-right: 20px;
        padding-bottom: 50px;
    }
    ._wrap{
        padding-top: 25px;
        flex-wrap: wrap;
    }
    .process_foot{ padding-top: 15px; padding-left: 15px; padding-right: 15px;}
    .panel {
        margin-bottom: 20px;
        background-color: #fff;
        border-color: #E5E5E5;
        border-width: 1px;
    }
    .panel-header{
        font-size: 30px;
        font-weight: bold;
        padding-top: 20px;
        padding-bottom: 20px;
        padding-left: 30px;
        padding-right: 30px;
    }
    .panel-body{
        padding-bottom: 20px;
        padding-left: 30px;
        padding-right: 30px;
    }
    .panel-body-form{
        padding-bottom: 20px;
        padding-left: 10px;
        padding-right: 10px;
    }
</style>