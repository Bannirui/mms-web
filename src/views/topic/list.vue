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
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <!--<el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <span>{{ row.topicId }}</span>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <!--<el-table-column label="Date" width="150px" align="center">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <!--<el-table-column label="主题名" min-width="150px">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <span class="link-type" @click="handleUpdate(row)">{{ row.id }}</span>-->
      <!--    <el-tag>{{ row.type | typeFilter }}</el-tag>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <el-table-column label="主题名" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.topicName }}</span>
        </template>
      </el-table-column>
      <!--<el-table-column label="Author" width="110px" align="center">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <span>{{ row.author }}</span>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <!--<el-table-column v-if="showReviewer" label="Reviewer" width="110px" align="center">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <span style="color:red;">{{ row.reviewer }}</span>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <!--<el-table-column label="Imp" width="80px">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <svg-icon v-for="n in + row.importance" :key="n" icon-class="star" class="meta-item__icon" />-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <!--<el-table-column label="Readings" align="center" width="95">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>-->
      <!--    <span v-else>0</span>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <!--<el-table-column label="Status" class-name="status-col" width="100">-->
      <!--  <template slot-scope="{row}">-->
      <!--    <el-tag :type="row.status | statusFilter">-->
      <!--      {{ row.status }}-->
      <!--    </el-tag>-->
      <!--  </template>-->
      <!--</el-table-column>-->
      <!--<el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">-->
      <!--  <template slot-scope="{row,$index}">-->
      <!--    <el-button type="primary" size="mini" @click="handleUpdate(row)">-->
      <!--      Edit-->
      <!--    </el-button>-->
      <!--    <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">-->
      <!--      Publish-->
      <!--    </el-button>-->
      <!--    <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">-->
      <!--      Draft-->
      <!--    </el-button>-->
      <!--    <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">-->
      <!--      Delete-->
      <!--    </el-button>-->
      <!--  </template>-->
      <!--</el-table-column>-->
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <!--申请topic表单-->
      <el-form ref="dataForm" :rules="rules" :model="applyTopic" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="主题名" prop="name">
          <el-input v-model="applyTopic.name" placeholder="主题名"/>
        </el-form-item>
        <el-form-item label="申请人" prop="userId">
          <el-input v-model="applyTopic.userId" readonly/>
        </el-form-item>
        <el-form-item label="申请域(appId)" prop="appId">
          <el-input v-model="applyTopic.appId" placeholder="appId" />
        </el-form-item>
        <el-form-item label="环境" prop="checked_envs">
          <el-checkbox-group
            v-model="checked_envs"
            @change="handleCheckedEnvChange"
          >
            <el-checkbox v-for="env in all_envs" :key="env" :label="env" :value="env">
              {{ env }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Imp">
          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
        </el-form-item>
        <el-form-item label="Remark">
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
import { fetchList, fetchPv, createTopic, updateArticle } from '@/api/topic'
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
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      // 申请topic
      applyTopic: {
        // 谁申请的
        userId: undefined,
        // topic name
        name: '',
        // 申请给哪个业务
        appId: undefined,
        tps: undefined,
        msgSz: undefined,
        // mq集群类型 rocket or kafka
        clusterType: undefined,
        // 环境
        envs: []
      },
      // 环境
      all_envs: [1, 2, 3],
      // 选中的环境
      checked_envs: [],
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
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
    this.getList()
  },
  methods: {
    // 分页拿到列表
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(resp => {
        this.list = resp.data
        this.total = resp.total

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
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    resetApplyTopic() {
      this.applyTopic = {
        // todo 自动填充当前用户id
        userId: 1024,
        name: '',
        appId: undefined,
        tps: undefined,
        msgSz: undefined,
        clusterType: undefined,
        // env id
        envs: []
      }
    },
    // 申请topic
    handleCreate() {
      this.resetApplyTopic()
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
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          // 创建topic
          createTopic(this.temp).then(() => {
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
      console.log('点击事件', checkedVals)
      // const checkedCount = value.length
      // checkAll.value = checkedCount === cities.length
      // isIndeterminate.value = checkedCount > 0 && checkedCount < cities.length
    }
  }
}
</script>
