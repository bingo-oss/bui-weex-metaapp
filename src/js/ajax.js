const stream = weex.requireModule('stream');
const linkapi = require('linkapi')
import config from './config.js';
import util from './util.js';

/**
 * {a: 'b', c: 'd'} => ?a=b&c=d
 * {} => ''
 */
function object2query(obj) {
    let parts = [];
    for (let key in obj) {
        if (obj[key] === undefined || obj[key] === null) {
            continue;
        }
        let s = new String(obj[key]);
        let v = encodeURIComponent(s);
        let part = `${key}=${v}`;
        parts.push(part)
    }
    return parts.length ? `?${parts.join('&')}` : '';
}

export default {
    request(param) {
        return new Promise((resolve, reject) => {
            param.method = param.method || 'GET';
            param.type = param.type || 'json';
            // 在以 type 为 json 来 Get swagger.json 的数据时，weex 会报错
            // 暂时将其以纯文本的形式获取
            if (param.url.indexOf('swagger.json') != -1) param.type = 'text';
            param.headers = param.headers || {};

            console.log(param);
            if (param.queryParam) {
                param.url += object2query(param.queryParam);
                console.log(param.url)
            }

            let tokenPromise = new Promise((resolve, reject) => {
                if (config.debug) {
                    resolve(config.token)
                } else {
                    linkapi.getToken(obj => {
                        resolve(obj.accessToken)
                    }, err => {
                        reject(err);
                    })
                }
            });

            tokenPromise.then((token) => {
                param.headers['Authorization'] = param.headers['Authorization'] || `Bearer ${token}`;
                // 当 body 是非字符串时，stringify 并且添加 Content-Type Header
                if (param.body) {
                    if (typeof param.body !== 'string') {
                        param.body = JSON.stringify(param.body);
                        param.headers['Content-Type'] = 'application/json';
                    }
                }
                console.log(`${param.method} ${param.url}`)
                // util.alert(param.url)
                stream.fetch(param, (resp) => {
                    // 由于将 type 设为了 text，这里需要解析，详见上解释
                    if (param.url.indexOf('swagger.json') != -1) {
                        resp.data = JSON.parse(resp.data);
                    }

                    if (!resp.ok) {
                        console.log('Fetch data failed: ' + JSON.stringify(resp.data));
                        reject(resp);
                        return;
                    }
                    resolve(resp)
                })
            })

        })
    },
    get(url, queryParam) {
        if (queryParam) {
            url += object2query(queryParam);
        }
        let param = {
            method: 'GET',
            url,
        }
        return this.request(param);
    },
    patch(url, data) {
        let param = {
            method: 'PATCH',
            url,
            body: data,
        }
        return this.request(param);
    },
    delete(url) {
        let param = {
            method: 'DELETE',
            url,
        }
        return this.request(param);
    },

    object2query,
}
