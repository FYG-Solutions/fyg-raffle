<template>
  <div class="w-full">
    <Navbar />
    <router-view />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";

export default {
  name: "Main",
  components: { Navbar }
};
</script>
