'use strict';
import Promise from './es6-promise.min';
import { shoppingData } from '../config/shopping.js';

export const api = {
  http: (method, url, param, isLogin = false) => {
    const opts = {
      url,
      method,
      data: param,
      header: {
        'Content-Type': 'application/json'
      }
    }

    let data;

    if (!isLogin) {
      const app = getApp();
      const userInfo = app.globalData.userInfo;
      const shop_id = shoppingData.shopid;

      opts.data = param ? Object.assign({}, param, { shop_id }) : { shop_id };
      opts['xsrfHeaderName'] = 'x-member';
      opts.header['x-member'] = encodeURI(JSON.stringify(userInfo));
    }

    return new Promise((resolve, reject) => {
      opts.success = function(res) {
        resolve(res)
      };
      opts.fail = function(res) {
        reject(res)
      };
      wx.request(opts)
    })
  },

  get: (url, data, isLogin = false) => {
    return api.http('GET', url, data, isLogin);
  },

  post: (url, data, isLogin = false) => {
    return api.http('POST', url, data, isLogin);
  },

  put: (url, data) => {
    return api.http('PUT', url, data);
  },

  delete: (url, data) => {
    return api.http('DELETE', url, data);
  }
}
