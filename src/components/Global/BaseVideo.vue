<template>
  <div class="video-container__wrapper mx-auto">
    <div class="video-container">
      <iframe
        class="video-container__video"
        :src="source"
        title="Cuttle Game Tutorial -- Youtube Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
  </div>
</template>


<script>
export default {
  name: 'BaseVideo',
  props: {
    source: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.video-container__wrapper {
  width: 100%;
}

/* https://css-tricks.com/fluid-width-video/ */
.video-container {
  position: relative;
  padding: 0 0 56.25%;
  height: 0;
  width: 100%;
  margin: 0 auto;
}

.video-container__video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
