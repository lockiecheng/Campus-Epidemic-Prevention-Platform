const express = require("express");
const router = express.Router();

const db = require("../db/index");

router.getDepartmentInfo = function (req, res) {
  const sqlStr = "select departmentId, departmentName from department_info";
  const queryStr = req.query.departmentId;
  db.query(sqlStr, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length === 0)
      return res.send({
        status: 1,
        msg: "查询为空",
      });
    return res.send({
      status: 0,
      msg: "查询成功",
      departmentList: results,
    });
  });
};

router.getClassList = function (req, res) {
  const sqlStr =
    "select departmentInfoList from department_info where departmentId = ?";
  const queryStr = req.query.departmenId;
  db.query(sqlStr, queryStr, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length === 0)
      return res.send({
        status: 1,
        msg: "查询为空",
      });
    return res.send({
      status: 0,
      msg: "查询成功",
      classList: results[0],
    });
  });
};

router.getStudentsListInfo = function (req, res) {
  const departmentId = req.query.departmentId;
  const classId = req.query.classId;
  const date = req.query.date; // 时间戳
  const sqlStr =
    "select * from student_info where departmentId = ? and classId = ?";
  db.query(sqlStr, [departmentId, classId], (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length === 0)
      return res.send({
        status: 1,
        msg: "查询为空",
      });
    // 传递回前端前要做一些操作
    let onSchoolNumber = 0,
      leaveSchoolNumber = 0,
      normalTemperature = 0,
      abnormalTemperature = 0,
      needNAT = 0,
      hasNAT = 0;
    let detailInfo_onSchoolNumber = [],
      detailInfo_leaveSchoolNumber = [],
      detailInfo_normalTemperature = [],
      detailInfo_abnormalTemperature = [],
      detailInfo_needNAT = [],
      detailInfo_hasNAT = [];
    results.forEach((element) => {
      // element是对象
      element.temperatureList = JSON.parse(element.temperatureList);
      if (element.isNAT == 0) {
        hasNAT++; // 已做完核酸
        detailInfo_hasNAT.push({
          ...element,
          temperatureList: [],
        });
      }
      if (element.isNeedNAT == 0) {
        needNAT++; // 需要做核酸
        detailInfo_needNAT.push({
          ...element,
          temperatureList: [],
        });
      }
      // 接下来需要判断当日的情况
      element.temperatureList.forEach((el) => {
        if (
          new Date(Number(el.temMeaTime)).setHours(0, 0, 0, 0) ==
          new Date(Number(date)).setHours(0, 0, 0, 0)
        ) {
          if (el.isOnschool == "0") {
            onSchoolNumber++;
            detailInfo_onSchoolNumber.push({
              ...element,
              temperatureList: el,
            });
          } else {
            leaveSchoolNumber++;
            detailInfo_leaveSchoolNumber.push({
              ...element,
              temperatureList: el,
            });
          }
          if (Number(el.temperature) > 37.3) {
            abnormalTemperature++;
            detailInfo_abnormalTemperature.push({
              ...element,
              temperatureList: el,
            });
          } else {
            normalTemperature++;
            detailInfo_normalTemperature.push({
              ...element,
              temperatureList: el,
            });
          }
        }
      });
    });
    return res.send({
      status: 0,
      msg: "查询成功",
      DetailInfo: {
        0: detailInfo_onSchoolNumber,
        1: detailInfo_leaveSchoolNumber,
        2: detailInfo_normalTemperature,
        3: detailInfo_abnormalTemperature,
        4: detailInfo_needNAT,
        5: detailInfo_hasNAT,
      },
    });
  });
};

// post请求，主要是插入Notification
router.insertNotificationInfo = function (req, res) {
  const idcard = req.query.idcard;
  const body = req.body;
  const sqlStr = `update student_info set NotificationList = 
  JSON_ARRAY_APPEND(NotificationList, '$', 
  '{"isNotification": \"${body.isNotification}\","NotificationTime": \"${body.NotificationTime}\","NotificationMessage": \"${body.NotificationMessage}\"}') 
  where idcard = ?  `;
  db.query(sqlStr, idcard, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.affectedRows == 0)
      return res.send({
        status: 1,
        msg: "通知失败",
      });
    return res.send({
      status: 0,
      msg: "通知成功", // 通知成功
    });
  });
};

// 请求Notification
router.getNotificationInfo = function (req, res) {
  const sqlStr = "select idcard, name, NotificationList from student_info";
  const notificationData = [];
  db.query(sqlStr, (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length == 0)
      return res.send({
        status: 1,
        msg: "查询为空, 无此字段的信息",
      });
    results.forEach((element) => {
      if (element.NotificationList != "null") {
        notificationData.push(element);
      }
    });
    return res.send({
      status: 0,
      msg: "查询成功",
      notificationData: notificationData,
    });
  });
};

// 删除Notification
router.delNotificationInfo = function (req, res) {
  var notificationData = [];
  // 如果是特定删除的话
  if (Object.keys(req.query).length !== 0) {
    const params = req.query["0"].split("&");
    const idcard = params[0].split("=")[1];
    const notificationId = params[1].split("=")[1];
    // 删除所有的通知，而删除特定通知则需要遍历JSON数组，并将特定的JSON数组给删除掉
    const queryStr =
      "select NotificationList from student_info where idcard = ?";
    db.query(queryStr, idcard, (err, results) => {
      if (err)
        return res.send({
          status: 1,
          msg: err.message,
        });
      if (results.length == 0)
        return res.send({
          status: 1,
          msg: "查询为空或没有该字段",
        });
      notificationData = JSON.parse(results[0].NotificationList);
      notificationData = notificationData.filter((element) => {
        return (
          element == null ||
          JSON.parse(element).NotificationTime != notificationId
        ); // 如果是null直接返回null
      });
      notificationData = JSON.stringify(notificationData);
      const sqlStr =
        "update student_info set NotificationList = ? where idcard = ?";
      db.query(sqlStr, [notificationData, idcard], (err, results) => {
        if (err)
          return res.send({
            status: 1,
            msg: err.message,
          });
        return res.send({
          status: 0,
          msg: "已清除该通知消息",
        });
      });
    });
  } else {
    const sqlStr = "update student_info set NotificationList = 'null'";
    db.query(sqlStr, (err, results) => {
      if (err)
        return res.send({
          status: 1,
          msg: err.message,
        });
      return res.send({
        status: 0,
        msg: "已清除所有的通知消息",
      });
    });
  }
};

module.exports = router;
