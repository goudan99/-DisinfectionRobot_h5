<template>
  <div >
    <div class="heekit-upload">
      <template>
        <div class="heekit-upload-img">
          <div class="heekit-upload-img-no" v-if="value === ''||value === null" @click="handleChange()">
            <Icon type="ios-camera" size="20"></Icon>
          </div>
          <div class="heekit-upload-img-yes" v-else>
            <img :src="value">
          </div>
        </div>
        <div class="heekit-upload-cover" v-if="!(value === ''||value === null)">
          <Icon type="ios-eye-outline" @click="handleView(value)"></Icon>
          <Icon type="ios-trash-outline" @click="handleRemove(item)"  v-if="remove"></Icon>
          <Icon type="ios-create-outline" @click="handleChange()"></Icon>
        </div>
        <input type="file" @change="fileChange" v-show="false" ref="file" />
      </template>
      <template>
        <Progress v-if="lodding" hide-info></Progress>
      </template>
    </div>
    <Modal title="View Image" v-model="visible">
      <img :src="value" v-if="visible" style="width: 100%">
    </Modal>
  </div>
</template>
<script>
export default {
  name: 'Upload',
  props: {
    value: {
      type: String,
      default: ''
    },
    change: {
      type: Function,
      default: null
    },
    remove: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      visible: false,
      lodding: false
    }
  },
  methods: {
    handleView () {
      this.visible = true
    },
    handleChange (event) {
      this.$refs.file.click()
    },
    handleRemove () {
      if (this.remove) {
        this.remove().then(res => {
          this.$emit('input', '')
        })
      }
    },
    fileChange () {
      if (this.change) {
        this.change(event.target.files[0]).then(res => {
          this.$emit('input', res.data.data)
        })
      }
    }
  }
}
</script>

<style lang="less">
  .heekit-upload{
    clear:both;
    // display: inline-block;
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin-right: 4px;
    &-img{
      display: inline-block;
      width:80px;
      &-no{
        width: 58px;
        height:58px;
        line-height: 58px;
      }
      &-yes{
        display: inline-block;
        text-align: center;
        background: #ccc;
        color: #fff;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        vertical-align: middle;
        width: 80px;
        height: 80px;
        line-height: 80px;
        border-radius: 0px;
        img{
          width: 100%;
          height: 100%;
          line-height: 80px;
        }
      }
    }
    &-cover{
      display: none;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,.6);
      i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
      }
    }
    &:hover &-cover{
      display: block;
    }
  }
</style>
