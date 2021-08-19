<template>
  <div>
    <div class="search-con search-con-top">
      <ButtonGroup>
        <Button :disabled="value.id?false:true" class="search-btn" type="primary" @click="handleModal()">
          <Icon type="search"/>&nbsp;&nbsp;新建操作
        </Button>
      </ButtonGroup>
    </div>
      <Table :columns="columns" :data="data">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="error" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">编辑</a> &nbsp;
          <Poptip confirm title="确定删除吗?" @on-ok="handleRemove(row)">
            <a>删除</a>
          </Poptip>
        </template>
      </Table>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-cancel="handleReset">
      <Form ref="actionForm" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="所属菜单" >
          <Input disabled v-model="value.name" ></Input>
        </FormItem>
        <FormItem label="所属权限" >
          <treeselect
            :options="selectTreeData"
            :default-expand-level="1"
            v-model="formItem.access_id"
            @select="selectData"
            :normalizer="treeSelectNormalizer"/>
        </FormItem>
        <FormItem label="权限标识" prop="code">
          <Input disabled v-model="formItem.code" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="请求地址" prop="path">
          <Input disabled v-model="formItem.path" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="状态">
          <i-switch disabled v-model="formItem.statusSwatch" size="large">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
        <FormItem label="描述">
          <Input disabled v-model="formItem.desc" type="textarea" placeholder="请输入内容"></Input>
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
import { getMenuActions, getAccess, storeAction, removeAction } from '@/api/setting'
import { listConvertTree } from '@/libs/util'
export default {
  name: 'MenuAction',
  props: {
    value: Object
  },
  data () {
    return {
      modalVisible: false,
      modalTitle: '',
      confirmModal: false,
      selectTreeData: [],
      formItemRules: {
      },
      formItem: {
        menu_id: '',
        access_id: 0,
        name: '',
        code: '',
        path: '',
        status: 0,
        statusSwatch: false,
        desc: ''
      },
      columns: [
        {
          title: '操作名称',
          key: 'name'
        },
        {
          title: '操作标识',
          key: 'code'
        },
        {
          title: '请求地址',
          key: 'path'
        },
        {
          title: '状态',
          slot: 'status',
          key: 'status'
        },
        {
          title: '描述',
          key: 'desc'
        },
        {
          title: '操作',
          slot: 'action',
          width: 150
        }
      ],
      data: []
    }
  },
  methods: {
    handleModal (data) {
      if (data) {
        this.modalTitle = '编辑操作'
        this.formItem = Object.assign({}, this.formItem, data)
        this.formItem.statusSwatch = this.formItem.status === 1
        this.formItem.access_id = data.id
      } else {
        this.modalTitle = '添加操作'
      }
      this.formItem.menu_id = this.value.id
      this.modalVisible = true
    },
    handleReset () {
      const newData = {
        menu_id: '',
        access_id: 0,
        name: '',
        code: '',
        path: '',
        status: 0,
        statusSwatch: false,
        desc: ''
      }
      this.formItem = newData
      // 重置验证
      this.$refs['actionForm'].resetFields()
      this.modalVisible = false
    },
    handleSubmit () {
      storeAction(this.formItem).then(res => {
        this.handleReset()
        this.handleSearch()
        if (res.code === 0) {
          this.$Message.success('保存成功')
        }
      })
    },
    handleSearch () {
      if (!this.value.id) {
        this.data = []
        return
      }
      getMenuActions(this.value.id).then(res => {
        this.data = res.data
      })
      getAccess(this.value.id).then(res => {
        let opt = {
          primaryKey: 'id',
          parentKey: 'parent_id',
          startPid: 0
        }
        this.setSelectTree(listConvertTree(res.data, opt))
      })
    },
    handleRemove (data) {
      removeAction({ menu_id: this.value.id, access_id: data.id }).then(res => {
        this.handleSearch()
        if (res.code === 0) {
          this.$Message.success('删除成功')
        }
      })
    },
    treeSelectNormalizer (node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    setSelectTree (data) {
      const root = {
        id: 0,
        name: '选择菜单权限'
      }
      this.selectTreeData = [root].concat(data)
    },
    selectData (data) {
      this.formItem = Object.assign({}, this.formItem, data)
      this.formItem.statusSwatch = this.formItem.status === 1
    }
  },
  watch: {
    value (val) {
      this.handleSearch()
    }
  },
  mounted: function () {
  }
}
</script>
