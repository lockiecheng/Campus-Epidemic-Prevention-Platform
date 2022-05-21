const express = require("express");
const router = express.Router();

// 导入用户路由处理函数模块
const userHandler = require("../router_handle/user");

// 用户注册
router.post("/reguser", userHandler.regUser);

// 用户登录
router.post("/userlogin", userHandler.loginUser);

// 获取管理员信息
router.get("/getAdminInfo", userHandler.getAdminInfo);

// 用户重置密码
router.post("/resetPasswd", userHandler.resetPasswd);

// 用户上传画像
router.post("/updateAvatar", userHandler.updateAvatar);

router.get("/getAvatar", userHandler.getAvatar);

module.exports = router;
