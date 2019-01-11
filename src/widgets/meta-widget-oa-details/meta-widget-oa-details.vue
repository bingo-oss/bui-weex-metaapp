<template>
    <div class="full-column">
        <bui-header :leftItem="{icon: 'ion-ios-arrow-left'}" @leftClick="() =>{this.$pop()}" :backgroundColor="themeBg">
            <div slot="center" class="page-title-wrapper">
                <text v-for="title in titles" class="page-title" :style="{color:(title.highlight?highlight.color:'#ccc')}" @click="goto(title.type)">{{title.name}}</text>
            </div>
        </bui-header>

        <scroller class="container" style="background-color: #F8F8F8;">
            <div class="panel" v-if="fields.length" @appear="appear('form')" @disappear="disappear('form')" :ref="'form'">
                <div class="panel-body">
                    <div class="form-group form-div" v-for="field in fields" v-if="field.text">
                        <div style="flex: 2; margin-right: 20px;">
                            <div style="flex: 1;" v-for="disname in getDisnames(field.disname)">
                                <text class="form-label view-label" style="text-align: right;">{{disname}}</text>
                            </div>
                        </div>
                        <rich-text :inner="field.text" :style="{flex:5}"></rich-text>
                        <!--<div style="flex: 2">
                            <text class="view-text">{{field["text"]}}</text>
                        </div>-->
                    </div>
                </div>
            </div>

            <div class="panel" v-if="attachment.length" @appear="appear('attachment')" @disappear="disappear('attachment')" :ref="'attachment'">
                <!--<text class="panel-header">附件</text>-->
                <div class="panel-body">
                    <attachment v-model="attachment"></attachment>
                </div>
            </div>

            <div class="panel" v-if="trail.length" @appear="appear('trail')" @disappear="disappear('trail')" :ref="'trail'">
                <!--<text class="panel-header">审批轨迹</text>-->
                <div class="panel-body">
                    <div class="approval-trail">
                        <div v-for="(item,index) in trail">
                            <div style="flex-direction: row; padding-left: 10px;">
                                <div class="approval-trail-w" :style="item.borderLeftWidth">
                                    <div class="approval-trail-title">
                                        <div>
                                            <text class="font28" style="" v-if="item.name">{{item.name}}</text>
<!--
                                            <text class="font28 color-sub" v-if="item.endTime" :style="{color:item.color}" style="text-align: right"> {{item.endTime}}</text>
-->
                                        </div>
                                    </div>
                                    <div class="approval-trail-details" v-for="content in item.content">
                                        <div class="approval-trail-info">
                                            <template>
                                                <div style="flex-direction: row;">
                                                    <text class="font28 color-sub" :style="{color:item.color}" v-if="content.name">{{content.name}}</text>
                                                    <text class="font28 color-sub" v-if="content.time" :style="{color:item.color}" style="text-align: right; padding-right: 120px;"> {{content.time}}</text>
                                                </div>
                                                <text class="font28 color-sub mt6" :style="{color:item.color}" v-if="content.comm">审批意见: {{content.comm}}</text>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                                <div class="_dot" :style="item.dotStyle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </scroller>

        <!--表单底部为公共操作区域-->
        <div class="action-bar" v-if="widgetParams.commonOperations&&widgetParams.commonOperations.length&&state!=2">
            <meta-operation v-for="(toolbarBtn,index) in widgetParams.commonOperations" :operation="toolbarBtn" :widget-context="getWidgetContext(toolbarBtn)" :key="index" class="full-column"></meta-operation>
        </div>

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
    import factoryApp from '../libs/factory-app.js';
    const dom = weex.requireModule('dom');
    const globalEvent = weex.requireModule('globalEvent');
    const linkapi = require('linkapi');
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
            let _t = this;
            return {
                userInfo:{},
                titles:[
                    {
                        name:"详情",
                        type:"form",
                        highlight:true,
                        data:"fields"
                    },
                    {
                        name:"附件",
                        type:"attachment",
                        highlight:false,
                        data:"attachment"
                    },
                    {
                        name:"轨迹",
                        type:"trail",
                        highlight:false,
                        data:"trail"
                    }
                ],
                highlight:{
                    //高亮属性
                    color:"#fff"
                },
                fields:[],
                attachment:[],
                trail:[],//流程轨迹
                isShowLoading:false,
                loadingText:"",
                state:2,//文档类型: 0为关联，1为待办，2为已办
                queryParam:""//请求参数
            }
        },
        created(){
            //EventBus.$emit("widget-push-title","");
        },
        watch:{
            "fields"(val){
                this.titlesRestructure()
            },
            "attachment"(val){
                this.titlesRestructure()
            },
            "trail"(val){
                this.titlesRestructure()
            }
        },
        computed: {
            code(){
                //企业code--目前对应企业的解析机制
                return this.widgetParams.code;
            },
            hideFields(){
                return this.widgetParams.oaInfo.hideFields||[]
            }
        },
        methods:{
            titlesRestructure(){
                _.each(this.titles,(title,index)=>{
                    if(title&&title.data&&this[title.data].length==0){
                        this.titles.splice(index,1);
                    }
                })
            },
            goto(ref){
                //滚到指定区域
                this.gotoOpt = true;
                _.each(this.titles,(title)=>{
                    if(title.type==ref){
                        title.highlight = true;
                    }else{
                        title.highlight = false;
                    }
                });
                const el = this.$refs[ref];
                dom.scrollToElement(el, {});
                this.gotoOpt = false;
            },
            appear(type){
                 //滚到特定区域触发
                /*_.each(this.titles,(title)=>{
                   if(title.type==type){
                      title.highlight = true;
                   }else{
                      title.highlight = false;
                    }
                });*/
                //buiweex.alert(type);
            },
            disappear(type){
              //离开某个组件
                if(this.gotoOpt)return
                _.each(this.titles,(title,index)=>{
                    if(title.type==type){
                        title.highlight = false;
                        this.titles[((index-1)<0)?(index+1):(index-1)].highlight = true;//上一个为高亮
                    }
                });
            },
            toPage(queryParam){
                //跳转页面--暴露给外部使用
                buiweex.push(Utils.pageEntry(),queryParam);
            },
            getWidgetContext(item){
                return {
                    form:this
                }
            },
            back(){
                this.$pop();
            },
            getXmlTagNameContent(data,tagName,type){
                var reg = new RegExp(`<${tagName}(.(?!<${tagName}))+<\/${tagName}>|<${tagName}(.(?!<${tagName}))+\/>`, "g");
                if(type==1){
                    reg = new RegExp(`<${tagName}((\n|\s|.)(?!<${tagName}))*<\/${tagName}>|<${tagName}(.(?!<${tagName}))+\/>`, "g");
                }
                return data.match(reg);
            },
            getXmlAttr(data,tagName,attr){
                //获取某个属性值
                var reg = new RegExp(`<${tagName}[^>]+${attr}\\s*=\\s*['\"]([^'\"]+)['\"][^>]*`);
                return data.match(reg)?data.match(reg):[""];
            },
            liftOff(str,tagName){
                //提除多余字符
                return str.replace("<![CDATA[","").replace("]]>","").replace(/<.*?>/g, '')
            },
            getData(queryParam){
                let _t  = this;
                if(_t.code=="my"){
                    _t.isShowLoading = false;
                    service[_t.code+"Xml"](_t,"");
                }else {
                    ajax.request(queryParam).then(function (res) {
                        _t.isShowLoading = false;
                        if(res.data&&(res.data.indexOf("field")==-1)){
                            //无数据
                            buiweex.pop();
                        }
                        service[_t.code + "Xml"](_t, res.data);
                    });
                }
            },
            getDisnames(disname){
                let _length = disname.length,disnames = [];
                if(_length<=5||(!/[\u4e00-\u9fa5]/g.test(disname))){
                    disnames =  [disname];
                }else{
                    //余数
                    let remainderNumber="",remainderNumberArry = [5,3,2];//设置的余数
                    _.each(remainderNumberArry,(num)=>{
                        if(!_length%num){
                           remainderNumber = num;
                        }
                    })
                    if(!remainderNumber)remainderNumber=2;
                    let remainder = _length%remainderNumber,num=0;
                    if(remainder){
                        num = _length-remainder;
                    }else{
                        //remainderNumber = 3;
                        /*if(_length%3){
                            remainderNumber = 3
                            num = _length-_length%3
                        }else{
                            num = _length
                        }*/
                        num = _length
                    }
                    while (num>5){//2、判断循环条件;
                        num=num/remainderNumber;//4、更新循环变量；
                    }
                    let _i = 0,_str="";
                    _.each(disname,(dis,index)=>{
                        _i++;
                        _str=_str+dis;
                        if(_i>=num){
                           disnames.push(_str);
                           _i = 0;
                           _str= "";
                        }
                    });

                    if(_str){
                        disnames.push(_str);
                        _str="";
                    }
                }
                return disnames
            }
        },
        mounted(){
            globalEvent.addEventListener("resume", e => {
                this.getData(this.queryParam);
            });
            //从xml中获取节点内容
            let _widgetParams = this.widgetParams,_t = this;
            if(_widgetParams.oaInfo&&_widgetParams.oaInfo.query){
                let _getPageParams = this.$getPageParams(),_queryParam = _widgetParams.oaInfo.query.split(",");
                this.queryParam = Object.assign({
                    method:'GET',
                    body: {},
                    type:"text"
                },_widgetParams.oaInfo);
                if(this.queryParam.method=="GET"){
                    //get请求
                    if(_t.queryParam.url.indexOf("?")<0){
                        _t.queryParam.url+="?";
                    }
                    _.each(_queryParam,(val,index)=>{
                       if(_getPageParams[val]){
                          _t.queryParam.url +="&"+val+"="+_getPageParams[val];
                        }
                    });
                    //_t.queryParam.url+='&userid=oaadmin';
                    //_t.queryParam.url +="&curpage="+page+"&pagesize="+_t.size;
                }else{
                    //post请求
                    _.each(_queryParam,(val,index)=>{
                        if(_getPageParams[val]){
                            _t.queryParam.body[val]=_getPageParams[val];
                        }
                    });
                    //__t.queryParam.body["userid"]='oaadmin';
                }
                _t.isShowLoading = true;
                try{
                    linkapi.getLoginInfo((res)=>{
                        _t.userInfo = res;
                        if(_t.queryParam.method=="GET"){
                            _t.queryParam.url+=`&userid=${_t.userInfo.loginId}`;
                        }else{
                            _t.queryParam.body["userid"]=_t.userInfo.loginId;
                        }
                        _t.getData(_t.queryParam);
                    });
                }catch (erro){
                    if(_t.queryParam.method=="GET"){
                        _t.queryParam.url+=`&userid=oaadmin`;
                    }else{
                        _t.queryParam.body["userid"]=`oaadmin`;
                    }
                    this.getData(this.queryParam);
                }
            }

        }
    };
</script>
<style lang="css">
    .page-title-wrapper{ flex-direction: row; flex: 1;}
    .page-title{ flex: 1; height: 90px; text-align: center; line-height: 90px; font-size: 32px; color: #fff;}
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
        padding-top: 30px;
        padding-bottom: 20px;
        padding-left: 30px;
        padding-right: 30px;
    }
    .panel-body-form{
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
        flex: 1;
        color:#666;
    }
    .approval-trail-title{}
    .approval-trail{
        /*
                flex:1;
        */
        padding-top:20px;
        padding-left:20px;
    }
    .approval-trail-w{
        flex-direction:column;
        border-left-style:solid;
        border-left-width: 1px;
        border-left-color: #DFDFDF;
        padding-left: 60px;
        padding-bottom: 40px;
    }
    .approval-trail-details{
        margin-top:10px;
        flex-direction:column;
    }
    .approval-trail-info{
        width: 700px;
    }
    ._dot{
        position: absolute; width:22px; height:22px; background-color: #5099F4; border-radius: 22px; left: 0;
    }
    .view-label{
        font-size: 30px;
    }
    .form-hrt{
        border-top-color: #e6e4e4;
        border-top-width: 1px;
        border-top-style: solid;
    }
    .form-div{
        justify-content: flex-start;
        align-items: flex-start;
        padding-bottom: 20px;
        padding-top: 20px;
    }

</style>
<style src="../../styles/common.css"></style>