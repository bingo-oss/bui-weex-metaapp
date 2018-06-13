<template>
    <div class="container">
        <bui-header :leftItem="{icon: 'ion-chevron-left'}" :title="title" @leftClick="() =>{this.$pop()}"></bui-header>
        <div class="container">
            <meta-widget-page ref="formPage" :query="{dataId:params.dataId}" :widget-params="params"></meta-widget-page>
        </div>
        <div class="action-bar">
            <meta-operation v-for="(toolbarBtn,index) in widgetParams.commonOperations" :operation="adjustment(toolbarBtn)" :widget-context="getWidgetContext(toolbarBtn)" :key="index" class="full-column"></meta-operation>
        </div>

    </div>
</template>

<script>
    import service from './js/service';
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
                title:"发起流程",
                params:{},
            }
        },
        watch:{},
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
                    "commandType": "StartProcessInstanceCmd"
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
                            _this.subParams.businessKey = formData.id
                            _this.subParams.variables.name = formData.title;
                        }
                        service.startProcessInstanceCmd(_this.subParams).then((res)=> {
                            resolve();
                            _this.$toast('发起流程成功');
                            _this.back();
                        })
                     });
                });
            },
            adjustment(item){
                //测试操作执行逻辑
                let _t = this;
                if(item.title="提交") {
                    //TODO 现在可以暂时先写在这里，后续确定后移走
                    item.onclick = function (ctx,$optInst) {
                        var spPromise=ctx.processLauncher.startProcess();
                        //完成后按钮可再次点击
                        spPromise.then(()=>{
                            $optInst.mustStopRepeatedClick = false;
                        },()=>{
                            $optInst.mustStopRepeatedClick = false;
                        });
                    }
                }
                return item;
            },
            back:function(){
                this.$pop();
            }
        },
        mounted(){
            let _this = this;
            //这里对于从某条数据发起流程businessKey是存在的，需要传递到页面部件的表单部件自动获取数据
            this.params = Object.assign({dataId:this.widgetParams.businessKey},this.widgetParams);

            service.getProcdefSetting(_this.subParams.processDefinitionKey).then(function(res){
                //获取流程配置
                if(res.settings){
                    _this.params = Object.assign({},_this.params,res.settings)
                }
            });
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
        padding-left: 20px;
        padding-right: 20px;
        flex: 1;
    }
    .scrollerDiv{
        /*        padding-left: 20px;
                padding-right: 20px;*/
    }
    .action-bar {
        flex-direction: row;
    }
    .widget-operation{
        background-color: #000;
    }

</style>
<style src="../../styles/common.css"></style>