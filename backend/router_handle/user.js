/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */

// 注册用户的处理函数
const express = require("express");
const router = express.Router();
const db = require("../db/index"); // 导入db模块
const bcrypt = require("bcryptjs"); // 将密码进行加密存储
const jwt = require("jsonwebtoken"); // jwt身份认证机制

// 用户注册流程
router.regUser = (req, res) => {
  const userinfo = req.body;
  //   合法性判断
  if (!userinfo.username || !userinfo.password || !userinfo.idcard)
    return res.send({
      status: 1,
      msg: "需要填写所有必填的信息",
    });
  // 检测用户是否已存在
  const sqlStr = "select * from user_login where idcard = ?"; // idcard唯一，因为每个人的IDcard不一样
  db.query(sqlStr, [userinfo.idcard], (err, results) => {
    if (err) return res.send(err.message);
    if (results.length >= 1)
      return res.send({
        status: 1,
        msg: "该学生已存在",
      });
    // 用户名可用，将其插入到db中
    // 先要将密码进行加密
    userinfo.password = bcrypt.hashSync(userinfo.password, 10); // 10 代表加密之后的密码长度
    // 登录的时候需要将输入的密码和数据库中的密码进行比较 ==> bcrypt.compareSync(userinfo.password, results[0].password)
    const registryStr = "insert into user_login set ?";
    db.query(
      registryStr,
      {
        idcard: userinfo.idcard,
        username: userinfo.username,
        password: userinfo.password,
      },
      (err, results) => {
        if (err)
          return res.send({
            status: 1,
            msg: err.message,
          });
        if (results.affectedRows !== 1)
          return res.send({
            status: 1,
            msg: "注册失败",
          });
        res.send({
          status: 0,
          msg: "注册成功",
        });
      }
    );
  });
};

// 用户登录流程，登录需要用户名和密码
router.loginUser = (req, res) => {
  const userinfo = req.body;
  const mysqlStr = "select * from user_login where username = ? ";
  db.query(mysqlStr, userinfo.username, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length == 0) {
      return res.send({
        status: 1,
        msg: "用户不存在，请返回使用学号注册",
      });
    } else if (!bcrypt.compareSync(userinfo.password, results[0].password)) {
      return res.send({
        status: 1,
        msg: "密码错误",
      });
    }
    // 登录成功，需要进行token认证, jwt进行认证的时格式是一个对象
    const userJwt = { ...results[0], password: "", idcard: "", avatar: "" }; // 只对name进行JWT认证
    const tokenStr = jwt.sign(userJwt, "zhuchengzhuchengheiheihei. ^_^", {
      expiresIn: "24h",
    });
    return res.send({
      status: 0,
      msg: "您登陆成功",
      token: "Bearer " + tokenStr, // 把token也传递过去
    });
  });
};

// 管理员信息
router.getAdminInfo = (req, res) => {
  const sqlStr = "select * from user_login where username = ? ";
  db.query(sqlStr, req.query.username, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    return res.send({
      status: 0,
      msg: "查询成功",
      adminInfo: {
        ...results[0],
        password: "",
      },
    });
  });
};

// 密码重置
router.resetPasswd = (req, res) => {
  const userinfo = req.body;
  const sqlStr = "select * from user_login where idcard = ?";
  db.query(sqlStr, userinfo.idcard, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length == 0) {
      return req.send({
        status: 1,
        msg: "查询为空",
      });
    }
    userinfo.newpassWord = bcrypt.hashSync(userinfo.newpassWord, 10); // 10 代表加密之后的密码长度
    const updatePasswdStr =
      "update user_login set password = ? where idcard = ?";
    db.query(
      updatePasswdStr,
      [userinfo.newpassWord, userinfo.idcard],
      (err, results) => {
        if (err)
          return res.send({
            status: 1,
            msg: err.message,
          });
        if (results.affectedRows !== 1) {
          return res.send({
            status: 1,
            msg: "更新密码失败",
          });
        }
        return res.send({
          status: 0,
          msg: "更新密码成功",
        });
      }
    );
  });
};

// 用户上传画像
router.updateAvatar = (req, res) => {
  // 将图像保存到用户avatar中
  const sqlStr = "update user_login set avatar = ? where idcard = ?";
  db.query(sqlStr, [req.body.avatar, req.body.idcard], (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.affectedRows !== 1)
      return res.send({
        status: 1,
        msg: "更换头像失败",
      });
    return res.send({
      status: 0,
      msg: "更换头像成功",
    });
  });
};

// 用户获取画像
router.getAvatar = (req, res) => {
  const sqlStr = "select avatar from user_login where idcard = ?";
  db.query(sqlStr, req.query.idcard, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    return res.send({
      status: 0,
      msg: "查询用户头像成功",
      avatar: results[0].avatar,
    });
  });
};

module.exports = router;
