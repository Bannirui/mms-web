<template>
  <div class="app-container">
    <el-container style="height: 100vh">
      <!-- 左侧菜单 -->
      <el-aside width="260px" style="background: #fff; border-right: 1px solid #eee">
        <el-menu class="el-menu-vertical-demo" :default-openeds="['0','1']">
          <template v-for="(env, envIdx) in serverList">
            <!-- 环境 -->
            <el-submenu :index="String(envIdx)" :key="env.envName">
              <template slot="title">
                <span>{{ env.envName }}</span>
                <!-- 为环境添加主机 -->
                <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreateHost(env.envId)">
                  新增Host
                </el-button>
              </template>
              <!-- 主机 -->
              <el-submenu
                v-for="(host, hostIdx) in env.hosts"
                :key="host.name"
                :index="envIdx + '-' + hostIdx"
              >
                <template slot="title">
                  <span>{{ host.name }}</span>
                  <!-- 添加服务 -->
                  <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
                    新增Server
                  </el-button>
                </template>
                <!-- 服务 -->
                <el-menu-item
                  v-for="(server, serverIdx) in host.servers"
                  :key="server.name"
                  :index="envIdx + '-' + hostIdx + '-' + serverIdx"
                  @click="handleServiceClick(env.envId, host.id, server.id)"
                >
                  {{ server.name }}
                </el-menu-item>
              </el-submenu>
            </el-submenu>
          </template>
        </el-menu>

        <!-- 左下角 悬浮按钮 -->
        <el-button
          type="primary"
          circle
          icon="el-icon-plus"
          @click="handleCreateEnv"
          style="position: absolute; bottom: 20%; left: 5%; transform: translateX(-50%);"
        />
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main style="padding: 20px">
        <el-card shadow="hover">
          <div style="margin-bottom: 10px">
            <el-button-group>
              <el-button size="mini">1小时</el-button>
              <el-button size="mini">6小时</el-button>
              <el-button size="mini">12小时</el-button>
              <el-button size="mini">1天</el-button>
              <el-button size="mini">7天</el-button>
              <el-button size="mini">30天</el-button>
            </el-button-group>
          </div>

          <div style="display: flex; gap: 20px">
            <!-- Echarts 图表1 -->
            <div ref="chart1" style="flex:1; height:300px"/>
            <!-- Echarts 图表2 -->
            <div ref="chart2" style="flex:1; height:300px"/>
          </div>
        </el-card>
      </el-main>
    </el-container>
    <!--环境-->
    <el-dialog :title="envDialogStatus==='create'?'Create':'Edit'" :visible.sync="envDialogFormVisible">
      <el-form ref="envDataForm" :rules="envRules" :model="envTmp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="环境名" prop="name">
          <el-input v-model="envTmp.name" placeholder="环境名"/>
        </el-form-item>
        <el-form-item label="顺序" prop="sortId">
          <el-input-number v-model="envTmp.sortId" :min="1" :max="10"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="envDialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="envDialogStatus==='create'?createEnvData():updateEnvData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
    <!--主机-->
    <el-dialog :title="hostDialogStatus==='create'?'Create':'Edit'" :visible.sync="hostDialogFormVisible">
      <el-form ref="hostDataForm" :rules="hostRules" :model="envTmp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="hostTmp.name" placeholder="主机名称"/>
        </el-form-item>
        <el-form-item label="主机域名(ip)" prop="host">
          <el-input v-model="hostTmp.host" placeholder="主机域名或ip地址"/>
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="hostTmp.port" :min="1" :max="65535"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="hostDialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="hostDialogStatus==='create'?createHostData():updateHostData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { listServer } from '@/api/env'
import { addEnv } from '@/api/env'
import { addHost } from '@/api/host'

export default {
  name: 'ClusterMonitor',
  mounted() {
    this.initChart(this.$refs.chart1, 'rocket_wq')
    this.initChart(this.$refs.chart2, 'kafka_wq')
  },
  created() {
    this.listServer()
  },
  data() {
    return {
      envRules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      hostRules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      // 添加环境的对话框 create or update
      envDialogStatus: '',
      envDialogFormVisible: false,
      // 环境
      envTmp: {
        id: undefined,
        name: '',
        sortId: 0,
        status: undefined
      },
      // 添加host
      hostDialogStatus: '',
      hostDialogFormVisible: false,
      // 环境
      hostTmp: {
        id: undefined,
        name: '',
        host: '',
        port: undefined,
        envId: undefined,
        status: undefined
      },
      // 服务
      serverList: []
    }
  },
  methods: {
    handleCreateHost(envId) {
      this.resetHostTmp()
      this.hostTmp.envId = envId
      this.hostTmp.port = 8080
      this.hostDialogStatus = 'create'
      this.hostDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['hostDataForm'].clearValidate()
      })
    },
    createHostData() {
      this.$refs['hostDataForm'].validate((valid) => {
        if (valid) {
          // 调用接口
          addHost(this.hostTmp.envId,
            {
              name: this.hostTmp.name,
              host: this.hostTmp.host,
              port: this.hostTmp.port
            }
          ).then(response => {
            // 新增的host添加到页面上
            // todo
            this.hostDialogFormVisible = false
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
    createEnvData() {
      this.$refs['envDataForm'].validate((valid) => {
        if (valid) {
          // 调用接口
          addEnv(
            {
              name: this.envTmp.name,
              sortId: this.envTmp.sortId
            }
          ).then(response => {
            // 新增的env状态待审批 页面不需要展示
            this.envDialogFormVisible = false
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
    resetEnvTmp: function() {
      this.envTmp = {
        id: undefined,
        name: '',
        sortId: ''
      }
    },
    resetHostTmp: function() {
      this.hostTmp = {
        id: undefined,
        host: '',
        port: undefined,
        envId: undefined,
        status: undefined
      }
    },
    handleCreateEnv() {
      this.resetEnvTmp()
      this.envDialogStatus = 'create'
      this.envDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['envDataForm'].clearValidate()
      })
    },
    handleServiceClick(envId, hostId, serverId) {
      console.log('点击了:', envId, hostId, serverId)
      // 这里你可以触发右侧 echarts 的刷新逻辑
    },
    // 所有的环境的服务
    listServer() {
      listServer().then(resp => {
        this.serverList = resp.data
      })
    },
    initChart(dom, title) {
      const chart = echarts.init(dom)
      chart.setOption({
        title: { text: title, left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['totalTps', 'clusterNums'], bottom: 0 },
        xAxis: { type: 'category', data: ['13:12', '13:17', '13:22', '13:27', '13:32', '13:36'] },
        yAxis: { type: 'value' },
        series: [
          { name: 'totalTps', type: 'line', data: [2, 2, 2, 2, 2, 2] },
          { name: 'clusterNums', type: 'line', data: [0.5, 0.6, 0.7, 0.8, 0.8, 0.9] }
        ]
      })
    }
  }
}
</script>

<style>
.el-menu {
  border-right: none;
}
</style>
