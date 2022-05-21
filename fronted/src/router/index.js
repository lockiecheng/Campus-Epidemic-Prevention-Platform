// 该文件用于创建整个应用的路由器
import VueRouter from "vue-router";
import Home from "../pages/Home";
import AdminPanel from "../pages/AdminPanel";
import StudentInfo from "../pages/StudentInfo";
import FootprintInfo from "../pages/FootprintInfo";
import TeacherInfo from "../pages/TeacherInfo";
import DepartmentInfo from "../pages/DepartmentInfo";
import NotificationInfo from "../pages/NotificationInfo";

// 捕获因多次访问同一个路由路径而出现的异常
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

// 创建一个路由器
const router = new VueRouter({
  mode: "history",
  routes: [
    // 不同的路由
    { name: "home", path: "/", component: Home },
    {
      name: "admin-panel",
      path: "/admin-panel",
      component: AdminPanel,
      children: [
        {
          name: "student-info",
          path: "student-info",
          component: StudentInfo,
        },
        {
          name: "footprint-info",
          path: "footprint-info",
          component: FootprintInfo,
        },
        {
          name: "teacher-info",
          path: "teacher-info",
          component: TeacherInfo,
        },
        {
          name: "department-info",
          path: "department-info",
          component: DepartmentInfo,
        },
        {
          name: "notification-info",
          path: "notification-info",
          component: NotificationInfo,
        },
      ],
    },
  ],
});

// 添加前置路由守卫; 在首页禁止后退
// 两种情况，如果是从首页中进入到管理界面，再从管理界面刷新，则判断是否存在token，如果存在token直接就放过
// 如果是在管理界面中，再刷新，则也放过
router.beforeEach((to, from, next) => {
  // 如果路由的去向不是home的话都得判断是否有token，如果没有就不允许返回
  // 因为退出登录的时候，会将token给删除掉，所以如果再返回的话，肯定是没有token的
  if (to.name !== "home") {
    if (!localStorage.getItem("token")) {
      // 说明没有退出 进入想进入的页面即可
      router.push({
        name: "home",
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
