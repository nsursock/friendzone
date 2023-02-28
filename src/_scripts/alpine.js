import Alpine from 'alpinejs'

import intersect from '@alpinejs/intersect'
Alpine.plugin(intersect)

import global from './global.js'
Alpine.data('global', global)

Alpine.directive(
  'else',
  (el, { expression, modifiers }, { evaluateLater, cleanup }) => {
    const previous = el.previousElementSibling

    if (!previous || previous.tagName.toLowerCase() !== 'template' || !previous.hasAttribute('x-if')) {
      throw new Error('`x-else` encountered without a previous `x-if` sibling.')
    }

    el.setAttribute('x-if', `! (${previous.getAttribute('x-if')})`)
  }
)

window.Alpine = Alpine

// Start Alpine when the page is ready.
window.addEventListener('DOMContentLoaded', () => {
  Alpine.start()
});

// // Basic Store Example in Alpine.
// window.addEventListener('alpine:initializing', () => {
//   Alpine.store('nav', {
//     isOpen: false,
//     close() { return this.isOpen = false },
//     open() { return this.isOpen = true },
//     toggle() { return this.isOpen = !this.isOpen }
//   })
// })

import { createClient } from '@supabase/supabase-js'

window.addEventListener('alpine:initializing', () => {

  Alpine.store('db', {
    client: null,

    createClient(url, key) {
      if (this.client === null)
        this.client = createClient(url, key)
    }
  })

  Alpine.store('auth', {
    user: null,

    setUser(user) {
      this.user = user
    },

    init() {
      this.getLoggedInUser()
    },

    getLoggedInUser() {
      var token = null
      if ('friendzone_token' in sessionStorage) {
        token = sessionStorage.getItem('friendzone_token')
      }
      else if ('friendzone_token' in localStorage) {
        token = localStorage.getItem('friendzone_token')
      }

      if (token) {
        fetch('/api/auth', {
          method: 'POST',
          body: token,
        })
          .then((response) => response.json())
          .then(async (message) => {
            if (message.success) {
              this.user = message.user

              if (!this.user.public_key || !this.user.private_key) {
                // handle keys that are not in database
                const keyPair = await window
                  .crypto
                  .subtle
                  .generateKey({
                    name: "ECDH",
                    namedCurve: "P-256"
                  }, true, ["deriveKey", "deriveBits"]);

                const publicKey = await window
                  .crypto
                  .subtle
                  .exportKey("jwk", keyPair.publicKey);

                const privateKey = await window
                  .crypto
                  .subtle
                  .exportKey("jwk", keyPair.privateKey);

                await fetch(`/api/contact?mode=sender_keys&email=${this.user.email}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    publicKey: JSON.stringify(publicKey),
                    privateKey: JSON.stringify(privateKey)
                  })
                })
              }
            }
          })
      }
    },
  })
})
