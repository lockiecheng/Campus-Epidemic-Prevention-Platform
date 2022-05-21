<template>
  <div class="admin-panel">
    <el-col :span="5">
      <el-menu
        default-active="0"
        class="el-menu-vertical-demo"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-menu-item index="0">
          <el-avatar :size="40" v-if="imageUrl" :src="imageUrl">
            <!-- 如果图像加载失败就加载下面这张图片 如果成功则加载el-avatar的图片 -->
            <img
              src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
            />
          </el-avatar>
          <!-- 管理员的一些操作 -->
          <el-dropdown
            trigger="click"
            @visible-change="showIcon"
            @command="handleCommand"
          >
            <span class="el-dropdown-link">
              {{ adminName }}<i :class="activeArrow"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="updateAvatar"
              >
                <el-dropdown-item icon="el-icon-picture" command="changeAvatar"
                  >更换头像</el-dropdown-item
                >
              </el-upload>

              <el-dropdown-item icon="el-icon-lock" command="changePasswd"
                >更换密码</el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-thumb" command="logout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </el-menu-item>
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-user"></i>
            <span>学生管理</span>
          </template>
          <el-menu-item-group>
            <template slot="title">查看学生信息</template>
            <el-menu-item index="1-1" @click="getStudentInfo(pickDate, 0)"
              >在校生信息</el-menu-item
            >
            <el-menu-item index="1-2" @click="getStudentInfo(pickDate, 1)"
              >离校生信息</el-menu-item
            >
          </el-menu-item-group>
          <el-menu-item-group>
            <template slot="title">详细信息统计</template>
            <el-menu-item index="1-3" @click="getFootprintInfo(2)"
              >学生流调信息</el-menu-item
            >
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-s-custom"></i>
            <span>教师管理</span>
          </template>
          <el-menu-item-group index="3">
            <template slot="title">查看教师信息</template>
            <el-menu-item index="3-1" @click="getTeacherInfo(pickDate, 0)"
              >在校教师信息</el-menu-item
            >
            <el-menu-item index="3-2" @click="getTeacherInfo(pickDate, 1)"
              >离校教师信息</el-menu-item
            >
          </el-menu-item-group>
          <el-menu-item-group index="4">
            <template slot="title">详细信息统计</template>
            <el-menu-item index="4-1" @click="getFootprintInfo(1)"
              >教师流调信息</el-menu-item
            >
          </el-menu-item-group>
        </el-submenu>
        <el-menu-item index="5" @click="getDepartmentInfo">
          <i class="el-icon-school"></i>
          <span slot="title">学院管理</span>
        </el-menu-item>
        <el-menu-item index="6" @click="getNotification">
          <i class="el-icon-message-solid"></i>
          <span slot="title">通知管理</span>
        </el-menu-item>
      </el-menu>
    </el-col>
    <div class="panel-body">
      <router-view :userData="userData" :pickDate="pickDate"></router-view>
    </div>
    <!-- 弹框 -->
    <el-dialog title="更新密码" :visible.sync="dialogFormVisible" width="30%">
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="密码" prop="pass">
          <el-input
            type="password"
            v-model="ruleForm.pass"
            autocomplete="off"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input
            type="password"
            v-model="ruleForm.checkPass"
            autocomplete="off"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')"
            >提交</el-button
          >
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Qs from "qs";
import moment from "moment";
export default {
  name: "AdminPanel",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.ruleForm.checkPass !== "") {
          this.$refs.ruleForm.validateField("checkPass");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      activeArrow: "el-icon-arrow-down el-icon--right",
      userData: [],
      pickDate: Date.now(),
      ruleForm: {
        pass: "",
        checkPass: "",
      },
      rules: {
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
      },
      dialogFormVisible: false,
      // 管理员信息
      adminName: "",
      adminIdCard: "",
      imageUrl: "",
    };
  },
  computed: {
    token() {
      // 从localstorage中获得token
      return JSON.parse(localStorage.getItem("token"))["token"];
    },
  },
  methods: {
    // 管理员向上向下箭头操作
    showIcon() {
      this.activeArrow =
        this.activeArrow === "el-icon-arrow-down el-icon--right"
          ? "el-icon-arrow-up el-icon--right"
          : "el-icon-arrow-down el-icon--right";
    },
    // 获得管理员登录信息，主要是用户名和idcard
    getAdminInfo() {
      this.adminName = localStorage.getItem("adminName");
      axios({
        method: "GET",
        url: `http://localhost:3000/api/getAdminInfo?username=${this.adminName}`,
      }).then((response) => {
        if (response.data.status == 0) {
          this.adminName = response.data.adminInfo.username;
          this.adminIdCard = response.data.adminInfo.idcard;
        }
      });
    },

    // 新密码
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        // 如果密码有效的话发送AJax请求
        if (valid) {
          axios({
            method: "POST",
            url: "http://localhost:3000/api/resetPasswd",
            data: Qs.stringify({
              idcard: this.adminIdCard, // 根据后端API返回来的
              newpassWord: this.ruleForm.pass,
            }),
          }).then(
            (response) => {
              this.$message({
                message: response.data.msg,
                type: response.data.status === 0 ? "success" : "error",
              });
              this.$notify({
                type: "error",
                message: "检测到您当前账号密码改变, 正在返回登录页",
                duration: 500,
              });
              // 更新完密码后进入到主页
              setTimeout(() => {
                this.handleCommand("logout");
              }, 1000);
            },
            (err) => {
              console.log("更新密码失败" + err);
            }
          );
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 管理员的一些操作
    handleCommand(command) {
      // 登出按钮 登出按钮的同时，需要把localStorage清空
      if (command == "logout") {
        localStorage.removeItem("token");
        this.$router.push({
          name: "home", // 返回登录页
        });
        this.$message({
          type: "success",
          message: "退出登录成功",
        });
      }
      // 更换密码按钮
      if (command == "changePasswd") {
        this.dialogFormVisible = true;
        this.getAdminInfo();
      }
      // 更换头像按钮
      if (command == "changeAvatar") {
        // 给后端返回一个新的avatar
      }
    },

    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          resolve(e.target.result);
        };
        // readAsDataURL
        fileReader.readAsDataURL(blob);
      });
    },

    // 获取用户头像
    getAvatar() {
      axios({
        method: "GET",
        url: `http://localhost:3000/api/getAvatar?idcard=${this.adminIdCard}`,
      }).then(
        (response) => {
          if (response.data.status == 0 && response.data.avatar) {
            this.imageUrl = response.data.avatar;
          } else {
            this.imageUrl =
              "https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png";
          }
        },
        (err) => {
          this.imageUrl =
            "https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png";
        }
      );
    },

    // 上传用户头像
    updateAvatar(file) {
      this.blobToBase64(file.file).then((res) => {
        // 转化后的base64
        var base64URL = res;
        axios({
          method: "POST",
          url: "http://localhost:3000/api/updateAvatar",
          data: Qs.stringify({
            idcard: this.adminIdCard,
            avatar: base64URL,
          }),
        }).then(
          (response) => {
            if (response.data.status == 0) {
              this.imageUrl = base64URL;
              this.$message({
                type: "success",
                message: response.data.msg,
              });
            } else {
              this.imageUrl =
                "https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png";
            }
          },
          (err) => {
            this.$message({
              type: "error",
              message: err.msg,
            });
          }
        );
      });
    },

    beforeAvatarUpload(file) {
      const isJPG =
        file.type === "image/jpeg" || "image/png" || "image/jpg" || "image/gif";
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG/PNG/JPEG/GIF 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M; // 只有这个为真才会触发handleAvatarSuccess
    },
    handleOpen(key, keyPath) {
      // console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      // console.log(key, keyPath);
    },
    // 获取学生基本信息，包括姓名院系等等
    getStudentInfo(pickDate, studentStatus) {
      // 路由跳转，路由跳转前先要判断是否有权限，把token返回给后端
      axios({
        method: "GET",
        url: `http://localhost:3000/my/getInfobyDate?date=${pickDate}&&studentStatus=${studentStatus}`,
        headers: {
          Authorization: this.token, // 将当前用户的token发送给后端进行验证
        },
      }).then(
        (response) => {
          if (response.data.status === 0) {
            this.$router.push(
              `/admin-panel/student-info?studentStatus=${studentStatus}`
            ); // 发送携带query的请求
            this.userData = response.data.resultsByDate; // 发送数据
            this.pickDate = pickDate; // 改变当前的日期选中状态，当子组件触发该事件是，会把当前的pickDate修改为子组件发送的date，这样就修改了总是发送最新的日期AJAX请求的bug
          } else {
            this.userData = [];
            // 弹出警告框
            this.$message({
              message: response.data.msg,
              type: "error",
            });
          }
        },
        (err) => {
          this.$message({
            message: err,
            type: "error",
          });
        }
      );
    },
    // 获取学生/ 老师的详细行程记录，流调信息以及近七天的门铃码信息
    getFootprintInfo(identification) {
      this.$router.push(
        `/admin-panel/footprint-info?identification=${identification}`
      );
    },

    // 获取老师基本信息，同上面的getStudenInfo
    getTeacherInfo(pickDate, teacherStatus) {
      axios({
        method: "GET",
        url: `http://localhost:3000/my/getTeacherInfoByDate?date=${pickDate}&&teacherStatus=${teacherStatus}`,
        headers: {
          Authorization: this.token, // 将当前用户的token发送给后端进行验证
        },
      }).then(
        (response) => {
          if (response.data.status === 0) {
            this.$router.push(
              `/admin-panel/teacher-info?teacherStatus=${teacherStatus}`
            );
            this.userData = response.data.resultsByDate; // 发送数据
            this.pickDate = pickDate;
          } else {
            this.userData = [];
            this.$message({
              message: response.data.msg,
              type: "error",
            });
          }
        },
        (err) => {
          console.log(err.message);
        }
      );
    },

    getDepartmentInfo() {
      this.$router.push("/admin-panel/department-info");
    },
    getNotification() {
      this.$router.push("/admin-panel/notification-info");
    },
  },

  mounted() {
    this.adminName = localStorage.getItem("adminName");
    this.$bus.$on("getStudentInfo", this.getStudentInfo); // 动态绑定一个事件，回调函数为getOnStudentInfo()
    this.$bus.$on("getTeacherInfo", this.getTeacherInfo);
    this.getAdminInfo();
    setTimeout(() => {
      this.getAvatar();
    }, 1000);
  },
};
</script>

<style scoped>
.el-dropdown {
  margin-left: 15px;
}

.el-dropdown-link {
  color: #e6a23c;
}

.adminName {
  margin-left: 15px;
}

.panel-body {
  width: 1200px;
  height: 680px;
  margin-left: 325px;
  margin-top: 10px;
}

.demo-ruleForm {
  width: 400px;
}
</style>
