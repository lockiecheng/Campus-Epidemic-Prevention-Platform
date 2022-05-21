const express = require("express");
const router = express.Router();

const routerHandler = require("../router_handle/getDepartmentInfo");

router.get("/getDepartmentInfo", routerHandler.getDepartmentInfo);

router.get("/getClassList", routerHandler.getClassList);

router.get("/getStudentsListInfo", routerHandler.getStudentsListInfo);

router.post("/insertNotificationInfo", routerHandler.insertNotificationInfo);

router.get("/getNotificationInfo", routerHandler.getNotificationInfo);

router.delete("/delNotificationInfo", routerHandler.delNotificationInfo);

module.exports = router;
