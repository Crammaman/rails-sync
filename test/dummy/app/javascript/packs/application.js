import Vue from 'vue'
import App from '../home.vue'
import RailsSync from 'rails-sync'

Vue.use( RailsSync )

document.addEventListener("DOMContentLoaded", e => {
  const app = new Vue({
    el: '#app',
    render: h => h(App)
  })
})
