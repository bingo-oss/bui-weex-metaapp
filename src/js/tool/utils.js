const Utils={
    dataPermField:"permVal",//数据权限值所在的字段
    operationDisplayField:"display",//部件操作是否显示的属性字段
    permValues:{
        "view":1,
        "create":2,
        "edit":4,
        "del":8,
        "publish":16,
        "manage":32,
        "changeOwner":64
    },
    /**
     * 将userPermVal和operationPermVal求与，如果结果等于operationPermVal表示有权限，否则无权限
     * @param {*} userPermVal 用户的权限，二进制对应的整数表示
     * @param {*} operationPermVal 操作的权限，二进制对应的整数表示
     */
    hasPerm(userPermVal,operationPermVal){
        //如果数据没定义任何权限，那就不控制权限
        if(!userPermVal){
            return true;
        }
        return (userPermVal & operationPermVal)===operationPermVal;
    },
    /** 快捷方法，判断当前用户是否对item数据的btn操作有权限
     * @param {*} item 记录数据对象
     * @param {*} btn 操作对象
     */
    hasDataPerm(item,btn){
        let userPermVal=item[Utils.dataPermField];
        //如果数据没定义任何权限，那就不控制权限
        if(!userPermVal){
            return true;
        }
        let operationPermVal=btn[Utils.dataPermField];
        //如果未设置权限，则默认没有权限
        if(!operationPermVal){
            return false;
        }
        return Utils.hasPerm(userPermVal,operationPermVal);
    }
};
export default Utils;