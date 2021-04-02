<template>
  <el-button @click="onClickTest">1111</el-button>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({
  components: {},
})
export default class Index extends Vue {
  name: string = "index";

  onClickTest() {
    console.log(1);
  }
}
</script>

<style scoped>

</style>
