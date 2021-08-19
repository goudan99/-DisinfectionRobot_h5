<template>
  <div>
    <Card shadow>
      <Table :columns="columns" :data="data" :loading="loading">
        <template  slot="action" slot-scope="{ row }">
          <a @click="handleShow(row)">查看</a>&nbsp;
          <a @click="handleModal(row)">下载</a>&nbsp;
          <a @click="handleRemove(row)">删除</a>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
  </div>
</template>

<script>
import { getCodeLogs, removeCodeLog } from '@/api/app'
export default {
  name: 'SystemUser',
  data () {
    return {
      loading: false,
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
          title: '日期',
          key: 'date'
        },
        {
          title: '全部',
          key: 'all'
        },
        {
          title: '危急',
          key: 'emergency'
        },
        {
          title: '紧急',
          key: 'alert'
        },
        {
          title: '严重',
          key: 'critical'
        },
        {
          title: '错误',
          key: 'error'
        },
        {
          title: '警告',
          key: 'warning'
        },
        {
          title: '注意',
          key: 'notice'
        },
        {
          title: '信息',
          key: 'info'
        },
        {
          title: '调试',
          key: 'debug'
        },
        {
          title: '调试',
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
    handleShow (data) {
      this.$router.push({
        name: 'log1',
        params: { date: data.date }
      })
    },
    handleRemove (data) {
      this.$Modal.confirm({
        title: '删除后将无法恢复,确定删除吗？',
        onOk: () => {
          removeCodeLog(data.date).then(res => {
            if (res.code === 0) {
              this.pageInfo.page = 1
              res.data ? this.$Message.success('删除成功') : this.$Message.error('删除失败,权限不足')
              this.handleSearch()
            }
          })
        }
      })
    },
    handleSearch () {
      let that = this
      this.loading = true
      getCodeLogs({ page: this.pageInfo.page, limit: this.pageInfo.limit }).then(res => {
        let data = []
        Object.keys(res.data.data).forEach(function (item) {
          data.push(res.data.data[item])
        })
        that.data = data
        that.pageInfo.total = parseInt(res.data.total)
        // that.pageInfo.limit = parseInt(res.data.per_page)
        that.pageInfo.page = parseInt(res.data.page)
        that.loading = false
      })
    },
    handlePage (current) {
      this.pageInfo.page = current
      this.handleSearch()
    },
    handlePageSize (size) {
      this.pageInfo.limit = size
      this.handleSearch()
    }
  },
  mounted: function () {
    this.handleSearch()
  }
}
</script>
