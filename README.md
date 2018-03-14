本项目主要为元数据表单在移动端提供两个 weex 渲染的页面，包含列表页和表单页。

# 列表页 (`list.weex.js`)

列表页的入口地址为 `list.weex.js`。页面参数见下:

参数名 | 是否必填 | 类型 | 备注
----- | ------ | ---- | ---
viewId | 是 | `String` | 要渲染的列表(视图)的 shortId

# 表单頁 (`form.weex.js`)

表单页的入口地址为 `form.weex.js`。页面参数见下:

参数名 | 是否必填 | 类型 | 备注
----- | ------ | ---- | ---
formId | 是 | `String` | 要渲染的表单的 shortId
readOnly | 否 | `Boolean` | 是否显示提交按钮
entityId | 否 | `String` | 如果用此页面来编辑某条实体记录的数据，则传入指定实体的 id
