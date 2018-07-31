<template>
    <div class="full-column">
        <div class="full-column">
            <scroller class="full-column" style="background-color: #F8F8F8;">
                <div class="panel">
                    <text class="panel-header">基本信息</text>
                    <div class="panel-body">
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
                    <div class="panel-body"></div>
                </div>
                <div class="panel">
                    <text class="panel-header">流程轨迹</text>
                    <div class="panel-body">
                        <approval-trail :widget-params="abstract" v-if="abstract.procInstId"></approval-trail>
                    </div>
                </div>
            </scroller>
        </div>
        <div class="action-bar">
            <meta-operation v-for="(toolbarBtn,index) in widgetParams.commonOperations" :operation="toolbarBtn" :widget-context="getWidgetContext(toolbarBtn)" :key="index" class="full-column" style="flex: 1"></meta-operation>
        </div>
    </div>
</template>

<script>
    import service from './js/service';
    import buiweex from 'bui-weex';
    import EventBus from '../../js/bus';
    import utils from '../../js/tool/utils';
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
                params:{},
                title:"详情",
                leftItem: {
                    icon: 'ion-chevron-left'
                },
                attachmentObject:{
                    list:[],//用于存储附件组件返回的数据结构
                    oList:[]//存储附件数据,用于过滤新数据结构
                }
            }
        },
        created(){
            EventBus.$emit("widget-push-title",this.title);
        },
        computed: {
            subParams(){
                let _t = this;
                return {
                    taskId:_t.params.taskId,
                    outputVariables: {
                        hrPass: true
                    },
                    localVariables:{
                        opinion:""
                    },
                    "commandType":"CompleteTaskCmd"
                }
            }
        },
        methods:{
            getWidgetContext(item){
                return {
                    processLauncher:this
                }
            },
            startProcess(){
                let formPromise=this.$refs.formPage.submit();
                let _t=this;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        var formData=data&&data[0];
                        service.taskComplete(_t.subParams).then((res)=>{
                            resolve(res);
                            _t.$toast('提交成功');
                            _t.back();
                        })
                    })
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
                    });
                });
            },
            back:function(){
                this.$pop();
            },
            formatDateTime(obj){
                let d = new Date(obj);
                return utils.formatDate(d);
            }
        },
        mounted(){
            let _this = this,_params = {}
            //this.params = this.widgetParams;
            service.getTaskInfo(this.widgetParams.taskId).then((res) =>{
                //任务信息
                _this.abstract = Object.assign(res,{"procInstId":res.processInstanceId});
                Object.assign(_params,{"dataId":res.processInstance.businessKey});//设置下数据id--表单部件接受的参数
                if(res.processDefinitionId) {
                    service.getProcdefSetting(res.processInstance.processDefinitionKey,res.taskDefinitionKey).then(function (res) {
                        //获取流程配置
                        if (res.settings) {
                            Object.assign(_params, res.settings);
                        }
                        _this.params = Object.assign({} ,_this.widgetParams,_params);
                    })
                }
                service.getAttachment(_this.widgetParams.taskId,res.processInstance.businessKey).then((res) =>{
                    //获取对应任务下的附件
                    //_this.attachmentObject.oList = Object.assign([],res);
                    _this.attachmentObject.list = res.data;
                })

            })

            _.each(this.$refs.formPage.$refs.childWidgets,function(cw){
                if(cw.$refs.buiHeader){
                    cw.$refs.buiHeaderShow = false;//隐藏
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
</style>