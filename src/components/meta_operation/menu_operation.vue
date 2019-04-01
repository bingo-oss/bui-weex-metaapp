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


   <!--平铺弹窗样式-->
    <bui-popup
            v-if="operation.menuType=='tile'"
            :height="tile_windowHeight"
            backgroundColor="transparent"
            v-model="menu_window_show"
            :rgba="0"
    >
      <scroller
              class="scl_content"
              style="width:750px; border-top-style:solid; border-top-color:#EAEAEA; border-top-width: 1px; "
      >
        <div style="width: 750px; " class="flex-row">
          <div
                  :style="{'height':'100px','background-color':'','width':tile_width}"
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
            >
              <div style="flex: 1; height: 100px; align-items: center; background-color: #F8F8F8; justify-content: center;">
                <image
                        v-if="button.icon"
                        style="width:40px;height:40px;margin-bottom: 10px; margin-top: 10px;"
                        :src="getImageUrl(button.icon)"
                />
                <text class="flex-row" style="font-size: 20px;">{{button.title}}</text>
              </div>
            </meta-operation>
          </div>

          <!--<meta-opt-btn
                  @on_btn_click="cancel"
                  :btn-type="'item'"
                  :title="'取消'"
                  style="margin-top:16px"
          ></meta-opt-btn>-->

        </div>
      </scroller>
    </bui-popup>


    <!--默认弹窗样式-->
    <bui-popup
            :height="windowHeight"
            backgroundColor="transparent"
            v-model="menu_window_show"
            v-else
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
    cellExecScript() {
      var _widgetCtx = Object.assign(this.widgetContext, {
        buttonInfo: this.operation
      });
      OperationUtils.execution(
              this.operation,
              _widgetCtx,
              "beforeExecCode",this
      ).then(res => {
        OperationUtils.setUrlParam(this.operation, this); //按钮输入参数处理
      var fun = this.operation.onClick;
      try{
        if (_.isFunction(fun)) {
          this.mustStopRepeatedClick = true;
          fun(_widgetCtx, factoryApp);
        } else if(fun){
          this.mustStopRepeatedClick = true;
          var onclick = Function('"use strict";return ' + fun)();
          onclick(_widgetCtx, factoryApp);
        }
      }catch (e){
        this.$toast("脚本语法有误");
      }
      this.mustStopRepeatedClick = false;
      this.$emit("triggered", "script");
      OperationUtils.execution(this.operation, _widgetCtx, "afterExecCode",this); //执行后
    });
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
    },
    getImageUrl(url) {
      if (Util.isEmpty(url)) {
        return "";
      }
      if (Util.isUrl(url)) {
        return url;
      }
      let _url = Config.serverConfig.engineService + "/stream?filePath=";

      let _array = url.split("||");
      if (Array.isArray(_array)) {
        if (_array.length > 0) {
          return _url + _array[0];
        } else {
          return _url + url;
        }
      } else {
        return _url + url;
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
      return hei+100;
    },
    tile_windowHeight(){
      var hei = 0;
      if (this.child_operations) {
        var len = parseInt(this.child_operations.length/3);
        if(this.child_operations.length%3!=0){
          len+=1;
        }
        if (len > 10) {
          len = 10;
        }
        hei = len * 110;
      }
      return hei;
    },
    tile_width(){
      if(this.child_operations){
        if(this.child_operations.length==1){
          return "750px"
        }else if(this.child_operations.length==2) {
          return "375px"
        }else{
          return "240px"
        }
      }
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
    },
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
        filters: "parentId eq " + operation.id,
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
.flex-row {
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
<style src="../../styles/common.css"></style>

