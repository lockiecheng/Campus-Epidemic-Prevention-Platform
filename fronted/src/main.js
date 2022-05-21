import Vue from "vue";
import App from "./App.vue";
import {
  Tabs,
  TabPane,
  Input,
  Button,
  Alert,
  Col,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Avatar,
  Message,
  Table,
  TableColumn,
  Tag,
  Checkbox,
  MessageBox,
  Popover,
  Descriptions,
  DescriptionsItem,
  Switch,
  DatePicker,
  Notification,
  Tooltip,
  Pagination,
  Form,
  FormItem,
  Loading,
  Option,
  Select,
  Link,
  Collapse,
  CollapseItem,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Dialog,
  Upload,
} from "element-ui"; // 按需引入element-ui组件库

import VueScroller from "vue-scroller"; // 引入scroller
Vue.use(VueScroller);

// 全局引入Echarts
import * as echarts from "echarts";

// 引入json-excel插件
import JsonExcel from "vue-json-excel";
Vue.component("downloadExcel", JsonExcel);

// 登录和注册页的element组件
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Input);
Vue.use(Button);
Vue.use(Alert);

// AdminPanel页导航栏的element组件
Vue.use(Avatar);
Vue.use(Col);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);

// AdminPanel 管理员操作的组件
Vue.use(Dropdown);
Vue.use(DropdownItem);
Vue.use(DropdownMenu);
Vue.use(Dialog);
Vue.use(Upload);

// AdminPanel子页 ==> 学生管理界面的element组件
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Tag);
Vue.use(Checkbox);
Vue.use(DatePicker);

// 每个学生的管理界面的element组件
Vue.use(Popover);
Vue.use(Descriptions);
Vue.use(DescriptionsItem);
Vue.use(Switch);

// 学生流调信息界面的element组件
Vue.use(Tooltip);
Vue.use(Pagination);

// 教师管理界面的element组件
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Loading);

// 学院管理的element组件
Vue.use(Option);
Vue.use(Select);
Vue.use(Link);

// 通知界面的element组件
Vue.use(Collapse);
Vue.use(CollapseItem);

// 引入路由机制
import VueRouter from "vue-router";
import router from "./router/index";

Vue.use(VueRouter);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  router: router, // 挂载路由
  beforeCreate() {
    // vm原型对象中添加总线，此时每个vc都拥有vm原型对象的所有属性
    Vue.prototype.$bus = this;
    Vue.prototype.$message = Message; // 确保每个vc都能有this.$message属性，以访问element-ui的方法
    Vue.prototype.$alert = MessageBox;
    Vue.prototype.$echarts = echarts;
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$notify = Notification;
    Vue.prototype.$loadings = Loading;
    Vue.prototype.$prompt = MessageBox.prompt;
  },
}).$mount("#app");
