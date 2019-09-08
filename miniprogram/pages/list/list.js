// pages/list/list.js
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    noteList: [],
    isFinished: false
  },
  /**
   * 获取列表
   */
  getList: function() {
    wx.showLoading({
      title: "加载中..."
    });
    wx.cloud
      .callFunction({
        name: "login"
      })
      .then(res => {
        db.collection("notes")
        .orderBy('isFinished', 'asc')
          .where({
            _openid: res.result.openid
          })
          .get()
          .then(res2 => {
          
            if (res2.data && res2.data.length > 0) {
              this.setData({
                noteList: res2.data
              });
            }
            wx.hideLoading();
          })
          .catch(err => {});
      });
  },

  /**
   * 标记完成
   */
  markFinished: function(event) {
    db.collection("notes")
      .doc(event.target.id)
      .update({
        data: {
          isFinished: true,
          finishedTime: new Date().toLocaleString()
        }
      })
      .then(res => {
        this.setData({
          isFinished: true
        });
        this.getList();
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getList();
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
  onPullDownRefresh: function() {},

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
    if (item.index == 1) {
      this.onLoad();
    }
  }
});
