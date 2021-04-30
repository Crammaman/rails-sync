import Vue from 'vue'
import App from '../home.vue'
import ActiveSync from 'active-sync'

let activeSync = new ActiveSync({ modelNames: ['Customer', 'Site'] })

Vue.use( activeSync )

document.addEventListener("DOMContentLoaded", e => {
  const app = new Vue({
    el: '#app',
    render: h => h(App)
  })
})
