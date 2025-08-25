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
          <span>{{ row.topicUserName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicAppName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="环境" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <el-tag
            v-for="(env, index) in row.topicEnvs"
            :key="index"
            :type="envName2TagType[env.name]"
            size="mini"
          >
            {{ env.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="TPS" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicTps }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消息大小" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicMsgSz }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分区" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicPartitions }}</span>
        </template>
      </el-table-column>
      <el-table-column label="副本" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicReplications }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注信息" align="center" min-width="150px" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.topicRemark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <!--todo 加权限判断-->
          <el-button v-if="row.topicStatus==1" size="mini" type="success" @click="handleApprove(row)">
            审批
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />

    <!--审批topic表单-->
    <el-dialog :title="textMap[approveDialogStatus]" :visible.sync="approveDialogFormVisible">
      <el-form ref="approveDataForm" :rules="approveRules" :model="temp" label-position="left" label-width="150px" style="width: 400px; margin-left:50px;">
        <el-form-item label="主题名" prop="topicName">
          {{ temp.topicName }}
        </el-form-item>
        <el-form-item label="申请人" prop="topicUserName">
          {{ temp.topicUserName }}
        </el-form-item>
        <el-form-item label="申请域(appName)" prop="topicAppName">
          {{ temp.topicAppName }}
        </el-form-item>
        <el-form-item label="MQ类型" prop="topicType">
          {{ mqBrokerTypeMap[temp.topicType] }}
        </el-form-item>
        <el-form-item label="发送速度" prop="topicTps">
          {{ temp.topicTps }}条/秒
        </el-form-item>
        <el-form-item label="消息体大小" prop="topicMsgSz">
          {{ temp.topicMsgSz }}字节
        </el-form-item>
        <el-form-item label="Remark" prop="topicRemark">
          {{ temp.topicRemark }}
        </el-form-item>
        <el-form-item label="分配分区数" prop="topicPartitions">
          <el-input-number v-model="temp.topicPartitions" :min="1" :max="1024" />个分区
        </el-form-item>
        <el-form-item label="分配副本数" prop="topicReplications">
          <el-input-number v-model="temp.topicReplications" :min="1" :max="1024" />个副本
        </el-form-item>
        <el-form-item label="环境资源分配" prop="topicEnvs">
          <el-tabs v-model="activeEnv">
            <el-tab-pane v-for="env in temp.topicEnvs" :key="env.id" :label="env.name" :name="env.name">
              <!-- 每个环境下的资源选择，用单选按钮组 -->
              <el-radio-group v-model="selectedResources[env.id]">
                <el-radio
                  v-for="srv in envResources[env.id]"
                  :key="srv.serverId"
                  :label="srv.serverId"
                >
                  {{ srv.hostName }}{{ srv.serverName }}-{{ srv.hostHost }}:{{ srv.serverPort }}
                </el-radio>
              </el-radio-group>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="approveDialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="approveDialogStatus==='create'?approveTopicData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
    <!--申请topic表单-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="主题名" prop="topicName">
          <el-input v-model="temp.topicName" placeholder="主题名" />
        </el-form-item>
        <el-form-item label="申请人" prop="topicUserId">
          <el-input v-model="temp.topicUserId" disabled />
        </el-form-item>
        <el-form-item label="申请域(appId)" prop="topicAppId">
          <el-input v-model.number="temp.topicAppId" placeholder="appId" />
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
        <el-form-item label="MQ类型" prop="topicType">
          <el-radio-group
            v-model="temp.topicType"
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
        <el-form-item label="发送速度" prop="topicTps">
          <el-input-number v-model="temp.topicTps" :min="1" :max="1024" />条/秒
        </el-form-item>
        <el-form-item label="消息体大小" prop="topicMsgSz">
          <el-input-number v-model="temp.topicMsgSz" :min="1" :max="1024" />字节
        </el-form-item>
        <el-form-item label="remark" prop="topicRemark">
          <el-input v-model="temp.topicRemark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
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
  </div>
</template>

<script>
import { fetchList, createTopic, approveTopic } from '@/api/topic'
import { allEnableEnv } from '@/api/env'
import { getServer8Type } from '@/api/server' // secondary package based on el-pagination
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

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
       *   [{topicId,topicName,topicType,topicStatus,topicTps,topicMsgSz,topicPartitions,topicReplications,topicRemark,userId,topicUserName,appId,topicAppName,
       *   envs: [{envId,envName}]
       *   }]
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
        userId: this.$store.state.user.id
      },
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      showReviewer: false,
      // 绑定表单 新增和更新时候用
      temp: {
        // topicId
        topicId: undefined,
        // topic name
        topicName: '',
        // 谁申请的
        topicUserId: undefined,
        topicUserName: '',
        // 申请给哪个业务
        topicAppId: undefined,
        topicAppName: '',
        // mq类型 number
        topicType: undefined,
        topicTps: undefined,
        topicMsgSz: undefined,
        topicRemark: '',
        // 选中的环境 num 为什么要放在temp里面 因为表单校验规则rule不允许独立
        checked_env_ids: [],
        // [{id, name}]
        topicEnvs: [],
        // 审批topic是分配的分区数
        topicPartitions: undefined,
        // 审批topic是分配的副本数
        topicReplications: undefined
      },
      // 所有enable的环境 {id, name, sortId, status}
      all_envs: [],
      // 申请
      dialogFormVisible: false,
      dialogStatus: '',
      // 审批
      approveDialogFormVisible: false,
      approveDialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      // 提交申请表单字段的校验规则
      rules: {
        topicName: [{ required: true, message: 'topic名称必填', trigger: 'blur' }],
        topicApp: [{ type: 'number', required: true, message: 'app应用必填数字', trigger: 'blur' }],
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
      // 审批topic
      approveRules: {
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
            topicId: item.topicId,
            topicName: item.topicName,
            topicType: item.topicType,
            topicStatus: item.topicStatus,
            topicTps: item.topicTps,
            topicMsgSz: item.topicMsgSz,
            topicPartitions: item.topicPartitions,
            topicReplications: item.topicReplication,
            topicRemark: item.topicRemark,
            topicUserName: item.userName,
            topicAppName: item.appName,
            topicEnvs: item.envs.map(env => { return { id: env.envId, name: env.envName } })
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
    resetTemp() {
      this.temp = {
        topicId: undefined,
        topicName: '',
        // 当前登陆用户
        topicUserId: this.$store.state.user.id,
        topicAppId: undefined,
        topicType: undefined,
        topicTps: 1024,
        topicMsgSz: 1024,
        topicRemark: '',
        // 申请topic时要填申请哪些环境
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
    // 审批topic
    handleApprove(row) {
      this.temp = {
        topicId: row.topicId,
        topicUserId: row.topicUserId,
        topicUserName: row.topicUserName,
        topicAppId: row.topicAppId,
        topicAppName: row.topicAppName,
        topicName: row.topicName,
        topicType: row.topicType,
        topicTps: row.topicTps,
        topicMsgSz: row.topicMsgSz,
        topicRemark: row.topicRemark,
        // 分配的默认分区数
        topicPartitions: 5,
        // 分配的默认副本数
        topicReplications: 1,
        // 等会要在表单中根据环境展示tab
        topicEnvs: row.topicEnvs
      }
      this.approveDialogStatus = 'create'
      this.approveDialogFormVisible = true
      // 从接口拿所有环境下可选mq资源服务
      getServer8Type(2).then(res => {
        res.data.forEach(x => {
          // 缓存每个环境下面的可选择资源
          this.envResources[x.envId] = x.servers
          // 还要初始化每个环境下面的已经点选的资源 selectedResources 不然单选框全是实心的
          this.$set(this.selectedResources, x.envId, null)
        })
      })
      console.log('审批topic mq可选服务', this.envResources)
      console.log('审批topic temp', this.temp)
      this.$nextTick(() => {
        this.$refs['approveDataForm'].clearValidate()
      })
    },
    // 申请topic
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 创建topic
          const data = {
            userId: this.temp.topicUserId,
            name: this.temp.topicName,
            appId: this.temp.topicAppId,
            tps: this.temp.topicTps,
            msgSz: this.temp.topicMsgSz,
            clusterType: this.temp.topicType,
            envs: this.temp.checked_env_ids.map(x => ({ envId: x })),
            remark: this.temp.topicRemark
          }
          console.log('申请topic的请求是', data)
          createTopic(data).then((resp) => {
            // 接口返回的topic id渲染到页面
            const envs = this.all_envs
              .filter(env => this.temp.checked_env_ids.includes(env.id))
              .map(env => { return { id: env.id, name: env.name } })
            console.log('新建topic的resp', resp.data)
            const newRow = {
              topicId: resp.data,
              topicName: this.temp.topicName,
              topicStatus: 1,
              topicUserId: this.temp.topicUserId,
              topicAppId: this.temp.topicAppId,
              topicTps: this.temp.topicTps,
              topicMsgSz: this.temp.topicMsgSz,
              topicRemark: this.temp.topicRemark,
              // [{id, name}]
              topicEnvs: envs
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
    // 审批topic
    approveTopicData() {
      this.$refs['approveDataForm'].validate((valid) => {
        if (valid) {
          console.log('审核topic环境资源分配', this.selectedResources)
          // 请求接口
          const list = Object.entries(this.selectedResources).map(([key, value]) => ({
            envId: Number(key),
            serverId: value
          }))
          console.log('环境资源分配转换为list', list)
          console.log('审批topic的temp是', this.temp)
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
