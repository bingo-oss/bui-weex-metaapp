import ajax from '../js/ajax.js'

const keyMetaBaseEndpoint = 'service.metabase.endpoint';

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
        return ajax.get(`${engineUrl}/${entityName}/${entityId}`).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    createEntify(engineUrl, entityName, data) {
        let param = {};
        param.method = 'POST';
        param.url = `${engineUrl}/${entityName}`;
        param.body = data;

        return ajax.request(param).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    updateEntity(engineUrl, entityName, entityId, data) {
        return ajax.patch(`${engineUrl}/${entityName}/${entityId}`, data).then((resp) => {
            return Promise.resolve(resp.data);
        })
    },

    /**
     * 获取元数据表单定义
     * @param  {string} formId  表单 ID
     * @return {Promise} Promise 对象，成功定义对象，失败返回 error
     */
    getMetaFormDef(formId) {
        return this._getConfig().then((data) => {
            let metaApiEndpoint = data[keyMetaBaseEndpoint]
            let url = `${metaApiEndpoint}/meta_form/short/${formId}?resolve=true`
            return ajax.get(url).then((resp) => {
                return Promise.resolve(resp.data);
            })
        })
    },

    getMetaViewDef(viewId) {
        return this._getConfig().then((data) => {
            let metaApiEndpoint = data[keyMetaBaseEndpoint];
            let url = `${metaApiEndpoint}/meta_view/short/${viewId}`
            return ajax.get(url).then((resp) => {
                return Promise.resolve(resp.data);
            })
        })
    },

    /**
     * 对 config 作缓存
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

}
