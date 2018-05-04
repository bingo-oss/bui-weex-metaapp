import ax from '../ajax.js';
const pageService={
    get(pageId){
        return new Promise(function(resolve,reject){
            ax.get(`http://10.200.210.248:8686/dist/test_page/${pageId}.json`).then(({data})=>{
                resolve(data);
            },()=>{
                reject();
            });
        });
    }
};
export default pageService;