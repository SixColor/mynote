//index.js
//获取应用实例
const app = getApp();
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
//获取年
for (let i = 2019; i <= date.getFullYear() + 5; i++) {
  years.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}

Page({
  data: {
    time: "",
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0, 9, 16, 10, 17],
    noticeTime: new Date(), //提醒时间
    noticeTimeString: "",
    noticeTimeStamp: new Date().valueOf(),
    minNoticeTime: new Date().valueOf(),
    showNoticePicker: false, //显示提醒时间 picker控件
    address: "暂未获取位置信息",
    activeTab: 0,
    locationInfo: {
      lat: 0,
      lng: 0
    },
    content: "",
    subject: "",
    motto: "Hello World",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo")
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: "../logs/logs"
    });
  },

  subjectInput: function(event) {
    this.setData({
      subject: event.detail.value
    });
  },

  memoInput: function(event) {
    this.setData({
      content: event.detail.value
    });
  },

  onReady: function() {},
  onLoad: function() {
    wx.cloud.init({
      traceUser: true
    });
    let that = this;
    this.setData({
      noticeTimeString: that.dateFormat(new Date(), "yyyy/MM/dd hh:mm")
    });

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
  },
  getUserInfo: function(e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  },
  getLocation: function() {
    const that = this;
    console.log(1111);
    wx.getLocation({
      type: "wgs84",
      success(res) {
        that.setData({
          locationInfo: {
            lat: res.latitude,
            lng: res.longitude
          }
        });
        const base_url =
          "https://apis.map.qq.com/ws/geocoder/v1/?key=BOQBZ-U4KCX-PI34Q-ZPAJI-CAVD2-YEFCR&location=";
        wx.request({
          url: base_url + res.latitude + "," + res.longitude,
          success(res) {
            that.setData({
              address: res.data.result.address
            });
          }
        });
      },
      fail(res) {
        wx.showToast({
          title: res.errMsg
        });
      },
      complete(res) {
        console.log(res);
      }
    });
  },
  showDatePicker: function() {
    this.setData({
      showNoticePicker: true
    });
  },
  onCloseNoticePicker: function() {
    this.setData({
      showNoticePicker: false
    });
  },
  selectedNoticeTime: function(value) {
    const dt = this.dateFormat(new Date(value.detail), "yyyy/MM/dd hh:mm");
    this.setData({
      showNoticePicker: false,
      noticeTime: new Date(value.detail),
      noticeTimeString: dt,
      noticeTimeStamp: new Date(value.detail).valueOf()
    });
  },
  //预计时间取消按钮
  onNoticeTimeCancel: function() {
    this.setData({
      showNoticePicker: false
    });
  },

  dateFormat: function(date, fmt) {
    //author: meizz
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
    return fmt;
  },
  //保存备忘
  saveNote: function() {
    const db = wx.cloud.database();
    const that = this.data;
    if (!this.data.subject) {
      wx.showToast({
        title: "请填写主题",
        icon: "none"
      });
      return;
    }
    wx.showLoading({
      title: "保存中..."
    });
    db.collection("notes")
      .add({
        // data 字段表示需新增的 JSON 数据
        data: {
          // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
          subject: that.subject,
          content: that.content,
          // 为待办事项添加一个地理位置（113°E，23°N）
          location: new db.Geo.Point(
            that.locationInfo.lng,
            that.locationInfo.lat
          ),
          noticeTime: new Date(that.noticeTime),
          isFinished:false
        }
      })
      .then(res => {
        wx.hideLoading();
        wx.showToast({
          title: "保存成功",
          success: function() {
            wx.hideLoading();
            wx.reLaunch({
              url: "../list/list"
            });
          }
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },
  //获取时间日期
  bindMultiPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    });
    const index = this.data.multiIndex;
    const year = this.data.multiArray[0][index[0]];
    const month = this.data.multiArray[1][index[1]];
    const day = this.data.multiArray[2][index[2]];
    const hour = this.data.multiArray[3][index[3]];
    const minute = this.data.multiArray[4][index[4]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    this.setData({
      time: year + "-" + month + "-" + day + " " + hour + ":" + minute
    });
    // console.log(this.data.time);
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function(e) {
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      console.log(choose_year);
      this.setData({
        choose_year
      });
    }
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (
        num == 1 ||
        num == 3 ||
        num == 5 ||
        num == 7 ||
        num == 8 ||
        num == 10 ||
        num == 12
      ) {
        //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ["multiArray[2]"]: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) {
        //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ["multiArray[2]"]: temp
        });
      } else if (num == 2) {
        //判断2月份天数
        let year = parseInt(this.data.choose_year);
        console.log(year);
        if ((year % 400 == 0 || year % 100 != 0) && year % 4 == 0) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ["multiArray[2]"]: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ["multiArray[2]"]: temp
          });
        }
      }
      console.log(this.data.multiArray[2]);
    }
  }
});
