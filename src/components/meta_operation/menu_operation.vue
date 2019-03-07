<template>
  <div class="full-column">
    <div
      @click="openMenu"
      id="div_btn"
      class="full-column"
    >
      <slot>
        <meta-opt-btn
          @on_btn_click="openMenu"
          :btn-type="btnType"
          :operation="operation"
        ></meta-opt-btn>
      </slot>
    </div>

    <bui-popup
      backgroundColor="transparent"
      v-model="menu_window_show"
    >
      <scroller
        class="scl_content"
        style="width:100%;"
      >
        <div style="width: 100%;">
          <div
            style="width: 100%;"
            v-if="child_operations"
            v-for="(button,index) in child_operations"
            v-bind:key="index"
          >
            <meta-operation
              :btnType="'item'"
              :operation="button"
              :widgetContext="widgetContext"
              @triggered="$emit('triggered')"
              @on_btn_click="cancel"
              :uiType="getUIType(index)"
            ></meta-operation>

          </div>

          <meta-opt-btn
            @on_btn_click="cancel"
            :btn-type="'item'"
            :title="'取消'"
            style="margin-top:16px"
          ></meta-opt-btn>

        </div>
      </scroller>
    </bui-popup>

  </div>
</template>
<script>
import Config from "../../js/config";
import service from "../../js/service.js";
import Util from "../../js/utils";
import OperationUtils from "./js/operation_utils";
import _ from "../../js/tool/lodash";
import factoryApp from "../../widgets/libs/factory-app.js";
import config from "../../js/config.js";
import ax from "../../js/ajax.js";

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
    return {
      menu_window_show: false,
      child_operations: null
    };
  },
  methods: {
    openMenu() {
      this.$emit("on_btn_click");
      if (this.child_operations && this.child_operations.length > 0) {
        this.menu_window_show = true;
      }
      this.executeOnClick();
      // this.$alert("aaaa");
    },
    executeOnClick() {
      let _t = this;
      if (_t.operation.onClick) {
        console.log("has Click");
        var _widgetCtx = Object.assign(_t.widgetContext, {
          buttonInfo: _t.operation
        });
        OperationUtils.execution(
          _t.operation,
          _widgetCtx,
          "beforeExecCode"
        ).then(res => {
          if (_.isFunction(this.operation.onClick)) {
            this.mustStopRepeatedClick = true;
            this.operation.onClick(
              Object.assign(this.widgetContext, { buttonInfo: this.operation }),
              factoryApp
            );
          } else {
            this.mustStopRepeatedClick = true;
            var onclick = Function(
              '"use strict";return ' + this.operation.onClick
            )();
            onclick(
              Object.assign(this.widgetContext, { buttonInfo: this.operation }),
              factoryApp
            );
          }
          this.mustStopRepeatedClick = false;
          this.$emit("triggered", "script");
          OperationUtils.execution(this.operation, _widgetCtx, "afterExecCode"); //执行后
        });
      } else {
        if (_t.implCode) {
          _t.cellExecScript();
        } else {
          //获取执行代码
          config.readRuntimeConfig().then(runtimeConfig => {
            ax.get(
              runtimeConfig["service.metabase.endpoint"] +
                `/meta_operation/${_t.operation.operationId}`
            ).then(({ data }) => {
              _t.implCode = data.implCode;
              _t.cellExecScript();
            });
          });
        }
      }
    },
    cancel() {
      this.menu_window_show = false;
    },
    actionsheetItemClick(item, index) {
      this.$toast(item);
      this.menu_window_show = false;
    },
    actionsheetBtnClick() {
      this.menu_window_show = false;
    },
    getUIType(index) {
      var len = this.child_operations.length;
      if (index == 0) {
        return 1;
      } else if (index == len - 1) {
        return 3;
      } else {
        return 2;
      }
    }
  },
  computed: {
    windowHeight() {
      var hei = 0;
      if (this.child_operations) {
        var len = this.child_operations.length;
        if (len > 10) {
          len = 10;
        }
        hei = len * 100;
      }
      return hei;
    },
    actionsheetItems() {
      if (this.child_operations) {
        var items = new Array();
        for (var i = 0; i < this.child_operations.length; i++) {
          var item = this.child_operations[i];
          items.push(item.title);
        }
        return items;
      } else {
        return null;
      }
    }
  },
  mounted() {
    //Config.serverConfig.configServerUrl == https://developer.bingosoft.net:12100/services/tool/system/config
    let operation = this.operation,
      _t = this; //页面参
    if (operation != null && !Util.isEmpty(operation.id)) {
      //this.$alert(Config.serverConfig)   hostServerUrl
      service.init(Config.serverConfig.configServerUrl); //初始化请求到的地址
      // filters: "parentId eq " + operation.id,
      let params = {
        orderby: "updatedAt desc",
        page: 1,
        page_size: 10,
        total: true
      };

      service.getMenuItems(params).then(res => {
        this.child_operations = res;
      }); //获取引擎地址
    } else {
      return;
      //this.$toast("参数未传递");
    }
  }
};
</script>
<style lang="css">
.scl_content {
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
}
</style>
<style src="../../styles/common.css"></style>

