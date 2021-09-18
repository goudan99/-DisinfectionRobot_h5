<template>
  <div>
    <Card shadow>
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>
        用户操作日志
      </p>
      <div class="search-con search-con-top">
        <Input placeholder="请输入用户名..." style="width: 300px" v-model="search.key"></Input>
        <Select v-model="search.status" style="width:200px;margin-left:8px">
          <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <DatePicker type="daterange" placeholder="选择时间" style="width: 200px;margin-left:8px" v-model="created_at" @on-change="change"></DatePicker>
        <Button icon="ios-search" type="primary" @click="handleSearch" style="margin-left:8px" :loading="seloading">搜索</Button>
      </div>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleExcel()">
            <Icon type="search"/>&nbsp;&nbsp;导出日志记录
          </Button>
          <!-- <Button class="search-btn" type="error" @click="handleRemove(select)" :disabled="disabled">
            <Icon type="search"/>&nbsp;&nbsp;删除日志
          </Button> -->
        </ButtonGroup>
      </div>
      <Table ref="table" :columns="columns" :data="data" :loading="loading"></Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer show-total @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getUserLogs } from '@/api/app'
import excel from '@/libs/excel'
export default {
  name: 'error_logger_page',
  data () {
    return {
      data: [],
      created_at: ['', ''],
      exportLoading: false,
      loading: false,
      disabled: true,
      seloading: false,
      statusList: [{ value: -1, label: '状态' }, { value: 1, label: '可用' }, { value: 0, label: '不可用' }],
      search: {
        key: '',
        status: -1,
        begin_at: '',
        end_at: ''
      },
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10
      },
      columns: [
        {
          key: 'id',
          title: 'id',
          width: 100
        },
        {
          key: 'user_name',
          title: '用户名',
          width: 100
        },
        {
          key: 'content',
          title: '操作内容'
        },
        {
          key: 'created_at',
          width: 150,
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
    handleSearch () {
      this.loading = true
      this.seloading = true
      getUserLogs(Object.assign({}, this.pageInfo, this.search)).then(res => {
        if (res.code === 0) {
          this.data = res.data.data
          this.pageInfo.total = parseInt(res.data.total)
          this.disabled = true
          this.seloading = false
          this.loading = false
        }
      }).catch(e => {
        this.disabled = true
        this.seloading = false
        this.loading = false
      })
    },
    handleExcel () {
      if (this.data.length) {
        this.exportLoading = true
        const params = {
          title: ['序号', '用户名', '操作名', '操作数据', '操作时间'],
          key: ['id', 'user_name', 'content', 'data', 'created_at'],
          data: this.data,
          autoWidth: true,
          filename: '任务日志'
        }
        excel.export_array_to_excel(params)
        this.exportLoading = false
      } else {
        this.$Message.info('表格数据不能为空！')
      }
    },
    handlePage (current) {
      this.pageInfo.page = current
      this.handleSearch()
    },
    handleRemove () {
    },
    handlePageSize (size) {
      this.pageInfo.limit = size
      this.handleSearch()
    },
    change () {
      this.search.begin_at = this.created_at.length >= 1 ? this.created_at[0] : ''
      this.search.end_at = this.created_at.length >= 2 ? this.created_at[1] : ''
    }
  },
  mounted () {
    this.handleSearch()
  }
}
</script>

<style>

</style>
