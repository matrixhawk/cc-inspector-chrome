<template>
  <div>
    <el-button @click="onClickTest">1111</el-button>
    <HelloWorld msg="fsf"></HelloWorld>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import HelloWorld from "@/popup/HelloWorld.vue";

@Component({
  components: {HelloWorld},
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
