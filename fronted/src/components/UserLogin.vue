<template>
  <div id="userlogin">
    <el-tabs v-model="activeName">
      <el-tab-pane label="登录" name="first">
        <el-input
          placeholder="请输入您的姓名"
          v-model="username"
          clearable
          prefix-icon="el-icon-user"
        >
        </el-input>
        <el-input
          placeholder="请输入您的密码"
          v-model="password"
          show-password
          prefix-icon="el-icon-lock"
        ></el-input>

        <div class="submit">
          <el-button type="primary" @click="userLogin">登录</el-button>
          <el-button @click="resetInput">重置</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="注册" name="second">
        <el-input
          placeholder="请输入您的学号"
          v-model="idcard"
          clearable
          prefix-icon="el-icon-school"
        >
        </el-input>
        <el-input
          placeholder="请输入您的姓名"
          v-model="username"
          clearable
          prefix-icon="el-icon-user"
        >
        </el-input>
        <el-input
          placeholder="请输入您的密码"
          v-model="password"
          show-password
          prefix-icon="el-icon-lock"
        ></el-input>
        <div class="submit">
          <el-button type="primary" @click="registryUser">注册</el-button>
          <el-button @click="resetInput">重置</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import axios from "axios";
import Qs from "qs";
export default {
  name: "UserLogin",
  data() {
    return {
      activeName: "first",
      idcard: "",
      username: "",
      password: "",
      token: "",
    };
  },
  methods: {
    userLogin() {
      // 登录逻辑 1、发送AJAX请求，http://localhost:3000/api/userlogin，返回status是0，即登录成功，同时保留token
      axios({
        method: "POST",
        url: "http://localhost:3000/api/userlogin",
        data:
          // 请求体内容
          Qs.stringify({ username: this.username, password: this.password }),
      }).then(
        (response) => {
          if (response.data.status === 0) {
            // 保存token字符串，以便后续进行身份验证，将该token字符串暴露出去
            this.token = response.data.token;
            localStorage.setItem(
              "token",
              JSON.stringify({
                token: this.token,
              })
            );
            // 跳转到管理员面板界面 且把当前的username保存起来
            localStorage.setItem("adminName", this.username);
            this.$router.push({
              name: "admin-panel",
            });
          }
          this.$message({
            message: response.data.msg,
            type: response.data.status === 0 ? "success" : "error",
          });
        },
        (err) => {
          console.log("出错啦" + err.message);
        }
      );
    },
    resetInput() {
      // 重置逻辑
      this.username = "";
      this.password = "";
      this.idcard = "";
    },
    registryUser() {
      // 注册逻辑，发送AJAX请求，http://localhost:3000/api/reguser，返回status是0，即注册成功
      axios({
        method: "POST",
        url: "http://localhost:3000/api/reguser",
        data: Qs.stringify({
          idcard: this.idcard,
          username: this.username,
          password: this.password,
        }),
      }).then(
        (response) => {
          if (response.data.status === 0) {
            this.resetInput();
          }
          this.$message({
            message: response.data.msg,
            type: response.data.status === 0 ? "success" : "error",
          });
        },
        (err) => {
          console.log("注册失败" + err);
        }
      );
    },
  },
};
</script>

<style scoped>
#userlogin {
  width: 400px;
  height: 300px;
  margin: 100px auto;
  background-color: white;
  border-radius: 10px;
  padding: 10px;
  border: 2px solid #ebeef5;
}

.el-input {
  margin-top: 15px;
  width: 100%;
}

.el-input:first-child {
  margin-top: 0px;
}

.submit {
  margin-top: 20px;
  float: right;
}
</style>
