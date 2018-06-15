<template>
<div class="approval-trail">
    <scroller class="scroller">
        <bui-flow
            :items="trail"
            :customStyles="customStyles"
            @click=''></bui-flow>
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
                        item.title = item.name;
                        item.date = "";
                        if(item.assigneeName){
                            item.date = "审批人："+item.assigneeName+" "
                        }
                        if (item.createTime) {
                            item.date += "审批时间：" + utils.formatDate(new Date(item.createTime))+" "
                        }
                        if(!item.assigneeName && !item.createTime && index<(taskList.length-1)) {
                            item.date = "被驳回"
                        }
                        if (variables[item.id + "-opinion"]) {
                            item.date += "审批意见" + variables[item.id + "-opinion"];//审批意见
                        }
                        if(index==(taskList.length-1)) {
                            item.highlight = true;
                        }
                        _this.trail.push(item)
                    });

                    _this.trail.unshift({
                        title: procInst.startUserName + "发起了" + procInst.processDefinitionName,
                        date: "发起时间："+utils.formatDate(new Date(procInst.startDate))
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
    .approval-trail{
        flex:1;
    }
</style>