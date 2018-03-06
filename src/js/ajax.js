const stream = weex.requireModule('stream');

/**
 * {a: 'b', c: 'd'} => ?a=b&c=d
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
    return `?${parts.join('&')}`;
}

export default {
    request(param) {
        return new Promise((resolve, reject) => {
            param.method = param.method || 'GET',
            param.type = param.type || 'json',
            param.headers = param.headers || {},
            param.headers['Authorization'] = param.headers['Authorization'] || 'Bearer e55ef929-285e-4736-a168-4a01509dc1b6'
            // 当 body 是非字符串时，stringify 并且添加 Content-Type Header
            if (param.body) {
                if (typeof param.body !== 'string') {
                    param.body = JSON.stringify(param.body);
                    param.headers['Content-Type'] = 'application/json';
                }
            }
            console.log(`GETing ${param.url}`)
            stream.fetch(param, (resp) => {
                if (!resp.ok) {
                    console.log('Fetch data failed: ' + JSON.stringify(resp.data));
                    reject(resp);
                    return;
                }
                resolve(resp)
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
    }
}
