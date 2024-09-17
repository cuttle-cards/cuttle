<template>
  <div class="multiplayer-rule-block">
    <div class="d-flex align-left mb-4">
      <h2 class="text-label-lg">
        {{ heading }}
      </h2>
    </div>
    <p class="d-block text-md">
      {{ paragraph }}
      {{ rulesDifference }}
    </p>
    <ul class="list-outside-pl5 text-md rules-ul">
      <li v-for="(rule, index) in rules" :key="index" class="rules-li">
        {{ rule }}
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  heading: {
    type: String,
    required: true,
  },
  paragraph: {
    type: String,
    required: true,
  },
  rules: {
    type: Array,
    required: true,
  },
  rulesDifference: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.multiplayer-rule-block {
  width: 100%;
  margin: 2rem 0 0 0;
}

.rules-ul {
  padding-left: 2rem;
}

.rules-li {
  padding: 0 0 1rem 0;
}

.rules-ul > li:first-child {
  margin-top: 16px;
}
</style>
