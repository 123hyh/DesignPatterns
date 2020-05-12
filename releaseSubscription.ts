/**
 * 需要订阅的方法
 */
type Handler = (...arg: any[]) => void;

/**
 * 创建 可监听的数据
 * @param this
 * @param data
 */
function createProxy<T extends any>(this: T, data: any) {
  return new Proxy(data, {
    set: (target, key, value) => {
      // 数组在设置值时会设置多一次下标
      if (Array.isArray(target) && key === 'length' && !!value) return true;

      const prevData = { [key]: target[key] };
      target[key] = value;
      if (typeof value === 'object') {
        target[key] = createProxy.call(this, value);
      }
      /**
       * 异步调用
       */
      Promise.resolve().then(() => {
        this.publish(JSON.parse(JSON.stringify(target)), prevData);
      });
      return true;
    },

    get(target, key) {
      // 前缀为下划线的为私有变量，不允许读取
      if (/^_/.test(<any>key)) {
        return;
      }

      return target[key];
    },
  });
}

/**
 * 发布订阅模式
 */
function ReleaseSubscription() {
  /**
   * 订阅的中心(存放事件)
   */
  const events: Array<(...args: any[]) => void> = [];
  return class ReleaseSubscription {
    protected observer: any;
    /**
     * 创建发布订阅中心
     */
    static Create(data: any) {
      const instance = new ReleaseSubscription(data);
      return [instance.observer, instance];
    }

    constructor(data: any) {
      this.observer = createProxy.call(this, data);
    }

    /**
     * 订阅
     * @param {Function} handler 需要订阅的回调
     */
    subscribe(handler: Handler) {
      events.push(handler);
      return this;
    }

    /**
     * 取消订阅
     * @param { Function }  handler 取消订阅的回调
     */
    unSubscribe(handler: Handler) {
      let i = 0;
      while (i < events.length) {
        const fn = events[i];
        if (fn === handler) {
          events.splice(i, 1);
          break;
        }
        i++;
      }
    }

    /**
     * 取消所有订阅
     */
    unAllSubscribe() {
      events.length = 0;
    }

    /**
     * 发布消息
     */
    private publish(data?: any, prevData?: any) {
      for (let handler of events) {
        handler({ current: data, prev: prevData });
      }
    }
  };
}

const [data, controlCenter] = ReleaseSubscription().Create({
  name: 'hyh',
});

const handler1 = (data: any) => {
  console.log(data);
};

controlCenter.subscribe(handler1);
