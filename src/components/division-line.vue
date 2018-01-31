<template>
    <div class="division-line-wrapper">
        <text :style="titleStyle">{{definition.componentParams.title}}</text>
        <div class="splitter"></div>
        <text :style="desStyle">{{definition.componentParams.description}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'DivisionLine',
    extends: mixin,
    data() {
        return {
        }
    },
    computed: {
        titleStyle() {
            return {
                'font-weight': 'bold',
                'text-align': this.definition.componentParams.titleAlign
            }
        },
        desStyle() {
            return {
                'text-align': this.definition.componentParams.descriptionAlign
            }
        },
    },
}
</script>

<style>
    .division-line-wrapper {
        padding-bottom: 40px;
        padding-top: 40px;
    }
    .splitter {
        margin-top: 20px;
        margin-bottom: 20px;
        border-bottom-color: #BEBCBC;
        border-bottom-width: 1px;
        border-bottom-style: solid;
    }
</style>
