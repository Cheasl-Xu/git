import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
import { utils } from '../../utils/utils.js';

var app = getApp()
Page({
    data: {
    	count: {
		    page: 1,
		    size: 10,
		    num: "",
		    sum: "",
	    },
	    list:[],
	    columnlist:{},
	    hasMore: false,
    	loadding: true,
        noContent: false,
      	id:'',
        height:''
    },
  	onLoad: function(e) {
  		var that = this;
        app.getSystemInfo(function(res) {
            that.setData({
                height: res.windowHeight-114
            })
        })
  		 wx.setNavigationBarTitle({  title: e.title || '专栏'})
  		 this.setData({
	    	id:e.id || ''
	    });
  	    this.getColumnlist()
    },
    getColumnlist() {
    	var that = this;
    	if (that.data.count.num && that.data.count.page > that.data.count.num){
    		that.setData({
    			hasMore: false
    		});
    		return false;
    	}
    	that.setData({
    		loadding: true
    	})
        var param = {
            page:that.data.count.page,
            count:that.data.count.size,
            source:'wx_applet',
            type_id:'' || that.data.id
        }
        api.get(getUri('column_lists', 'tech'),param).then(res => {
            if( res.statusCode == 200 ){
                wx.stopPullDownRefresh();
                var data = res.data;
                if( data.error || data.message ){
                    wx.redirectTo({
                        url:'/pages/error/error',
                    })
                    that.setData({
                        hasMore: false,
                        loadding: false 
                    })
                }
                if( data && data.response.page && data.response.data && data.response.data[0]){
                    that.data.count.num = data.response.page.last_page
                    that.data.count.sum = data.response.page.total
                    that.data.list = that.data.list.concat(data.response.data)
                    for(var i = 0; i < data.response.data.length ;i++){
                        if (data.response.data[i].indexpic){
                            data.response.data[i].indeximg = utils.createImgSrc(data.response.data[i].indexpic , {width: 268})
                        }
                    }
                    that.setData({
                        columnlist: that.data.list,
                        count:that.data.count
                    })
                }else{
                    that.setData({
                        hasMore: false,
                        loadding:false,
                        noContent:true
                    })
                }
            }else{
                wx.redirectTo({
                  url:'/pages/error/error',
                })
            }
            that.setData({
                loadding: false
            });
        }).catch(res => {
            console.log(res)
            that.setData({
                loadding: false
            })
        })
    },
    onPullDownRefresh:function() {
	    var that = this;
	    that.data.count.page = 1;
	    that.data.list = [];
	    that.getSubscibe();
	},
    loadMore(){
    	var that = this;
		that.setData({
    		hasMore: true
    	});
    	that.data.count.page++;
    	that.getColumnlist()
    },
})
