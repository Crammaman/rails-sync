<template>
  <div>
    <p>Rails Sync</p>
    <!-- <div v-for="customer in customers.slice(0,1)">
      <customer :customer="customer"></customer>
    </div> -->
    <div v-for="site in sites">
      <site :site="site"></site>
      <!-- <customer :customer="site.customer"></customer> -->
    </div>
  </div>
</template>

<script>
import Customer from './customer.vue'
import Site from './site.vue'
export default {
  data: function () {
    return {
      //customers: this.$Customer.all
      sites: this.$Site.all
    }
  },
  components:{
    Customer,
    Site
  }
}
</script>

<style>
p {
  font-size: 2em;
  text-align: center;
}
</style>
