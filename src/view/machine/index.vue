<template>
  <div>
    <Card shadow>
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>
        设备管理
      </p>
      <div class="search-con search-con-top">
        <Input placeholder="请输sn码..." style="width: 300px" v-model="key"></Input>
        <Button icon="ios-search" type="primary" @click="handleSearch" style="margin-left:8px">搜索</Button>
      </div>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button  class="search-btn" type="primary" @click="handleStore()">
            <Icon type="search"/>&nbsp;&nbsp;新建设备
          </Button>
          <Button class="search-btn" type="error" @click="handleRemove(select)" :disabled="disabled">
            <Icon type="search"/>&nbsp;&nbsp;删除设备
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading" @on-selection-change="handleSelect">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="error" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleShow(row.id)"> 操作用户11</a>&nbsp;
          <a @click="handleStore(row)"> 编辑</a>&nbsp;
          <a @click="handleRemove([row.id])">删除</a>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer show-total @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible" :title="modalTitle" width="680" @on-ok="handleSubmit" @on-cancel="handleReset">
      <Form ref="form1" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="序列号" prop="sn">
          <Input v-model="formItem.sn" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="机器名称" prop="name">
          <Input v-model="formItem.name" placeholder="机器名称"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="default" @click="handleReset">取消</Button>&nbsp;
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
    <Modal v-model="modalVisible1" :title="modalTitle1" width="680">
      <Table :columns="columns1" :data="data1">
      </Table>
    </Modal>
  </div>
</template>

<script>
import { getMachines, getMachine, storeMachine, removeMachine } from '@/api/machine'
import dayjs from 'dayjs'
export default {
  name: 'machineMoudle',
  data () {
    return {
      loading: false,
      disabled: true,
      modalVisible: false,
      modalTitle: '',
      key: '',
      selectAccess: [],
      select: [],
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10
      },
      formItemRules: {
        sn: [
          { required: true, message: '设备序列号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '机器名称', trigger: 'blur' }
        ]
      },
      formItem: {
        id: '',
        name: '',
        sn: ''
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: 'id',
          key: 'id'
        },
        {
          title: '序列号',
          key: 'sn'
        },
        {
          title: '机器名称',
          key: 'name'
        },
        {
          title: '创建时间',
          key: 'created_at',
          render: (h, { row }) => {
            return (
              <span>{ dayjs(row.created_at).format('YYYY-MM-DD HH:mm:ss') }</span>
            )
          }
        },
        {
          title: '操作',
          slot: 'action',
          width: 200,
          fixed: 'right'
        }
      ],
      data: [],
      modalVisible1: false,
      modalTitle1: '绑定的用户',
      columns1: [
        {
          title: 'id',
          key: 'id'
        },
        {
          title: '手机',
          key: 'phone'
        },
        {
          title: '昵称',
          key: 'nickname'
        }
      ],
      data1: []
    }
  },
  methods: {
    checkboxClick (row, rowIndex, $event) {
      this.formItem.grantMenus = this.$refs['tree'].getCheckedProp('menuId')
      if (this.formItem.grantMenus && this.formItem.grantMenus.length === 0) {
        this.formItem.grantActions = []
      }
    },
    handleShow (id) {
      this.modalVisible1 = true
      getMachine(id).then(res => {
        this.data1 = res.data.users
      })
    },
    handleStore (data) {
      if (data) {
        this.modalTitle = '编辑设备'
        this.formItem = Object.assign({}, this.formItem, data)
      } else {
        this.modalTitle = '添加设备'
      }
      this.modalVisible = true
    },
    handleReset () {
      const newData = { id: '', sn: '', name: '' }
      this.formItem = newData
      // 重置验证
      this.$refs['form1'].resetFields()
      this.current = 0
      this.modalVisible = false
    },
    handleSubmit () {
      this.$refs['form1'].validate((valid) => {
        if (valid) {
          this.formItem.status = this.formItem.statusSwatch === '1' ? 1 : 0
          storeMachine(this.formItem).then(res => {
            if (res.code === 0) {
              this.$Message.success('保存成功')
              this.handleReset()
              this.handleSearch()
            } else if (res.code === 422) {
              for (var p in res.error) { this.$Message.error(res.error[p].join(',')) }
            }
          })
        }
      })
    },
    handleSearch () {
      this.loading = true
      getMachines({ page: this.pageInfo.page, limit: this.pageInfo.limit, key: this.key }).then(res => {
        this.data = res.data.data
        this.pageInfo.total = parseInt(res.data.total)
        this.loading = false
        this.disabled = true
      })
    },
    handlePage (current) {
      this.pageInfo.page = current
      this.handleSearch()
    },
    handlePageSize (size) {
      this.pageInfo.limit = size
      this.handleSearch()
    },
    handleRemove (data) {
      this.$Modal.confirm({
        title: '确定删除吗？',
        onOk: () => {
          removeMachine(data).then(res => {
            this.handleSearch()
            if (res.code === 0) {
              this.pageInfo.page = 1
              this.$Message.success('删除成功')
            }
          })
        }
      })
    },
    handleSelect (selection) {
      selection.length > 0 ? this.disabled = false : this.disabled = true
      this.select = []
      selection.map(item => { this.select.push(item.id) })
    }
  },
  mounted: function () {
    this.handleSearch()
  }
}
</script>
