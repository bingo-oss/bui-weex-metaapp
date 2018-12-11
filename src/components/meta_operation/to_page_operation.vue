<template>
  <div class="full-column">
    <div
      @click="gotoPage"
      class="full-column"
    >
      <slot>
        <meta-opt-btn
          @on_btn_click="gotoPage"
          :uiType="uiType"
          :btn-type="btnType"
          :operation="operation"
        ></meta-opt-btn>
      </slot>
    </div>

    <!--    <div bubble="true" class="full-column" v-if="!operation.isPopup">
        &lt;!&ndash;<bui-popup pos="top" v-model="popupWidgetModal" :height="modalHeight" :width="modalWidth">
            <meta-widget-page class="full-column" ref="page" :query="pageParams" :widget-params="pageParams"></meta-widget-page>
        </bui-popup>&ndash;&gt;

        &lt;!&ndash;<div v-if="popupWidgetModal" style=" position: fixed;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        background-color:rgba(0,0,0,0.2);">
        </div>&ndash;&gt;

        <div :style="{position:'fixed',width:modalWidth,height:modalHeight,top:(1000-modalHeight)/2,left:(750-(modalWidth>=750?modalWidth:0))/2}">
            <meta-widget-page v-if="pageShow" ref="page" :query="pageParams" :widget-params="pageParams" :vue-modal="this"></meta-widget-page>
        </div>

        <div @click="toggleModal" class="full-column" v-if="operation.isPopup">
            <slot>
                <meta-opt-btn :btn-type="btnType" :operation="operation"></meta-opt-btn>
            </slot>
        </div>

    </div>-->

  </div>
</template>
<script>
import _ from "../../js/tool/lodash.js";
import Utils from "../../js/tool/utils";
import OperationUtils from "./js/operation_utils";

export default {
  props: {
    widgetContext: {
      //由使用操作的部件传入的部件上下文
      type: Object,
      required: true
    },
    operation: {
      //操作的定义，必传参数
      type: Object,
      required: true
    },
    btnType: {
      //操作按钮的类型
      type: String
    },
    uiType: {}
  },
  data() {
    if (!this.operation.pageId) {
      //this.$toast("page参数缺失");
    }
    return {
      modalWidth: this.operation.modalWidth || 750,
      modalHeight: this.operation.modalHeight || 840,
      modalTitle: this.operation.modalTitle,
      popupWidgetModal: false,
      pageShow: true,
      pageParams: {}
    };
  },
  methods: {
    getIdFromContext() {
      var context = _.extend(this.widgetContext, this.operation);
      var id = context.selectedId;
      var metaEntity = context.metaEntity;
      if (!context.selectedItem && context.selectedItems) {
        //按钮放置的是在工具栏
        context.selectedItem =
          context.selectedItems[context.selectedItems.length - 1];
        context.selectedId = context.selectedItem.id;
        id = context.selectedId;
      }
      if (!id) {
        var selectedItem = context.selectedItem;
        if (selectedItem) {
          //计算id字段
          var idField = null;
          if (!_.isEmpty(metaEntity)) {
            idField = metaEntity.getIdField();
          }
          id = selectedItem[idField];
        }
      }
      return /*{dataId:id,entity:metaEntity.metaEntityId}*/;
    },
    gotoPage() {
      this.$emit("on_btn_click");
      var _widgetCtx = Object.assign(this.widgetContext, {
        buttonInfo: this.operation
      });
      OperationUtils.execution(
        this.operation,
        _widgetCtx,
        "beforeExecCode"
      ).then(res => {
        if (!this.operation.pageId) {
          return;
        }
        var pageId = this.operation.pageId;
        var queryParam = _.extend(
          {
            pageId: pageId,
            byOperation: false
          } /*,this.getIdFromContext(),this.operation.queryParams*/
        );
        OperationUtils.setUrlParam(this.operation, this); //按钮输入参数处理
        OperationUtils.execution(this.operation, _widgetCtx, "afterExecCode"); //执行后
        this.$push(Utils.pageEntry(), queryParam);
        this.$emit("triggered", "toPage");
      });
    },
    toggleModal() {
      var _widgetCtx = Object.assign(this.widgetContext, {
        buttonInfo: this.operation
      });
      OperationUtils.execution(
        this.operation,
        _widgetCtx,
        "beforeExecCode"
      ).then(res => {
        this.pageParams = _.extend(
          { pageId: this.operation.pageId, byOperation: false },
          this.getIdFromContext()
        );
        /*this.webUrl = Utils.pageEntry()+"?pageId="+this.pageParams.pageId+"&dataId="+this.pageParams.dataId+"&entity="+this.pageParams.entity;*/
        /*this.$refs
         */
        this.popupWidgetModal = !this.popupWidgetModal;
        this.$emit("triggered", "popup");
        this.pageShow = true;
        OperationUtils.execution(this.operation, _widgetCtx, "afterExecCode"); //执行后
      });
    },
    toggleClose() {
      this.popupWidgetModal = false;
      this.pageShow = false;
    }
  }
};
</script>
<style src="../../styles/common.css"></style>