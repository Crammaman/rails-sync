<template>
<div>
  <p @click="expanded = !expanded">{{ customer.name }}</p>
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
  data: function() {
    return {
      expanded: false
    }
  },
  components:{
    Site
  }
}
</script>
