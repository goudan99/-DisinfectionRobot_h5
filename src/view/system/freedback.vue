<template>
  <div>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="error" @click="handleRemove(select)" :disabled="disabled">
            <Icon type="search"/>&nbsp;&nbsp;删除用户
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading" @on-selection-change="handleSelect">
        <template  slot="pics" slot-scope="{ row }">
          <a v-for="(item, index) in row.pics" v-bind="index" :key="item" :href="item" target="blank">
            <img :src="item" width="50" height="50"/>
          </a>
        </template>
        <template  slot="action" slot-scope="{ row }">
          <a @click="handleRemove([row.id])">删除</a>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
  </div>
</template>

<script>
import { getFreedbackes, removeFreedbackes } from '@/api/user'
import dayjs from 'dayjs'

export default {
  name: 'freeback',
  data () {
    return {
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '用户',
          width: 120,
          key: 'user_name'
        },
        {
          title: '联系电话',
          width: 120,
          key: 'phone'
        },
        {
          title: '反馈内容',
          key: 'desc'
        },
        {
          title: '图片',
          width: 300,
          slot: 'pics'
        },
        {
          title: '反馈时间',
          width: 150,
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
      loading: false,
      disabled: true,
      select: [],
      data: []
    }
  },
  methods: {
    handleSearch () {
      this.loading = true
      getFreedbackes({ page: this.pageInfo.page, limit: this.pageInfo.limit, key: this.key, status: this.status }).then(res => {
        this.data = res.data.data
        this.pageInfo.total = parseInt(res.data.total)
        this.disabled = true
        this.loading = false
      })
    },
    handleRemove (data) {
      this.$Modal.confirm({
        title: '删除后将无法恢复,确定删除吗？',
        onOk: () => {
          removeFreedbackes(data).then(res => {
            this.handleSearch()
            if (res.code === 0) {
              res.data ? this.$Message.success('删除成功') : this.$Message.error('删除失败,权限不足')
            }
          })
        }
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
