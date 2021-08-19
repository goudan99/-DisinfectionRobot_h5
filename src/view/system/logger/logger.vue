<template>
  <div>
    <Button>导出日志记录</Button>

      <Row :gutter="16">
        <Col span="4" >
          <Card title="等级" icon="ios-options" :padding="0" shadow>
            <CellGroup>
              <Cell title="所有" label="all" />
              <Cell title="危急" disabled label="emergency" />
              <Cell title="紧急" disabled label="alert" extra="0" to="/components/button" />
              <Cell title="严重" disabled label="critical" extra="0" to="/components/button" />
              <Cell title="错误" disabled label="error" extra="0" to="/components/button"/>
              <Cell title="警告" disabled label="warning" extra="0" to="/components/button"/>
              <Cell title="注意" disabled label="notice" extra="0" to="/components/button"/>
              <Cell title="信息" disabled label="info" extra="0" to="/components/button"/>
              <Cell title="调试" disabled label="debug" extra="0" to="/components/button">
                <Badge :count="10" slot="extra" />
              </Cell>
            </CellGroup>
          </Card>
        </Col>
        <Col span="20" >
          <Table ref="table" :columns="columns" :data="logs"></Table>
        </Col>
      </Row>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getCodeLogs } from '@/api/app'
export default {
  name: 'error_logger_page',
  data () {
    return {
      logs: [],
      columns: [
        {
          type: 'index',
          title: '序号',
          width: 100
        },
        {
          key: 'type',
          title: '类型',
          width: 100,
          render: (h, { row }) => {
            return (
              <div>
                <icon size={16} type={row.type === 'ajax' ? 'md-link' : 'md-code-working'}></icon>
              </div>
            )
          }
        },
        {
          key: 'code',
          title: '编码',
          render: (h, { row }) => {
            return (
              <span>{ row.code === 0 ? '-' : row.code }</span>
            )
          }
        },
        {
          key: 'mes',
          title: '信息'
        },
        {
          key: 'url',
          title: 'URL'
        },
        {
          key: 'time',
          title: '时间',
          render: (h, { row }) => {
            return (
              <span>{ dayjs(row.time).format('YYYY-MM-DD HH:mm:ss') }</span>
            )
          },
          sortable: true,
          sortType: 'desc'
        }
      ]
    }
  },
  methods: {
    inita () {
      getCodeLogs({}).then(res => {

      })
    }
  },
  mounted () {
    this.inita()
  }
}
</script>

<style>

</style>
