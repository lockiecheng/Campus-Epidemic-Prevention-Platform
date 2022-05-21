<template>
  <div class="main">
    <!-- 搜索框 -->
    <el-input
      :placeholder="`输入${keyIdentification}进行查找`"
      prefix-icon="el-icon-search"
      v-model="searchValue"
      clearable
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="getFootprinInfo(searchValue)"
      ></el-button>
    </el-input>
    <!-- 学生流调信息表格页 -->
    <el-button
      class="getCalander"
      icon="el-icon-date"
      @click="getCalander"
      circle
    ></el-button>
    <transition name="calander">
      <div class="block" v-show="showCalander">
        <el-date-picker
          v-model="datePicker"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @click="getScope(scope.$index)"
        >
        </el-date-picker>
      </div>
    </transition>
    <!-- 表格body -->
    <template>
      <el-table
        :data="tableData.filter(getDateFilter)"
        style="width: 100%"
        max-height="500px"
        :default-sort="{ prop: 'temMeaTime', order: 'descending' }"
      >
        <el-table-column
          label="日期"
          prop="temMeaTime"
          sortable
          fixed
          width="120"
        >
        </el-table-column>
        <el-table-column :label="keyIdentification" prop="idcard">
        </el-table-column>
        <el-table-column label="姓名" prop="name"> </el-table-column>
        <el-table-column label="当日测温" prop="temperature"> </el-table-column>
        <el-table-column label="是否在校" prop="isOnschool">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.isOnschool === '是' ? 'success' : 'error'"
              disable-transitions
              >{{ scope.row.isOnschool }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="今天是否还在隔离期内" prop="isQuarantine">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.isQuarantine === '是' ? 'success' : 'error'"
              disable-transitions
              >{{ scope.row.isQuarantine }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="目前是否为疑似病例" prop="isSuspectedCase">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.isSuspectedCase === '是' ? 'success' : 'error'"
              disable-transitions
              >{{ scope.row.isSuspectedCase }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="目前是否为确诊病例" prop="isDiagnosed">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.isDiagnosed === '是' ? 'success' : 'error'"
              disable-transitions
              >{{ scope.row.isDiagnosed }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="近14天内有无新冠肺炎病例或无症状感染者报告社区的旅行史"
          prop="isTravelhistoryPastFourten"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isTravelhistoryPastFourten === '是'
                  ? 'success'
                  : 'error'
              "
              disable-transitions
              >{{ scope.row.isTravelhistoryPastFourten }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="近14天内有无与新型冠状病毒感染患者或无症状感染者接触"
          prop="isNucleicAcidPositiveContact"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isNucleicAcidPositiveContact === '是'
                  ? 'success'
                  : 'error'
              "
              disable-transitions
              >{{ scope.row.isNucleicAcidPositiveContact }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="近14天内曾接触过来自有病例报告社区的发热或有呼吸道症状的人员"
          prop="isExposedToFeverPastFourten"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isExposedToFeverPastFourten === '是'
                  ? 'success'
                  : 'error'
              "
              disable-transitions
              >{{ scope.row.isExposedToFeverPastFourten }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="近14天内本人周边至少有2例发热/或有呼吸道症状的患者"
          prop="isAtLeastTwopatientsWithFever"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isAtLeastTwopatientsWithFever === '是'
                  ? 'success'
                  : 'error'
              "
              disable-transitions
              >{{ scope.row.isAtLeastTwopatientsWithFever }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="近7天内本人有无发热或呼吸道症状或其他不适"
          prop="isFeverPastSeven"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.isFeverPastSeven === '是' ? 'success' : 'error'"
              disable-transitions
              >{{ scope.row.isFeverPastSeven }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="目前是否居住在实施封闭、封控管理的小区或区域"
          prop="isLiveInClosedArea"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isLiveInClosedArea === '是' ? 'success' : 'error'
              "
              disable-transitions
              >{{ scope.row.isLiveInClosedArea }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="近14天内是否有进口冷链产品等物品接触史"
          prop="isContactWithColdChainProducts"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isContactWithColdChainProducts === '是'
                  ? 'success'
                  : 'error'
              "
              disable-transitions
              >{{ scope.row.isContactWithColdChainProducts }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="近28天内是否有国内外中高风险地区旅居史"
          prop="isTravelToHighRiskAreas"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isTravelToHighRiskAreas === '是' ? 'success' : 'error'
              "
              disable-transitions
              >{{ scope.row.isTravelToHighRiskAreas }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="24小时内密切接触人原中有无发热或呼吸道等症状的患者"
          prop="isCloseContactsFeverOrRespiratory"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isCloseContactsFeverOrRespiratory === '是'
                  ? 'success'
                  : 'error'
              "
              disable-transitions
              >{{ scope.row.isCloseContactsFeverOrRespiratory }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="今年以来本人有无与新冠肺炎相关的其他特殊情况"
          prop="isHaveSpecialCircumstances"
        >
          <template slot-scope="scope">
            <el-tag
              :type="
                scope.row.isHaveSpecialCircumstances === '是'
                  ? 'success'
                  : 'error'
              "
              disable-transitions
              >{{ scope.row.isHaveSpecialCircumstances }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          label="已经完成第一针新冠疫苗接种日期"
          prop="DateOfFirstCovidVaccinationCompleted.VaccinationDate"
          width="120"
        >
        </el-table-column>
        <el-table-column
          label="已经完成第一针新冠疫苗接种地点"
          prop="DateOfFirstCovidVaccinationCompleted.VaccinationAddress"
        >
        </el-table-column>
        <el-table-column
          label="已经完成第二针新冠疫苗接种日期"
          prop="DateOfSecondCovidVaccinationCompleted.VaccinationDate"
          width="120"
        >
        </el-table-column>
        <el-table-column
          label="已经完成第二针新冠疫苗接种地点"
          prop="DateOfSecondCovidVaccinationCompleted.VaccinationAddress"
        >
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <el-popover
              placement="left"
              trigger="click"
              :close-delay="10"
              transition="fade-in-linear"
              :open-delay="300"
            >
              <!-- 门铃码信息描述 -->
              <div>
                <el-descriptions
                  class="margin-left"
                  :column="2"
                  size="large"
                  border
                  :contentStyle="doorContent"
                  :label-style="doorLabel"
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
                      <i class="el-icon-key"></i>
                      当日测温
                    </template>
                    <el-tag type="success" disable-transitions>
                      {{ scope.row.temperature }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
                <el-descriptions
                  class="margin-left"
                  :column="3"
                  size="large"
                  border
                  v-for="doorList in scope.row.doorLists"
                  :key="doorList.doorId"
                  :contentStyle="doorContent"
                  :label-style="doorLabel"
                >
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-location"></i>
                      地点
                    </template>
                    <el-tag type="warning" disable-transitions>
                      {{ doorList.place }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-watch"></i>
                      进入时间
                    </template>
                    {{ doorList.enterTime }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-watch"></i>
                      离开时间
                    </template>
                    {{ doorList.leaveTime }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <el-button
                slot="reference"
                type="info"
                size="mini"
                @click="handleEdit(scope.$index, scope.row)"
                >门铃码</el-button
              >
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <!-- 底部分页 -->
    <!-- 每次动态的展示几条数据 -->
    <div class="pagination-block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[3, 10, 20, 30]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.showList.length"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Qs from "qs";
import moment from "moment";
export default {
  name: "FootprintInfo",
  data() {
    return {
      searchValue: "",
      datePicker: "",
      showCalander: false,
      showCalanderNumber: 0,
      showList: [], // 真正返回的经过处理后的List
      pageList: [], // 实际展示的List
      currentPage: 1,
      pageSize: 3, // 默认的pageSize
      // 门铃码信息 样式
      doorContent: {
        "text-align": "center", //文本居中
        "min-width": "160px", //最小宽度
        "word-break": "break-all", //过长时自动换行
        color: "#077A82",
        "font-weight": "600",
      },
      doorLabel: {
        color: "#303133",
        "text-align": "center",
        "font-weight": "600",
        // height: "20px",
        "min-width": "100px",
        "word-break": "keep-all",
      },
    };
  },
  computed: {
    token() {
      // 从localstorage中获得token
      return JSON.parse(localStorage.getItem("token"))["token"];
    },
    tableData() {
      // 返回最终显示在界面的数据
      return this.pageList;
    },
    keyIdentification() {
      return this.$route.query.identification == "1" ? "工号" : "学号";
    },
  },
  methods: {
    getDateFilter(data) {
      // 这里要筛选出数据，根据日期筛选即可
      return (
        !this.datePicker ||
        (new Date(Date.parse(data.temMeaTime)).setHours(0, 0, 0, 0) >=
          this.datePicker[0] &&
          new Date(Date.parse(data.temMeaTime)).setHours(0, 0, 0, 0) <
            this.datePicker[1] + 24 * 60 * 60 * 1000) // 日期选择器上的时间默认是0时0分0秒
      );
    },
    getCalander() {
      // 显示日历
      this.showCalanderNumber++;
      if (this.showCalanderNumber % 2) {
        this.showCalander = true; // 奇数时为true
      } else {
        this.showCalander = false;
      }
    },
    getFootprinInfo(key) {
      // 向后端发送AJAX请求，请求流调信息
      this.showList = []; // 每次请求前都赋值为空
      this.currentPage = 1; // 每次重新请求之后都要赋值为1，不然会出现页码不匹配的错误
      if (key.trim() !== "") {
        axios({
          method: "GET",
          url: `http://localhost:3000/my/getFootprintInfo?idcard=${key}&&identification=${this.$route.query.identification}`,
          headers: {
            Authorization: this.token, // 需要验证
          },
        }).then(
          (response) => {
            if (response.data.status == 0) {
              var ListObj = {
                idcard: response.data.footprintInfo.idcard, // 学号/工号
                name: response.data.footprintInfo.name, // 姓名
                covidVaccinationCompletedInfo: JSON.parse(
                  // 对象
                  response.data.footprintInfo.covidVaccinationCompletedInfo // 疫苗接种情况
                ),
                footprintInfoList: JSON.parse(
                  response.data.footprintInfo.footprintInfoList // 流调信息中包含了doorLists数组，每个数组都是一个对象，对象属性为place enterTime leaveTime
                ),
              };
              // 格式化为页面展示的数据类型
              ListObj.footprintInfoList.forEach((element) => {
                // element是每个流调信息，为对象类型  for...in 可以取出对象类型的键值对
                for (let index in element) {
                  if (index == "temMeaTime") {
                    element[index] = moment(Number(element[index])).format(
                      "YYYY-MM-DD"
                    );
                  } else if (index == "temperature") {
                    element[index] += "℃";
                  } else if (index == "doorLists") {
                    // 如果是doorLists数据，则将其格式化，包括为每个门铃码信息赋值一个doorID（唯一）
                    element[index].forEach((doorList) => {
                      doorList.doorId = doorList.enterTime; // 把时间戳赋值为唯一ID
                      doorList.enterTime =
                        doorList.enterTime == ""
                          ? "--"
                          : moment(Number(doorList.enterTime)).format(
                              "YYYY-MM-DD HH:mm:ss"
                            );
                      doorList.leaveTime =
                        doorList.leaveTime == ""
                          ? "--"
                          : moment(Number(doorList.leaveTime)).format(
                              "YYYY-MM-DD HH:mm:ss"
                            );
                    });
                  } else {
                    element[index] = element[index] == "1" ? "否" : "是";
                  }
                }
                this.showList.push({
                  idcard: ListObj.idcard,
                  name: ListObj.name,
                  ...element,
                  DateOfFirstCovidVaccinationCompleted: {
                    VaccinationDate: moment(
                      Number(
                        ListObj.covidVaccinationCompletedInfo
                          .DateOfFirstCovidVaccinationCompleted.VaccinationDate
                      )
                    ).format("YYYY-MM-DD"),
                    VaccinationAddress:
                      ListObj.covidVaccinationCompletedInfo
                        .DateOfFirstCovidVaccinationCompleted
                        .VaccinationAddress,
                  },
                  DateOfSecondCovidVaccinationCompleted: {
                    VaccinationDate: moment(
                      Number(
                        ListObj.covidVaccinationCompletedInfo
                          .DateOfSecondCovidVaccinationCompleted.VaccinationDate
                      )
                    ).format("YYYY-MM-DD"),
                    VaccinationAddress:
                      ListObj.covidVaccinationCompletedInfo
                        .DateOfSecondCovidVaccinationCompleted
                        .VaccinationAddress,
                  },
                });
              });
              this.pageList = this.showList;
              // 手动调用一次，默认显示的当前页的数据
              this.handleCurrentChange(this.currentPage);
            } else {
              this.$message({
                type: "error",
                message: response.data.msg,
              });
            }
          },
          (err) => {
            console.log(err.message);
          }
        );
      } else {
        this.$message({
          type: "error",
          message: "学号不可为空",
        });
      }
    },
    handleSizeChange(val) {
      // console.log(`当前页/条: ${val}`);  // 1 * 3 -
      this.pageSize = val;
      // 手动调用一次，每次切换条/页时，都要重新调用一次下面的函数，以展示第一页的数据
      this.handleCurrentChange(1); // 调用一次之后currentPage一定要变成1
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);  // 1 * 3 -
      // 要在返回的数据中操作
      this.currentPage = val;
      this.pageList = this.showList.slice(
        (val - 1) * this.pageSize,
        val * this.pageSize
      );
    },
    handleEdit(index, row) {
      // console.log(index, row); // index是第几行，row是对应的数据
    },
  },
  created() {},
};
</script>

<style scoped>
.main {
  position: relative;
  height: 660px;
  background-color: white;
}

.main .el-input {
  width: 300px;
}

.getCalander {
  position: fixed;
  left: 340px;
  top: 80px;
  z-index: 999;
  background-color: #f2f6fc;
}

.block {
  position: fixed;
  left: 390px;
  top: 80px;
  z-index: 999;
}

/* 过渡元素 */
.calander-enter-active,
.calander-leave-active {
  transition: all 0.8s ease;
}

.calander-enter,
.calander-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.calander-enter-to,
.calander-leave {
  transform: translateX(0%);
  opacity: 1;
}

/* 分页 */
.pagination-block {
  position: absolute;
  bottom: 0;
  left: 25%;
}

/* 门铃码详细信息 */
</style>
