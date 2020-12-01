<template>
  <div class="w-full">
    <Navbar />
    <transition name="fade">
      <router-view v-if="routerActive" />
    </transition>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";

export default {
  name: "Main",
  data() {
    return {
      routerActive: true
    };
  },
  components: { Navbar },
  methods: {
    async play() {
      this.routerActive = false;
      await new Promise(r => setTimeout(r, 500));
      this.routerActive = true;
    }
  }
};
</script>
