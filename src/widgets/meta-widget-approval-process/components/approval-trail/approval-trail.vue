<template>
<div class="approval-trail">
    <scroller class="scroller">
        <bui-timeline>
            <bui-timeline-item v-for="(item,index) in trail" :first="index===0" :last="index===trail.length-1 && index!==0" :key="item.id">
                <div style="flex-direction:column;">
                    <div class="approval-trail-title">
                        <text class="font28">{{item.name}}</text>
                    </div>
                    <div class="approval-trail-details">
                        <div class="approval-trail-info">
                            <template>
                                <text class="font28 color-sub" v-if="item.assigneeName">审批人: {{item.assigneeName}}&nbsp;&nbsp;<template v-if="item.createTime">审批时间: {{item.endTime}}</template></text>
                                <text class="font28 color-sub" v-if="item.opinion">审批意见: {{item.opinion}}</text>
                            </template>
                        </div>
                    </div>
                </div>
            </bui-timeline-item>
        </bui-timeline>
    </scroller>
</div>
</template>

<script>
import _ from '../../../../js/tool/lodash.js'
import service from './js/service';
import utils from '../../../../js/tool/utils';
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
        procInstId: function() {
            return this.widgetParams.procInstId;
        }
    },
    watch: {
        procInstId: function() {
            this.getProvalTrail();
        }
    },
    methods: {
        getProvalTrail() {
            var _this = this;
            if (_this.procInstId) {
                service.tasksInfo(_this.procInstId).then(resp => {
                    var procInst = resp.processInstance;
                    var variables =  resp.processInstance.variables;
                    var taskList = resp.tasks.content
                    _this.trail = taskList.map(item => {
                        return {
                            name:item.name,
                            assigneeName:item.assigneeName,
                            createTime:item.createTime?utils.formatDate(item.createTime):"",
                            endTime:item.endTime?utils.formatDate(item.endTime):"",
                            opinion:item.variables?item.variables.opinion:""
                        }
                    });

                })
            }
        }
    },
    mounted () {
        this.getProvalTrail();
    }
}
</script>
<style lang="css">
    .scroller{
        flex:1;
    }
    .font28{
        font-size:28px;
    }
    .color-sub{
        color:#666;
    }
    .approval-trail-title{ padding-top: 4px;}
    .approval-trail{
        flex:1;
        padding-top:66px;
        padding-left:20px;
    }
    .approval-trail-details{
        margin-top:20px;
        flex-direction:column;
    }
    .approval-trail-info{
        width: 700px;
    }
    
</style>