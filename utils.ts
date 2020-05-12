/**
 * 获取数据类型
 * @param data 数据
 */
function getType(data: any) {
  return Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
}

function forEach<T>(newData: T, handler: (key: any, newData: T) => any) {
  return function forEach(prevData: T) {
    const OBJ_TYPE = getType(prevData);
    if (OBJ_TYPE === 'object') {
      for (const key in prevData) {
        handler([key, prevData[key]], newData);
      }
    } else {
      for (const item of <any>prevData) {
        handler(item, newData);
      }
    }

    return newData;
  };
}

type CloneDataType = 'array' | 'object' | 'map' | 'set';

type cloneDataConf = {
  [key in CloneDataType]: typeof forEach;
};

const cloneDataConf = {
  array: forEach(Array.of<any>(), (item, newData) => {
    newData.push(cloneData(item));
  }),
  object: forEach(Object.assign({}), ([key, value], newData) => {
    newData[key] = cloneData(value);
  }),
  map: forEach(new Map(), ([key, value], newData) => {
    newData.set(key, cloneData(value));
  }),
  set: forEach(new Set(), (value, newData) => {
    newData.add(cloneData(value));
  }),
};

/**
 * 深克隆数据
 * @param {T} data 数据
 * @returns {T} data
 */
function cloneData<T extends Object>(data: T): T {
  const DATA_TYPE = getType(data);
  if (cloneDataConf.hasOwnProperty(DATA_TYPE)) {
    data = (<any>cloneDataConf)[DATA_TYPE](data);
  }
  return data;
}
var a = {
  x: new Map<any, any>([
    [1, 2],
    [2, new Set([1, 2, 3, 4])],
  ]),
  y() {
    console.log(123);
  },
  z: [1, 2, 3],
};
var d = cloneData(a);
