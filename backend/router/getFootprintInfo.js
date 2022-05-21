const express = require("express");
const router = express.Router();

const routerHandler = require("../router_handle/getFootprintInfo");

router.get("/getFootprintInfo", routerHandler.getFootprintInfo);

module.exports = router;
