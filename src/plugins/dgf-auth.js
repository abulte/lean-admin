class AuthLib {
  constructor (options, http) {
    this.options = options
    this.http = http
    const protocol = this.options.protocol || 'https'
    this.serverURL = `${protocol}://${this.options.domain}`
    this.state = 'f2d81a260dea8a100dd517984e53c56'
    this.code_verifier = 'd14a30a27e77370585e078ad7cff6b139254983e3e28825ca0077f49' // Not random for dev purpose
  }

  _getBaseUrl () {
    const port = window.location.port
    return window.location.protocol + '//' + window.location.hostname + (port ? ':' + port : '')
  }

  isAuthenticated () {
    // TODO: handle expiration
    return !!localStorage.dgfToken
  }

  async retrieveToken () {
    const clientId = this.options.clientId
    const clientSecret = this.options.clientSecret
    const headerStr = btoa(`${clientId}:${clientSecret}`)

    const queryDict = {}
    window.location.search.substr(1).split('&').forEach(function (item) { queryDict[item.split('=')[0]] = item.split('=')[1] })
    const code = queryDict.code
    // const state = queryDict.state

    const response = await this.http.post(
      `${this.serverURL}/oauth/token`,
      {
        grant_type: 'authorization_code',
        code: code,
        code_verifier: this.code_verifier,
        redirect_uri: `${this._getBaseUrl()}${this.options.redirect}`
      },
      {
        headers: {
          Authorization: `Basic ${headerStr}`
        },
        emulateJSON: true
      }
    )
    console.log(response.body.access_token)
    localStorage.dgfToken = response.body.access_token
  }

  /**
   * Launches the login workflow
   */
  async login () {
    const codeChallenge = await pkceChallengeFromVerifier(this.code_verifier)
    const urlCodeChallenge = encodeURIComponent(codeChallenge)
    const redirectURI = encodeURIComponent(`${this._getBaseUrl()}${this.options.redirect}`)
    const state = encodeURIComponent(this.state)
    const serverURL = `${this.serverURL}/oauth/authorize`
    const clientId = encodeURIComponent(this.options.clientId)

    const urlLogin = `${serverURL}?redirect_uri=${redirectURI}&response_type=code&client_id=${clientId}&scope=default&state=${state}&code_challenge=${urlCodeChallenge}&code_challenge_method=S256`
    console.log(urlLogin)
    window.location = urlLogin
  }

  /**
   * Deletes the local token and revoke it from the server
   * FIXME: does not work on server side (probably because missing @csrf.exempt)
   */
  async logout () {
    const serverURL = `${this.serverURL}/oauth/revoke/`
    try {
      await this.http.post(serverURL, { token: localStorage.dgfToken }, { emulateJSON: true })
    } catch (error) {
      console.log('error', error)
    } finally {
      delete localStorage.dgfToken
      delete localStorage.dgfTokenExpires
    }
  }
}

const DGFAuth = {
  install (Vue, options) {
    if (!Vue.http) {
      return console.error('dgf-auth requires vue-resource')
    }
    Vue.prototype.$dgfAuth = new AuthLib(options, Vue.http)
    Vue.http.interceptors.push(function (request) {
      const token = localStorage.dgfToken
      const isApiCall = (
        request.url.indexOf(`${options.domain}/api/1`) !== -1 ||
        request.url.indexOf(`${options.domain}/oauth/revoke`) !== -1
      )
      if (isApiCall && token) {
        request.headers.set('Authorization', `Bearer ${token}`)
      }
    })
  }
}

export default DGFAuth

function sha256 (plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

function base64urlencode (str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function pkceChallengeFromVerifier (v) {
  const hashed = await sha256(v)
  return base64urlencode(hashed)
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(DGFAuth)
}
