const express = require("express");
const router = express.Router();

const updateInfoHandler = require("../router_handle/updateInfo");

// 学生管理界面的数据请求
router.post("/updateInfo", updateInfoHandler.updateInfo);

module.exports = router;
