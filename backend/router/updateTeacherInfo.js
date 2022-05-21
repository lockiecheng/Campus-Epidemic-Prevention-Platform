const express = require("express");
const router = express.Router();

const updateInfoHandler = require("../router_handle/updateTeacherInfo");

// 老师管理界面的数据请求
router.post("/updateTeacherInfo", updateInfoHandler.updateTeacherInfo);

module.exports = router;
