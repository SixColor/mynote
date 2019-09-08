// miniprogram/pages/myprofile/myprofile.js
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: "../../images/defaultavatar.png",
      nickName: "点击登录"
    },
    gotUserInfo: false,
    userOpenid: "",
    isLogin: false,
    noteCount: "",
    remotetoicon:
      "https://6d79-mynotes-ec5112-1259194846.tcb.qcloud.la/todo.png?sign=941e45d3d9fd605e0e3db597e97aa88f&t=1567941968"
  },
  getUserInfo: function(res) {
    this.setData({
      userInfo: res.detail.userInfo,
      gotUserInfo: true
    });
    this.getNoteCount();
  },
  getUserNotes: function(res) {},
  getUserOpenid: function() {
    wx.cloud
      .callFunction({
        name: "login"
      })
      .then(res => {
        this.setData({
          userOpenid: res.result.openid
        });
      });
  },

  getNoteCount: function() {
    db.collection("notes")
      .orderBy("isFinished", "asc")
      .where({
        _openid: this.userOpenid,
        isFinished: false
      })
      .count()
      .then(res => {
        this.setData({
          noteCount: res.total
        });
      });
  },

  checkLoginState: function() {
    let that = this;
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        that.setData({
          isLogin: true
        });
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程

        wx.login(); //重新登录
      }
    });
  },

  login: function() {
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: "https://test.com/onLogin",
            data: {
              code: res.code
            }
          });
        } else {
          console.log("登录失败！" + res.errMsg);
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.checkLoginState();

    this.getUserOpenid();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.checkLoginState();
    this.getUserNotes();
    if (this.isLogin) {
      this.getNoteCount();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},

  onTabItemTap(item) {
    // tab 点击时执行
    if (item.index == 2) {
      this.onLoad();
    }
  }
});
