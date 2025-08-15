<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.topicName" placeholder="Topic名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.userId" placeholder="申请人" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
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
          <span>{{ topicStatusMap[row.topicStatus] }}</span>
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
      <el-table-column label="环境" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <el-tag
            v-for="(envName, index) in row.envs"
            :key="index"
            :type="envName2TagType[envName]"
            size="mini"
          >
            {{ envName }}
          </el-tag>
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
      <el-table-column label="备注信息" align="center" min-width="150px" show-overflow-tooltip>
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
          <el-input v-model="temp.userId" readonly disabled/>
        </el-form-item>
        <el-form-item label="申请域(appId)" prop="appId">
          <el-input v-model.number="temp.appId" placeholder="appId" />
        </el-form-item>
        <el-form-item label="环境" prop="checked_env_ids">
          <el-checkbox-group
            v-model="temp.checked_env_ids"
            @change="handleCheckedEnvChange"
          >
            <el-checkbox v-for="(env, index) in all_envs" :key="index" :label="env.id">
              {{ env.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="MQ类型" prop="brokerType">
          <el-radio-group
            v-model="temp.brokerType"
            text-color="#626aef"
            fill="#6cf"
          >
            <el-radio-button
              v-for="(v, k) in mqBrokerTypeMap"
              :key="k"
              :label="k"
            >
              {{ v }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发送速度" prop="tps">
          <el-input-number v-model="temp.tps" :min="1" :max="1024"/>条/秒
        </el-form-item>
        <el-form-item label="消息体大小" prop="msgSz">
          <el-input-number v-model="temp.msgSz" :min="1" :max="1024"/>字节
        </el-form-item>
        <el-form-item label="remark" prop="remark">
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
    }
  },
  data() {
    return {
      // 环境映射tag
      envName2TagType: {
        'prod': 'success',
        'PROD': 'success',
        'test': 'warning',
        'TEST': 'warning',
        'dev': 'primary',
        'DEV': 'primary'
      },
      tableKey: 0,
      /**
       * 后端接口查询回来的列表
       */
      list: [],
      // 全量记录条数
      total: 0,
      listLoading: true,
      // 请求分页列表
      listQuery: {
        page: 1,
        size: 20,
        // 查询条件 topic
        topicName: '',
        // 查询条件 用户id
        userId: null
      },
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
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
        // mq类型 number
        brokerType: undefined,
        tps: undefined,
        msgSz: undefined,
        remark: '',
        // 选中的环境 num 为什么要放在temp里面 因为表单校验规则rule不允许独立
        checked_env_ids: []
      },
      // 所有enable的环境 {id, name, sortId, status}
      all_envs: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      // 提交申请表单字段的校验规则
      rules: {
        name: [{ required: true, message: 'topic名称必填', trigger: 'blur' }],
        appId: [{ type: 'number', required: true, message: 'app应用必填数字', trigger: 'blur' }],
        checked_env_ids: [{
          validator: (rule, value, callback) => {
            if (!value || value.length === 0) {
              callback(new Error('环境必选'))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }],
        brokerType: [{ required: true, message: 'MQ集群类型必选', trigger: 'change' }],
        tps: [{ type: 'number', required: true, message: 'MQ的TPS必填', trigger: 'blur' }],
        msgSz: [{ type: 'number', required: true, message: '消息体大小必填', trigger: 'blur' }],
        remark: [{ required: true, message: 'remark必填', trigger: 'blur' }]
      },
      downloadLoading: false,
      // 申请topic时下拉选择
      mqBrokerTypeMap: {
        1: 'Kafka',
        2: 'Rocket'
      },
      // topic状态映射
      topicStatusMap: {
        0: '删除',
        1: '待审批',
        2: '已审批',
        4: '待审批',
        8: '已审批'
      }
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
      fetchList(this.listQuery.page, this.listQuery.size, this.listQuery.topicName, this.listQuery.userId).then(resp => {
        this.total = resp.total
        this.list = resp.data.map(
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
        )

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 所有的环境
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
        // 当前登陆用户
        userId: this.$store.state.user.id,
        name: '',
        appId: undefined,
        brokerType: undefined,
        tps: 1024,
        msgSz: 1024,
        remark: '',
        checked_env_ids: []
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
          // 创建topic
          createTopic({
            userId: this.temp.userId,
            name: this.temp.name,
            appId: this.temp.appId,
            tps: this.temp.tps,
            msgSz: this.temp.msgSz,
            clusterType: this.temp.brokerType,
            envs: this.temp.checked_env_ids.map(x => ({ envId: x })),
            remark: this.temp.remark
          }).then(() => {
            const env_names = this.all_envs
              .filter(env => this.temp.checked_env_ids.includes(env.id))
              .map(env => env.name)
            const newRow = {
              topicName: this.temp.name,
              topicStatus: 1,
              topicUser: this.temp.userId,
              topicApp: this.temp.appId,
              tps: this.temp.tps,
              msgSz: this.temp.msgSz,
              remark: this.temp.remark,
              envs: env_names
            }
            this.list.unshift(newRow)
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
