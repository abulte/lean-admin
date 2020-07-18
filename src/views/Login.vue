<template>
  <div>
    <h1></h1>
  </div>
</template>

<script>
export default {
  name: 'Login',
  components: {
  },
  async mounted () {
    try {
      await this.$dgfAuth.retrieveToken()
      this.$router.push('/')
    } catch (ex) {
      console.log('error', ex)
    }
  }
}
</script>
