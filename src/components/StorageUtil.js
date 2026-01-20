// StorageUtil.js - 增强版存储工具类
export const StorageUtil = {
  isMiniProgram: () => {
    return typeof wx !== 'undefined' && typeof wx.setStorageSync !== 'undefined';
  },

  /**
   * 存储数据（支持所有类型）
   * @param {string} key - 存储键名
   * @param {any} value - 存储值（支持对象、数组、字符串、数字、布尔值等）
   */
  set(key, value) {
    if (value === undefined) {
      value = null;
    }
    
    if (this.isMiniProgram()) {
      // 微信小程序：统一序列化存储，确保一致性
      try {
        const data = JSON.stringify(value);
        wx.setStorageSync(key, data);
      } catch (e) {
        console.error('微信小程序存储失败：', e);
        // 如果序列化失败，存储为字符串
        wx.setStorageSync(key, String(value));
      }
    } else {
      // Web环境：需要序列化
      try {
        const data = JSON.stringify(value);
        localStorage.setItem(key, data);
      } catch (e) {
        console.error('Web存储失败：', e);
        // 如果序列化失败，存储为字符串
        localStorage.setItem(key, String(value));
      }
    }
  },

  /**
   * 获取存储的数据
   * @param {string} key - 存储键名
   * @param {any} defaultValue - 默认值（当数据不存在时返回）
   * @returns {any} 存储的数据
   */
  get(key, defaultValue = null) {
    try {
      let data;
      if (this.isMiniProgram()) {
        data = wx.getStorageSync(key);
      } else {
        data = localStorage.getItem(key);
      }
      
      // 数据不存在的情况
      if (data === null || data === undefined || data === '') {
        return defaultValue;
      }
      
      // 处理字符串数据
      if (typeof data === 'string') {
        // 跳过明显无效的数据
        if (data === '[object Object]' || data === 'undefined' || data === 'NaN') {
          console.warn(`键 "${key}" 存储了无效数据: "${data}"`);
          return defaultValue;
        }
        
        try {
          // 尝试解析JSON
          const parsed = JSON.parse(data);
          return parsed;
        } catch (e) {
          // 如果不是JSON，返回原始字符串
          return data;
        }
      } else {
        // 如果不是字符串（可能在某些情况下微信小程序返回了对象）
        // 这种情况下，可能是其他代码直接调用了wx.setStorageSync
        return data;
      }
    } catch (e) {
      console.error('获取存储数据失败：', e);
      return defaultValue;
    }
  },

  /**
   * 获取原始字符串数据（不进行JSON解析）
   * @param {string} key - 存储键名
   * @param {string} defaultValue - 默认值
   * @returns {string} 原始字符串数据
   */
  getRawString(key, defaultValue = '') {
    try {
      let data;
      if (this.isMiniProgram()) {
        data = wx.getStorageSync(key);
      } else {
        data = localStorage.getItem(key);
      }
      
      if (data === null || data === undefined) {
        return defaultValue;
      }
      
      // 强制转为字符串
      return String(data);
    } catch (e) {
      console.error('获取原始字符串数据失败：', e);
      return defaultValue;
    }
  },

  /**
   * 专门获取JSON数据（确保返回对象/数组）
   * @param {string} key - 存储键名
   * @param {any} defaultValue - 默认值
   * @returns {Object|Array} JSON数据
   */
  getJSON(key, defaultValue = null) {
    const data = this.get(key, defaultValue);
    
    // 确保返回的是对象或数组
    if (data && typeof data === 'object') {
      return data;
    }
    
    // 如果是字符串，尝试再次解析
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return defaultValue;
      }
    }
    
    return defaultValue;
  },

  /**
   * 检查数据类型
   * @param {string} key - 存储键名
   * @returns {string} 数据类型：'object', 'array', 'string', 'number', 'boolean', 'null', 'undefined', 'invalid'
   */
  getDataType(key) {
    try {
      let data;
      if (this.isMiniProgram()) {
        data = wx.getStorageSync(key);
      } else {
        data = localStorage.getItem(key);
      }
      
      if (data === null || data === undefined) {
        return 'undefined';
      }
      
      // 如果是字符串，尝试判断是否为JSON
      if (typeof data === 'string') {
        if (data === 'null') return 'null';
        if (data === 'undefined') return 'undefined';
        
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return 'array';
          if (parsed && typeof parsed === 'object') return 'object';
          if (typeof parsed === 'number') return 'number';
          if (typeof parsed === 'boolean') return 'boolean';
          return typeof parsed;
        } catch {
          return 'string';
        }
      } else {
        // 微信小程序可能直接返回对象
        if (Array.isArray(data)) return 'array';
        if (data && typeof data === 'object') return 'object';
        return typeof data;
      }
    } catch (e) {
      return 'invalid';
    }
  },

  /**
   * 直接存储字符串（不进行JSON.stringify）
   * @param {string} key - 存储键名
   * @param {string} value - 字符串值
   */
  setString(key, value) {
    const strValue = String(value);
    if (this.isMiniProgram()) {
      wx.setStorageSync(key, strValue);
    } else {
      localStorage.setItem(key, strValue);
    }
  },

  /**
   * 直接存储JSON对象
   * @param {string} key - 存储键名
   * @param {Object|Array} value - JSON数据
   */
  setJSON(key, value) {
    if (value && typeof value === 'object') {
      this.set(key, value);
    } else {
      console.error('setJSON只能存储对象或数组');
    }
  },

  remove(key) {
    if (this.isMiniProgram()) {
      wx.removeStorageSync(key);
    } else {
      localStorage.removeItem(key);
    }
  },

  getAllKeys() {
    if (this.isMiniProgram()) {
      return wx.getStorageInfoSync().keys || [];
    } else {
      return Object.keys(localStorage) || [];
    }
  },

  /**
   * 清空所有存储
   */
  clear() {
    if (this.isMiniProgram()) {
      wx.clearStorageSync();
    } else {
      localStorage.clear();
    }
  },

  /**
   * 获取存储信息
   * @returns {Object} 存储信息
   */
  getStorageInfo() {
    if (this.isMiniProgram()) {
      return wx.getStorageInfoSync();
    } else {
      return {
        keys: Object.keys(localStorage),
        limitSize: 0, // 浏览器不提供此信息
        currentSize: 0 // 浏览器不提供此信息
      };
    }
  }
};