<template>
  <div>
    <Card shadow>
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>
        权限查看
      </p>
    <tree-table height="900" expand-key="name"
      :expand-type="false"
      :is-fold="false"
      :tree-type="true"
      :selectable="false"
      :columns="columns"
      :data="data">
      <template slot="path" slot-scope="{ row }">
        <Badge v-if="row.method==='1'" type="success" text="get"/>
        <Badge v-else-if="row.method==='2'" type="primary" text="post"/>
        <Badge v-else-if="row.method==='3'" type="info" text="put"/>
        <Badge v-else-if="row.method==='4'" type="error" text="delete"/>
        <Badge v-else="" type="primary" text="any"/>
        <span>{{row.path}}</span>
      </template>
      <template slot="type" slot-scope="{ row }">
        <span v-if="row.type===1">资源</span>
        <span v-else-if="row.type===2">操作</span>
        <span v-else="">其他</span>
      </template>
    </tree-table>
    </Card>
  </div>
</template>

<script>
import { listConvertTree } from '@/libs/util'
import { getAccess } from '@/api/setting'
export default {
  name: 'SystemGrantAccess',
  data () {
    return {
      loading: false,
      columns: [
        {
          title: '权限名',
          key: 'name'
        },
        {
          title: '权限标识',
          key: 'code'
        },
        {
          title: '类型',
          type: 'template',
          template: 'type'
        },
        {
          title: '路由',
          type: 'template',
          template: 'path'
        }
      ],
      data: []
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
    }
  },
  mounted: function () {
    this.handleSearch()
  }
}
</script>
