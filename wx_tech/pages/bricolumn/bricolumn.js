import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
import { utils } from '../../utils/utils.js';

var app = getApp();
Page({
	data:{
		id:'',
		freeColumndetail:{},
		loadding:true,
		isShowToast: false,
	    tips: '',
	    duration: 1500,
	    footer:false,
	    canIUse: wx.canIUse('rich-text.nodes')
	},
	onLoad:function(e){
		var that = this;
		if(e.cid){
			that.setData({
				id:e.cid
			})
		}
		app.check(function(){
        	that.getFreeColumndetail()
        })
		
	},
	onPullDownRefresh : function(){
	    this.getFreeColumndetail()
	},
	showToast: function(msg, cb) {
	    if (this.data.isShowToast) {
	        return false;
	    }
	    this.setData({
	        tips: msg,
	        isShowToast: true
	    })
	    setTimeout(function(){
	        this.setData({
	            isShowToast: false
	        })
	        cb && cb();
	    }.bind(this), this.data.duration);
	},
	onShareAppMessage() {
  		var that = this;
    	return {
      		title: that.data.freeColumndetail.title,
      		path: '/pages/bricolumn/bricolumn?cid='+that.data.id
		}
  	},
	getFreeColumndetail: function(){
		var that = this;
		api.get(getUri('column_free_detail', 'tech').replace('{id}',that.data.id),{}).then(res => {
			if(res.statusCode == 200){
				var data = res.data;
				wx.stopPullDownRefresh()
				if(data.error || data.message){
					wx.redirectTo({
			            url:'/pages/error/error',
			        })
			        that.setData({
			        	loadding:false
			        })
				}else if(data.response.data && data.response.data.column_id){
					if(data.response.data.is_subscribe == 0){
						if(data.response.data.indexpic){
							data.response.data.indeximg = utils.createImgSrc(data.response.data.indexpic , {width: 750})
						}
						if(that.data.canIUse){
							data.response.data.describe = utils.replaceRichText(data.response.data.describe);
						}else{
							data.response.data.describe = data.response.data.describe.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,'').replace(/&amp;/g,'&');
						}
						
						wx.setNavigationBarTitle({  title: data.response.data.title })
						that.setData({
							freeColumndetail:data.response.data,
							loadding:false,
							footer:true
						})
					}else{
						wx.redirectTo({
							url:'/pages/column/column?cid='+that.data.id
						})
					}
				}else{
					that.setData({
						loadding:false
					})
				}
			}
		}).catch(res => {
			console.log(res)
			that.setData({
				loadding:false
			})
		})
	},
	ordercolumn: function(){
		var that = this;
		var param = {
			column_id:that.data.id
		}
		api.get(getUri('column_subscribe', 'tech'),param).then(res => {
			if(res.statusCode == 200){
				var data = res.data;
				if(data.error || data.message){
					wx.redirectTo({
						url:'/pages/error/error'
					})
				}else{
					if(data.response.success == 1){
						that.showToast('你已订阅成功!',function(){
							wx.redirectTo({
								url:'/pages/column/column?cid=' + that.data.id
							})
						})
					}
				}
			}
		}).catch(res => {
			console.log(res)
		})
	}
})
