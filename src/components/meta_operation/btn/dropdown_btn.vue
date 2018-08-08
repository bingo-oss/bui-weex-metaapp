<template>
    <div v-if="operation" class="bui-cell cell-bottom-border full-column">
        <div class="cell-title">
            <text class="cell-content" v-if="operation.title" :style="operation.style">{{operation.title}}</text>
        </div>
    </div>
</template>
<script>
export default {
    props:{
        operation:{
            type:Object
        }
    }
}
</script>
<style>
    .bui-cell {
        height: 100px;
        position: relative;
        flex-direction: row;
        align-items: center;
        padding-left: 24px;
        padding-right: 24px;
        background-color: #ffffff;
    }
    .cell-bottom-border {
        border-bottom-color: #eeeeee;
        border-bottom-width: 1px;
    }
    .cell-title {
        flex: 1;
    }
    .cell-content {
        text-align: center;
        color: #333333;
        font-size: 30px;
        line-height: 40px;
    }
</style>


