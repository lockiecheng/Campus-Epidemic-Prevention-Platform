<template>
  <div>
    <!-- 日期组件 -->
    <template>
      <div class="block">
        <el-date-picker
          v-model="date"
          align="left"
          type="date"
          placeholder="选择日期"
          :picker-options="pickerOptions"
          value-format="timestamp"
        >
        </el-date-picker>
      </div>
    </template>

    <!-- 老师表格信息，父表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      row-key="idcard"
      @expand-change="expandChange"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'idcard', order: 'ascending' }"
    >
      >
      <el-table-column type="expand">
        <!-- 扩展表格信息（主要是所在册的学生信息） -->
        <template slot-scope="props">
          <el-table
            :data="props.row.studentData"
            style="width: 100%"
            height="400"
            size="small"
            border
            class="expand_body"
            v-loading="props.row.loading"
          >
            >
            <el-table-column prop="idcard" label="学号" width="80">
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="80">
            </el-table-column>
            <el-table-column prop="phoneNumber" label="联系方式" width="120">
            </el-table-column>
            <el-table-column prop="isOnschool" label="是否在校" width="80">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.isOnschool === '是' ? 'success' : 'error'"
                  disable-transitions
                  >{{ scope.row.isOnschool }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column prop="temperature" label="测温温度" width="120">
            </el-table-column>
            <el-table-column prop="temMeaTime" label="测温时间" width="160">
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template slot-scope="scope">
                <el-popover
                  placement="left"
                  trigger="click"
                  @after-enter="getEchartData(scope.row.idcard)"
                  @after-leave="cancleProp()"
                  :close-delay="10"
                >
                  <!-- 个人信息描述 -->
                  <div>
                    <el-descriptions
                      class="margin-left"
                      title="学生详细信息"
                      :column="3"
                      size="small"
                      border
                    >
                      <el-descriptions-item>
                        <template slot="label">
                          <i class="el-icon-user"></i>
                          姓名
                        </template>
                        {{ scope.row.name }}
                      </el-descriptions-item>
                      <el-descriptions-item>
                        <template slot="label">
                          <i class="el-icon-mobile-phone"></i>
                          手机号
                        </template>
                        {{ scope.row.phoneNumber }}
                      </el-descriptions-item>
                      <el-descriptions-item>
                        <template slot="label">
                          <i class="el-icon-office-building"></i>
                          所在院系
                        </template>
                        {{ scope.row.department }}
                      </el-descriptions-item>
                      <el-descriptions-item>
                        <template slot="label">
                          <i class="el-icon-tickets"></i>
                          导师
                        </template>
                        <el-tag size="small">{{ scope.row.conductor }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item>
                        <template slot="label">
                          <i class="el-icon-location-outline"></i>
                          联系地址
                        </template>
                        江苏省无锡市东南大学无锡国际校区
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                  <!-- 测量温度曲线图 -->
                  <!-- showTempLine需要动态绑定ref -->
                  <div class="line-switch">
                    <el-switch
                      style="display: block"
                      v-model="showTempLine"
                      active-color="#13ce66"
                      inactive-color="#ff4949"
                      active-text="查看近七天测温曲线"
                    >
                    </el-switch>
                  </div>
                  <div
                    :ref="scope.row.idcard"
                    style="width: 400px; height: 300px; margin-left: 40px"
                    v-show="showTempLine"
                  ></div>
                  <el-button
                    slot="reference"
                    @click="handleClickByTeacher(scope.row)"
                    type="text"
                    size="small"
                    >查看</el-button
                  >
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="idcard" label="工号" width="80" sortable>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="80" sortable>
      </el-table-column>
      <el-table-column prop="department" label="院系" width="150">
      </el-table-column>
      <el-table-column prop="isTemMea" label="是否测温" width="80">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isTemMea === '是' ? 'success' : 'error'"
            disable-transitions
            >{{ scope.row.isTemMea }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="temperature" label="测温温度" width="120">
      </el-table-column>
      <el-table-column prop="temMeaTime" label="测温时间" width="160">
      </el-table-column>
      <el-table-column prop="isOnschool" label="是否在校" width="80">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isOnschool === '是' ? 'success' : 'error'"
            disable-transitions
            >{{ scope.row.isOnschool }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="phoneNumber" label="联系方式" width="120">
      </el-table-column>
      <el-table-column
        prop="registerGraduateStudentNumber"
        label="在册研究生人数"
        width="80"
      >
        <template slot-scope="scope">
          <el-tag type="warning" disable-transitions>{{
            scope.row.registerGraduateStudentNumber
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="isNAT"
        label="是否核检"
        width="80"
        :filters="[
          { text: '是', value: '是' },
          { text: '否', value: '否' },
        ]"
        :filter-method="filterTag"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isNAT === '是' ? 'success' : 'error'"
            disable-transitions
            >{{ scope.row.isNAT }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-popover
            placement="left"
            trigger="click"
            @after-enter="getEchartData(scope.row.idcard)"
            @after-leave="cancleProp()"
            :close-delay="10"
          >
            <!-- 个人信息描述 -->
            <div>
              <el-descriptions
                class="margin-left"
                title="老师信息"
                :column="3"
                size="small"
                border
              >
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-user"></i>
                    姓名
                  </template>
                  {{ scope.row.name }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-mobile-phone"></i>
                    手机号
                  </template>
                  {{ scope.row.phoneNumber }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-office-building"></i>
                    所在院系
                  </template>
                  {{ scope.row.department }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-location-outline"></i>
                    家庭住址
                  </template>
                  江苏省无锡市锡山区
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class=" el-icon-location-outline"></i>
                    办公地址
                  </template>
                  无锡校区行政楼209室
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <!-- 测量温度曲线图 -->
            <!-- showTempLine需要动态绑定ref -->
            <div class="line-switch">
              <el-switch
                style="display: block"
                v-model="showTempLine"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="查看近七天测温曲线"
              >
              </el-switch>
            </div>
            <div
              :ref="scope.row.idcard"
              style="width: 400px; height: 300px; margin-left: 40px"
              v-show="showTempLine"
            ></div>
            <el-button
              slot="reference"
              @click="handleClick(scope.row)"
              type="text"
              size="small"
              >查看</el-button
            >
          </el-popover>
          <!-- 另一个按钮的popover -->
          <el-button
            type="text"
            size="small"
            @click="updateTeacherStatus(scope.$index, scope.row)"
            >修改</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import Qs from "qs";
export default {
  name: "TeacherInfo",
  props: ["userData", "pickDate"],
  data() {
    return {
      loading: false,
      multipleSelection: [],
      temperatureList: [],
      showTempLine: false,
      rowId: null,
      showList: this.userData,
      // 日期选择器
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      date: this.pickDate, // 默认显示的是最新的时间，由父组件传递过来
    };
  },
  watch: {
    userData: {
      deep: true,
      immediate: true,
      handler(newValue) {
        this.showList = newValue;
      },
    },
    date: {
      // 监视date是否发生变化
      handler(newValue, oldValue) {
        // 更新后触发回调函数，获取用户信息
        this.$bus.$emit(
          "getTeacherInfo",
          newValue,
          this.$route.query.teacherStatus
        );
      },
    },
  },
  computed: {
    token() {
      // 从localstorage中获得token
      return JSON.parse(localStorage.getItem("token"))["token"];
    },
    tableData: {
      // 要做一些处理，包括把判断是否的列表项，0表示是，1表示否，测温时间从时间戳转换为时间，同时还要把温度换成当前的温度
      get() {
        if (this.showList instanceof Array) {
          this.showList.forEach((element) => {
            element.temperature =
              typeof element.temperature == "string"
                ? element.temperature
                : element.temperature + "℃";
            element.isTemMea =
              element.isTemMea == 0 || element.isTemMea == "是" ? "是" : "否"; // 这儿有问题，会变成否，bug已修复
            element.isOnschool =
              element.isOnschool == 0 || element.isOnschool == "是"
                ? "是"
                : "否";
            element.isNAT = element.isNAT == 0 || element.isNAT ? "是" : "否";
            element.temMeaTime = moment(element.temMeaTime).format(
              // 这里无需对element.temMeaTime进行Number转数字型，因为后盾返回的已经格式化
              "YYYY-MM-DD HH:mm:ss"
            );
            // // 加入一个全新的属性，即子节点
            // if (element.registerGraduateStudentNumber > 0) {
            //   element.hasChildren = true; // 是否为true要根据所注册的研究生人数来判断
            // }
          });
          return this.showList;
        }
        return [];
      },
    },
    tempListFormat() {
      // 日期： 只统计最近七天的日期
      var len =
        this.temperatureList.length > 7 ? 7 : this.temperatureList.length;
      var tempDateList = [];
      var tempValueList = [];
      for (var i = 0; i < len; i++) {
        tempDateList.push(
          moment(Number(this.temperatureList[i].temMeaTime)).format(
            // 日期需要格式化
            "MM-DD"
          )
        );
        tempValueList.push(Number(this.temperatureList[i].temperature)); // temperatureList需要格式化，因为返回的均是字符型
      }
      return {
        tempDateList,
        tempValueList,
      };
    },
  },
  methods: {
    filterTag(value, row) {
      return row.isNAT === value;
    },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getEchartData(id) {
      // 消除警告
      const chart = this.$refs[id];
      if (chart) {
        let myChart = this.$echarts.getInstanceByDom(chart);
        if (myChart == null) {
          myChart = this.$echarts.init(chart);
        }
        const option = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
          },
          legend: {},
          xAxis: {
            type: "category",
            axisTick: {
              alignWithLabel: true,
            },
            data: this.tempListFormat["tempDateList"],
          },

          yAxis: {
            type: "value",
            name: "温度",
            position: "left",
            axisLabel: {
              formatter: "{value} °C",
            },
          },
          // 纵坐标数据
          series: [
            {
              name: "温度",
              type: "line",
              smooth: true,
              yAxisIndex: 0,
              data: this.tempListFormat["tempValueList"],
            },
          ],
        };
        option && myChart.setOption(option);
        window.addEventListener("resize", function () {
          myChart.resize();
        });
      }
    },
    cancleProp() {
      // 当popver弹出框消失后，将所有的状态变为false
      this.showTempLine = false;
    },
    // 点击查看
    handleClick(row) {
      this.rowId = row;
      axios({
        method: "GET",
        url: `http://localhost:3000/my/getTeacherTempList?idcard=${this.rowId.idcard}`, // 获取温度曲线
        headers: {
          Authorization: this.token, // 需要验证
        },
      }).then(
        (response) => {
          // 请求成功则收到服务端的测量温度的记录
          this.temperatureList = JSON.parse(
            response.data.tempList[0].temperatureList
          );
        },
        (err) => {
          console.log(err.message);
        }
      );
    },
    // 点击修改====》修改老师的在校状态
    updateTeacherStatus(index, row) {
      this.$confirm(
        `此操作将修改<span style="color: #409EFF; font-weight: bold">${row.name}</span>老师的在校状态, 是否继续?`,
        "提示",
        {
          confirmButtonText: "修改",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true,
          distinguishCancelAndClose: true,
        }
      )
        .then(() => {
          // 点击确认修改
          axios({
            method: "POST",
            url: "http://localhost:3000/my/updateTeacherInfo", // 修改老师在校状态
            headers: {
              Authorization: this.token, // 需要验证
            },
            data: Qs.stringify({
              idcard: row.idcard, // 不用转换为字符型
              isOnschool: row.isOnschool == "是" ? 1 : 0, // 这里要注意，界面中的siOnschool已经被格式化为 是 或者 否
              temMeaTime: Date.parse(String(row.temMeaTime)), // 修改时要修改特定日期下的在校状态
            }),
          }).then(
            (response) => {
              // console.log(response.data);
              if (response.data.status == 0) {
                this.$notify({
                  title: "成功",
                  message: response.data.msg,
                  type: "success",
                });
                // this.showList.splice(index, 1); // 需要将当前行删除，这段代码有bug，会默认把其他的行状态也给down掉
                this.$bus.$emit(
                  "getTeacherInfo",
                  this.date,
                  this.$route.query.teacherStatus
                ); // 触发侧边按钮事件，传递两个参数，一个日期，一个是状态
              } else {
                this.$notify({
                  title: "失败",
                  message: response.data.msg,
                  type: "error",
                });
              }
            },
            (err) => {
              this.$notify({
                title: "失败",
                message: err.msg,
                type: "error",
              });
            }
          );
        })
        .catch(() => {
          // 取消修改的回调函数
          this.$message({
            type: "info",
            message: "已取消修改",
          });
        });
    },

    // 点击扩展状态时展示详细信息
    expandChange(row) {
      if (!row.studentData) {
        this.$set(row, "loading", true);
        // 异步操作，向后端发送AJAX请求
        axios({
          method: "GET",
          url: `http://localhost:3000/my/getRegistryStudentInfo?conductorName=${row.name}`,
          headers: {
            Authorization: this.token, // 将当前用户的token发送给后端进行验证
          },
        }).then(
          (response) => {
            if (response.data.status == 0) {
              // 拿到数据
              row.studentData = response.data.studentData; // 获得数组
              // 需要格式化
              row.studentData.forEach((element) => {
                element.isNAT =
                  element.isNAT == 0 || element.isNAT == "是" ? "是" : "否";
                // 默认提取最近的即可
                element.temperatureList = JSON.parse(element.temperatureList);
                element.isOnschool =
                  element.temperatureList[0].isOnschool == 0 ||
                  element.temperatureList[0].isOnschool == "是"
                    ? "是"
                    : "否";
                element.temperature =
                  element.temperatureList[0].temperature + "℃";
                element.temMeaTime = moment(
                  Number(element.temperatureList[0].temMeaTime)
                ).format("YYYY-MM-DD HH:mm:ss");
              });
              this.$set(row, "loading", false); // 成功设置为false
            } else {
              this.$message({
                type: "error",
                message: response.data.msg,
              });
            }
          },
          (err) => {
            this.$set(row, "loading", false); // 成功设置为false，懒加载完毕
            this.$message({
              type: "error",
              message: err.message,
            });
          }
        );
      }
    },

    // 导师点击学生列表的查看按钮时
    handleClickByTeacher(row) {
      this.temperatureList = row.temperatureList;
    },
  },
  mounted() {
    // 挂载的时候也要调用一次，不然会出现问题
    this.$bus.$emit(
      "getTeacherInfo",
      this.date,
      this.$route.query.teacherStatus
    );
  },
};
</script>

<style scoped>
.line-switch {
  margin-top: 10px;
  font-size: 10px;
}

/* 扩展表格的样式 */
.expand_body {
  margin-left: 50px;
}
.expand_title {
  font-size: 16px;
  font-weight: 600;
}
</style>
