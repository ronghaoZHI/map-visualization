<template>
  <div id="app">
    <overview />
  </div>
</template>

<script>
import overview from '@/views/overview/';
export default {
  name: 'App',
  components: {
    overview
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

html, body, #app {
  user-select: none;
  border: 0;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

html {
  /* 全局主题色 */
  --themeColor: #7172ff;
}
</style>
