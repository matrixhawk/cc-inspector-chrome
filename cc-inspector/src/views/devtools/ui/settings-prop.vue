<template>
  <div class="settings-prop">
    <span class="label">{{ label }}</span>
    <slot class="slot"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsProp",
  props: {
    label: {
      type: String,
      default: "",
    },
  },
});
</script>

<style scoped lang="less">
.settings-prop {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 300px;
  margin: 2px 4px;

  .label {
    max-width: 80px;
    min-width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slot {
    flex: 1;
  }
}
</style>
