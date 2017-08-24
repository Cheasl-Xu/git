import { shoppingData } from '../../config/shopping.js';
var app = getApp();
Page({
    data: {
    	h5_qrcode: shoppingData.h5QRcode
    },
    downloadFile: function(){
    	var _this = this;
    	wx.showActionSheet({
		  itemList: ['保存图片'],
		  success: function(res) {
		  	if(res.tapIndex == 0){
	  			app.downloadFile(_this.data.h5_qrcode);
		  	}
		  },
		  fail: function(res) {
		    console.log(res.errMsg)
		  }
		})
    }
})