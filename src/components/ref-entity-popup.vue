<template>
    <div class="container">
        <bui-header :title="'请选择' + definition.componentParams.title"
            :leftItem="{text: '取消'}" @leftClick="back">
        </bui-header>
        <bui-searchbar-center placeholder="请输入搜索内容" @input="onSearchInput"></bui-searchbar-center>
        <scroller class="scroller">
            <bui-cell v-for="item in dataList" :key="item.id" :title="item.title" @cellClick="itemClicked(item)"></bui-cell>
        </scroller>
    </div>
</template>

<script>
import ajax from '../js/ajax.js';

export default {
    props: {
        definition: null,
    },
    data() {
        return {
            dataList: [],
            dataUrlPath: '',
            dataUrlQuery: {},
        }
    },
    methods: {
        refresh() {
            ajax.get(this.dataUrlPath, this.dataUrlQuery).then(resp => {
                this.dataList = resp.data;
            });
        },
        onSearchInput(e) {
            this.dataUrlQuery.filters = `title like %${e.value}%`;
            this.refresh();
        },
        itemClicked(item) {
            this.$emit('itemSelected', item)
        }
    },
    created() {
        this.dataUrlPath = this.definition.componentParams.entityResourceUrl;
        this.refresh();
    }
}
</script>

<style lang="css">
.container {
    flex: 1;
}
.scroller {
    flex: 1;
}
</style>
