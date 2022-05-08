<template>
  <div>
    <!-- Upper Servicd -->
    <section id="upper-surface" class="pa-8 mb-6">
      <h1 class="text-h2">Clubs 2022</h1>
    </section>
    <section class="px-8">
      <h2 class="text-h3 mb-4">Season Champions</h2>
      <div class="d-flex justify-space-between flex-wrap">
        <award-card username="fooey" :place="1" class="mb-4"/>
        <award-card username="booey" :place="2" class="mb-4"/>
        <award-card username="gluey" :place="3" class="mb-4"/>
      </div>
    </section>
  </div>
</template>

<script>
import AwardCard from '@/components/AwardCard.vue';

export default {
  name: 'Stats',
  components: {
    AwardCard,
  },
};
</script>

<style scoped>
#upper-surface {
  background-color: #F3F3F3;
}
</style>