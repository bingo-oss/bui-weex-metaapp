<template>
  <div>
    <!-- 由于active伪类会拦截点击事件，所以在这里监听点击再往上传 -->
    <div
      class="item_btn"
      :style="itemStyle"
      @click="$emit('on_btn_click')"
    >
      <text class="item_text">{{(operation && operation.title)? operation.title : title}}</text>
    </div>
  </div>

</template>
<script>
export default {
  props: {
    operation: {
      type: Object
    },
    //没有operation/没有operation.title的情况下
    //可以传入title
    title: {
      type: String,
      default: "title" //normal,swipe-cell,icon
    },
    uiType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      item_btn: {
        "border-color": "#999999",
        "border-width": "1px",
        "border-radius": "10px",
        height: "80px",
        "flex-direction": "row",
        "align-items": "center",
        flex: 1,
        "background-color": "#f1f1f1"
      },

      item_btn_top: {
        "border-color": "#999999",
        "border-left-width": "1px",
        "border-right-width": "1px",
        "border-top-width": "1px",
        "border-top-left-radius": "10px",
        "border-top-right-radius": "10px",
        height: "80px",
        "flex-direction": "row",
        "align-items": "center",
        flex: 1,
        "background-color": "#f1f1f1"
      },

      item_btn_middle: {
        "border-left-width": "1px",
        "border-right-width": "1px",
        "border-top-width": "1px",
        "border-color": "#999999",
        height: "80px",
        "flex-direction": "row",
        "align-items": "center",
        flex: 1,
        "background-color": "#f1f1f1"
      },

      item_btn_bottom: {
        "border-color": "#999999",
        "border-width": "1px",
        "border-bottom-left-radius": "10px",
        "border-bottom-right-radius": "10px",
        height: "80px",
        "flex-direction": "row",
        "align-items": "center",
        flex: 1,
        "background-color": "#f1f1f1"
      }
    };
  },
  computed: {
    /**
     * 根据uiType返回样式
     * @param uiType
     *    1=上圆下方
     *    2=全方边框
     *    3=上方下圆
     *    0/其他=全圆
     */
    itemStyle() {
      if (this.uiType == 1) {
        return this.item_btn_top;
      } else if (this.uiType == 2) {
        return this.item_btn_middle;
      } else if (this.uiType == 3) {
        return this.item_btn_bottom;
      } else {
        return this.item_btn;
      }
    }
  },
  methods: {}
};
</script>

<style>
.item_btn {
  background-color: #f1f1f1;
}

.item_btn:active {
  background-color: #ffffff;
}

.item_text {
  text-overflow: ellipsis;
  lines: 1;
  flex: 1;
  text-align: center;
  font-size: 30px;
  color: #333333;
}
</style>





