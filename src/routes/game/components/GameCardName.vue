<template>
  <div class="card-name">
    {{ cardName }}
  </div> 
</template>

<script>

export default {
  name: 'GameCardName',
  props: {
    cardName: {
      type: String,
      required: true,
    }
  },
};
</script>

<style lang="scss" scoped>

.card-name {
  color: rgba(var(--v-theme-surface-1));
  background-color: rgba(var(--v-theme-surface-2));
  padding-right: 8px;
  padding-left: 8px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-radius: 8px;
  margin-right: 4px;
  margin-left: 4px;
  display:inline-block;
}
</style>
