<template>
  <div>
    <Button click="handleDown">导出日志记录</Button>

      <Row :gutter="16">
        <Col span="4" >
          <Card title="等级" icon="ios-options" :padding="0" shadow>
            <CellGroup>
              <Cell v-for="(item, index) in leves" :key="index" :selected="level === index">
                <Badge :count="item.count" slot="extra" />
                <div @click="switchItem(index)">{{item.name}}</div>
              </Cell>
            </CellGroup>
          </Card>
        </Col>
        <Col span="20" >
          <Table ref="table" :columns="columns" :data="logs" border></Table>
          <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
        </Col>
      </Row>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getCodeLog } from '@/api/app'
export default {
  name: 'error_logger_page',
  data () {
    return {
      level: 'all',
      date: '2021-08-19',
      logs: [],
      leves: [],
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10
      },
      columns: [
        {
          type: 'expand',
          width: 65,
          title: '查看',
          render: (h, { row }) => {
            return h('div', row.stack)
          }
        },
        {
          key: 'level',
          width: 80,
          title: '编码'
        },
        {
          key: 'time',
          title: '时间',
          width: 150,
          render: (h, { row }) => {
            return (
              <span>{ dayjs(row.datetime).format('YYYY-MM-DD HH:mm:ss') }</span>
            )
          },
          sortable: true,
          sortType: 'desc'
        },
        {
          key: 'header',
          title: '内容'
        }
      ]
    }
  },
  methods: {
    handleSearch () {
      let that = this
      getCodeLog({ page: this.pageInfo.page, limit: this.pageInfo.limit, level: this.level }, this.date).then(res => {
        that.leves = res.data.leves
        that.logs = res.data.data
        that.pageInfo.total = parseInt(res.data.total)
        that.pageInfo.page = parseInt(res.data.page)
      })
    },
    switchItem (item) {
      this.level = item
      this.handleSearch()
    },
    handlePage (current) {
      this.pageInfo.page = current
      this.handleSearch()
    },
    handleDown () {
      // getCodeLog()
    },
    handlePageSize (size) {
      this.pageInfo.limit = size
      this.handleSearch()
    }
  },
  mounted () {
    this.date = this.$route.params.date
    this.handleSearch()
  }
}
</script>

<style>

</style>
