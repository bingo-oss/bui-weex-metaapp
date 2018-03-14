<template>
    <div class="container">
        <bui-header :title="'请选择' + definition.componentParams.title"
            :leftItem="{text: '取消'}" @leftClick="cancel">
        </bui-header>
        <bui-searchbar-center placeholder="请输入搜索内容" @search="onSearchInput" @clear="onSearchClear"></bui-searchbar-center>
        <scroller class="scroller">
            <bui-cell v-for="item in dataList" :key="item.id" :title="item.title" @cellClick="itemClicked(item)"></bui-cell>
            <loading-wrapper v-if="dataList.length && dataList.length >= pageSize" @loading="onloading" :status="loadingStatus">
            </loading-wrapper>
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
            queryObject: {},
            pageSize: 20,
            loadingStatus: 'init',
            currentPage: 1,
        }
    },
    methods: {
        fetchData(page) {
            this.queryObject.page = page || 1;
            this.queryObject.page_size = this.pageSize;
            return ajax.get(this.dataUrlPath, this.queryObject).then(resp => {
                return resp.data;
            });
        },
        refresh() {
            this.fetchData(1).then(data => {
                this.dataList = data;
                this.loadingStatus = 'init';
            })
        },
        onSearchInput(v) {
            this.queryObject.filters = v && `title like %${v}%`;
            this.refresh();
        },
        onSearchClear() {
            this.queryObject.filters = '';
            this.refresh();
        },
        itemClicked(item) {
            this.$emit('itemSelected', item);
        },
        cancel() {
            this.$emit('cancel');
        },
        onloading() {
            if (this.loadingStatus == 'loading') return;
            this.loadingStatus = 'loading';
            this.fetchData(this.currentPage + 1).then(data => {
                if (data.length) {
                    this.dataList = this.dataList.concat(data);
                    this.currentPage++;
                    this.loadingStatus = 'init';
                } else {
                    this.loadingStatus = 'noMore';
                }
            }).catch(err => {
                this.$toast(err);
                this.loadingStatus = 'init';
            })
        }
    },
    created() {
        this.dataUrlPath = this.definition.componentParams.entityResourceUrl;
        this.refresh();
    },
    components: {
        'refresh-wrapper': require('../components/common/refresh.vue'),
        'loading-wrapper': require('../components/common/loading.vue')
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
