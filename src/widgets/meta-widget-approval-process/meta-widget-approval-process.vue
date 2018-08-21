<template>
    <div class="full-column">
        <bui-header :leftItem="{icon: 'ion-chevron-left'}" :title="title" @leftClick="() =>{this.$pop()}">
            <div slot="right" class="header-right-wrapper">
                <div class="header-button">
                    <!--头部为上拉菜单操作区域-->
                    <template v-if="this.widgetParams.actionsheetOperation.length===1">
                        <meta-operation  btn-type="icon" :operation="this.widgetParams.actionsheetOperation[0]" :widget-context="getWidgetContext()"></meta-operation>
                    </template>
                    <bui-icon v-if="this.widgetParams.actionsheetOperation.length>1" name="ion-ios-more" color="white" @click="titleOperationClicked"></bui-icon>
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
            <div v-for="(commonOpt,index) in this.widgetParams.actionsheetOperation" :key="index">
                <meta-operation class="full-column" btn-type="dropdown" :operation="actionsheetStyle(commonOpt,index)" :widget-context="getWidgetContext()" @triggered="actionsheetTriggered" @successed="actionsheetSuccessed"></meta-operation>
            </div>
        </actionsheet-wrapper>

        <bui-loading :show="isShowLoading" :loading-text="loadingText==''?'加载中...':loadingText"></bui-loading>

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
                showActionsheet: false,
                isShowLoading:false,
                loadingText:""
            }
        },
        created(){
            //EventBus.$emit("widget-push-title",this.title);
        },
        computed: {
            metaForm(){
                //读取formPage内的视图配置
                return this.$refs.formPage.$refs.childWidgets.filter((cw)=>{return cw.metaForm})[0].metaForm;
            },
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
                    processLauncher:this,
                    selectedId:this.params.dataId,
                    form:this
                 }
            },
            approveProcess(param){
                let formPromise=this.$refs.formPage.submit();
                let _t=this;
                _t.isShowLoading = true;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        var formData=data&&data[0];
                        if(param.taskId) {
                            service.taskComplete(param).then((res) => {
                                resolve(res);
                                _t.isShowLoading = false;
                                _t.$toast('提交成功');
                                _t.back();
                            },(err)=>{
                                _t.isShowLoading = false;
                                _t.$toast('提交失败');
                                reject()
                            })
                        }else{
                            //需要对没有关联任务的数据进行初始化信息
                            param.businessKey = _t.widgetParams.businessKey;
                            param.procDefKey = _t.widgetParams.procDefKey;
                            param.payloadType = "StartProcessPayload";
                            service.startProcessInstanceCmd(param).then((res)=> {
                                _t.isShowLoading = false;
                                resolve(res);
                                _t.$toast('提交成功');
                                _t.back();
                            },(err)=>{
                                _t.isShowLoading = false;
                                _t.$toast('提交失败');
                                reject()
                            })
                        }
                    },(erro)=>{
                        reject();
                        _t.isShowLoading = false;
                        _this.$toast(erro);
                    })
                },(erro)=>{
                    reject();
                    _this.$toast(erro);
                    _t.isShowLoading = false;
                })
            },
            dismissProcess(){
                //驳回流程
                let formPromise=this.$refs.formPage.submit();
                let _t=this;
                _t.isShowLoading = true;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        var formData=data&&data[0];
                        service.taskReject(_t.subParams).then((res)=>{
                            resolve(res);
                            _t.$toast('驳回成功');
                            _t.back();
                            _t.isShowLoading = false;
                        },(erro)=>{
                            _t.isShowLoading = false;
                            buiweex.alert(erro)
                        });
                    });
                })
            },
            processFormSave(){
                //表单保存
                let formPromise=this.$refs.formPage.submit();
                let _this=this;
                _this.isShowLoading = true;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        resolve();
                        _this.$toast('编辑成功');
                        _this.isShowLoading = false;
                        _this.back();
                    },(erro)=>{
                        reject();
                        _this.$toast(erro);
                        _this.isShowLoading = false;
                    });
                },(erro)=>{
                    reject();
                    _this.$toast(erro);
                    _this.isShowLoading = false;
                });
            },
            back:function(){
                this.$pop();
            },
            formatDateTime(obj){
                let d = new Date(obj);
                return Utils.formatDate(d);
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
            },
            hideOperations(isApproval,objArry){
                //移除操作处理--目前控制操作的方法
                if(objArry&&!_.isArray(objArry)){
                    //传入的是json对象--作为单个对象
                    objArry = [objArry];
                }
                if(objArry&&objArry.length){
                    _.each(objArry,(obj,index)=>{
                        if(obj.type=="widget"){
                            _.each(this.widgetParams.commonOperations,(opt,index)=>{
                                if(opt&&opt.props&&opt.props.widget&&opt.props.widget.value==obj.value&&isApproval){
                                    if(!obj.name||(opt.name&&obj.name==opt.name)||!opt.name) {
                                        this.widgetParams.commonOperations.splice(index, 1);
                                    }
                                }
                            });
                            _.each(this.widgetParams.actionsheetOperation,(opt,index)=>{
                                if(opt&&opt.props&&opt.props.widget&&opt.props.widget.value==obj.value&&isApproval){
                                    if(!obj.name||(opt.name&&obj.name==opt.name)||!opt.name) {
                                        this.widgetParams.actionsheetOperation.splice(index, 1);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        },
        mounted(){
            let _this = this,_params = this.params,_businessKey,_procDefKey;
            if(_this.widgetParams.taskId=="undefined"){_this.widgetParams.taskId=""}
            if(_this.widgetParams.businessKey=="undefined"){_this.widgetParams.businessKey=""}
            _this.isShowLoading = true;
            service.getTaskInfo(_this.widgetParams.taskId,_this.widgetParams.businessKey).then((res) =>{
                //任务信息
                _this.abstract = res;
                if(res.processInstance&&res.processInstance.businessKey){
                    _businessKey = res.processInstance.businessKey
                    _procDefKey = res.processInstance.processDefinitionKey
                    if(res.processInstance.finished){
                        _this.hideOperations(true,[{type:"widget",value:"submission-frame"}]);
                    }//流程结束隐藏审核按钮
                    _this.abstract = Object.assign({},res,{"procInstId":res.processInstance.id});
                    _this.hideOperations(true,[{type:"widget",value:"submission-frame",name:"startProcess"}]);//发起流程--隐藏提交操作
                }else if(_this.widgetParams.businessKey){
                    _businessKey = _this.widgetParams.businessKey
                    _procDefKey = _this.widgetParams.procDefKey;
                    service.getfirstSteps(_this.widgetParams.procDefKey).then((res)=>{
                        //获取流程第一步信息
                        _this.abstract = Object.assign({},_this.abstract,{nextNodes:res});
                    });
                    _this.hideOperations(true,[{type:"widget",value:"submission-frame",name:"approveProcess"}]);//没有发起流程--隐藏审批操作
                }
                Object.assign(_params,{"dataId":_businessKey,"taskId":res.id});//设置下数据id--表单部件接受的参数
                service.getProcdefSetting(_procDefKey,res.taskDefinitionKey).then(function (res) {
                    //获取流程配置
                    if (res.settings) {
                        Object.assign(_params, res.settings);
                    }
                    _this.params = Object.assign({} ,_this.widgetParams,_params);
                });

                service.getAttachment(_params.taskId,_businessKey).then((res)=>{
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
                    _this.isShowLoading = false;
                    //_this.attachmentObject.oList = Object.assign([],_attachment);
                    _this.attachmentObject.list = _attachment;
                });

                if(_params.taskId){
                    service.isApproval(_params.taskId).then((res)=>{
                        //获取当前登录用户是否具备审批权限
                        _this.abstract.isApproval = res;
                        _this.hideOperations(!res,[{type:"widget",value:"submission-frame"}])
                    },(erro)=>{
                        //_this.abstract.isApproval = true;
                        //_this.hideOperations(true)
                    });
                }

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