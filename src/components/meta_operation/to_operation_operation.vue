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
    }
  },
  data() {
    if (!this.operation.operationId) {
      this.$toast("page参数缺失");
    }
    return {};
  },
  methods: {
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
        var pageId = this.operation.operationId;
        var queryParam = _.extend(
          {
            pageId: pageId,
            byOperation: true
          } /*,this.getIdFromContext(),this.operation.queryParams*/
        );
        OperationUtils.setUrlParam(this.operation, this); //按钮输入参数处理
        OperationUtils.execution(this.operation, _widgetCtx, "afterExecCode"); //执行后
        this.$push(Utils.pageEntry(), queryParam);
        this.$emit("triggered", "toPage");
      });
    }
  }
};
</script>
<style src="../../styles/common.css"></style>