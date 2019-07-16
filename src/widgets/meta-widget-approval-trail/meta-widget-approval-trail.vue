<template>
<div class="approval-trail">
    <div v-for="(item,index) in trail">
        <div style="flex-direction: row; padding-left: 10px;">
            <div class="approval-trail-w" :style="item.borderLeftWidth">
                <div class="approval-trail-title">
                    <!--<text class="font28">{{item.name}}</text>-->
                    <div style="flex-direction: row;">
                        <text class="font28" :style="{width:'320px',color:item.textColor}" v-if="item.name">{{item.name}}</text>
                        <text class="font28 color-sub" v-if="item.endTime" :style="{color:item.color}" style="text-align: right"> {{item.endTime}}</text>
                    </div>
                </div>
                <div class="approval-trail-details">
                    <div class="approval-trail-info">
                        <template>
                            <text class="font28 color-sub" :style="{color:item.color}" v-if="item.assigneeName">{{item.assigneeName}}</text>
                            <text class="font28 color-sub mt6" :style="{color:item.color}" v-if="item.opinion">审批意见: {{item.opinion}}</text>
                        </template>
                    </div>
                </div>
            </div>
            <div class="_dot" :style="item.dotStyle"></div>
        </div>
    </div>
    <scroller class="scroller">
        <!--<bui-timeline :customStyles="customStyles">
            <bui-timeline-item v-for="(item,index) in trail" :first="index===0" :last="index===trail.length-1 && index!==0" :key="item.id" :color="item.color">
                <div style="flex-direction:column;">
                    <div class="approval-trail-title">
                        &lt;!&ndash;<text class="font28">{{item.name}}</text>&ndash;&gt;
                        <div style="flex-direction: row;">
                            <text class="font28" :style="{width:'400px',color:item.textColor}" v-if="item.assigneeName">{{item.name}}</text>
                            <text class="font28 color-sub" v-if="item.createTime" style="text-align: right"> {{item.endTime}}</text>
                        </div>
                    </div>
                    <div class="approval-trail-details">
                        <div class="approval-trail-info">
                            <template>
                                <text class="font28 color-sub" v-if="item.assigneeName">{{item.assigneeName}}</text>
                                <text class="font28 color-sub" v-if="item.opinion">审批意见: {{item.opinion}}</text>
                            </template>
                        </div>
                    </div>
                </div>
            </bui-timeline-item>
        </bui-timeline>-->
    </scroller>
</div>
</template>

<script>
import _ from '../../js/tool/lodash.js'
import service from './js/service';
import utils from '../../js/tool/utils';
import buiweex from 'bui-weex';
import factoryApp from '../libs/factory-app.js';
import engineService from "../../../src/js/services/engine/engineservice";

export default {
    props: {
        widgetParams: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            trail: [],
            customStyles: {
                'highlightTitleColor': '#EE9900',
                'highlightPointInnerColor': '#EE9900',
                'highlightPointBorderColor': '#FFE78D'
            }
        }
    },
    computed: {
        /*procInstId: function() {
            return this.widgetParams.procInstId;
        }*/
    },
    watch: {
        /*procInstId: function() {
            this.getProvalTrail();
        }*/
    },
    methods: {
        getProvalTrail() {
            var _this = this;
                service.tasksInfo(_this.businessKey).then(data => {
                    _this.trail = [];//清空下轨迹数据
            _.each(data.content,(resp)=>{
                    var procInst = resp.processInstance;
                    var variables =  resp.processInstance.variables;
                    var taskList = resp.tasks.content
                    Object.assign(_this.trail,taskList.map(item => {
                        if(!item.assigneeName){
                            if(item.currentNode&&item.currentNode.candidateInfo&&item.currentNode.candidateInfo.length){
                                let processingPerson = [];
                                _.each(item.currentNode.candidateInfo,(item,index)=>{
                                    if(item.type==1){
                                        if(item.groupUsers&&item.groupUsers.length){
                                            _.each(item.groupUsers,(item,index)=>{
                                                processingPerson.push(item.name)
                                            });
                                        }else{
                                            processingPerson.push(item.name)
                                        }
                                    }else{
                                        processingPerson.push(item.name)
                                    }
                                });
                                item.assigneeName = processingPerson.join(",")
                            }//处理下需要显示的处理人名称集
                        }
                        return {
                            name:item.name,
                            assigneeName:item.assigneeName,
                            createTime:item.createTime?utils.formatDate(item.createTime):"",
                            endTime:item.endTime?utils.formatDate(item.endTime):"",
                            opinion:item.variables?item.variables.opinion:"",
                            color:"#ccc",
                            textColor:"#ccc",
                            approvalTrailw:{

                            },
                            dotStyle:{
                                "background-color":"#DFDFDF"
                            }
                        }
                    }));
                    _this.trail.reverse();//数组执行下倒叙
                    Object.assign(_this.trail[0],{
                        select:true,
                        color:"#5099F4",//高亮dot
                        textColor:"#000",//高亮文字
                        dotStyle:{"background-color":"#5099F4"}
                    })
                    _this.trail[(_this.trail.length-1)].borderLeftWidth = {"border-left-width":0};//不需要显示线条
                })
            })
        }
    },
    mounted () {
        if(this.widgetParams.entityName){
            engineService.getEntity(this.widgetParams.entityName).then((data)=>{
                //通过实体名称获取实体id
                this.entityId = data.attrs.metaEntityId;
                this.businessKey = data.attrs.metaEntityId+':'+this.widgetParams.dataId;
                this.getProvalTrail();
            })
        }
    }
}
</script>
<style lang="css">
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
    
</style>