<template>
<div>
  <p>{{site.name}}</p>
  <!-- <p>{{site.customer.name}}</p> -->
</div>
</template>
<script>
export default {
  name: 'site',
  props: ['site']
}
</script>
