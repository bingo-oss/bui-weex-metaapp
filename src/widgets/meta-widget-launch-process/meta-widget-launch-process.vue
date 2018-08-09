<template>
    <div class="container">
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

        <div class="container">
            <meta-widget-page ref="formPage" :query="{dataId:params.dataId}" :widget-params="params"></meta-widget-page>
        </div>
        <!--表单底部为公共操作区域-->
        <div class="action-bar">
            <meta-operation v-for="(toolbarBtn,index) in widgetParams.commonOperations" :operation="toolbarBtn" :widget-context="getWidgetContext(toolbarBtn)" :key="index" class="full-column"></meta-operation>
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
    import _ from '../../js/tool/lodash.js';
    import EventBus from '../../js/bus';
    import buiweex from 'bui-weex';
    import Utils from '../../js/tool/utils';

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
                title:"发起流程",
                params:{
                    hideHeader:true//隐藏内嵌的部件头部
                },
                showActionsheet: false,
            }
        },
        created(){
            //EventBus.$emit("widget-push-title","");
        },
        computed: {
            subParams(){
                let _t = this;
                return {
                    "processDefinitionKey":_t.params.procDefKey||"leave",
                    "variables": {
                        "applyUserId": "e4cfb2ca-7b83-44d5-a32d-1f0c0fc6c94f",
                        "userId": "fulsh",
                    },
                    "businessKey": _t.params.businessKey,
                    "payloadType": "StartProcessPayload"
                }
            }
        },
        methods:{
            getWidgetContext(item){
                return {
                    processLauncher:this
                }
            },
            startProcess(){//启动流程
                let formPromise=this.$refs.formPage.submit();
                let _this=this;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        var formData=data&&data[0];
                        if(formData&&formData.id) {
                            _this.params.businessKey = formData.id
                            _this.params.dataId = formData.id;
                            //_this.params.variables.name = formData.title;
                        }
                        service.startProcessInstanceCmd(_this.subParams).then((res)=> {
                            resolve();
                            _this.$toast('发起流程成功');
                            _this.back();
                        })
                     },(erro)=>{
                        reject();
                        _this.$toast(erro);
                    });
                },(erro)=>{
                    reject();
                    _this.$toast(erro);
                });
            },
            processFormSave(){
                //表单保存
                let formPromise=this.$refs.formPage.submit();
                let _this = this;
                return new Promise((resolve,reject)=>{
                    formPromise.then((data)=>{
                        var formData=data&&data[0];
                        if(formData&&formData.id) {
                            _this.params.businessKey = formData.id
                            _this.params.dataId = formData.id;
                            //_this.params.variables.name = formData.title;
                        }
                        _this.params = Object.assign({},_this.params);
                        resolve();
                        _this.$toast('保存成功');
                    },(erro)=>{
                        reject();
                        _this.$toast(erro);
                    });
                },(erro)=>{
                    reject();
                });
            },
            back(){
                this.$pop();
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
            let _this = this;
            //这里对于从某条数据发起流程businessKey是存在的，需要传递到页面部件的表单部件自动获取数据
            this.params = Object.assign({dataId:this.widgetParams.businessKey},this.widgetParams,this.params);
            service.getProcdefSetting(_this.subParams.processDefinitionKey).then(function(res){
                //获取流程配置
                if(res.settings){
                    _this.params = Object.assign({},_this.params,res.settings)
                }
                _this.$refs.formPage.title="";
            });

            this.$refs.formPage.hideHeader = true;
        }
    };
</script>
<style lang="css">
    .container {
        flex:1;
        flex-direction: column;
        align-items: stretch;
    }

    .scroller {
        padding-left: 10px;
        padding-right: 10px;
        flex: 1;
    }
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
    .widget-operation{
        background-color: #000;
    }

</style>
<style src="../../styles/common.css"></style>