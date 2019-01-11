<template>
    <div class="full-column">
        <bui-header :leftItem="{icon: 'ion-ios-arrow-left'}" :title="showProcRelation?'选择流程':'审批'" @leftClick="leftClick" :backgroundColor="themeBg">
            <div slot="right" v-if="!showProcRelation" @click="handleSubmit" class="header-right-wrapper">
                <bui-icon @click="handleSubmit" name="ion-android-done" color="white" size=60></bui-icon>
            </div>
        </bui-header>

        <scroller class="container" style="background-color: #F8F8F8;">
            <div class="panel" v-if="!showProcRelation">
                <div class="panel-body">
                    <div class="form-group form-hrb">
                        <div class="label-wrapper">
                            <text class="form-label">下一环节：</text>
                        </div>
                        <div class="from-input-wrapper">
                            <text class="form-input" :style="inputStyle">{{selectNode.name}}</text>
                        </div>
                    </div>

                    <div class="form-group form-hrb" v-if="selectNode.processingPerson&&selectNode.processingPerson.length">
                        <div class="label-wrapper">
                            <text class="form-label">处理人：</text>
                        </div>
                        <div class="from-input-wrapper">
                            <text class="form-input" :style="inputStyle">{{selectNode.processingPerson.join(",")}}</text>
                        </div>
                    </div>

                    <template v-if="taskInfor.formProperties" v-for="(formItem,index) in taskInfor.formProperties" :key="">
                        <!--读取环节上设置的自定义字段-->
                        <div v-if="defaultFormDate(formItem)&&formItem.type=='enum'" class="form-group form-hrb">
                            <text class="form-label">{{formItem.name}}</text>
                            <bui-radio v-model="formDate[formItem.id]" :items="formItem.options" direction="horizontal" @change="radioChange" ></bui-radio>
                        </div>
                    </template>

                    <div class="form-group-vertical">
                        <textarea :disabled="readonly" class="form-input-textarea" v-model="formDate.opinion" :placeholder="'填写审批意见'" rows="3"/>
                    </div>

                </div>
            </div>

            <!--流程选择-->
            <div v-if="showProcRelation">
                <div class="list hr_b" @click="selectProcRelations(procRelation)" v-for="procRelation in procRelations">
                    <text class="font28">{{procRelation.procDefName}}</text>
                </div>
            </div>
        </scroller>

        <!--<bui-loading :show="isShowLoading" :loading-text="loadingText==''?'加载中...':loadingText"></bui-loading>-->
    </div>
</template>
<script>
    import _ from '../../js/tool/lodash';
    import service from "./js/service"
    import factoryApp from '../libs/factory-app.js';

    const picker = weex.requireModule('picker')
    export default {
        props:{
            widgetParams: {
                // 表单组件的定义
                type: Object,
                required: true
            },
            widgetContext:{//由使用操作的部件传入的部件上下文
                type:Object,
                required:true
            },
            operation:{//操作的定义，必传参数
                type:Object,
                required:true
            },
            btnType:{//操作按钮的类型
                type:String
            }
        },
        computed: {
            formProperties(){
                return  ""
            },
            /*taskInfor(){
                return {"nextNodes":[{"name":"拟稿","id":"default"}]}
            }*/
        },
        watch: {
            "formDate.nodeId"(val){
                //监听环节id变化--设置所选环节
                if(!this.taskInfor.nextNodes)return false;
                let _selectNode = this.taskInfor.nextNodes.filter((node)=>{return node.id==val});
                if(_selectNode&&_selectNode.length){
                    this.selectNode = _selectNode[0];//转化为当前选择的环节
                    let selectNode_userName = this.selectNode;
                    selectNode_userName.processingPerson=[];
                    if(selectNode_userName.assigneeName){
                        selectNode_userName.processingPerson.push(selectNode_userName.assigneeName)
                    }
                    if(selectNode_userName.candidateInfo&&selectNode_userName.candidateInfo.length){
                        _.each(selectNode_userName.candidateInfo,(item,index)=>{
                            if(item.type==1){
                                if(item.groupUsers&&item.groupUsers.length){
                                    _.each(item.groupUsers,(item,index)=>{
                                        selectNode_userName.processingPerson.push(item.name)
                                    });
                                }else{
                                    selectNode_userName.processingPerson.push(item.name)
                                }
                            }else{
                                selectNode_userName.processingPerson.push(item.name)
                            }
                        });
                    }//处理下需要显示的处理人名称集
                }
            },
            "taskInfor"(val){
                let _nodes = this.taskInfor.nextNodes;
                if(_nodes&&_nodes.length) {
                    this.formDate.nodeId = this.taskInfor.nextNodes[(_nodes.length-1)].id;//默认选择最后一个
                }
            }
        },
        data(){
            return {
                selectNode:{},//所选环节信息
                taskInfor:{},
                formDate: {
                    "nodeId":"",
                    "opinion":""
                },//组件内部表单数据
                subParams:{
                    variables: {
                        hrPass: true
                    },
                    localVariables:{
                        opinion:""
                    },
                    "payloadType":"CompleteTaskPayload"
                },
                modalView:"",
                mustStopRepeatedClick: false,
                showProcRelation: true,//显示流程
                procRelations:[],//流程数据
                procRelation:{}//选择的流程
            };
        },
        methods: {
            back(){
                this.$pop()
            },
            leftClick(){
                if((this.showProcRelation&&this.widgetParams.launch)||(!this.widgetParams.launch&&!this.widgetParams.launch)){
                    //审批返回直接返回--提交返回操作返回到选择流程
                    this.back()
                }else{
                    this.showProcRelation = true;
                }
            },
            open() {
                this.showDialog = true;
                this.$emit("triggered","widget");
            },
            addPeople(){
                //选择人
            },
            handleSubmit(Boolean){
                let _t = this,Process,ProcessType="";
                if(_t.mustStopRepeatedClick){return}else{_t.mustStopRepeatedClick=true}

                if(this.widgetParams.launch) {
                    //发起请求
                    var _subParams = {
                        processDefinitionKey:_t.procRelation.procDefKey,
                        businessKey:_t.widgetParams.dataId,
                        "variables": {
                            "applyUserId": "e4cfb2ca-7b83-44d5-a32d-1f0c0fc6c94f",
                            "userId": "fulsh",
                        },
                        "payloadType": "StartProcessPayload"
                    }
                    _.each(_t.formDate,(val,key)=>{
                        if(_subParams.localVariables)
                        {
                            _subParams.localVariables[key] = val;
                        }
                        if(_subParams.variables) {
                            _subParams.variables[key] = val
                        }
                    });//组装传入值
                    service.startProcessInstanceCmd(_subParams).then((res)=> {
                        _t.isShowLoading = false;
                        _t.$toast('提交成功');
                        _t.back();
                    },(err)=>{
                        _t.isShowLoading = false;
                        _t.$toast('提交失败');
                        _t.mustStopRepeatedClick = false;
                    });
                }else{
                    //审批请求
                    var _subParams = {
                        taskId: _t.procRelation.id,
                        processDefinitionKey:_t.procRelation.procDefKey||_t.procRelation.processDefinitionKey,
                        businessKey:_t.widgetParams.dataId,
                        variables: {
                            hrPass: true
                        },
                        localVariables:{
                            opinion:""
                        },
                        "payloadType":"CompleteTaskPayload"
                    }
                    _.each(_t.formDate,(val,key)=>{
                        if(_subParams.localVariables)
                        {
                            _subParams.localVariables[key] = val;
                        }
                        if(_subParams.variables) {
                            _subParams.variables[key] = val
                        }
                    });//组装传入值
                    
                    service.taskComplete(_subParams).then((res) => {
                        _t.isShowLoading = false;
                        _t.$toast('提交成功');
                        _t.back();
                    },(err)=>{
                        _t.isShowLoading = false;
                        _t.$toast('提交失败');
                        _t.mustStopRepeatedClick = false;
                    })

                }
            },
            radioChange(item){
                this.$forceUpdate()
            },
            defaultFormDate(formItem){
                //处理环节字段默认值
                let _formDate = this.formDate;
                switch (formItem.type){
                    case "enum":{
                        if(!_formDate[formItem.id]) {
                            let _checked = formItem.options.filter(function (obj) {
                                obj.title = obj.name;
                                obj.value = obj.id;
                                return obj.checked
                            });
                            if (_checked.length) {
                                _formDate[formItem.id] = _checked[0].id;
                            }else{
                                _formDate[formItem.id] = formItem.options[0].id;//默认选择第一个
                            }
                        }
                        break
                    }
                    default:{}
                }
                return true;
            },
            selectNext(){
/*                let _t = this;
                if(_t.taskInfor.nextNodes.length==0)return false;
                picker.pick({
                    value: this.value,
                    index:_t.nodeId,
                    items:_t.taskInfor.nextNodes.map((obj)=>{return obj.id})
                }, event => {
                    if (event.result === 'success'){
                        buiweex.alert(event)
                    }
                })*/
            },
            selectProcRelations(item){
                //选择流程
                let _t = this;
                this.showProcRelation = false;
                this.procRelation = item;
                if(this.widgetParams.launch){
                    //发起
                    service.getfirstSteps(item.procDefKey).then((res)=>{
                        //获取流程第一步信息
                        _t.taskInfor = Object.assign({},{nextNodes:res});
                    });
                }else{

                }
            }
        },
        mounted(){
            let _t = this;
            this.formDate.nodeId = "default";
            if(this.widgetParams.launch) {
                //是提交按钮
                service.getMetaEntityProcRelation(this.widgetParams.entityId).then((res)=>{
                    _t.procRelations = res.data;
                });
            }else{
                this.showProcRelation = false;
                //审批按钮
                service.getTaskInfo("",this.widgetParams.dataId).then((res) => {
                    //任务信息
                    if(res.id){
                        _t.taskInfor = res;
                        _t.procRelation = res.processInstance
                        if(res.id){
                            service.isApproval(res.id).then((res)=>{
                                //获取当前登录用户是否具备审批权限
                                _t.abstract.isApproval = res;
                                if(!res){
                                    _t.$toast('不具备权限审批');
                                }
                            },(erro)=>{});
                        }
                    }
                });
            }
        }
    }
</script>
<style src="../../styles/common.css"></style>
<style lang="css">
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

    .scroller{
        flex:1;
    }
    .mt6{ margin-top: 6px;}
    .font28{
        font-size:28px;
    }
    .color-sub{
        color:#666;
    }
    .form-input-textarea {
        flex: 1;
        font-size: 36px;
    }
    .list{
        background-color: #fff;
        border-bottom-color: #f1f1f1;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        padding-top:40px;
        padding-bottom: 40px;
        padding-left: 40px;
        padding-right: 40px;
    }
</style>
