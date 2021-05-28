<template>
<div>
  <p @click="toggle">{{ customer.name }}</p>
  <div  v-if="expanded">
    <site v-for="site in customer.sites" :key="'site'+site.id" :site="site"></site>
  </div>
</div>
</template>
<script>
import Site from './site.vue'
export default{
  name: 'customer',
  props: ['customer'],
  data() {
    return {
      sites: [],
      expanded: false
    }
  },
  methods: {
    toggle(){
      this.expanded = !this.expanded
      this.sites = this.customer.sites().then((sites) => this.sites = sites)
    }
  },
  components:{
    Site
  }
}
</script>
