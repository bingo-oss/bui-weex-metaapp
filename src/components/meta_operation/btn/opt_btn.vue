<template>
  <div style="flex: 1;">
    <component
      @on_btn_click="$emit('on_btn_click')"
      :is="btnComponentName"
      :operation="operation"
      :title="title"
      :uiType="uiType"
    ></component>
  </div>
</template>
<script>
export default {
  props: {
    operation: {
      type: Object
    },
    btnType: {
      type: String,
      default: "normal" //normal,swipe-cell,icon
    },
    title: {
      type: String,
      default: "title" //normal,swipe-cell,icon
    },
    uiType: {}
  },
  methods: {},
  computed: {
    btnComponentName() {
      return `${this.btnType}-btn`;
    }
  },
  components: {
    "normal-btn": require("./normal_btn.vue"),
    "swipe-cell-btn": require("./swipe_cell_btn.vue"),
    "icon-btn": require("./icon_btn.vue"),
    "dropdown-btn": require("./dropdown_btn.vue"),
    "img-btn": require("./img_btn.vue"),
    "item-btn": require("./item_btn.vue")
  }
};
</script>
