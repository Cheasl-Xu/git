//app.js
// import { mockUserInfo } from './utils/mockUserInfo.js';
import { getUri } from './config/config.js';
import { shoppingData } from './config/shopping.js'
import { api } from './utils/api.js';

App({
  globalData:{
    userInfo: null,
    systemInfo: null,
    errorMsg : '',
    errorNum : 0,
    first: false,
    errorArr:['expire-signature', 'no-member-info', 'no-shop','member-shop-not-match']
  },

  onLaunch: function () {
    wx.showToast({
      title : '登录中',
      icon : 'loading',
      duration : 20000
    });
  },

  check : function( cbk ){
    var _this = this;
    _this.globalData.first = true;
    wx.checkSession({
      success : function( res ){
        const prevShopId = wx.getStorageSync('ds_shop_id');
        const curShopId = shoppingData.shopid;
        if (prevShopId && prevShopId == curShopId) {
          const data = wx.getStorageSync('sessionToken');
          const now = +new Date();
          if(data && data.expire && (now < data.expire)){
            wx.hideToast();
            var userInfo = wx.getStorageSync('userInfo');
            if( userInfo ){
              _this.globalData.userInfo = userInfo;
              cbk && cbk(1);
            }else{
              _this.getUserInfo( data, cbk );
            }
          }else{
            _this.getSession( cbk );
          }
        } else {
           _this.getSession( cbk );
        }
      },
      fail : function( res ){
        _this.getSession( cbk );
      }
    });
  },

  getSession : function( cbk ){
    var _this = this;
    wx.login({
      success : function( res ){
        if( res && res.code ){
          api.get(getUri('session_key'), { code: res.code, app_id: shoppingData.appid}, true).then(res => {
            if( res.data && res.data.error){
              _this.globalData.errorMsg = res.data.error;
              console.warn(res.data.message);
              wx.hideToast();
              cbk && cbk(-1);
              return false;
            }
            if( res.data && res.data.sessionToken ){
              _this.getUserInfo(res.data, cbk);
              const time = res.data.expires_in * 1e3;
              const tokenObj = {
                sessionToken: res.data.sessionToken,
                expire: +new Date() + time
              }
              wx.setStorageSync('sessionToken', tokenObj);
            }
          })
          .catch(res => {
            _this.globalData.errorMsg = '访问错误';
            console.warn(res.errMsg);
            wx.hideToast();
            cbk && cbk(-1);
          })
        }
      },
      fail : function( res ){
         _this.globalData.errorMsg = '访问错误';
         console.warn(res.ErrorText);
         wx.hideToast();
         cbk && cbk(-1);
      }
    });
  },

  getUserInfo : function( param, cbk ){
    var _this = this;
    _this.globalData.errorMsg = '';
    wx.getUserInfo({
      withCredentials: true,
      success : function( res ){
        const data = {
          sessionToken : param.sessionToken,
          iv: res.iv,
          encryptedData: res.encryptedData,
          rawData: res.rawData,
          shop_id: shoppingData.shopid,
          app_id: shoppingData.appid,
          signature: res.signature
        };
        api.post(getUri('app_login'), data).then(res => {
          if(res.data.error) {
            if( _this.globalData.errorNum <= 2){
              wx.removeStorageSync('sessionToken');
              wx.removeStorageSync('ds_shop_id');
              _this.globalData.errorNum++;
              _this.getSession();
              return false;
            }
            wx.showToast({
              title : '登录失败',
            });
            _this.globalData.errorMsg = res.data.error;
            cbk && cbk(-1);
          } else {
            _this.globalData.errorMsg = '';
            var storage = wx.getStorageSync('userInfo')
            _this.globalData.userInfo = res.data.response;
            cbk && cbk(1);
            if( !storage || storage.nick_name !==  res.data.nick_name ){
              wx.setStorageSync('userInfo', res.data.response)
              wx.setStorageSync('ds_shop_id', shoppingData.shopid);
            }
          }
        })
        .catch(res => {
          wx.hideToast();
           _this.globalData.errorMsg = '访问错误';
           cbk && cbk(-1);
        })
      },
      fail : function( res ){
        wx.hideToast();
         _this.globalData.errorMsg = '访问错误';
         cbk && cbk(-1);
      }
    })
  },

  getSystemInfo: function (cb) {
    var that = this
    if(that.globalData.systemInfo){
      typeof cb == "function" && cb(that.globalData.systemInfo)
    }else{
      wx.getSystemInfo({
        success: function(res) {
          that.globalData.systemInfo = res
          typeof cb == "function" && cb(that.globalData.systemInfo)
        }
      })
    }
  },
  downloadFile: function(imgSrc){
    wx.downloadFile({
      url: imgSrc,
      success: function(res) {
        wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                icon: 'success',
                title: '图片已保存到系统相册',
                duration: 2000
              });
            },
            fail(res) {
              wx.showToast({
                icon: 'success',
                title: '图片保存失败',
                duration: 2000
              });
            }
        })
      }
    })
  }
})
