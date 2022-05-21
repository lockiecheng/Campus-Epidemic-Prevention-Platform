const express = require("express");
const cors = require("cors");
const app = express();

// token中间件
const expressJWT = require("express-jwt");

app.use(cors()); // 允许跨域
app.use(express.urlencoded({ extended: false })); // 只能解析x-www类型的表单数据

// 配置解析token的中间件
// 除了api开头的不需要身份认证外，其余的都需要身份认证
app.use(
  expressJWT({ secret: "zhuchengzhuchengheiheihei. ^_^" }).unless({
    path: [/^\/api\//],
  })
);

// 导入并使用router
const userRouter = require("./router/user");
const updateInfo = require("./router/updateInfo"); // 修改学生界面的在校状态
const userTempList = require("./router/getTempList"); // 学生界面的主要信息
const userPrintInfo = require("./router/getFootprintInfo"); // 获得流调信息
const teacherInfo = require("./router/getTeacherInfo"); // 教师界面的主要信息
const updateTeacherInfo = require("./router/updateTeacherInfo"); // 修改老师界面的在校状态
const getDepartmentInfo = require("./router/getDepartmentInfo");

// 挂载
app.use("/api", userRouter);
app.use("/my", updateInfo);
app.use("/my", userTempList);
app.use("/my", userPrintInfo);
app.use("/my", teacherInfo);
app.use("/my", updateTeacherInfo);
app.use("/my", getDepartmentInfo);

// 定义错误中间件
app.use(function (err, req, res, next) {
  // 捕获身份认证失败错误
  if (err.name == "UnauthorizedError")
    return res.send({
      status: 1,
      msg: "身份认证失败",
    });
  // 未知错误
  return res.send({
    status: 1,
    msg: err.message,
  }); // 响应未知错误
});

app.listen(3000, () => {
  console.log("listen at 3000"); // 端口开启在3000
});
