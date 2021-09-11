<template>
  <div>
    <Card shadow>
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>
        用户管理
      </p>
      <div class="search-con search-con-top">
        <Input placeholder="请输入用户名,或手机号..." style="width: 300px" v-model="key"></Input>
        <Select v-model="status" style="width:200px;margin-left:8px">
          <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button icon="ios-search" type="primary" @click="handleSearch" style="margin-left:8px">搜索</Button>
      </div>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新建用户
          </Button>
          <Button class="search-btn" type="error" @click="handleRemove(select)" :disabled="disabled">
            <Icon type="search"/>&nbsp;&nbsp;删除用户
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading" @on-selection-change="handleSelect">
        <template slot="passed" slot-scope="{ row }">
          <Badge v-if="row.passed===1" status="success" text="正常"/>
          <Badge v-else-if="row.passed===2" status="success" text="锁定"/>
          <Badge v-else="" status="error" text="禁用"/>
        </template>
        <template  slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">编辑</a>&nbsp;
          <a @click="handleRemove([row.id])" v-if="row.is_system===0">删除</a>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible1" :title="modalTitle" width="680" @on-ok="handleSubmit" @on-cancel="handleReset">
      <Form ref="userForm1" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="昵称" prop="nickname">
          <Input v-model="formItem.nickname" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="登录名" prop="name">
          <Input :disabled="formItem.id?true:false" v-model="formItem.name" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="登录密码" prop="password">
          <Input type="password" v-model="formItem.password"  placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="再次确认密码" prop="passwordConfirm">
          <Input type="password" v-model="formItem.passwordConfirm" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="激活码" prop="code">
          <Input v-model="formItem.code" :disabled="formItem.id?true:false" placeholder="激活码,不能修改"></Input>
        </FormItem>
        <FormItem label="角色：" prop="role">
          <CheckboxGroup v-model="formItem.roles" v-if="formItem.is_system !== 1">
            <Checkbox v-for="(item,index) in roleList" :key="index" :label="item.id">
             <span>{{item.name}}</span>
            </Checkbox>
          </CheckboxGroup>
          <span v-else>内置管理员</span>
        </FormItem>
        <FormItem label="手机号" prop="phone">
          <Input v-model="formItem.phone" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="状态">
          <RadioGroup v-model="formItem.passed">
            <Radio label="0">禁用</Radio>
            <Radio label="1">正常</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.desc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="default" @click="handleReset">取消</Button>&nbsp;
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
    <Modal v-model="modalVisible" :title="modalTitle" width="680" @on-ok="handleSubmit" @on-cancel="handleReset">
      <Form ref="userForm" :model="formItem" :rules="formItemRules1" :label-width="100">
        <FormItem label="昵称" prop="nickname">
          <Input v-model="formItem.nickname" placeholder="登录昵称"></Input>
        </FormItem>
        <FormItem label="登录名" prop="name">
          <Input :disabled="formItem.id?true:false" v-model="formItem.name" placeholder="登录帐号"></Input>
        </FormItem>
        <FormItem label="登录密码" prop="password">
          <Input type="password" v-model="formItem.password"  placeholder="如果不修改，保持为空"></Input>
        </FormItem>
        <FormItem label="再次确认密码" prop="passwordConfirm">
          <Input type="password" v-model="formItem.passwordConfirm" placeholder="如果不修改，保持为空"></Input>
        </FormItem>
        <FormItem label="激活码" prop="code">
          <Input v-model="formItem.code" :disabled="formItem.id?true:false" placeholder="请输入激活码"></Input>
        </FormItem>
        <FormItem label="角色：" prop="role">
          <CheckboxGroup v-model="formItem.roles" v-if="formItem.is_system !== 1">
            <Checkbox v-for="(item,index) in roleList" :key="index" :label="item.id">
             <span>{{item.name}}</span>
            </Checkbox>
          </CheckboxGroup>
          <span v-else>内置管理员</span>
        </FormItem>
        <FormItem label="手机号" prop="phone">
          <Input v-model="formItem.phone" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="状态">
          <RadioGroup v-model="formItem.passed">
            <Radio label="0">禁用</Radio>
            <Radio label="1">正常</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.desc" type="textarea" placeholder="请输入内容"></Input>
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
import { getUsers, storeUser, removeUser, getRoles } from '@/api/member'
import dayjs from 'dayjs'
export default {
  name: 'SystemUser',
  data () {
    const validatePassConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.formItem.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    const validateMobile = (rule, value, callback) => {
      var reg = /^1\d{10}$/
      if (value !== '' && !reg.test(value)) {
        callback(new Error('手机号码格式不正确'))
      } else {
        callback()
      }
    }
    return {
      statusList: [{ value: -1, label: '全部' }, { value: 1, label: '可用' }, { value: 0, label: '不可用' }],
      key: '',
      status: -1,
      disabled: true,
      loading: false,
      modalVisible: false,
      modalVisible1: false,
      select: [],
      modalTitle: '',
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10
      },
      formItemRules: {
        name: [
          { required: true, message: '登录名不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'blur' }
        ],
        passwordConfirm: [
          { required: true, validator: validatePassConfirm, trigger: 'blur' }
        ],
        code: [
          { required: true, message: '激活码不能为空', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '昵称不能为空', trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: validateMobile, trigger: 'blur' }
        ]
      },
      formItemRules1: {
        name: [
          { required: true, message: '登录名不能为空', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '昵称不能为空', trigger: 'blur' }
        ],
        phone: [
          { required: true, validator: validateMobile, trigger: 'blur' }
        ]
      },
      formItem: {
        id: '',
        name: '',
        roles: [],
        nickname: '',
        password: '',
        passwordConfirm: '',
        passed: 1,
        code: '',
        phone: '',
        desc: '',
        avatar: ''
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '登录名称',
          key: 'name'
        },
        {
          title: '手机号',
          key: 'phone'
        },
        {
          title: '角色名',
          key: 'roles',
          render: (h, { row }) => {
            return (
              <span>{ row.is_system ? '内置管理员' : row.roles.map(item => { return item.name }).join(',') }</span>
            )
          }
        },
        {
          title: '昵称',
          key: 'nickname'
        },
        {
          title: '状态',
          slot: 'passed',
          key: 'passed'
        },
        {
          title: '描述',
          key: 'desc'
        },
        {
          title: '上次登录',
          key: 'last_at',
          render: (h, { row }) => {
            return (
              <span>{ dayjs(row.last_at).format('YYYY-MM-DD HH:mm:ss') }</span>
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
      roleList: [],
      data: []
    }
  },
  methods: {
    handleReset () {
      const newData = {
        id: '',
        name: '',
        roles: [],
        nickname: '',
        passed: 1,
        email: '',
        code: '',
        password: '',
        passwordConfirm: '',
        phone: '',
        desc: '',
        avatar: ''
      }
      this.formItem = newData
      // 重置验证
      this.$refs['userForm'].resetFields()
      this.modalVisible = false
      this.modalVisible1 = false
    },
    handleModal (data) {
      if (data) {
        this.modalTitle = '编辑用户'
        let roles = Object.assign({}, data)
        roles['roles'] = []
        data['roles'].map(item => { roles['roles'].push(item.id) })
        this.formItem = Object.assign({}, this.formItem, roles)
      } else {
        this.modalTitle = '添加用户'
      }
      this.formItem.passed = this.formItem.passed + ''
      if (!this.formItem.id > 0) {
        this.modalVisible1 = true
        this.modalVisible = false
      } else {
        this.modalVisible1 = false
        this.modalVisible = true
      }
    },
    handleRemove (data) {
      this.$Modal.confirm({
        title: '删除后将无法恢复,确定删除吗？',
        onOk: () => {
          removeUser(data).then(res => {
            this.handleSearch()
            if (res.code === 0) {
              this.pageInfo.page = 1
              res.data ? this.$Message.success('删除成功') : this.$Message.error('删除失败,权限不足')
            }
          })
        }
      })
    },
    handleSubmit () {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          storeUser(this.formItem).then(res => {
            if (res.code === 0) {
              this.$Message.success('保存成功')
              this.handleSearch()
              this.handleReset()
            } else if (res.code === 422) {
              for (var p in res.error) { this.$Message.error(res.error[p].join(',')) }
            }
          })
        }
      })
    },
    handleSearch () {
      this.loading = true
      getUsers({ page: this.pageInfo.page, limit: this.pageInfo.limit, key: this.key, status: this.status }).then(res => {
        this.data = res.data.data
        this.pageInfo.total = parseInt(res.data.total)
        this.disabled = true
        this.loading = false
      })
      getRoles().then(res => {
        this.roleList = res.data.data
        this.loading = false
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
