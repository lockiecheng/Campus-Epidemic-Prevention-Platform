<template>
  <div class="main">
    <!-- 搜索框 -->
    <div class="search">
      <template>
        <el-select
          v-model="selectOption"
          clearable
          placeholder="请选择查询方式"
          size="small"
          class="search-method"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <div class="search-panel">
          <!-- 精准查询 -->
          <el-input
            style="width: 300px"
            placeholder="使用学号/工号进行查询"
            prefix-icon="el-icon-search"
            v-model="searchValue"
            clearable
            size="small"
            v-if="selectOption === 'precise'"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getSearch(searchValue)"
            ></el-button>
          </el-input>
          <!-- 模糊查询 -->
          <el-form
            :inline="true"
            :model="formInline"
            class="demo-form-inline"
            size="small"
            v-else-if="selectOption === 'blur'"
          >
            <el-form-item label="院系">
              <el-select
                v-model="formInline.department"
                @change="getClassList(formInline.department)"
                @click.native="getDepartmentList()"
                :loading="loading"
              >
                <el-option
                  :label="department.departmentName"
                  :value="department.departmentId"
                  v-for="department in departmentList"
                  :key="department.departmentId"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 班级的信息是根据院系来进行查询 -->
            <el-form-item label="班级">
              <el-select
                v-model="formInline.class"
                placeholder="请选择班级"
                clearable
              >
                <el-option
                  :label="classItem.className"
                  :value="classItem.classId"
                  v-for="classItem in classList"
                  :key="classItem.classId"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
    </div>
    <!-- 结果展示框 -->
    <div class="result" v-show="resultblurShow">
      <!-- 日期 -->
      <div class="block">
        <el-date-picker
          v-model="date"
          align="left"
          type="date"
          placeholder="选择日期"
          :picker-options="pickerOptions"
          value-format="timestamp"
          size="small"
        >
        </el-date-picker>
      </div>
      <!-- 结果展示 -->
      <div class="result-list">
        <div class="result-info">
          <el-descriptions
            class="margin-top"
            title="详细信息"
            :column="3"
            size="large"
            :labelStyle="Label"
            :contentStyle="Content"
            border
          >
            <el-descriptions-item
              :label="item.name"
              v-for="(item, index) in descriptionsData"
              :key="index"
            >
              <el-link
                type="success"
                :disabled="item.value <= 0"
                @click="
                  showDetailInfo(
                    index,
                    date,
                    formInline.department,
                    formInline.class
                  )
                "
                >{{ item.value }}
                <i
                  class="el-icon-view el-icon--right"
                  v-show="clickIndex == index"
                ></i>
              </el-link>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <div
          ref="chart"
          style="width: 400px; height: 200px"
          class="pipe-chart"
        ></div>
      </div>
      <!-- 表格具体结果展示 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        height="300"
        :default-sort="{ prop: 'idcard', order: 'ascending' }"
      >
        <el-table-column prop="idcard" label="学号" width="80" sortable>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="80" sortable>
        </el-table-column>
        <el-table-column prop="class" label="班级" width="120">
        </el-table-column>
        <el-table-column prop="department" label="院系" width="160">
        </el-table-column>
        <el-table-column prop="conductor" label="导师" width="80">
        </el-table-column>
        <el-table-column prop="phoneNumber" label="联系方式" width="120">
        </el-table-column>
        <el-table-column prop="NATResult" label="近期核检结果" width="120">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.NATResult === '阴性' ? 'success' : 'error'"
              disable-transitions
              >{{ scope.row.NATResult }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="NATTime" label="近期核检时间" width="170">
        </el-table-column>
        <el-table-column prop="NATCompany" label="近期核检地点" width="120">
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="notifyNAT(scope.$index, scope.row)"
              >通知核检<i
                class="el-icon-message-solid"
                style="color: #ff4040"
                v-show="scope.row.isNotification"
              ></i
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="result" v-show="resultpreciseShow"></div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import Qs from "qs";
export default {
  name: "DepartmentInfo",
  data() {
    return {
      searchValue: "",
      options: [
        {
          value: "precise",
          label: "精准查询",
        },
        {
          value: "blur",
          label: "模糊查询",
        },
      ],
      selectOption: "precise",
      formInline: {
        department: "",
        class: "",
      },
      departmentList: [],
      classList: [],
      loading: false,
      resultpreciseShow: false,
      resultblurShow: false,
      date: Date.now(),
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
      Content: {
        "text-align": "center", //文本居中
        "min-width": "100px", //最小宽度
        "word-break": "break-all", //过长时自动换行
        color: "#077A82",
        "font-weight": "600",
      },
      Label: {
        color: "#303133",
        "text-align": "center",
        "font-weight": "600",
        // height: "20px",
        "min-width": "100px",
        "word-break": "keep-all",
      },
      descriptionsItemList: [
        "今日在校人数",
        "今日离校人数",
        "今日测温正常人数",
        "今日测温异常人数",
        "今日需要核酸检测人数",
        "今日已完成核酸检测人数",
      ],
      descriptionsData: [],
      detailInfo: [],
      tableData: [],
      clickIndex: -1,
      saveLastIndex: -1,
    };
  },
  computed: {
    token() {
      // 从localstorage中获得token
      return JSON.parse(localStorage.getItem("token"))["token"];
    },
  },
  methods: {
    getDepartmentList() {
      // 发送AJAX请求，请求院系的列表
      this.loading = true;
      axios({
        method: "GET",
        url: "http://localhost:3000/my/getDepartmentInfo",
        headers: {
          Authorization: this.token, // 将当前用户的token发送给后端进行验证
        },
      }).then(
        (response) => {
          if (response.data.status == 0) {
            // 接收数据
            this.departmentList = response.data.departmentList;
            this.loading = false;
          } else {
            this.$message({
              type: "error",
              message: response.data.msg,
            });
          }
        },
        (err) => {
          this.$message({
            type: "error",
            message: err.message,
          });
        }
      );
    },
    getClassList(departmenId) {
      // 根据id查找班级，只要选中了院系就会查找
      axios({
        method: "GET",
        url: `http://localhost:3000/my/getClassList?departmenId=${departmenId}`,
        headers: {
          Authorization: this.token, // 将当前用户的token发送给后端进行验证
        },
      }).then(
        (response) => {
          if (response.data.status == 0) {
            // 接收数据
            this.classList = JSON.parse(
              response.data.classList.departmentInfoList
            ); // 数组
          } else {
            this.$message({
              type: "error",
              message: response.data.msg,
            });
          }
        },
        (err) => {
          this.$message({
            type: "error",
            message: err.message,
          });
        }
      );
    },

    // 点击精准查询 ----暂时还没想好要做什么功能
    getSearch(value) {
      this.resultblurShow = false;
      this.resultpreciseShow = true;
      // value是学号/工号
    },
    // 点击模糊查询
    onSubmit() {
      // 请求数据，以饼状图显示
      // class: 班级ID  department: 院系的ID
      // 不同的字段进行查询结果不一样，现在只考虑同时以班级ID，和院系ID进行查询，则查询的结果是 某个院系某个班的数据
      this.resultpreciseShow = false; // 是否显示精准查询 是否显示模糊查询
      this.resultblurShow = true;
      this.clickIndex = -1; // 注意需要变成-1 不然每次重新刷新都有个小眼睛
      const departmentId = this.formInline.department;
      const classId = this.formInline.class;
      this.descriptionsData = [];
      this.detailInfo = [];
      this.tableData = []; // 防止重新选择之后下面的表格还是有数据
      axios({
        method: "GET",
        url: `http://localhost:3000/my/getStudentsListInfo?departmentId=${departmentId}&&classId=${classId}&&date=${this.date}`,
        headers: {
          Authorization: this.token, // 将当前用户的token发送给后端进行验证
        },
      }).then(
        (response) => {
          if (response.data.status == 0) {
            // 接收数据
            this.detailInfo = response.data.DetailInfo;
            for (var item in this.detailInfo) {
              this.descriptionsData.push({
                value: this.detailInfo[item].length, // 传入value value是长度
                name: this.descriptionsItemList[this.descriptionsData.length], // 传入key
              });
            }
            // 展示图表
            this.getEchartData();
          } else {
            this.$message({
              type: "error",
              message: response.data.msg,
            });
          }
        },
        (err) => {
          this.$message({
            type: "error",
            message: err.message,
          });
        }
      );
    },

    // 点击每个数字，可以得到对应的详细表格记录，并且要将当前的index背景变一下
    showDetailInfo(index) {
      // index是点击的第几个链接，也就是要请求的数据是什么数据
      this.clickIndex = index;
      this.saveLastIndex = index; // 保存最后一次点击的index，以便通知后自动触发该事件
      this.tableData = this.detailInfo[index]; // 第几个index
      if (this.tableData instanceof Array) {
        this.tableData.forEach((element) => {
          element.NATInfoList =
            typeof element.NATInfoList == "object"
              ? element.NATInfoList
              : JSON.parse(element.NATInfoList); // 否则JSON报错
          element.NATTime = moment(
            Number(element.NATInfoList[0].NATTime)
          ).format("YYYY-MM-DD HH:mm:ss");
          element.NATResult =
            element.NATInfoList[0].NATResult == "0" ||
            element.NATInfoList[0].NATResult == "阳性"
              ? "阳性"
              : "阴性";
          element.NATCompany = element.NATInfoList[0].NATCompany;
          element.NotificationList =
            element.NotificationList instanceof Object // 如果不是Object则有可能是JSON数据类型的
              ? element.NotificationList
              : JSON.parse(element.NotificationList); // 转换成Object
          element.NotificationList =
            element.NotificationList == null ? [] : element.NotificationList;
          if (element.NotificationList.length != 1) {
            // 如果长度不为1就说明有通知消息，开始遍历
            element.NotificationList.forEach((el) => {
              el = el == null || JSON.parse(el);
              if (
                new Date(
                  Number(el.NotificationTime) // 这个是最新的时间?
                ).setHours(0, 0, 0, 0) ==
                new Date(Date.now()).setHours(0, 0, 0, 0)
              ) {
                element.isNotification = true; // 今天已经通知过了
              }
            });
          } else {
            element.isNotification = false;
          }
        });
      }
    },

    // 通知该学生核检
    notifyNAT(index, row) {
      // 点击通知核检，如果已经核检了就显示您于xxx通知了一次，是否还要通知? 然后显示通知成功
      // 通知核检，实际上是在student_info字段的NotificationNATList = ?
      this.$prompt("请输入通知消息", "提示", {
        confirmButtonText: "发送通知",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          if (value.trim() !== "") {
            axios({
              method: "POST",
              url: `http://localhost:3000/my/insertNotificationInfo?idcard=${row.idcard}`,
              headers: {
                Authorization: this.token, // 将当前用户的token发送给后端进行验证
              },
              data: Qs.stringify({
                isNotification: "0", //
                NotificationTime: Date.now(), // 通知消息的发送时间
                NotificationMessage: value,
              }),
            }).then(
              (response) => {
                if (response.data.status == 0) {
                  this.$notify({
                    type: "success",
                    title: response.data.msg,
                  });
                  this.onSubmit();
                  // 需要设置异步请求，不然的话没有数据回来
                  setTimeout(() => {
                    this.showDetailInfo(this.saveLastIndex);
                  }, 0);
                } else {
                  this.$notify({
                    type: "error",
                    title: response.data.msg,
                  });
                }
              },
              (err) => {
                this.$message({
                  type: "error",
                  message: err.message,
                });
              }
            );
          } else {
            this.$message({
              type: "error",
              message: "通知消息不可为空",
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "通知消息不可为空",
          });
        });
    },

    // 图表展示
    getEchartData() {
      // 消除警告
      const chart = this.$refs.chart;
      if (chart) {
        let myChart = this.$echarts.getInstanceByDom(chart);
        if (myChart == null) {
          myChart = this.$echarts.init(chart);
        }
        // 饼状图
        const option = {
          title: {
            text: "防疫面板",
            left: "center",
          },
          tooltip: {
            trigger: "item",
          },
          series: [
            {
              name: "Access From",
              type: "pie",
              radius: "60%",
              data: this.descriptionsData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
            },
          ],
        };
        option && myChart.setOption(option);
        window.addEventListener("resize", function () {
          myChart.resize();
        });
      }
    },
  },
};
</script>

<style scoped>
.search {
  /* height: 100px; */
  border: 1px solid #ccc;
  background-color: #fff;
}

.search-method {
  margin-left: 12px;
  margin-top: 10px;
}

.search-panel {
  height: 40px;
  margin-left: 12px;
  margin-top: 10px;
}

/* 结果展示部分 */
.result {
  background-color: #fff;
  margin-top: 10px;
  padding: 4px;
}
.result-list {
  position: relative;
  width: 100%;
}

.block {
  margin-top: 10px;
  margin-left: 10px;
}

.pipe-chart {
  position: absolute;
  left: 67.5%;
  top: -15%;
}

.result-info {
  width: 800px;
  height: 180px;
  margin-top: 20px;
  margin-left: 10px;
}

.el-link {
  font-weight: 800;
}
</style>
