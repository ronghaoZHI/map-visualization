import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueAwesomeSwiper from 'vue-awesome-swiper'
// import style (<= Swiper 5.x)
import 'swiper/swiper.min.css';

Vue.use(VueAwesomeSwiper)

Vue.config.productionTip = false

document.addEventListener('mousedown', e => {
  e.preventDefault()
  e.stopPropagation()
}, true);

document.addEventListener('touchstart', e => {
  e.preventDefault()
  e.stopPropagation()
}, true);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
