import Vue from 'vue'
import App from '../home.vue'
import ActiveSync from 'active-sync'

Vue.use( ActiveSync )

document.addEventListener("DOMContentLoaded", e => {
  const app = new Vue({
    el: '#app',
    render: h => h(App)
  })
})
