<template>
  <v-col
    class="sidebar-container"
    md="3"
    sm="12"
    tag="nav"
  >
    <ul ref="sidebarContainer" class="ms-5 sidebar-title mt-8">
      <li
        v-for="{ title, href, id } in sectionTitles"
        :id="'navItem_' + id"
        :key="title"
        class="nav-item"
      >
        <a
          :class="activeTitle === id ? 'active-title' : ''"
          class="nav-button text-label-md"
          @click="emit('click', href)"
        >
          {{ t(title) }}
        </a>
      </li>
    </ul>
  </v-col>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGoTo } from 'vuetify';

const props = defineProps({
  sectionTitles: {
    type: Array,
    required: true,
  },
  activeTitle: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([ 'click' ]);

const { t } = useI18n();

// Scrolling Active link into view
const goTo = useGoTo();
const sidebarContainer = ref();

watch(() => props.activeTitle,
  (newVal) => {
    goTo.horizontal(`#navItem_${newVal}`, { container: sidebarContainer.value });
  }
);
</script>

<style scoped lang="scss">
.sidebar-title {
  display: flex;
  gap: 2rem;

  & .nav-item {
    list-style: none;
    width: 100%;
    border-radius: 16px;
    &:hover {
      background-color: rgba(100, 96, 84, .4);
    }
  }
}

.nav-button {
  display: block;
  padding: 16px;
  width: 100%;
  border-radius: 16px;
  cursor: pointer;
}

.active-title {
  background-color: rgba(var(--v-theme-newPrimary));
}

@media (min-width: 960px) {
  .sidebar-container {
    margin-left: -48px;
    margin-right: 48px;
  }

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
