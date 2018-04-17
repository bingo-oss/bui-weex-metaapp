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

# 属于实体字段的页面参数将被特殊处理

如果有属于实体字段的页面参数，将会在页面的一些请求里原封不动地带上。例如页面参数包含 activityId=id，而实体有 activityId 这个字段，则在列表页里会在请求数据 (如GET /milestone) 时原封不动带上该参数。

# Developer note

以下是给这个项目开发者的 note，页面的使用者可以跳过。

两个页面的入口在 src/entry 下可以找到。

表单的所有 input 组件在 src/components 下，目前尚未完全实现 PC 端定义的所有组件，也并未完全实现所有定义的组件功能。

主要的问题:

1. 这两个提供的页面主要做的事件是根据列表或表单的定义，将页面渲染出来，并实现定义的功能逻辑。但是目前的定义没有文档描述，只能通过猜测、尝试以及口头询问的方式去理解定义，因此很容易出现移动端的行为与 PC 端不一致（对定义的理解有出入）。同时也容易出现 PC 端修改了定义内容，移动端没有跟上一起改导致移动端出错。
2. input 的组件比较多，且这些 input 在表单视图与在 filterView 里的行为有很多不一致的地方，目前的实现是让 input 组件同时支持两种模式（input 与 filterInput），这样能共用一些逻辑，但也会有耦合严重的问题（目前只有部分组件支持两种模式）。可以考虑将每个 input 组件拆成两个，一个在普通的表单视图里用，一个在 filterView 里用，这样会使文件数目翻倍（date.vue and date-filter.vue），但能减少耦合。
3. 有两个比较重要的组件未实现，image-input 与 file-input。
4. 其它见 jira 单。

## 开发流程

与一般的 weex 工程类似，只是可以在 src/js/config.js 里设置 debug 为 true 可以写死 viewId, formId 等方便调试。记得在 npm run publish 之前将 debug 设为 false 即可。

测试云指系统地址
https://developer.bingosoft.net:12100/mweb/metasuite.html