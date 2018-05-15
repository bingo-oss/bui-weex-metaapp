<template>
<div bubble="true" class="full-column">
    <div @click="toggleModal" class="full-column">
        <slot>
            <meta-opt-btn :btn-type="btnType" :operation="operation"></meta-opt-btn>
        </slot>
    </div>
    <bui-popup pos="top" v-model="popupWidgetModal" :height="modalHeight" :width="modalWidth">
        <component @close="close" :widget-context="widgetContext" :operation="operation" :is="operation.widget">
        </component>
    </bui-popup>
</div>
</template>
<script>
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
    data(){
        return {
            modalWidth:this.operation.modalWidth||750,
            modalHeight:this.operation.modalHeight||840,
            modalTitle:this.operation.modalTitle,
            popupWidgetModal:false
        };
    },
    methods:{
        toggleModal(){
            this.popupWidgetModal=!this.popupWidgetModal;
            this.$emit("triggered",this.popupWidgetModal);
        },
        close(){
            this.popupWidgetModal=false;
        }
    }
}
</script>
<style lang="css">
    .popup-widget-con .modal-inner-widget{
        overflow:auto;padding:5px;
    }
    .popup-widget-con .ivu-modal-footer{
        padding:0px;
        border:none;
    }
</style>
<style src="../../styles/common.css"></style>

