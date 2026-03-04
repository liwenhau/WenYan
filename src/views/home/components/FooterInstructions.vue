<template>
    <div class="absolute bottom-6 md:bottom-8 text-xs tracking-[0.2em] opacity-40 hover:opacity-80 transition-all duration-300 font-sans uppercase"
         :class="isDark ? 'text-neutral-600' : 'text-neutral-400'">
        <span class="hidden md:inline">Space to Shuffle &nbsp;•&nbsp; Click to Copy</span>
        <span class="md:hidden">Tap to Shuffle</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
  isDark: boolean;
}>();
</script>
