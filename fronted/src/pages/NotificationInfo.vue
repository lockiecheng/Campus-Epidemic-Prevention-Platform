<template>
  <div>
    <div class="clickBtn">
      <el-button type="info" @click="getNotificationInfo"
        >获取所有通知信息</el-button
      >
      <el-button type="info" @click="deltAllNotificationInfo"
        >清除所有通知信息</el-button
      >
    </div>
    <!-- 通知消息展示界面 -->
    <div class="scrollerWrap">
      <scroller height="100%" ref="scrollerBottom">
        <main class="scrollerContent">
          <el-collapse
            @change="handleChange"
            accordion
            v-show="showNotification"
          >
            <el-collapse-item
              :name="notification.activeId"
              v-for="notification in notificationFormat"
              :key="notification.activeId"
            >
              <template slot="title">
                {{ notification.showNotificationTime
                }}<i class="el-icon-message-solid" style="color: #ff4040"></i>
              </template>
              <div class="notification-info">
                <el-descriptions
                  class="margin-top"
                  title="通知详情"
                  :column="2"
                  size="small"
                  border
                >
                  <!-- 删除通知消息 -->
                  <template slot="extra">
                    <el-button
                      type="error"
                      size="small"
                      @click="
                        deleteNotification(
                          notification.idcard,
                          notification.activeId
                        )
                      "
                      >删除</el-button
                    >
                  </template>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-user"></i>
                      被通知对象姓名
                    </template>
                    {{ notification.name }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-mobile-phone"></i>
                      被通知对象学号
                    </template>
                    {{ notification.idcard }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-time"></i>
                      通知时间
                    </template>
                    {{ notification.notificationFormatTime }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-tickets"></i>
                      通知信息
                    </template>
                    {{ notification.message }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-collapse-item>
          </el-collapse>
        </main>
      </scroller>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import Qs from "qs";
export default {
  name: "NotificationInfo",
  data() {
    return {
      notificationList: [],
      showNotification: false,
    };
  },
  computed: {
    token() {
      // 从localstorage中获得token
      return JSON.parse(localStorage.getItem("token"))["token"];
    },
    notificationFormat() {
      // 最终展示在界面上面的数据
      this.notificationList.forEach((element) => {
        element.activeId = element.notificationList.NotificationTime;
        element.message = element.notificationList.NotificationMessage;
        // 格式化
        var hour = parseInt(
          (Date.now() - Number(element.notificationList.NotificationTime)) /
            1000 /
            60 /
            60
        );
        hour = hour < 10 ? "0" + hour : hour;
        var minute = parseInt(
          ((Date.now() - Number(element.notificationList.NotificationTime)) /
            1000 /
            60) %
            60
        );
        minute = minute < 10 ? "0" + minute : minute;
        var second = parseInt(
          ((Date.now() - Number(element.notificationList.NotificationTime)) /
            1000) %
            60
        );
        second = second < 10 ? "0" + second : second;
        element.notificationFormatTime = moment(
          Number(element.notificationList.NotificationTime)
        ).format("YYYY-MM-DD HH:mm:ss");

        element.showNotificationTime =
          hour + "小时" + minute + "分钟" + second + "秒前 您发送了一条通知"; // 小时
      });
      this.notificationList.sort((a, b) => b.activeId - a.activeId); //日期时间戳降序排列) 如果比较的值小于0，则a会被排列到b前面
      return this.notificationList;
    },
  },
  methods: {
    getNotificationInfo() {
      this.notificationList = [];
      this.showNotification = true;
      axios({
        method: "GET",
        url: "http://localhost:3000/my/getNotificationInfo",
        headers: {
          Authorization: this.token, // 将当前用户的token发送给后端进行验证
        },
      }).then(
        (response) => {
          if (
            response.data.status == 0 &&
            response.data.notificationData.length > 0
          ) {
            // 数组 response.data.notificationData
            response.data.notificationData.forEach((element) => {
              // 每一个element是下面的notificationData
              JSON.parse(element.NotificationList)
                .slice(1)
                .forEach((ele) => {
                  this.notificationList.unshift({
                    idcard: element.idcard,
                    name: element.name,
                    notificationList: JSON.parse(ele),
                  });
                });
            });
          } else {
            this.$message({
              type: "error",
              message:
                response.data.notificationData.length == 0
                  ? "暂时没有通知消息"
                  : response.data.msg,
            });
            this.showNotification = false;
          }
        },
        (err) => {
          this.$message({
            type: "error",
            message: err.message,
          });
        }
      );
    },
    // 清除特定通知消息
    deleteNotification(idcard, activeId) {
      this.$confirm("此操作将删除该通知消息，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 将notificationList中特定的idcard和activeId给删除
          this.notificationList = this.notificationList.filter((element) => {
            return !(element.idcard == idcard && element.activeId == activeId);
          });
          // 发送AJAX请求，真正修改数据库
          axios({
            method: "DELETE",
            url: "http://localhost:3000/my/delNotificationInfo",
            headers: {
              Authorization: this.token, // 将当前用户的token发送给后端进行验证
            },
            params: Qs.stringify({
              idcard: idcard,
              activeId: activeId,
            }),
          }).then(
            (response) => {
              if (response.data.status == 0) {
                this.$message({
                  type: "success",
                  message: response.data.msg,
                });
              } else {
                this.$message({
                  type: "error",
                  message: response.data.msg,
                });
              }
            },
            (err) => {
              console.log(err.message);
            }
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 清除所有的通知消息
    deltAllNotificationInfo() {
      this.$confirm("此操作将删除所有的通知消息，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.notificationList = [];
          // 发送AJAX请求 DELETE即可
          axios({
            method: "DELETE",
            url: "http://localhost:3000/my/delNotificationInfo",
            headers: {
              Authorization: this.token, // 将当前用户的token发送给后端进行验证
            },
          }).then(
            (response) => {
              if (response.data.status == 0) {
                this.showNotification = false;
                this.$message({
                  type: "success",
                  message: response.data.msg,
                });
              } else {
                this.$message({
                  type: "error",
                  message: response.data.msg,
                });
              }
            },
            (err) => {
              this.$message({
                type: "error",
                message: err.message,
              });
            }
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handleChange(val) {
      // console.log(val);
    },
    // 滚动条事件
    refresh(done) {
      //下拉刷新
      //your code
    },
    infinite(done) {
      done(true);
    },
  },
};
</script>

<style scoped>
.el-collapse {
  width: 50%;
  height: 20px;
  margin-top: 10px;
}

.notification-info {
  margin-left: 20px;
}

.scrollerWrap {
  position: absolute;
  width: 75%;
  height: 90%;
  top: 50px;
  bottom: 20px;
  margin-left: 10px;
}
.scrollerWrap main {
  height: 100%;
}
</style>
