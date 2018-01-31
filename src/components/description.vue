<template>
    <div class="form-group">
        <text :style="contentStyle">{{definition.componentParams.content}}</text>
    </div>
</template>

<script>
import mixin from './component-mixin.js'

export default {
    componentType: 'Description',
    extends: mixin,
    data() {
        return {
        }
    },
    computed: {
        contentStyle() {
            return {
                'text-align': this.definition.componentParams.align
            }
        }
    },
}
</script>

<style src="../styles/common.css"></style>
