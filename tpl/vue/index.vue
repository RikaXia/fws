<template lang="pug">
  div.example {{ msg }}
</template>
<script>
export default {
  data(){
      return{
          msg:'Hello'
      }
  }
}
</script>
<style lang="scss">
.example {
    $color:red;
    background:$color;
}
</style>

