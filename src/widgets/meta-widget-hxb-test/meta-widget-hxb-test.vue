<template>
    <div id="parent">
        <div>================================================</div>
    </div>
</template>

<script>
    export default {
        name: 'meta-widget-hxb-test',
        props: {
            widgetParams: {
                type: Object,
                required: true
            },
            widgetContext: {
                //由使用操作的部件传入的部件上下文
                type: Object,
                required: false
            }
        },
        data() {
            return {}
        },
        watch: {
            widgetParams: {
                immediate: true,
                handler: function () {
                }
            }
        },
        computed: {},
        methods: {
            getWidgetContext() {
                var metaEntity = this.widgetParams.metaEntity
                if (typeof metaEntity == 'string') {
                    return {metaEntity: JSON.parse(metaEntity)}
                } else {
                    return {metaEntity: metaEntity}
                }
            },
            getOperation() {
                var operation = {}
                operation.title = '哈哈'
                operation.icon = 'arrow-up-a'
                return operation
            }
        },
        created() {
            var _this = this
        }
    }
</script>

<style scoped>
    #parent {
        /*padding: 20px;*/
        display: inline-block;
    }
</style>
