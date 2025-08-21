<template>
  <div class="app-container">
    <div class="filter-container">
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
      <el-table-column label="id" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序权重" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sortId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ statusMap[row.status] || '未知' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="zk" width="180px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.zkName">{{ row.zkName }}[{{row.zkHost}}:{{row.zkPort}}]</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="480px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status!=4" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!=2" size="mini" type="success" @click="handleModifyStatus(row,2)">
            可用
          </el-button>
          <el-button v-if="row.status!=1 && row.status!=4" size="mini" @click="handleModifyStatus(row,4)">
            禁用
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button v-if="row.status==2" size="mini" type="success" @click="handleUpdateDatasource(row)">
            关联数据源
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--环境-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="环境名" prop="name">
          <el-input v-model="temp.name" placeholder="环境名"/>
        </el-form-item>
        <el-form-item label="顺序" prop="sortId">
          <el-input-number v-model="temp.sortId" :min="1" :max="10"/>
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
    <!--zk-->
    <el-dialog :title="textMap[datasourceDialogStatus]" :visible.sync="datasourceDialogFormVisible">
      <el-form ref="datasourceDataForm" :rules="datasourceRules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="环境名" prop="name">
          <el-input v-model="temp.name" placeholder="环境名" disabled/>
        </el-form-item>
        <el-form-item label="zk" prop="zk">
          <el-radio-group
            v-model="temp.zkDataSourceId"
            text-color="#626aef"
            fill="#6cf"
          >
            <el-radio-button
              v-for="(v, idx) in zkServers"
              :key="idx"
              :label="v.serverId"
            >
              {{ v.serverName }}[{{ v.host }}:{{ v.port }}]
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="datasourceDialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="datasourceDialogStatus==='create'?createDatasource():updateDatasource()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, addEnv, del, updateStatus, updateEnv, envBindZk } from '@/api/env'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import { getServer8Type } from '@/api/server'

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
  name: 'EnvList',
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
      // 数据源 zk [serverId, serverName, host, port]
      zkServers: [],
      tableKey: 0,
      // 全量环境[{id,name,sortId,status,zkId,zkName,zkHost,zkPort}]
      list: [],
      listLoading: true,
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      // 环境
      all_envs: [1, 2, 3],
      // 选中的环境
      checked_envs: [],
      // form表单新增和更新环境的时候用 给环境添加数据源
      temp: {
        id: undefined,
        name: '',
        sortId: 0,
        status: undefined,
        // 环境关联的数据源
        zkDataSourceId: undefined
      },
      dialogFormVisible: false,
      datasourceDialogFormVisible: false,
      dialogStatus: '',
      datasourceDialogStatus: '',
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
      // 给环境添加数据源表单校验
      datasourceRules: {
      },
      downloadLoading: false,
      statusMap: {
        0: '删除',
        1: '新建',
        2: '可用',
        4: '禁用'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getServerByType(serverType) {
      getServer8Type(serverType).then(res => {
        this.zkServers = res.data
      })
    },
    getList() {
      this.listLoading = true
      fetchList().then(resp => {
        this.list = resp.data
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    /**
     * 修改状态
     * @param status 期望的状态
     */
    handleModifyStatus(row, status) {
      // 调用接口
      updateStatus(row.id, status).then(() => {
        this.$message({
          message: '操作Success',
          type: 'success'
        })
        row.status = status
      })
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
    handleCreate() {
      this.resetTemp()
      // 触发createData函数
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 添加环境的数据源
    createDatasource() {
      this.$refs['datasourceDataForm'].validate((valid) => {
        if (valid) {
          // 绑定数据源
          envBindZk(this.temp.id, { zkId: this.temp.zkDataSourceId }).then(resp => {
            // todo
            // 接口返回的zk信息缓存到内存
            this.datasourceDialogFormVisible = false
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
    // 更新环境的数据源
    updateDatasource() {
      this.$refs['datasourceDataForm'].validate((valid) => {
        if (valid) {
          // 调用接口
          envBindZk(this.temp.id, { zkId: this.temp.zkDataSourceId }).then(resp => {
            // 绑定成功后把对应的zk信息带到页面
            const zk = this.zkServers.find(x => x.serverId === this.temp.zkDataSourceId)
            if (zk) {
              // 找到要更新zk信息的那条env记录
              const env = this.list.find(x => x.id === this.temp.id)
              if (env) {
                env.zkId = zk.serverId
                env.zkName = zk.serverName
                env.zkHost = zk.host
                env.zkPort = zk.port
              }
            }
            // 关闭对话框
            this.datasourceDialogFormVisible = false
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
    // 添加环境
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 新增环境
          addEnv({ name: this.temp.name, sortId: this.temp.sortId }).then(() => {
            // 刷新列表
            this.getList()
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
    // 修改环境
    handleUpdate(row) {
      // 缓存行数据
      this.temp = Object.assign({}, row)
      // 触发更新对话框
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 修改数据源
    handleUpdateDatasource(row) {
      // 缓存行数据
      this.temp = Object.assign({}, row)
      // 触发更新对话框
      this.datasourceDialogStatus = 'update'
      this.datasourceDialogFormVisible = true
      this.getServerByType(4)
      this.$nextTick(() => {
        this.$refs['datasourceDataForm'].clearValidate()
      })
    },
    // 更新环境
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // 调用接口
          updateEnv(tempData.id, { name: tempData.name, sortId: tempData.sortId }).then(() => {
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
    // 删除
    handleDelete(row, index) {
      // 调用接口
      del(row.id)
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      // 移除页面上的记录
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
    resetTemp: function() {
      this.temp = {
        id: undefined,
        name: '',
        sortId: 0
      }
    }
  }
}
</script>
