<template>
  <div class="everything"></div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "every-things",
  setup(props, { emit }) {
    return {};
  },
});
</script>
<style lang="less" scoped>
.everything {
  display: flex;
}
</style>
