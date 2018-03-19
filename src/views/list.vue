<template>
    <div>
        <bui-header>
            <div slot="center" class="page-title-wrapper" @click="titleClicked">
                <text class="page-title" @click="titleClicked">{{title}}</text>
                <bui-icon name="ion-chevron-down" color="white" size=36 @click="titleClicked"></bui-icon>
            </div>
            <div slot="right" class="header-right-wrapper">
                <div class="header-button" @click="filterClicked">
                    <bui-icon name="ion-funnel" color="white" @click="filterClicked"></bui-icon>
                </div>
                <div class="header-button" @click="create">
                    <bui-icon name="ion-plus" color="white" @click="create"></bui-icon>
                </div>
            </div>
        </bui-header>
        <bui-searchbar-center @search="onSearch" @clear="onSearchClear" placeholder="请输入搜索内容"></bui-searchbar-center>
        <scroller>
            <refresh-wrapper @refresh="onrefresh" :isRefreshing="isRefreshing">
            </refresh-wrapper>
            <div v-for="o in listData" @click="cellClick(o.id)">
                <!-- 布局 0 -->
                <div class="list-item" v-if="layoutType == '0'">
                    <div class="list-item-row">
                        <text class="sub-text">{{o.title}}</text>
                    </div>
                </div>

                <!-- 布局 1 -->
                <div class="list-item" v-if="layoutType == '1'">
                    <div class="list-item-row">
                        <text class="title-text">{{getFieldValue(o, p1)}}</text>
                    </div>
                    <div class="list-item-row">
                        <text class="sub-text">{{getFieldValue(o, p2)}}</text>
                        <text class="sub-text">{{getFieldValue(o, p3)}}</text>
                    </div>
                    <div class="list-item-row">
                        <text class="sub-text">{{getFieldValue(o, p4)}}</text>
                        <text class="sub-text">{{getFieldValue(o, p5)}}</text>
                    </div>
                </div>
            </div>
            <loading-wrapper v-if="listData.length && listData.length >= pageSize" @loading="onloading" :status="loadingStatus">
            </loading-wrapper>
        </scroller>

        <bui-dropdown v-model="showDropdown" ref="dropdown" :center=true>
            <bui-cell v-for="filter in presetFilters" :key="filter.id" :title="filter.title" @cellClick="presetFilterChosen(filter)"></bui-cell>
        </bui-dropdown>

        <bui-popup v-model="showPopup" pos="right" width=600>
            <filter-view :filters="filters" :viewDef="viewDef" :swaggerEntiyDef="swaggerEntiyDef" @filter="customFilterSet" @cancel="showPopup = false">
            </filter-view>
        </bui-popup>
    </div>
</template>

<script>

import service from '../js/service.js';
import ajax from '../js/ajax.js';
import config from '../js/config.js';
const linkapi = require('linkapi');

const globalEvent = weex.requireModule('globalEvent');

module.exports = {
    data() {
        return {
            dataUrlPath: '', // 获取 listData 的 url 路径
            dataUrlParam: null, // 获取 listData 的 url query object
            listData: [],
            viewDef: {},
            selectFields: [],
            quickSearchableField: [],
            swaggerEntiyDef: {},
            layoutType: "1",
            p1: 'title',
            p2: '2',
            p3: '3',
            p4: '4',
            p5: '5',
            presetFilters: [],
            filters: {}, // 高级搜索
            quickSearchFilters: '',
            selectedFilter: null,
            showDropdown: false,
            showPopup: false,
            isRefreshing: false,
            loadingStatus: 'init',
            currentPage: 1,
            pageSize: 10,
        }
    },
    computed: {
        title() {
            if (this.selectedFilter) {
                return this.selectedFilter.title;
            }
            return this.viewDef.title;
        }
    },
    watch: {

    },
    methods: {
        cellClick(id) {
            // let url = `${this.contextPath}/form.weex.js?entityId=${id}&formId=${this.formId}`;
            // this.$push(url)
            let url = this.viewDef.settings.mViewUrl.appUrl.replace(':id', id);
            let params = {
                appCode: this.viewDef.settings.mViewUrl.appCode,
                appUrl: url,
            };
            linkapi.runApp(params)
        },
        filterClicked() {
            this.showPopup = true;
        },
        customFilterSet(result) {
            // this.$alert(result);
            this.showPopup = false;
            this.filters = result;
            this.refreshData();
        },
        create() {
            let url = `${this.contextPath}/form.weex.js?formId=${this.formId}`;
            this.$push(url)
        },
        titleClicked(e) {
            this.$refs.dropdown.show(e);
            this.showDropdown = true;
        },
        presetFilterChosen(filter) {
            this.$refs.dropdown.hide();
            this.selectedFilter = filter;
            this.queryParam.viewId = filter.viewId;
            this.refreshData();
        },
        getFieldValue(obj, field) {
            if (obj._data && obj._data[field]) {
                // 对于引用实体字段，读取 _data 里的内容
                // 参考返回的数据结构
                let expandedData = obj._data[field];
                for (let k in expandedData) {
                    return expandedData[k].title;
                }
            } else {
                // 对于非引用实体字段，针对日期作处理
                let fieldDef = this.swaggerEntiyDef.properties[field];
                if (fieldDef) {
                    switch (fieldDef.format) {
                        case 'date-time':
                            let d = new Date(obj[field]);
                            return d.toLocaleString(undefined, {hour12: false})
                        default:

                    }
                }
                return obj[field];
            }
        },
        fetchData(page) {
            this.queryParam.page_size = this.pageSize;
            this.queryParam.page = page || 1;
            let filtersParts = [];
            if (this.filters) {
                for (let k in this.filters) {
                    if (this.filters[k]) filtersParts.push(this.filters[k]);
                }
            }
            if (this.quickSearchFilters) {
                filtersParts.push(this.quickSearchFilters);
            }
            if (this.selectedFilter && this.selectedFilter.value) {
                filtersParts.push(this.selectedFilter.value)
            }
            this.queryParam.filters = filtersParts.join(' and ');
            return ajax.get(this.dataUrlPath, this.queryParam).then(resp => {
                return resp.data;
            })
        },
        refreshData() {
            if (this.isRefreshing) return;
            this.isRefreshing = true;
            this.fetchData(1).then(data => {
                this.listData = data;
                this.isRefreshing = false;
                this.currentPage = 1;
                this.loadingStatus = 'init';
            }).catch(err => {
                this.isRefreshing = false;
            })
        },
        loadMore() {
            if (this.loadingStatus == 'loading') return;
            this.loadingStatus = 'loading';
            this.fetchData(this.currentPage + 1).then(data => {
                if (data.length) {
                    this.listData = this.listData.concat(data);
                    this.loadingStatus = 'init';
                    this.currentPage++;
                } else {
                    this.loadingStatus = 'noMore';
                }

            }).catch(err => {
                this.loadingStatus = 'init';
            })
        },
        onrefresh() {
            this.refreshData();
        },
        onloading() {
            this.loadMore();
        },
        onSearch(keyword) {
            let filtersStr = keyword && this.quickSearchableField
                .map(name => `${name} like '%${keyword}%'`)
                .join(' or ')
            this.quickSearchFilters = filtersStr && `(${filtersStr})`; // and 优先级比 or 高，这里先用 () 包裹起来
            this.refreshData();
        },
        onSearchClear() {
            this.quickSearchFilters = '';
            this.refreshData();
        }
    },
    created() {
        this.contextPath = this.$getContextPath();
        globalEvent.addEventListener("androidback", e => {
            this.$pop();
        });

        let pageParam = this.$getPageParams();

        // 以下变量由外部配置
        let viewId = pageParam.viewId;

        let debug = config.debug;
        let readRuntimeConfigPromise;
        if (debug) {
            viewId = viewId || config.debugViewId;
            service.init(config.debugConfigUrl);
            readRuntimeConfigPromise = Promise.resolve();
        } else {
            if (!viewId) {
                this.$alert('缺少参数 viewId');
                return;
            }
            let contextPath = this.$getContextPath();
            readRuntimeConfigPromise = config.readRuntimeConfig(contextPath).then(runtimeConfig => {
                service.init(runtimeConfig.configServerUrl)
            });
        }

        readRuntimeConfigPromise.then(() => {
            return service.getMetaViewDef(viewId).catch((err) => {
                this.$toast('getMetaViewDef error')
                this.$alert(err)
            })
            .then(viewDef => {
                this.viewDef = viewDef;
                this.formId = viewDef.metaFormShortId;
                let params = {
                    filters: viewDef.config.filters, // 过滤
                };
                // 选择字段
                let fields = new Set();
                fields.add('_data'); // _data 字段里会有冗余信息
                viewDef.config.columns.forEach(col => {
                    fields.add(col.name)
                    if (col.quicksearchable) {
                        this.quickSearchableField.push(col.name);
                    }
                });
                if (viewDef.config.mLayout) {
                    // 处理手机端布局
                    this.layoutType = viewDef.config.mLayout.template;
                    if (this.layoutType == '1') {
                        let layout = viewDef.config.mLayout.params;
                        this.p1 = layout.p1;
                        this.p2 = layout.p2;
                        this.p3 = layout.p3;
                        this.p4 = layout.p4;
                        this.p5 = layout.p5;
                        fields.add(this.p1);
                        fields.add(this.p2);
                        fields.add(this.p3);
                        fields.add(this.p4);
                        fields.add(this.p5);
                    }
                }
                params.select = Array.from(fields).join(',');
                // 排序
                if (viewDef.config.orderby) {
                    params.orderby = viewDef.config.orderby.map(o => `${o.name} ${o.type}`).join(',')
                }
                // 预设的过滤器
                if (viewDef.config.multipleFilters.support) {
                    this.presetFilters = viewDef.config.multipleFilters.filters;
                    this.selectedFilter = this.presetFilters.find(f => f.checked);
                    if (this.selectedFilter) {
                        params.viewId = this.selectedFilter.viewId;
                    }
                }
                return service.getEngineUrl(viewDef.projectId)
                .catch(err => {
                    this.$toast('getEngineUrl error')
                    this.$alert(err)
                })
                .then(engineUrl => {
                    return ajax.get(`${engineUrl}/swagger.json`).then(resp => {
                        let name = viewDef.metaEntityName;
                        let key = name[0].toUpperCase() + name.substr(1);
                        this.swaggerEntiyDef = resp.data.definitions[key];
                    })
                    .catch(err => {
                        this.$toast('getSwagger error')
                        this.$alert(err)
                    })
                    .then(() => {
                        this.dataUrlPath = `${engineUrl}/${viewDef.metaEntityName}`;
                        this.queryParam = params;
                        return this.refreshData();
                    })
                    .catch(err => {
                        this.$alert('refreshData error')
                        this.$alert(err)
                    })
                });
            })
        }).catch(err => {
            console.log(err)
            this.$alert(err);
        });
    },
    components: {
        'filter-view': require('./filter.vue'),
        'refresh-wrapper': require('../components/common/refresh.vue'),
        'loading-wrapper': require('../components/common/loading.vue')
    }
}
</script>

<style lang="css">
.page-title-wrapper {
    flex-direction: row;
}

.header-right-wrapper {
    flex-direction: row;
    position: relative;
    left: 20px;
}

.page-title {
    color: white;
    font-size: 36px;
}

.header-button {
    padding-bottom: 20px;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
}

.list-item {
    flex-direction: column;
    padding-bottom: 20px;
    padding-top: 20px;
    padding-left: 40px;
    padding-right: 40px;
    border-bottom-color: #BEBCBC;
    border-bottom-width: 1px;
    border-bottom-style: solid;
}
.list-item-row {
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
}

.title-text {
    color: black;
    font-weight: 500;
    font-size: 32px;
    margin-bottom: 5px;
    flex: 1;
}

.sub-text {
    font-size: 32px;
    max-width: 300px;
    color: #BEBCBC;
    /* text-overflow: ellipsis; */
    /* overflow: hidden; */
    /* white-space: nowrap; */
}
</style>
