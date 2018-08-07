<template>
    <div class="form-group">
        <template v-if="viewMode||forceView">
            <div class="label-wrapper">
                <text class="form-label view-label">{{definition.componentParams.title}}</text>
                <text class="view-text" :value="definition.componentParams.content"></text>
            </div>
        </template>
        <template v-else>
            <text :style="contentStyle">{{definition.componentParams.content}}</text>
        </template>
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
<style src="../../styles/common.css" scoped="false"></style>