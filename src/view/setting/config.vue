<template>
  <div>
    <Card shadow>
      <p slot="title">
        <Icon type="ios-film-outline"></Icon>
        站点配置
      </p>
      <Row :gutter="16">
        <Col span="4" >
          <CellGroup>
            <Cell v-for="(item, index) in group" :key="index" :title="index" :selected="active === index">
              <div @click="switchItem(index)">{{item.label}}</div>
            </Cell>
          </CellGroup>
        </Col>
        <Col span="20" v-for="(items, index) in data" :key="'tab'+index" v-show="active === index">
          <Form :ref="'configForm'">
            <FormItem>
              <Button type="primary" @click="handleSubmit(index)" :loading="loading">保存</Button>
            </FormItem>
            <template v-for="item in items">
              <FormItem :key="item.id" :label="item.name">
                <Input v-model="item.value" v-if="item.field_type === 'text'" :placeholder="item.help" type="text" />
                <Input v-model="item.value" v-else-if="item.field_type === 'number'" type="number" />
                <Input v-model="item.value" v-else-if="item.field_type === 'textarea'" type="textarea" />
                <i-switch v-model="item.value" v-else-if="item.field_type === 'switch'" size="large" true-value="1" false-value="0"/>
                <Editor v-model="item.value" v-else-if="item.field_type === 'longtext'"/>
                <Upload v-model="item.value" v-else-if="item.field_type === 'image'" :change="upload"/>
                <Select v-model="item.value" v-else-if="item.field_type === 'select'"/>
              </FormItem>
            </template>
          </Form>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
import { getConfig, storeConfig, upload } from '@/api/setting'
export default {
  name: 'settingConfig',
  data () {
    return {
      loading: false,
      active: 'system',
      data: [],
      group: []
    }
  },
  methods: {
    handleSearch () {
      this.loading = true
      getConfig().then(res => {
        this.data = res.data.data
        this.group = res.data.group
        this.loading = false
      })
    },
    switchItem (item) {
      this.active = item
    },
    upload (file) {
      return upload(file)
    },
    handleSubmit (name) {
      storeConfig(this.data[name]).then(res => {
        this.loading = false
        this.$Message.success('保存成功')
      })
    }
  },
  mounted: function () {
    this.handleSearch()
  }
}
</script>
