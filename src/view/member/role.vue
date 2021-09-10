<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <Input placeholder="请输角色名..." style="width: 300px" v-model="key"></Input>
        <Button icon="ios-search" type="primary" @click="handleSearch" style="margin-left:8px">搜索</Button>
      </div>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button  class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新建角色
          </Button>
          <Button class="search-btn" type="error" @click="handleRemove(select)" :disabled="disabled">
            <Icon type="search"/>&nbsp;&nbsp;删除角色
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading" @on-selection-change="handleSelect">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="error" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)"> 编辑</a>&nbsp;
          <a @click="handleRemove([row.id])" v-if="row.is_system===0">删除</a>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-ok="handleSubmit"
           @on-cancel="handleReset">
      <Form ref="form1" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="角色名" prop="name">
          <Input v-model="formItem.name" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.desc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="权限" prop="grantMenus">
          <Table :columns="columns2" :data="selectAccess">
            <template slot="status" slot-scope="{ row }">
              <CheckboxGroup v-model="formItem.access">
                  <Checkbox  :label="row.id">
                    <span>{{row.name}}</span>
                  </Checkbox>
                  <Checkbox v-for="(item,index) in row.children" :key="index" :label="item.id">
                    <span>{{item.name}}</span>
                  </Checkbox>
              </CheckboxGroup>
            </template>
          </Table>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="default" @click="handleReset">取消</Button>&nbsp;
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { getRoles, storeRole, removeRole, getRoleInfo } from '@/api/member'
import { getAccess } from '@/api/setting'
import { listConvertTree } from '@/libs/util'
import dayjs from 'dayjs'
export default {
  name: 'SystemRole',
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
        name: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        access: [
          { required: false, type: 'array', message: '权限不能为空', trigger: 'blur' }
        ]
      },
      formItem: {
        roleId: '',
        roleCode: '',
        name: '',
        path: '',
        status: 1,
        statusSwatch: '1',
        menuId: '',
        priority: 0,
        roleDesc: '',
        access: []
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '角色id',
          key: 'id'
        },
        {
          title: '角色名称',
          key: 'name'
        },
        {
          title: '描述',
          key: 'desc'
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
          width: 125,
          fixed: 'right'
        }
      ],
      columns2: [
        {
          title: '权限名',
          key: 'name',
          minWidth: '100px'
        },
        {
          title: '权限说明',
          slot: 'status',
          minWidth: '580px'
        }
      ],
      data: []
    }
  },
  methods: {
    checkboxClick (row, rowIndex, $event) {
      this.formItem.grantMenus = this.$refs['tree'].getCheckedProp('menuId')
      if (this.formItem.grantMenus && this.formItem.grantMenus.length === 0) {
        this.formItem.grantActions = []
      }
    },
    handleModal (data) {
      if (data) {
        this.modalTitle = '编辑角色'
        this.formItem = Object.assign({}, this.formItem, data)
        this.formItem.statusSwatch = this.formItem.status === 1 ? '1' : '0'
        this.handleLoadRoleGranted(this.formItem.id)
      } else {
        this.modalTitle = '添加角色'
      }
      this.modalVisible = true
    },
    handleReset () {
      const newData = {
        roleId: '',
        roleCode: '',
        name: '',
        path: '',
        status: 1,
        statusSwatch: '1',
        menuId: '',
        priority: 0,
        roleDesc: '',
        access: []
      }
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
          storeRole(this.formItem).then(res => {
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
      getRoles({ page: this.pageInfo.page, limit: this.pageInfo.limit, key: this.key }).then(res => {
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
          removeRole(data).then(res => {
            this.handleSearch()
            if (res.code === 0) {
              this.pageInfo.page = 1
              this.$Message.success('删除成功')
            }
          })
        }
      })
    },
    handleLoadRoleGranted (roleId) {
      getRoleInfo(roleId).then(res => {
        if (res.code === 0) {
          let result = []
          res.data.access.map(item => { result.push(item.id) })
          this.formItem.access = result
        }
      })
    },
    handleLoadAccess () {
      getAccess().then(res => {
        let opt = {
          primaryKey: 'id',
          parentKey: 'parent_id',
          startPid: 0
        }
        this.selectAccess = listConvertTree(res.data, opt)
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
    this.handleLoadAccess()
  }
}
</script>
