/**
 * 元数据管理
 * Created by fulsh on 2017/12/12.
 */

//import controlTypeService from '../../components/form/js/control_type_service';
var controlTypeService={
  componentTypes:{
    RefEntity:{id:'RefEntity'},
    SingleLineText:{id:'SingleLineText'}
  },
  getMetaFieldComponentType(metaField){
    return controlTypeService.componentTypes.SingleLineText.id;
  }
};
var Config=require("../config.js");
import metaservice from './metaservice';
//var store=require("store2");
import ajax from '../ajax';
import i18n from '../i18n/index';
import _ from '../tool/lodash';

var MetaEntityCls=require("./metaentity");
//当前项目的id
var currentProjectId=null;
//当前项目的engine地址
var currentEngineUrl=null;
//所有项目对应的元数据，以项目mbCacheKey存储
var metabases={};

/**
 * 根据项目id构建项目元数据访问的key
 * @param {*} projectId 
 */
function mbCacheKey(projectId){
  return projectId?`${projectId}/_mb_`:`_mb_`;
}
/**
 * 根据传入的项目id获取项目元数据
 * @param {*} projectId 
 */
function getMetabase(projectId){
  var cacheKey=mbCacheKey(projectId);
  //先从内存获取
  if(metabases[cacheKey]){
    return metabases[cacheKey];
  }
  //再从本地存储获取
  // if(store.has(cacheKey)){
  //   return store.get(cacheKey);
  // }
  return null;
}
/**
 * 获取当前项目的swagger地址
 */
function currentSwagger(projectId){
  if(!projectId){
    return new Promise(function(reslove,reject){
      currentEngineUrl=Config.getApiBaseUrl();
      var swagger= Config.getApiBaseUrl()+"/swagger.json";
      reslove(swagger);
    });
  }
  return metaservice.getProject(projectId).then((data)=>{
    if(!data.engine||!data.engine.externalUrl){
      console.log(`项目id为${projectId}的项目engine地址不存在`);
      return null;
    }
    currentEngineUrl=data.engine.externalUrl;
    var swagger=`${data.engine.externalUrl}/swagger.json`;
    return swagger;
  });
}
/**
 * 根据项目id从远程加载项目的元数据信息
 * @param {*} projectId 
 * @param {*} forceReload 为true表示强制从远程更新元数据信息
 */
function  initMetabase(projectId,forceReload){
  currentProjectId=projectId;
  return new Promise((resolve, reject) => {
    var _metabase=getMetabase(projectId);
    if(_metabase&&!forceReload){//已经在缓存里边存在，不加载
      resolve();
      return;
    }
    //先通过项目id，查询项目的swagger服务地址，在通过swagger地址获取元数据信息
    currentSwagger(projectId).then((swagger)=>{
      if(!swagger){
        reject();
        return;
      }
      ajax.get(swagger).then(({data})=>{
        loadMetabase(data,projectId);
        resolve();
      },e=>{
        console.log(i18n.checkSwaggerConfig+swagger);
        reject();
      });
      
    });
  });
}

/**
 * 将swagger 转为Metabase
 * @param swagger
 */
function loadMetabase(swagger,projectId){
  var context={
    swagger:swagger
  };
  var entities={};
  _.forEach(swagger.definitions,function(val,key){
    var isEntity=firstNotNaN(val["x-entity"],true);
    if(!isEntity){
      return;
    }
    var metaEntity=loadMetaEntityFromMode(context,key,val);
    entities[key.toLowerCase()]=metaEntity;
  });
  var metabase={};
  metabase.entities=entities;
  var cachedKey=mbCacheKey(projectId);
  metabases[cachedKey]=metabase;
  //store.set(cachedKey,metabase);
}

/**
 * 将swagger的model转为MetaEntity
 * @param context
 * @param model
 */
function loadMetaEntityFromMode(context,modelName,model){
  var entityPath=_.snakeCase(modelName);
  var opt={
    name:modelName,
    title:model.title,
    description:model.description,
    _model:model,
    resourceUrl:`${currentEngineUrl}/${entityPath}`,
    projectId:currentProjectId
  };
  var metaEntity=MetaEntityCls(opt);
  var propertyContext=_.extend({
    metaEntity:metaEntity,
    model:model
  },context);
  var index=0;
  var relations=[];
  _.forEach(model.properties,function (val,key) {
    var isRelation=firstNotNaN(val["x-relation"],false);
    if(isRelation){
      var metaRelation=loadMetaRelationFromProperty(propertyContext,key,val);
      relations.push(metaRelation);
      return;
    }
    var metaField=loadMetaFieldFromProperty(propertyContext,key,val);
    metaField["displayOrder"]=index;
    metaEntity.fields[key]=metaField;
    index++;
  });

  _.forEach(relations,function (metaRelation,i) {
    _.forEach(metaRelation.joinFields,function(joinField,index){
      var relationField=null;
      if(_.isString(joinField)){
        relationField=metaEntity.fields[joinField];
      }
      if(relationField==null && _.isPlainObject(joinField) && !_.isEmpty(joinField["local"])){
        relationField=metaEntity.fields[joinField["local"]];
      }
      if(relationField!=null){
        relationField.isRelationField=true;
        relationField.relations.push(metaRelation);
        //多对一关系的字段修正为引用实体控件类型
        if(metaRelation.type=="many-to-one"&&
          ((!relationField.inputType)||
          (relationField.inputType==controlTypeService.componentTypes.RefEntity.id)||
          (relationField.inputType==controlTypeService.componentTypes.SingleLineText.id))){
          relationField.inputType=controlTypeService.componentTypes.RefEntity.id;
          relationField.manyToOneRelation=metaRelation;
        }
      }
    });

      metaEntity.relations[metaRelation.name]=metaRelation;
  });
  //初始化实体模型数据
  metaEntity.defaultModel=metaEntity.getDefaultModel();
  return metaEntity;
}

/**
 * 将Property构造成metafield对象
 * @param context
 * @param propertyName
 * @param property
 */
function loadMetaFieldFromProperty(context,propertyName,property){
  var metaField={
    name:propertyName,
    title:firstNotNaN(property["title"],property["description"],propertyName),
    entityName:context.metaEntity.name,
    published:true,
    summary:property["description"],
    description:property["description"],
    default:property["default"]||null,
    isSystem:true,
    isDisplay:true,
    displayOrder:0,
    identity:firstNotNaN(property["x-identity"],false),
    readonly:!!property["readOnly"],
    autoIncrement:false,
    unique:firstNotNaN(property["x-unique"],property["uniqueItems"],false),
    required:firstNotNaN(property["x-required"],false),
    creatable:firstNotNaN(property["x-creatable"],true),
    updatable:firstNotNaN(property["x-updatable"],property["readOnly"],true),
    sortable:firstNotNaN(property["x-sortable"],false),
    filterable:firstNotNaN(property["x-filterable"],false),
    inputType:property["x-input"],
    inputTypeParams:{},
    semantics:property["x-meaning"],
    isTitleField:"title"===property["x-meaning"],
    maxLength:property["maxLength"],
    minLength:property["minLength"],
    pattern:property["pattern"],
    maximum:property["maximum"],
    minimum:property["minimum"],
    enum:property["enum"],
    type:property["type"],
    format:property["format"],
    isRelationField:false,
    relations:[],
    _property:property
  };
  //设置inputTypeParams
  fillInputTypeParams(metaField,property);
  return metaField;
}

/**
 * 设置metaField的inputTypeParams参数
 * @param metaField
 * @param property
 */
function fillInputTypeParams(metaField,property) {
  //如果metaField的inputType为空，设置默认
  if(!metaField.inputType){
    let inputType=controlTypeService.getMetaFieldComponentType(metaField);
    metaField.inputType=inputType;
  }
  if(_.isNaN(property["maxLength"])){
    metaField.inputTypeParams["maxLength"]=property["maxLength"];
  }
  if(_.isNaN(property["minLength"])){
    metaField.inputTypeParams["minLength"]=property["minLength"];
  }
  if(_.isNaN(property["pattern"])){
    metaField.inputTypeParams["pattern"]=property["pattern"];
  }
  if(_.isNaN(property["maximum"])){
    metaField.inputTypeParams["max"]=property["maximum"];
  }
  if(_.isNaN(property["minimum"])){
    metaField.inputTypeParams["min"]=property["minimum"];
  }
  if(_.isNaN(property["enum"])){
    metaField.inputTypeParams["enums"]=property["enum"];
  }
  if(_.isNaN(property["format"])){
    metaField.inputTypeParams["format"]=property["format"];
  }
  if(property["x-options"]&&property["x-options"].items){
    let options=[];
    _.each(property["x-options"].items,function (item,index) {
      options.push({
        id:item.value,
        text:item.title,
        checked:metaField.default==item.value?true:false
      });
    });
    metaField.inputTypeParams["options"]=options;
  }
}

/**
 * 根据关系属性构造关系
 * @param context
 * @param propertyName
 * @param property
 */
function loadMetaRelationFromProperty(context,propertyName,property){
  var metaRelation={
    name:propertyName,
    type:firstNotNaN(property["x-relation-type"],"many-to-one"),
    sourceEntity:context.metaEntity.name,
    targetEntity:property["x-target-entity"],
    joinEntity:property["x-join-entity"],
    joinFields:property["x-join-fields"],     //[{"local":"updatedBy","target":"userId"}]
    expandable:firstNotNaN(property["x-expandable"],false),
    _property:property
  };
  return metaRelation;
}


/**
 * 获取第一个非undefined的参数
 */
function firstNotNaN(){
  var reval;
  _.forEach(arguments,function (item,index) {
    if(!_.isUndefined(item)){
      reval=item;
      return false;
    }
  });
  return reval;
}

//转换实体名称规则
function lowerUnderscore(str){
  if(str == null || str === '')
    return str;
  var strArray = str.split("");
  var result = [];

  for(var i = 1; i < strArray.length - 1; i++){
    var previous = strArray[i-1];
    result.push(previous);
    if ((!/[A-Z]/.test(previous) || !isNaN(previous)) &&
        /[A-Z]/.test(strArray[i]) &&
        !/[A-Z]/.test(strArray[i+1])) {
      result.push("_");
    }
  }
  result.push(strArray[strArray.length - 2]);
  result.push(strArray[strArray.length - 1]);
  return result.join("").toLocaleLowerCase();
}

export default{
  /**
   * 根据实体名，查询实体
   * @param metaEntityName
   * @returns {*}
   */
  findMetaEntity:function (metaEntityName) {
    if(!metaEntityName){
      return null;
    }
    var metabase=getMetabase(currentProjectId);
    var metaEntity= metabase.entities[metaEntityName.toLowerCase()];
    if(_.isEmpty(metaEntity)){
      return null;
    }
    var metaEntityCloned =MetaEntityCls(metaEntity);
    return metaEntityCloned;
  },
  /**
   * 获取所有实体
   * @returns {null}
   */
  entities:function () {
    var metabase=getMetabase(currentProjectId);
    return metabase.entities;
  },
  initMetabase:initMetabase,
  currentSwagger:currentSwagger,
  routeForEntityList(entityName,params){
    var router= {name: 'defaultEntityList', params: {entityName:entityName}};
    if(!_.isEmpty(params)){
      router.params= _.extend(router.params,params);
    }
    return router;
  },
  routeForEntityCreateForm(entityName,params){
    var router= {name: 'defaultCreateForm', params: {entityName:entityName}};
    if(!_.isEmpty(params)){
      router.params= _.extend(router.params,params);
    }
    return router;
  },
  routeForEntityUpdateForm(entityName,id,params){
    var router= {name: 'defaultEditForm', params: {entityName:entityName,id:id}};
    if(!_.isEmpty(params)){
      router.params= _.extend(router.params,params);
    }
    return router;
  },
    setEntityNameForRoute(router,entityName){
      if(_.isEmpty(router)){
          return;
      }
      router.params["entityName"]=entityName;
    },
  lowerUnderscore:lowerUnderscore
}
