<template>
  <div>
      <Table :columns="columns" :data="data" :loading="loading">
      </Table>
  </div>
</template>

<script>
import { getFreedbackes } from '@/api/user'

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
          key: 'user_name'
        },
        {
          title: '联系电话',
          key: 'phone'
        },
        {
          title: '反馈内容',
          key: 'desc'
        }
      ],
      loading: false,
      data: []
    }
  },
  methods: {
    handleSearch () {
      this.loading = true
      getFreedbackes({ page: this.pageInfo.page, limit: this.pageInfo.limit, key: this.key, status: this.status }).then(res => {
        this.data = res.data
        this.disabled = true
        this.loading = false
      })
    }
  },
  mounted: function () {
    this.handleSearch()
  }
}
</script>
