<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox>
    </div>

    <!--查询结果-->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      :fit="false"
      highlight-current-row
      style="width: auto; display: inline-block;"
      @sort-change="sortChange"
    >
      <el-table-column label="主题名" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicUser }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicApp }}</span>
        </template>
      </el-table-column>
      <el-table-column label="TPS" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tps }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消息大小" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.msgSz }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分区" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.partitions }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注信息" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <!--申请topic表单-->
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="主题名" prop="name">
          <el-input v-model="temp.name" placeholder="主题名"/>
        </el-form-item>
        <el-form-item label="申请人" prop="userId">
          <el-input v-model="temp.userId" readonly/>
        </el-form-item>
        <el-form-item label="申请域(appId)" prop="appId">
          <el-input v-model="temp.appId" placeholder="appId" />
        </el-form-item>
        <el-form-item label="环境" prop="checked_envs">
          <el-checkbox-group
            v-model="checked_env_ids"
            @change="handleCheckedEnvChange"
          >
            <el-checkbox v-for="env in all_envs" :key="env.id" :label="env.id">
              {{ env.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="MQ类型">
          <el-select v-model="temp.brokerType" class="filter-item" placeholder="选择MQ类型">
            <el-option v-for="item in MqBrokerTypeArr" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送速度" prop="tps">
          <el-input-number v-model="temp.tps" :min="1" :max="1024"/>条/秒
        </el-form-item>
        <el-form-item label="消息体大小" prop="tps">
          <el-input-number v-model="temp.msgSz" :min="1" :max="1024"/>字节
        </el-form-item>
        <el-form-item label="mark">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createTopic } from '@/api/topic'
import { allEnableEnv } from '@/api/env'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'TopicList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      /**
       * 后端接口查询回来的列表
       * @type {Array<{id: number, name: string, age: number}>}
       */
      list: [],
      // 全量记录条数
      total: 0,
      listLoading: true,
      // 请求分页列表
      listQuery: {
        page: 1,
        size: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      // 申请topic时下拉选择
      MqBrokerTypeArr: [
        { code: 1, name: 'Kafka' },
        { code: 2, name: 'Rocket' }
      ],
      showReviewer: false,
      // 绑定表单 新增和更新时候用
      temp: {
        id: undefined,
        // 谁申请的
        userId: undefined,
        // topic name
        name: '',
        // 申请给哪个业务
        appId: undefined,
        // mq类型
        brokerType: undefined,
        tps: undefined,
        msgSz: undefined,
        // 环境
        envIds: [],
        remark: ''
      },
      // 所有enable的环境
      all_envs: [],
      // 选中的环境
      checked_env_ids: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    // 所有topic
    this.getList()
    // 有的环境
    this.getAllEnv()
  },
  methods: {
    // 分页拿到列表
    getList() {
      this.listLoading = true
      fetchList(this.listQuery.page, this.listQuery.size).then(resp => {
        this.total = resp.total
        this.list.push(...resp.data.map(
          item => ({
            topicName: item.topic.name,
            topicStatus: item.topic.status,
            topicUser: item.topic.userId,
            topicApp: item.topic.appId,
            tps: item.topic.tps,
            msgSz: item.topic.msgSz,
            partitions: item.topic.partitions,
            remark: item.topic.remark,
            envs: item.envs.map(env => env.name)
          })
        ))

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 的有环境
    getAllEnv() {
      allEnableEnv().then(resp => {
        this.all_envs = resp.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        userId: undefined,
        name: '',
        appId: undefined,
        brokerType: undefined,
        tps: 1024,
        msgSz: 1024,
        // env id
        envIds: [],
        remark: ''
      }
    },
    // 申请topic
    handleCreate() {
      this.resetTemp()
      // 触发createData函数
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // todo 填充当前用户id
          this.temp.userId = 1024
          // 创建topic
          createTopic({
            userId: this.temp.userId,
            name: this.temp.name,
            appId: this.temp.appId,
            tps: this.temp.tps,
            msgSz: this.temp.msgSz,
            clusterType: this.temp.brokerType,
            envs: this.checked_env_ids.map(x => ({ envId: x })),
            remark: this.temp.remark
          }).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    // 点选checkbox后被选择的
    handleCheckedEnvChange: function(checkedVals) {
      // todo
    }
  }
}
</script>
