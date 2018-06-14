<template>
    <div class="full-column">
        <div class="full-column">
            <bui-tabbar :tabItems="tabItems" showSelectedLine=true @change="onItemChange" v-model="currentTab" titleSize="32"></bui-tabbar>
            <slider class="full-column" @change="" :index="currentTab">
                <scroller class="full-column" v-show="currentTab==0">
                    <div class="process_abstract" v-if="abstract.processInstance">
                        <p class="_wrap"><text class="pageSize1">{{abstract.processInstance.name}}</text></p>
                        <p class="_wrap"><text class="pageSize2">发起人：{{abstract.processInstance.startUserName}} &nbsp;&nbsp; </text></p>
                        <p class="_wrap"><text class="pageSize2">发起时间：{{formatDateTime(abstract.processInstance.startDate)}}</text></p>
                    </div>
                    <div>
                        <meta-widget-page ref="formPage" :query="{dataId:params.dataId}" :widget-params="params"></meta-widget-page>
                    </div>
                    <div class="process_foot" v-show="abstract.taskDefinitionKey">
                        <label class="ivu-form-item-label"><text class="pageSize1">审批意见:</text></label>
                        <textarea rows="5" placeholder="" v-model="subParams.outputVariables[abstract.id+'-opinion']" class="form-control pageSize1"></textarea>
                    </div>
                </scroller>

                <div style="flex:10" v-if="currentTab==1">
                    <approval-trail :widget-params="abstract" v-if="abstract.procInstId"></approval-trail>
                </div>
            </slider>
        </div>
        <div class="action-bar">
            <meta-operation v-for="(toolbarBtn,index) in widgetParams.commonOperations" :operation="adjustment(toolbarBtn)" :widget-context="getWidgetContext(toolbarBtn)" :key="index" class="full-column" style="flex: 1"></meta-operation>
        </div>
    </div>
</template>

<script>
    import service from './js/service';
    import buiweex from 'bui-weex';
    import EventBus from '../../js/bus';
    import utils from '../../js/tool/utils';
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
                title:"流程审批",
                leftItem: {
                    icon: 'ion-chevron-left'
                },
                currentTab:0,
                tabItems: [
                    {
                        title: "基本信息",
                        icon: ""
                    },
                    {
                        icon: "",
                        title: "处理轨迹"
                    }
                ]
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
                        deptLeaderPass: true,
                        hrPass: true,
                        [_t.abstract.id+'-opinion']:""
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
            adjustment(item){
                //测试操作执行逻辑
                let _t = this;
                if(item.title=="提交") {
                    item.onclick = function (ctx,$optInst) {
                        var spPromise=ctx.processLauncher.startProcess();
                        //完成后按钮可再次点击
                        spPromise.then(()=>{
                            $optInst.mustStopRepeatedClick = false;
                        },()=>{
                            $optInst.mustStopRepeatedClick = false;
                        });
                    }
                }else if(item.title=="驳回"){
                    item.onclick = function (ctx,$optInst) {
                        var spPromise=ctx.processLauncher.dismissProcess();
                        //完成后按钮可再次点击
                        spPromise.then(()=>{
                            $optInst.mustStopRepeatedClick = false;
                        },()=>{
                            $optInst.mustStopRepeatedClick = false;
                        });
                    }
                }
                return item
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
        font-size: 30px;
        color: #666;
    }
    .process_abstract{
        padding-top:20px;
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 20px;
    }
    ._wrap{
        padding-top: 20px;
        flex-wrap: wrap;
    }
    .process_foot{ padding-top: 15px; padding-left: 15px; padding-right: 15px;}
</style>