<template>
  <v-col
    :class="isInModal ? 'inModal' : 'notInModal'"
    class="sidebar-container"
    :md="msize"
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
  isInModal : {
    type :Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

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
<script>
export default {
  name: 'RulesNav',
  computed: {
    msize() {
      return this.isInModal ? 12 : 3;
    }
  }
};
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
.inModal.sidebar-container{
     background: rgba(var(--v-theme-surface-1));
    position: sticky;
    top: 0;
    z-index:18;
}
@media (max-width: 450px) {
  .inModal.sidebar-container{
    display:none;
  }
}
@media (min-width: 960px) {
  .notInModal.sidebar-container {
    margin-left: -48px;
    margin-right: 48px;
  }

  .notInModal .sidebar-title {
    position: sticky;
    top: 130px;
    flex-direction: column;
  }
}

@media (max-width: 960px) {
  .sidebar-container {
    background: rgba(var(--v-theme-surface-1));
    position: sticky;
    top: 0;
    z-index:18;
  }
  .notInModal.sidebar-container{
    top:64px;
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
