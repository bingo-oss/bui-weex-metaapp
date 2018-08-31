<template>
    <div class="full-column">
        <bui-header :leftItem="{icon: 'ion-chevron-left'}" :title="title" @leftClick="() =>{this.$pop()}">
            <div slot="right" @click="dataPost" class="header-right-wrapper">
                <bui-icon @click="dataPost" name="ion-android-done" color="white" size=60></bui-icon>
            </div>
        </bui-header>

        <scroller class="container" style="background-color: #F8F8F8;">
            <div class="" style="justify-content: center; align-items: center; padding-top: 20px; padding-bottom: 20px;">
                <bui-radio v-model="submission.selectedItem" :items="items"></bui-radio>
            </div>

            <div class="panel" v-if="items.length">
                <div class="panel-body">
                    <div class="form-group form-hrb" v-if="submission.sendtran&&submission.sendtran.text">
                        <div class="label-wrapper">
                            <text class="form-label">下一环节：</text>
                        </div>
                        <div class="from-input-wrapper">
                            <text class="form-input" :style="inputStyle">{{submission.sendtran.text}}</text>
                        </div>
                    </div>

                    <div class="form-group form-hrb" v-if="submission.sendtran&&submission.sendtran.users&&submission.sendtran.users.length">
                        <div class="label-wrapper">
                            <text class="form-label">处理人：</text>
                        </div>
                        <div class="from-input-wrapper">
                            <text class="form-input" :style="inputStyle">{{submission.sendtran.users.map((user)=>user.text).join(",")}}</text>
                        </div>
                    </div>


                    <div class="form-group-vertical">
                        <textarea :disabled="readonly" class="form-input-textarea" v-model="submission.comm" :placeholder="'请填写审批意见'" rows="3"/>
                    </div>

                </div>
            </div>
        </scroller>

        <bui-loading :show="isShowLoading" :loading-text="loadingText==''?'加载中...':loadingText"></bui-loading>

    </div>
</template>

<script>
    import service from './js/service';
    import _ from '../../js/tool/lodash.js';
    import EventBus from '../../js/bus';
    import buiweex from 'bui-weex';
    import Utils from '../../js/tool/utils';
    import ajax from '../../js/ajax.js';
    //import xml2js from "xml2js"
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
                title:"处理",
                items:[],
                submission:{
                    selectedItem:"",
                    comm:"",
                    sendtran:{}//当前选择的环节信息
                },
                postXml:"",//需要post的xml结构
                sendtrans:{},//用于存储对应的选项环节信息
                isShowLoading:false,
                loadingText:"",
                queryParam:{},//请求参数
                query:{},//需要附加在请求的参数
            }
        },
        created(){
            //EventBus.$emit("widget-push-title","处理");
        },
        watch:{
            "submission.selectedItem"(val){
                service[this.code+"XmlOption"](this,val);
            }
        },
        computed: {
            code(){
                //企业code--目前对应企业的解析机制
                return this.widgetParams.code;
            }
        },
        methods:{
            getWidgetContext(item){
                return {
                    form:this
                }
            },
            back(){
                this.$pop();
            },
            getXmlTagNameContent(data,tagName){
                //获取xml内某标签信息
                var reg = new RegExp(`(<${tagName}(.(?!${tagName}))+<\/${tagName}>)|(<${tagName}(.(?!${tagName}))+\/>)`, "g");
                return data.match(reg);
            },
            getXmlAttr(data,tagName,attr){
                //获取某个属性值
                var reg = new RegExp(`<${tagName}[^>]+${attr}\\s*=\\s*['\"]([^'\"]+)['\"][^>]*`);
                return data.match(reg)?data.match(reg):[""];
            },
            liftOff(str,tagName){
                //提除多余字符
                return str.replace("<"+tagName+">","").replace("</"+tagName+">","").replace("<![CDATA[","").replace("]]>","")
            },
            getData(){
                //获取数据
                let _t  = this, _widgetParams = this.widgetParams;
                if(_widgetParams.oaOperation&&_widgetParams.oaOperation.query){
                    let _getPageParams = this.$getPageParams(),_queryParam = _widgetParams.oaOperation.query.split(","),_query = this.query;
                    this.queryParam = Object.assign({
                        method:'GET',
                        body: {},
                        type:"text"
                    },_widgetParams.oaOperation);
                    if(this.queryParam.method=="GET"){
                        //get请求
                        if(_t.queryParam.url.indexOf("?")<0){
                            _t.queryParam.url+="?";
                        }
                        _.each(_queryParam,(val,index)=>{
                            if(_query[val]){
                                //优先取设置的参数
                                _t.queryParam.url +="&"+val+"="+_query[val];
                            }else if(_getPageParams[val]){
                                //链接上的参数
                                _t.queryParam.url +="&"+val+"="+_getPageParams[val];
                            }
                        });
                        _t.queryParam.url+='&userid=oaadmin';
                        //_t.queryParam.url +="&curpage="+page+"&pagesize="+_t.size;
                    }else{
                        //post请求
                        _.each(_queryParam,(val,index)=>{
                            if(_query[val]){
                                //优先取设置的参数
                                _t.queryParam.body[val]=_query[val];
                            }else if(_getPageParams[val]){
                                //链接上的参数
                                _t.queryParam.body[val]=_getPageParams[val];
                            }
                        });
                        _t.queryParam.body["userid"]='oaadmin';
                    }
                    /*_.each()*/
                    _t.isShowLoading = true;
                    ajax.request(_t.queryParam).then(function(res){
                        _t.isShowLoading = false;
                        _t.postXml = res.data;
                        service[_t.code+"Xml"](_t,res.data);
                    });
                }
            },
            dataPost(){
                //数据提交
                service[this.code+"Post"](this)
            }
        },
        mounted(){
            //从xml中获取节点内容
            this.getData()
        }
    };
</script>
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
</style>
<style src="../../styles/common.css"></style>