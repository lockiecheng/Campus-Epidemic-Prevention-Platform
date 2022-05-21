const express = require("express");
const router = express.Router();

const userTempListHandler = require("../router_handle/getTempList"); // 路由处理函数

router.get("/getTempList", userTempListHandler.getTempList);

router.get("/getInfobyDate", userTempListHandler.getInfobyDate);

router.get(
  "/getRegistryStudentInfo",
  userTempListHandler.getRegistryStudentInfo
);

module.exports = router;
