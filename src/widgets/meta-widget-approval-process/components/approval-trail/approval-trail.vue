<template>
<div class="approval-trail">
    <scroller class="scroller">
        <bui-timeline>
            <bui-timeline-item v-for="(item,index) in trail" :first="index===0" :last="index===trail.length-1 && index!==0" :key="item.id">
                <div style="flex-direction:column;">
                    <div class="approval-trail-title">
                        <text class="font28">{{item.name}}</text>
                    </div>
                    <div class="approval-trail-details" style="flex-direction:column;">
                        <div class="approval-trail-info" v-if="index===0">
                            <text class="font28 color-sub" v-if="item.createTime">发起时间: {{item.createTime}}&nbsp;&nbsp;</text>
                        </div>
                        <div class="approval-trail-info" v-else>
                            <text class="font28 color-sub" v-if="item.assigneeName">审批人: {{item.assigneeName}}&nbsp;&nbsp;审批时间: {{item.createTime}}</text>
                            <text class="font28 color-sub" v-if="item.opinion">审批意见: {{item.opinion}}</text>
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
                    _.each(taskList,function(item,index){
                        if (item.createTime) {
                            item.createTime=utils.formatDate(item.createTime);
                        }
                        if (variables[item.id + "-opinion"]) {
                            item.opinion = variables[item.id + "-opinion"];
                        }
                        _this.trail.push(item)
                    });

                    _this.trail.unshift({
                        name: procInst.startUserName + "发起了" + procInst.processDefinitionName,
                        createTime: utils.formatDate(procInst.startDate)
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
    .approval-trail{
        flex:1;
        padding-top:66px;
        padding-left:20px;
    }
    .approval-trail-details{
        margin-top:20px;
    }
    
</style>