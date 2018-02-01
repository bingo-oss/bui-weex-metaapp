<template lang="html">
    <div v-if="showComponent" class="form-group">
        <text class="form-label">{{definition.componentParams.title}}</text>
        <text class="form-input" :style="inputStyle" @click="inputClicked">{{valueText || '选择部门...'}}</text>
    </div>
</template>

<script>
const linkapi = require("linkapi");
import SingleUserSelect from './single-user-select.vue'

export default {
    componentType: 'SingleOrgSelect',
    extends: SingleUserSelect,
    methods: {
        inputClicked(e) {
            linkapi.startContactSingleSelector(this.definition.componentParams.title, 4, {}, (result) => {
                // this.valueText = result.user.map(u => u.name).join(',');
                // this.$emit('input', result.user);
                this.$alert(result);
            }, (err) => {
                this.$alert(err);
            })
        }
    },
}
</script>

<style src="../styles/common.css"></style>
