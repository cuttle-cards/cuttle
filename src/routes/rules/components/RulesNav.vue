<template>
  <v-col
    class="sidebar-container"
    md="3"
    sm="12"
  >
    <ul ref="sidebarContainer" class="ms-5 sidebar-title mt-8">
      <li
        v-for="{ title, href, id } in sectionTitles"
        :id="'listItem_' + id"
        :key="title"
        ref="items"
      >
        <button
          :class="[
            activeTitle === id ? 'active-title' : '',
            'text-h5 text-decoration-none text-surface-2',
          ]"
          @click="emit('click', href)"
        >
          {{ t(title) }}
        </button>
      </li>
    </ul>
  </v-col>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  sectionTitles: {
    type: Array,
    required: true,
  },
  activeTitle: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['click']);

const { t } = useI18n();

</script>

<style scoped>
.sidebar-title {
  display: flex;
  gap: 2rem;
}

.sidebar-title li {
  list-style: none;
}

.active-title {
  background-color: rgba(var(--v-theme-newPrimary));
}

@media (min-width: 960px) {
  .sidebar-title {
    position: sticky;
    top: 130px;
    flex-direction: column;
  }
}

@media (max-width: 960px) {
  .sidebar-container {
    background: rgba(var(--v-theme-surface-1));
    position: sticky;
    top: 64px;
    z-index: 999;
  }
  .sidebar-title {
    white-space: nowrap;
    overflow-x: auto;
  }

  .section-title {
    font-size: 2.5rem !important;
  }
}
</style>