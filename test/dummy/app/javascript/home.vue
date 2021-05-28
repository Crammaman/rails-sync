<template>
  <div>
    <p>Rails Sync</p>
    <div v-for="customer in customers">
      <customer :customer="customer"></customer>
    </div>
  </div>
</template>

<script>
import Customer from './customer.vue'
import Site from './site.vue'
export default {
  data: function () {
    return {
      customers: []
    }
  },

  created() {
    this.$Customer.all.then((customers) => this.customers = customers)
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
