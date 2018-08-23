<template>
    <div>
        <div @click="open" class="full-column">
            <slot>
                <meta-opt-btn :btn-type="btnType" :operation="operation"></meta-opt-btn>
            </slot>
        </div>


        <div v-if="showDialog">
            <bui-mask @click="showDialog=!showDialog"></bui-mask>
            <div class="bui-dialog" :style="{top:taskInfor.formProperties?200:300}">
                <div class="bui-dialog-title">
                    <text class="dialog-title-text">{{title}}</text>
                </div>
                <div class="bui-dialog-content" :style="{height:taskInfor.formProperties?500:300}">
                    <scroller>
                        <text class="form-label mb25" v-if="taskInfor.name">当前环节：{{taskInfor.name}}</text>
                        <text class="form-label mb25" @click="selectNext">下一环节：{{selectNode.name}}</text>
                        <text class="form-label mb25" v-if="selectNode.processingPerson&&selectNode.processingPerson.length">处理人：{{selectNode.processingPerson.join(",")}}</text>
                        <template v-if="taskInfor.formProperties" v-for="(formItem,index) in taskInfor.formProperties" :key="">
                            <!--读取环节上设置的自定义字段-->
                            <div v-if="defaultFormDate(formItem)&&formItem.type=='enum'" class="mb25">
                                <text class="form-label">{{formItem.name}}</text>
                                <bui-radio v-model="formDate[formItem.id]" :items="formItem.options" direction="horizontal" @change="radioChange" ></bui-radio>
                            </div>
                        </template>
                        <div class="mb25 hr_b"></div>
                        <div class="mb25">
                            <textarea v-model="formDate.opinion" class="textarea form-label" @input="" @change="" @focus="" @blur="" placeholder="填写审批意见"></textarea>
                        </div>
                    </scroller>
                </div>
                <div class="bui-dialog-footer">
                    <text class="dialog-action-text" style="color: #949494" @click="onDialogCallback(false)">取消</text>
                    <text class="dialog-action-text" @click="onDialogCallback(true)">确定</text>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import _ from '../../../../js/tool/lodash'
    const picker = weex.requireModule('picker')
    export default {
        props:{
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
                return this.widgetContext.processLauncher.params|| ""
            },
            taskInfor(){
                return this.widgetContext.processLauncher.abstract || {"nextNodes":[{"name":"拟稿","id":"default"}]}
            }
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
            let _t = this,_processLauncher = _t.widgetContext.processLauncher,_operation = _t.operation;
            return {
                selectNode:{},//所选环节信息
                formDate: {
                    "nodeId":"",
                    "opinion":""
                },//组件内部表单数据
                showDialog: false,//显示弹出框
                title:_t.operation.title?_t.operation.title:"",
                modalView:_t.operation.modalView||"",
                mustStopRepeatedClick: false
            };
        },
        methods: {
            open() {
                this.showDialog = true;
                this.$emit("triggered","widget");
            },
            onDialogCallback (text) {
                this.showDialog = false;
                if(text){
                    this.handleSubmit(true)
                }
                this.$emit("successed","widget");
            },
            addPeople(){
                //选择人
            },
            handleSubmit(Boolean){
                let ctx = this.widgetContext,_t = this,Process,ProcessType="";
                if(_t.mustStopRepeatedClick){return}else{_t.mustStopRepeatedClick=true}
                var _subParams  = Object.assign({},this.widgetContext.processLauncher.subParams)//获取审批需要的结构数据
                _.each(_t.formDate,(val,key)=>{
                    if(_subParams.localVariables)
                    {
                        _subParams.localVariables[key] = val;
                    }
                    if(_subParams.variables) {
                        _subParams.variables[key] = val
                    }
                });//组装传入值

                if (ctx.processLauncher.startProcess) {
                    Process = ctx.processLauncher.startProcess
                } else if (ctx.processLauncher.approveProcess) {
                    Process = ctx.processLauncher.approveProcess
                }
                var spPromise=Process(_subParams);
                //完成后按钮可再次点击
                spPromise.then(()=>{
                    _t.mustStopRepeatedClick = false;
                },()=>{
                    _t.mustStopRepeatedClick = false;
                });
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
            }
        },
        mounted(){
            this.formDate.nodeId = "default"
        }
    }
</script>
<style src="../../../../styles/common.css"></style>
<style>
    .mb25{ margin-bottom: 25px;}
    .hr_b{
        border-bottom-color: #e6e4e4;
        border-bottom-width: 1px;
        border-bottom-style: solid;
    }
    .textarea{
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 15px;
        padding-bottom: 15px;
        height: 80px;

        background-color: #fff;
        border-bottom-color: #e6e4e4;
        border-bottom-width: 1px;
        border-bottom-style: solid;

        border-top-color: #e6e4e4;
        border-top-width: 1px;
        border-top-style: solid;

        border-left-color: #e6e4e4;
        border-left-width: 1px;
        border-left-style: solid;

        border-right-color: #e6e4e4;
        border-right-width: 1px;
        border-tight-style: solid;
    }

    .bui-dialog1 {
        background-color: #F6F6F6;
        border-radius: 20px;
        height: 200px;
        top: 300px;
        left: 50px;
        right: 50px;
        flex: 1;
    }
    .bui-dialog {
        position: fixed;
        background-color: #F6F6F6;
        border-radius: 20px;
        top: 300px;
        left: 50px;
        right: 50px; }
    .bui-dialog-title {
        justify-content: center;
        height: 80px;
        padding-left: 40px;
        padding-right: 40px;
        margin-top: 30px;
        margin-bottom: 30px;
        align-items: center;
    }
    .dialog-title-text {
        color: #000000;
        font-size: 35px;
    }
    .bui-dialog-content {
        height: 220px;
        padding-left: 40px;
        padding-right: 40px;
        padding-bottom: 32px; }
    .bui-dialog-footer {
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: 90px;
        border-top-width: 1px;
        border-top-style: solid;
        border-top-color: #d7dde4; }

    .dialog-action-text {
        flex: 1;
        text-align: center;
        font-size: 32px;
        color: #3399ff;
        border-right-width: 1px;
        border-right-style: solid;
        border-right-color: #d7dde4; }
    .dialog-action-text:active {
        color: #000000; }
</style>