<template>
  <div>
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

    <template>
      <download-excel
        class="export-excel-wrapper"
        :data="tableData"
        :fields="json_fields"
        :header="title"
        :name="title + '.xls'"
      >
        <el-button class="toExcel-btn" type="success">导出为Excel</el-button>
      </download-excel>
    </template>

    <el-table
      :data="tableData"
      style="width: 100%"
      height="600"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'idcard', order: 'ascending' }"
    >
      <el-table-column type="selection" width="40"> </el-table-column>
      <el-table-column prop="idcard" label="学号" width="80" sortable>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="80" sortable>
      </el-table-column>
      <el-table-column prop="class" label="班级" width="120"> </el-table-column>
      <el-table-column prop="department" label="院系" width="150">
      </el-table-column>
      <el-table-column prop="conductor" label="导师" width="80">
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
      <!-- 是否核检？ -->
      <el-table-column
        prop="isNAT"
        label="今日是否核检"
        width="120"
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
      <!-- 是否需要核检？ -->
      <el-table-column
        prop="isNeedNAT"
        label="是否需要核检"
        width="120"
        :filters="[
          { text: '是', value: '是' },
          { text: '否', value: '否' },
        ]"
        :filter-method="filterTagNeedNAT"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isNeedNAT === '是' ? 'success' : 'error'"
            disable-transitions
            >{{ scope.row.isNeedNAT }}</el-tag
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
                title="学生信息"
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
                  江苏省南京市东南大学九龙湖校区
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
            @click="updateStudentStatus(scope.$index, scope.row)"
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
  name: "StudentInfo",
  props: ["userData", "pickDate"],
  data() {
    return {
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
      // 日历时间
      date: this.pickDate, // 默认显示的是最新的时间，由父组件传递过来
      // 导出excel文本
      title: `在校生信息表`, // xx年xx月xx日在校生信息表?
      // 表头
      title: "信息表",
      json_fields: {
        学号: "idcard",
        姓名: "name",
        班级: "class",
        院系: "department",
        导师: "conductor",
        是否测温: "isTemMea",
        测温温度: "temperature",
        测温时间: "temMeaTime",
        是否在校: "isOnschool",
        联系方式: "phoneNumber",
      },
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
      deep: true,
      handler(newValue, oldValue) {
        // 更新后触发回调函数，获取用户信息
        this.$bus.$emit(
          "getStudentInfo",
          newValue,
          this.$route.query.studentStatus
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
            element.isTemMea = element.isTemMea == 0 ? "是" : "否";
            element.isOnschool = element.isOnschool == 0 ? "是" : "否";
            element.isNAT = element.isNAT == 0 ? "是" : "否";
            element.isNeedNAT = element.isNeedNAT == 0 ? "是" : "否";
            element.temMeaTime = moment(element.temMeaTime).format(
              // 这里无需对element.temMeaTime进行Number转数字型，因为后盾返回的已经格式化
              "YYYY-MM-DD HH:mm:ss"
            );
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
    filterTagNeedNAT(value, row) {
      return row.isNeedNAT === value;
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
    getDate(currentSelectedDate) {
      // 默认选择的是今天的日期，如果点击选择日期，那么发送AJAX请求，提取出所选择日期的所有数据
      axios({
        method: "GET",
        url: `http://localhost:3000/my/getInfobyDate?date=${currentSelectedDate}&&studentStatus=${this.$route.query.studentStatus}`,
        headers: {
          Authorization: this.token, // 需要验证
        },
      }).then(
        (response) => {
          this.showList = response.data.resultsByDate;
        },
        (err) => {
          console.log(err.message);
        }
      );
    },
    // 点击查看
    handleClick(row) {
      this.rowId = row;
      // 管理员在操作栏点击查看后，可以查看当前李六的个人信息和近七天测量温度的记录，点击编辑后，弹出一个box框，可以对是否在校，是否测温的信息进行更改
      axios({
        method: "GET",
        url: `http://localhost:3000/my/getTempList?idcard=${this.rowId.idcard}`,
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
    // 点击修改====》修改学生的在校状态
    updateStudentStatus(index, row) {
      this.$confirm(
        `此操作将修改<span style="color: #409EFF; font-weight: bold">${row.name}</span>同学的在校状态, 是否继续?`,
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
          // 修改成功的回调函数
          // 状态修改时，需要拿到当前的学生的状态row.idcard,  row.isOnschool, 和日期 row.temMeaTime，发送数据到后端进行修改
          axios({
            method: "POST",
            url: "http://localhost:3000/my/updateInfo",
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
                  "getStudentInfo",
                  this.date,
                  this.$route.query.studentStatus
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
  },
  mounted() {
    // 挂载的时候也要调用一次，不然会出现问题
    this.$bus.$emit(
      "getStudentInfo",
      this.date,
      this.$route.query.studentStatus
    );
  },
};
</script>

<style scoped>
.line-switch {
  margin-top: 10px;
  font-size: 10px;
}

.export-excel-wrapper {
  position: absolute;
  width: 40px;
  top: 10px;
  right: 80px;
}
</style>
