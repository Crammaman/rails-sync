<template>
  <div>
  <p>{{ customer.name }}</p>
  <site v-for="site in customer.sites" v-if="site.id" :key="'site'+site.id" :site="site"></site>
</div>
</template>
<script>
import Site from './site.vue'
export default{
  name: 'customer',
  props: ['customer'],
  components:{
    Site
  }
}
</script>
