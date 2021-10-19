<template>
  <div>
    <Card shadow>
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>
        权限查看
      </p>
      <Button slot="extra" @click="handleEdit" type="primary"><Icon type="ios-loop-strong"></Icon>添加</Button>
      <tree-table height="900" expand-key="name" :expand-type="false" :is-fold="false" :tree-type="true" :selectable="false" :columns="columns" :data="data" border>
        <template slot="action" slot-scope="{ row }">
          <ButtonGroup>
            <Button @click="handleEdit(row)" type="primary">修改</Button>
            <Button @click="handleRemove(row.id)" type="error">删除</Button>
          </ButtonGroup>
        </template>
      </tree-table>
    </Card>
    <Modal v-model="modalVisible" :title="modalTitle" @on-ok="handleSubmit" @on-cancel="handleReset">
      <Form ref="accessForm" :model="formItem" :rules="formItemRules" :label-width="80">
        <FormItem prop="parent_id" label="依赖权限">
          <Select v-model="formItem.parent_id">
            <Option v-for="(item, index) in data" :key="index" :value="item.id">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="name" label="权限名">
          <Input v-model="formItem.name" placeholder="权限名"></Input>
        </FormItem>
        <FormItem prop="code" label="权限标识">
          <Input v-model="formItem.code" placeholder="权限标识"></Input>
        </FormItem>
        <FormItem prop="path" label="对应路由">
          {{formItem.method}} :{{formItem.path}} <Button @click="handleUriEdit">请选择路由</Button>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="default" @click="handleReset">取消</Button>
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
    <Modal v-model="modalVisible1" :title="modalTitle1">
      <RadioGroup v-model="selectIndex" v-if="modalVisible1" style="padding:0px;margin:0px;width:100%">
        <Table :columns="columns1" :data="uris" @on-row-dblclick="handleUriDbclick" @on-row-click="handleUriclick">
          <template slot="radio" slot-scope="{ row,index }">
            <Radio :label="index"></Radio>
          </template>
        </Table>
      </RadioGroup>
      <div slot="footer">
        <Button type="default" @click="handleUriReset">取消</Button>
        <Button type="primary" @click="handleUriSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { listConvertTree } from '@/libs/util'
import { getAccess, getUris, storeAccess, removeAccess } from '@/api/setting'
export default {
  name: 'SystemGrantAccess',
  data () {
    return {
      loading: false,
      modalVisible: false,
      modalTitle: '添加权限',
      modalVisible1: false,
      modalTitle1: '所有路径',
      data: [],
      uris: [],
      selectIndex: -1,
      columns: [
        {
          title: '权限名',
          width: '200',
          key: 'name'
        },
        {
          title: '权限标识',
          width: '100',
          key: 'code'
        },
        {
          title: '方法',
          width: '100',
          key: 'method'
        },
        {
          title: '路由',
          key: 'path'
        },
        {
          title: '操作',
          type: 'template',
          width: '150',
          template: 'action'
        }
      ],
      columns1: [
        {
          title: '请选择',
          slot: 'radio'
        },
        {
          title: '路径',
          key: 'path'
        },
        {
          title: '方法',
          key: 'method'
        }
      ],
      formItemRules: {
        name: [
          { required: true, message: '权限名不能空', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '路由不能空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '权限编号不能空', trigger: 'blur' }
        ],
        method: [
          { required: true, message: '路由方法不能为空', trigger: 'blur' }
        ]
      },
      formItem: {
        id: '',
        name: '',
        path: '',
        parent_id: 0,
        code: '',
        method: '',
        desc: ''
      }
    }
  },
  methods: {
    handleSearch () {
      this.loading = true
      getAccess().then(res => {
        let opt = {
          primaryKey: 'id',
          parentKey: 'parent_id',
          startPid: 0
        }
        this.data = listConvertTree(res.data, opt)
        this.loading = false
      })
    },
    loadUri () {
      getUris().then(res => {
        this.uris = res.data
      })
    },
    handleUriEdit () {
      this.modalVisible1 = true
    },
    handleUriDbclick () {
      this.modalVisible1 = false
      this.handleUriSubmit()
    },
    handleUriclick (row, index) {
      this.selectIndex = index
    },
    handleUriSubmit () {
      this.modalVisible1 = false
      this.formItem.path = this.uris[this.selectIndex].path
      this.formItem.method = this.uris[this.selectIndex].method
    },
    handleUriReset () {
      this.modalVisible1 = false
    },
    handleEdit (data) {
      this.modalVisible = true
      if (data) {
        this.modalTitle = '编辑权限'
        this.formItem = Object.assign({}, this.formItem, data)
        for (let index in this.uris) {
          if (this.uris[index].path === this.formItem.path && this.uris[index].method === this.formItem.method) {
            this.selectIndex = index
          }
        }
      } else {
        this.formItem = Object.assign({})
        this.modalTitle = '添加权限'
      }
    },
    handleReset () {
      this.modalVisible = false
      const newData = {
        id: '',
        name: '',
        path: '',
        parent_id: 0,
        code: '',
        method: '',
        desc: ''
      }
      this.formItem = newData
      // 重置验证
      this.$refs['accessForm'].resetFields()
      this.modalVisible = false
      this.selectIndex = 0
      this.modalVisible1 = false
    },
    handleSubmit () {
      this.$refs['accessForm'].validate((valid) => {
        if (valid) {
          storeAccess(this.formItem).then(res => {
            if (res.code === 422) {
              for (var item in res.data) {
                const field = this.$refs['accessForm'].fields.filter(field => field.prop === item)[0]
                if (field) {
                  field.validateMessage = res.data[item].join(',')
                  field.validateState = 'error'
                }
              }
            } else {
              this.modalVisible = false
              this.handleReset()
              this.handleSearch()
            }
          })
        }
      })
    },
    handleRemove (id) {
      this.$Modal.confirm({
        title: '删除后将无法恢复,确定删除吗？',
        onOk: () => {
          removeAccess(id).then(res => { this.handleSearch() })
        }
      })
    }
  },
  mounted: function () {
    this.handleSearch()
    this.loadUri()
  }
}
</script>
