<template>
  <v-menu  transition="slide-x-transition">
    <template #activator="{ props }">
      <v-btn
        data-cy="user-menu"
        class="hidden-xs-only d-flex text-body-1"
        v-bind="props"
        variant="text"
      >
        <v-icon 
          aria-label="Open user menu"
          aria-hidden="false"
          role="img"
        />
        {{$store.state.auth.username}}
      </v-btn>
    </template>
    <v-list density="compact" class="bg-surface-2 text-surface-1">
      <v-list-item
        v-for="({ text, icon, page }, i) in getMenuItems"
        :key="i"
        :prepend-icon="`mdi-${icon}`"
        :title="text"
        :to="page"
        exact
        :data-nav="text"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
import { getMenuItems }  from '@/composables/navLink.js';
</script>