const express = require("express");
const router = express.Router();

const routerHandler = require("../router_handle/getTeacherInfo");

router.get("/getTeacherInfoByDate", routerHandler.getTeacherInfoByDate); // get请求

router.get("/getTeacherTempList", routerHandler.getTeacherTempList);

module.exports = router;
