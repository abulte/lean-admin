<template>
  <div id="app" class="container mb-4">
    <b-navbar variant="dark" type="dark">
      <b-navbar-brand href="#">lean-admin</b-navbar-brand>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right v-if="me">
          <template v-slot:button-content>
            <em>{{ me.first_name }} {{ me.last_name }}</em>
          </template>
          <b-dropdown-item @click="logout">Déconnexion</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item @click="login" v-if="!me">Connexion</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      isAuthenticated: false,
      me: ''
    }
  },
  mounted () {
    this.isAuthenticated = this.$dgfAuth.isAuthenticated()
    if (this.isAuthenticated) {
      this.$dgfApi.getMe().then(me => {
        this.me = me
      }).catch(err => {
        console.error(err)
      })
    }
  },
  methods: {
    async login () {
      await this.$dgfAuth.login()
    },
    async logout () {
      await this.$dgfAuth.logout()
      this.isAuthenticated = false
      this.me = ''
    }
  }
}
</script>

<style>
</style>
