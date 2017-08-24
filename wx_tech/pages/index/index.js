import { api } from '../../utils/api.js';
import { getUri } from '../../config/config.js';
import { utils } from '../../utils/utils.js';
import { shoppingData } from '../../config/shopping.js'

var app = getApp()
Page({
    data: {
        loading : true,
        hasMore : false,
        nopay:false,
        height:'',
        footer:false,
        num:''
    },
    onShow (){
  		var that = this;
      app.getSystemInfo(function(res) {
          that.setData({
              height: res.windowHeight-114
          })
      })
      wx.showNavigationBarLoading()
      wx.setNavigationBarTitle({
        title: shoppingData.shop.title,
        complete: () => {
          wx.hideNavigationBarLoading()
        }
      })
  		this.data.swiperlists = [];
  		this.data.navlist = [];
  		this.data.columnList = [];
  		this.data.contentList = [];
  		this.data.page = {
            cur : 1,
            size : 10,
            num : '',
            total : ''
        },
        app.check(function(code){
          if (code > 0) {
            that.getSwipers()
            that.getNavlist()
            that.getColumnList()
            setTimeout(function () {
              that.getContentList()
            }, 100)
          }else{
            wx.redirectTo({
              url: '/pages/error/error',
            })
          }
        })
    },
    onShareAppMessage() {
	    return {
	      title: shoppingData.title,
	      path: '/pages/index/index'
	    }
  	},
    getSwipers () {
        var that = this;
        api.get(getUri('banner_lists','tech'),{}).then( res => {
            if( res.statusCode == 200 ){
                var data = res.data;
                if( data.message || data.error ){
                    if(app.globalData.errorArr.indexOf(data.error) > -1){
                        wx.redirectTo({
				            url:'/pages/error/error',
				        })
                    }
                    return false;
                }
                if( data && data.response ){
                    if( data.response.data && data.response.data[0] ){
                        data.response.data.map(function(m,n){
                            m.imgSrc = utils.createImgSrc( m.indexpic,{width : 2250} );
                        })
                    }
                    that.setData({
                        swiperlists : data.response.data
                    })
                }
            }
        }).catch(res => {
            return false;
        })
    },

    toLink (e){
        var that = this,
        	index =  e.currentTarget.dataset.index,
        	item = that.data.swiperlists[index].link;
        if(!item.id){
          return false;
        }
        switch( item.type ){
        	case 'article' :
        	case 'audio' :
        	case 'video' : {
		 		wx.navigateTo({
		            url: '/pages/form/form?cid=' + item.id + '&type=' + item.type
		        })
		        break;
        	}
        	case 'column' : {
        		wx.navigateTo({
		            url: '/pages/bricolumn/bricolumn?cid=' + item.id
		        })
		         break;
        	}
            case 'live' : {
                wx.navigateTo({
                    url: '/pages/live/live'
                })
                 break;
            }
        	default : {}
        }
    },

    getNavlist (){
        var that = this;
        api.get(getUri('nav_lists','tech'),{}).then(res => {
            if( res.statusCode == 200 ){
                 var data = res.data;
                 if( data.message || data.error ){
                     if(app.globalData.errorArr.indexOf(data.error) > -1){
                		wx.redirectTo({
			            	url:'../error/error',
			          	})
                     }
                     return false;
                 }
                 if( data && data.response ){
                     if( data.response.data && data.response.data[0] ){
                         data.response.data.map(function(m,n){
                             m.imgSrc = utils.createImgSrc( m.indexpic,{width : 720} );
                         })
                     }
                     that.setData({
                         navlist : data.response.data
                     })
                 }
             }
        }).catch(res => {
            return false;
        })
    },
    getColumnList () {
        var that = this;
        var param = {
            count : that.data.page.size,
            page : 1,
            source : 'wx_applet'
        }
        api.get(getUri('column_lists','tech'),param).then(res => {
            if( res.statusCode == 200 ){
                var data = res.data;
                if( data.message || data.error ){
                    if(app.globalData.errorArr.indexOf(data.error) > -1){
                        wx.redirectTo({
				            url:'/pages/error/error',
				        })
                    }
                    return false;
                }
                if( data && data.response ){
                    if( data.response.data && data.response.data[0] ){
                        data.response.data.map(function(m,n){
                            m.imgSrc = utils.createImgSrc( m.indexpic,{width : 594} );
                        })
                    }
                    that.setData({
                        columnList : data.response.data
                    })
                }
            }
        }).catch(res => {
            return false;
        })
    },
    getContentList () {
        this.setData({
            loading : true
        });
        var that = this;
        var param = {
            count : that.data.page.size,
            page : that.data.page.cur,
            source :'wx_applet'
        }
        api.get(getUri('content_lists','tech'),param).then(res => {
            if( res.statusCode == 200 ){
                var data = res.data;
                if( data.message || data.error ){
                    if(app.globalData.errorArr.indexOf(data.error) > -1){
                        wx.redirectTo({
				            url:'/pages/error/error',
				          })
                    }else{
                        that.setData({
                            loading : false,
                            hasMore : false
                        })
                    }
                }
                if( data && data.response ){
                    if( data.response.page ){
                        that.data.page.num = res.data.response.page.last_page;
                        that.data.page.total = res.data.response.page.total;
                    }
                    if( data.response.data && data.response.data[0] ){
                        data.response.data.map(function(m,n){
                            m.imgSrc = utils.createImgSrc( m.indexpic,{width : 822} );
                        })
                    }
                    that.setData({
                        contentList :that.data.contentList.concat(data.response.data),
                        page : that.data.page,
                        loading : false,
                        footer:true
                    })
                    wx.stopPullDownRefresh();
                }
            }else{
                that.setData({
                    hasMore : false,
                    loading : false
                });
            }
        }).catch(res => {
           that.setData({
                loading : false,
                hasMore : false
            })
        })
    },
    loadMore : function(){
    	this.data.page.cur++;
    	if( this.data.page.cur > this.data.page.num || this.data.page.num == 0){
	        return false;
        }
        this.setData({
            hasMore : true,
        })
        this.getContentList();
        
    }
})
