<script setup lang="ts">
import { NMessageProvider, NConfigProvider, darkTheme } from 'naive-ui'
import DesktopTitleBar from './components/DesktopTitleBar.vue'
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <DesktopTitleBar />
      <main class="app-content">
        <router-view/>
      </main>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-content {
  height: 100vh;
  width: 100vw;
}

body.wenyan-desktop-shell .app-content {
  height: calc(100vh - 2.35rem);
  padding-top: 2.35rem;
  box-sizing: border-box;
}

body.wenyan-desktop-shell .app-content > .h-screen {
  height: calc(100vh - 2.35rem);
}

body:not(.wenyan-desktop-shell) .app-content {
  padding-top: 0;
}
</style>
