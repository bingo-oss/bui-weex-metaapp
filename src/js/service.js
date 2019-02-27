import ajax from '../js/ajax.js'

const keyMetaBaseEndpoint = 'service.metabase.endpoint';
const keyGatewayEndpoint = 'service.gateway.endpoint';

let CachedConfig = null;
let ConfigUrl = '';

export default {

    /**
     * 初始化服务
     * @param  {string} configUrl  配置服务器的地址
     */
    init(configUrl) {
        ConfigUrl = configUrl;
    },

    /**
     * 获取项目的引擎地址
     * @param  {string} projectId
     * @return {Promise} 成功返回引擎地址，失败返回 error。
     */
    getEngineUrl(projectId) {
        return this._getConfig().then((data) => {
            let metabaseUrl = data[keyMetaBaseEndpoint]
            let url = `${metabaseUrl}/meta_project/${projectId}`
            return ajax.get(url).then((resp) => {
                let engineUrl = resp.data.engine.externalUrl;
                return Promise.resolve(engineUrl);
            })
        })
    },

    /**
     * 获取实体列表
     * @param  {string} engineUrl 引擎地址
     * @param  {string} entityName 实体名称
     * @return {Promise} Promise 对象，成功返回数组数据，失败返回 error
     */
    getEntityDataList(engineUrl, entityName) {
        return ajax.get(`${engineUrl}/${entityName}?orderby=${encodeURIComponent('createdAt desc')}`).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    /**
     * 获取指定 ID 的实体数据
     * @param  {string} engineUrl 引擎地址
     * @param  {string} entityName 实体名称
     * @param  {string} entityId 实体 ID
     * @return {Promise} Promise 对象，成功返回对象数据，失败返回 error
     */
    getEntityDataForId(engineUrl, entityName, entityId) {
        entityName = entityName.toLowerCase();
        return ajax.get(`${engineUrl}/${entityName}/${entityId}`).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    /**
     * 创建实体
     */
    createEntify(engineUrl, entityName, queryParam, data) {
        entityName = entityName.toLowerCase();
        let param = {};
        param.method = 'POST';
        param.url = `${engineUrl}/${entityName}`;
        param.body = data;
        param.queryParam = queryParam;

        return ajax.request(param).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    /**
     * 更新实体
     * @return {Promise} Promise 对象，失败返回 error
     */
    updateEntity(engineUrl, entityName, entityId, data) {
        entityName = entityName.toLowerCase();
        return ajax.patch(`${engineUrl}/${entityName}/${entityId}`, data).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    /**
     * 删除实体
     * @return {Promise} Promise 对象，成功定义对象，失败返回 error
     */
    deleteEntity(engineUrl, entityName, entityId) {
        entityName = entityName.toLowerCase();
        return ajax.delete(`${engineUrl}/${entityName}/${entityId}`).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    /**
     * 获取元数据表单定义
     * @param  {string} formId  表单 ID
     * @return {Promise} Promise 对象，成功返回定义对象，失败返回 error
     */
    getMetaFormDef(formId, param) {
        return this._getConfig().then((data) => {
            let metaApiEndpoint = data[keyMetaBaseEndpoint]
            let url = `${metaApiEndpoint}/meta_form/default/short/${formId}`
            return ajax.get(url,param).then((resp) => {
                return Promise.resolve(resp.data);
            })
        })
    },

    /**
     * 获取视图定义
     * @return {Promise} Promise 对象，成功返回定义对象，失败返回 error
     */
    getMetaViewDef(viewId,param) {
        return this._getConfig().then((data) => {
            let metaApiEndpoint = data[keyMetaBaseEndpoint];
            let url = `${metaApiEndpoint}/meta_view/default/short/${viewId}`
            return ajax.get(url,param).then((resp) => {
                return Promise.resolve(resp.data);
            })
        })
    },

    /**
     *  获取实体的 swagger.json
     * @return {Promise} Promise 对象，成功返回 swagger.json 数据，失败返回 error
     */
    getSwaggerEntityDef(engineUrl, entityName) {
        return ajax.get(`${engineUrl}/swagger.json`).then(resp => {
            // Capitalize
            let capitalizedKey = entityName[0].toUpperCase() + entityName.substr(1);
            let definition = resp.data.definitions;
            return definition[entityName] || definition[capitalizedKey];
        })
    },

    /**
     * 对 config 作缓存
     * @return {Promise} Promise 对象，成功返回缓存的 config，失败返回 error
     */
    _getConfig() {
        if (CachedConfig) {
            return Promise.resolve(CachedConfig);
        }
        return ajax.get(ConfigUrl).then((resp) => {
            CachedConfig = resp.data;
            return resp.data;
        })
    },
    /*获取过滤条件信息*/
    getMetaViewFilter(filtersId) {
        return this._getConfig().then((data) => {
            let metabaseUrl = data[keyMetaBaseEndpoint]
            return ajax.get(`${metabaseUrl}/meta_view_filters/${filtersId}`).then(resp => {
                // Capitalize
                return resp.data;
            })
        })

    },
    /**
     * 获取实体信息
     * @param  {string} projectId
     * @return {Promise} 成功返回引擎地址，失败返回 error。
     */
    getMetaEntity(entityId) {
        return this._getConfig().then((data) => {
            let metabaseUrl = data[keyMetaBaseEndpoint]
            let url = `${metabaseUrl}/meta_entity/${entityId}`
            return ajax.get(url).then((resp) => {
                return resp.data;
            })
        })
    },
    /**
     * 获取项目的引擎地址--通过实体id获取
     * @param  {string} projectId
     * @return {Promise} 成功返回引擎地址，失败返回 error。
     */
    getEngineUrlMeta(entityId) {
        return this._getConfig().then((data) => {
            let metabaseUrl = data[keyMetaBaseEndpoint]
            let url = `${metabaseUrl}/meta_entity/${entityId}`
            return ajax.get(url).then((resp) => {
                let engineUrl = resp.data.project.engine.externalUrl;
                return Promise.resolve(engineUrl);
            })
        })
    },

    /**
     * 获取菜单项
     * @return {Promise} Promise 对象，成功返回定义对象，失败返回 error
     */
    getMenuItems(param) {
        return this._getConfig().then((data) => {
            let metaApiEndpoint = data[keyGatewayEndpoint];
            let url = `${metaApiEndpoint}/metad/api/mp_operation`
            return ajax.get(url, Object.assign({}, param)).then((resp) => {
                return Promise.resolve(resp.data);
            })
        })
    }
}
