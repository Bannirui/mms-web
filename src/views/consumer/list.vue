<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="getAllConsumersQuery.consumerName" placeholder="消费组名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="getAllConsumersQuery.consumerUserName" placeholder="申请人" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter4UserName" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreateConsumer">
        新增
      </el-button>
    </div>

    <!--查询结果-->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="allConsumers"
      border
      :fit="false"
      highlight-current-row
      style="width: auto; display: inline-block;"
    >
      <el-table-column label="消费组" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.consumerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主题名" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ consumerStatusMap[row.consumerStatus] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.consumerUserName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.consumerAppName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="环境" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <el-tag
            v-for="(env, index) in row.consumerEnvs"
            :key="index"
            :type="envName2TagType[env.envName]"
            size="mini"
          >
            {{ env.envName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注信息" align="center" min-width="150px" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.consumerRemark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <!--todo 加权限判断-->
          <el-button v-if="row.consumerStatus==1" size="mini" type="success" @click="handleApproveConsumer(row)">
            审批
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="getAllConsumersQuery.page" :limit.sync="getAllConsumersQuery.size" @pagination="getAllConsumers" />

    <!--申请表单-->
    <el-dialog :title="textMap[createConsumerDialogStatus]" :visible.sync="createConsumerDialogFormVisible">
      <el-form ref="createConsumerDataForm" :rules="createConsumerRules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="消费组" prop="consumerName">
          <el-input v-model="temp.consumerName" placeholder="主题名" />
        </el-form-item>
        <el-form-item label="主题名" prop="topicId">
          <el-select
            v-model="temp.topicId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="输入主题名称搜索"
            :remote-method="searchTopic"
            :loading="listLoading"
            style="width: 100%"
            @change="handleSelectTopicChange"
          >
            <el-option
              v-for="item in topicOptions"
              :key="item.topicId"
              :label="item.topicName"
              :value="item.topicId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请人" prop="consumerUserName">
          <el-input v-model="temp.consumerUserName" disabled />
        </el-form-item>
        <el-form-item label="关联App" prop="consumerAppId">
          <el-select
            v-model="temp.consumerAppId"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="输入APP名称搜索"
            :remote-method="searchApp"
            :loading="listLoading"
            style="width: 100%"
            @change="handleSelectAppChange"
          >
            <el-option
              v-for="item in appOptions"
              :key="item.appId"
              :label="item.appName"
              :value="item.appId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Remark" prop="consumerRemark">
          <el-input v-model="temp.consumerRemark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createConsumerDialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="createConsumerDialogStatus==='create'?createConsumer():updateConsumer()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
    <!--审批表单-->
    <el-dialog :title="textMap[approveConsumerDialogStatus]" :visible.sync="approveConsumerDialogFormVisible">
      <el-form ref="approveConsumerDataForm" :rules="approveConsumerRules" :model="temp" label-position="left" label-width="150px" style="width: 400px; margin-left:50px;">
        <el-form-item label="主题名" prop="consumerName">
          {{ temp.consumerName }}
        </el-form-item>
        <el-form-item label="申请人" prop="consumerUserName">
          {{ temp.consumerUserName }}
        </el-form-item>
        <el-form-item label="申请域(appName)" prop="consumerAppName">
          {{ temp.consumerAppName }}
        </el-form-item>
        <el-form-item label="Remark" prop="consumerRemark">
          {{ temp.consumerRemark }}
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="approveConsumerDialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="approveConsumerDialogStatus==='create'?approveConsumer():updateConsumer()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { searchTopic } from '@/api/topic'
import { createConsumer, pageList } from '@/api/consumer'
import { allEnableEnv } from '@/api/env'
import { getServer8Type } from '@/api/server' // secondary package based on el-pagination
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'ConsumerList',
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
      // 申请consumer模糊搜索选择对应topic {topicId,topicName}
      topicOptions: [],
      // 申请consumer时模糊搜索 app的信息{appId, appName}
      appOptions: [],
      activeEnv: '开发', // 绑定el-tabs的v-model
      // 每个环境下可供选择的mq资源 {环境id: [{hostId, hostName, hostHost, serverId, serverName, serverPort}]}
      envResources: {},
      // 分配给不同环境topic的机器资源 {envId: serverId}
      selectedResources: {},
      // 环境映射tag
      envName2TagType: {
        '生产': 'success',
        'prod': 'success',
        'PROD': 'success',
        '测试': 'warning',
        'test': 'warning',
        'TEST': 'warning',
        '开发': 'primary',
        'dev': 'primary',
        'DEV': 'primary'
      },
      tableKey: 0,
      /**
       * 后端接口查询回来的列表
       *   [{consumerId,consumerName,consumerStatus,consumerRemark,consumerUserId,consumerUserName,consumerAppId,consumerAppName,consumerRemark,
       *   topicId,topicName,
       *   consumerEnvs: [{envId,envName}]
       *   }]
       */
      allConsumers: [],
      // 全量记录条数
      total: 0,
      listLoading: true,
      // 请求分页列表
      getAllConsumersQuery: {
        page: 1,
        size: 20,
        // 查询条件 topic
        consumerName: '',
        // 查询条件 用户id
        userId: this.$store.state.user.id
      },
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      showReviewer: false,
      // 绑定表单 新增和更新时候用
      temp: {
        consumerId: undefined,
        consumerName: '',
        // 谁申请的
        consumerUserId: undefined,
        consumerUserName: '',
        // 申请给哪个业务
        consumerAppId: undefined,
        consumerAppName: '',
        topicId: undefined,
        consumerRemark: '',
        // 选中的环境 num 为什么要放在temp里面 因为表单校验规则rule不允许独立
        checked_env_ids: [],
        // [{envId, envName}]
        consumerEnvs: []
      },
      // 所有enable的环境 {id, name, sortId, status}
      all_envs: [],
      // 申请
      createConsumerDialogFormVisible: false,
      createConsumerDialogStatus: '',
      // 审批
      approveConsumerDialogFormVisible: false,
      approveConsumerDialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      createConsumerRules: { },
      approveConsumerRules: { },
      // 状态映射
      consumerStatusMap: {
        0: '删除',
        1: '待审批',
        2: '已审批',
        4: '待审批',
        8: '已审批'
      }
    }
  },
  created() {
    // 所有消费组
    this.getAllConsumers()
    // 所有的环境
    this.getAllEnv()
  },
  methods: {
    // topic name模糊搜索
    async searchTopic(query) {
      if (!query) {
        this.topicOptions = []
        return
      }
      this.listLoading = true
      try {
        const resp = await searchTopic(query)
        console.log('topic列表', resp)
        const data = await resp.data
        this.topicOptions = data
      } catch (e) {
        console.error('搜索主题失败', e)
      } finally {
        this.listLoading = false
      }
    },
    // 申请consumer时选中topic保存topic的信息
    handleSelectTopicChange(val) {
      const selected = this.topicOptions.find(item => item.topicId === val)
      if (selected) {
        this.temp.topicId = selected.topicId
        this.temp.topicName = selected.topicName
      }
    },
    // 申请consumer时选中app保存app的信息
    handleSelectAppChange(val) {
      const selected = this.appOptions.find(item => item.appId === val)
      if (selected) {
        this.temp.consumerAppId = selected.appId
        this.temp.consumerAppName = selected.appName
      }
    },
    // app name模糊搜索
    async searchApp(query) {
      if (!query) {
        this.topicOptions = []
        return
      }
      this.listLoading = true
      try {
        // todo 查询接口
        this.appOptions = [{ appId: 1, appName: 'my-test' }, { appId: 2, appName: 'mms' }, { appId: 3, appName: 'hellot' }]
      } catch (e) {
        console.error('搜索APP失败', e)
      } finally {
        this.listLoading = false
      }
    },
    // 分页拿到所有消费组(所有状态)
    getAllConsumers() {
      this.listLoading = true
      pageList(this.getAllConsumersQuery.page, this.getAllConsumersQuery.size, this.getAllConsumersQuery.consumerName, this.getAllConsumersQuery.userId).then(resp => {
        console.log('查询consumer', resp)
        this.total = resp.total
        this.allConsumers = resp.data.map(
          item => ({
            consumerId: item.consumerId,
            consumerName: item.consumerName,
            topicId: item.topicId,
            topicName: item.topicName,
            consumerStatus: item.consumerStatus,
            consumerRemark: item.consumerRemark,
            consumerUserId: item.consumerUserId,
            consumerUserName: item.consumerUserName,
            consumerAppId: item.consumerAppId,
            consumerAppName: item.consumerAppName,
            consumerEnvs: item.consumerEnvs.map(env => { return { envId: env.envId, envName: env.envName } })
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
      this.getAllConsumersQuery.page = 1
      this.getAllConsumers()
    },
    // 姓名映射userId
    handleFilter4UserName() {
      this.getAllConsumersQuery.page = 1
      // todo 根据userName映射到对应的userId
      this.getAllConsumersQuery.userId = null
      this.getAllConsumers()
    },
    resetTemp() {
      this.temp = {
        consumerId: undefined,
        consumerName: '',
        // 当前登陆用户
        consumerUserId: this.$store.state.user.id,
        consumerUserName: this.$store.state.user.name,
        consumerAppId: undefined,
        consumerAppName: '',
        topicId: undefined,
        consumerRemark: ''
      }
    },
    // 申请消费组
    handleCreateConsumer() {
      this.resetTemp()
      this.createConsumerDialogStatus = 'create'
      this.createConsumerDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['createConsumerDataForm'].clearValidate()
      })
    },
    createConsumer() {
      this.$refs['createConsumerDataForm'].validate((valid) => {
        if (valid) {
          // 创建
          const data = {
            name: this.temp.consumerName,
            userId: this.temp.consumerUserId,
            appId: this.temp.consumerAppId,
            topicId: this.temp.topicId,
            remark: this.temp.consumerRemark
          }
          console.log('申请consumer的请求是', data)
          createConsumer(data).then((resp) => {
            // 接口返回的consumer id渲染到页面
            const data = resp.data
            console.log('新建consumer的resp', data)
            const newRow = {
              consumerId: data.consumerId,
              consumerName: this.temp.consumerName,
              topicId: this.temp.topicId,
              topicName: this.temp.topicName,
              consumerUserId: this.temp.consumerUserId,
              consumerUserName: this.temp.consumerUserName,
              consumerAppId: this.temp.consumerAppId,
              consumerAppName: this.temp.consumerAppName,
              consumerStatus: 1,
              consumerRemark: this.temp.consumerRemark,
              // [{envId, envName}]
              consumerEnvs: data.consumerEnvs
            }
            this.allConsumers.unshift(newRow)
            this.createConsumerDialogFormVisible = false
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
    updateConsumer() {},
    // 审批consumer
    handleApproveConsumer(row) {
      this.temp = {
        consumerId: row.consumerId,
        consumerName: row.consumerName,
        consumerUserId: row.consumerUserId,
        consumerUserName: row.consumerUserName,
        consumerAppId: row.consumerAppId,
        topicAppName: row.consumerAppName,
        consumerRemark: row.consumerRemark,
        // 等会要在表单中根据环境展示tab
        topicEnvs: row.topicEnvs
      }
      this.approveConsumerDialogStatus = 'create'
      this.approveConsumerDialogFormVisible = true
      // 从接口拿所有环境下可选mq资源服务
      getServer8Type(2).then(res => {
        res.data.forEach(x => {
          // 缓存每个环境下面的可选择资源
          this.envResources[x.envId] = x.servers
          // 还要初始化每个环境下面的已经点选的资源 selectedResources 不然单选框全是实心的
          this.$set(this.selectedResources, x.envId, null)
        })
      })
      this.$nextTick(() => {
        this.$refs['approveConsumerDataForm'].clearValidate()
      })
    },
    // 审批消费组
    approveConsumer() {
      this.$refs['approveConsumerDataForm'].validate((valid) => {
        if (valid) {
          // 请求接口
          const list = Object.entries(this.selectedResources).map(([key, value]) => ({
            envId: Number(key),
            serverId: value
          }))
          approveTopic(this.temp.topicId, {
            partitions: this.temp.topicPartitions,
            replication: this.temp.topicReplications,
            envServers: list
          }).then(() => {
            const index = this.list.findIndex(v => v.topicId === this.temp.topicId)
            this.list.splice(index, 1, this.temp)
            this.approveDialogFormVisible = false
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
    // 点选checkbox后被选择的
    handleCheckedEnvChange: function(checkedVals) {
      // todo
    }
  }
}
</script>
