import { format, formatRelative, formatDistance } from 'date-fns'

// import hljs from 'highlight.js';

export default () => ({

  notifications: [],
  showNotifications: false,
  supabase: null,

  openWarning: false,
  openNewPost: false,
  openContacts: false,
  searchText: '',

  tabs: [
    {
      id: 'All'
    }, {
      id: 'Online'
    }, /*{
      id: 'Offline'
    },*/ {
      id: 'Unread'
    }
  ],

  // highlightAll() {
  //   hljs.highlightAll()
  // },

  logout() {
    sessionStorage.removeItem('friendzone_token')
    localStorage.removeItem('friendzone_token')
    Alpine.store('auth').setUser(null)
    window.location.href = '/'
  },

  async getConnects() {
    const invites = (await (await fetch('/api/directory?mode=invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: Alpine.store('auth').user?.email
      })
    })).json()).data

    invites.map((invite) => {
      const { id, created_at, user1 } = invite
      const isAlreadyNotified = this.notifications.findIndex((notif) => notif.id === id) !== -1
      if (!isAlreadyNotified)
        this
          .notifications
          .push({ id, created_at, type: 'connect', show: true, success: false, user: user1 })
    })

  },

  handleConnect(email) {
    fetch('/api/directory?mode=connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user1: Alpine
          .store('auth')
          .user
          .email,
        user2: email,
        status: 'Pending'
      })
    })
      .then((response) => response.json())
      .then((message) => {
        if (!message.success) {
          this
            .notifications
            .push({ show: true, success: false, title: 'Invitation not sent', description: 'There was an error inviting this person.' })
        } else {
          this
            .notifications
            .push({ show: true, success: true, title: 'Invite sent!', description: 'Please wait for the confirmation.' })
        }
      })
      .catch((error) => {
        this
          .notifications
          .push({ show: true, success: false, title: 'Invitation not sent', description: 'There was an error inviting this person.' })
      })
      .finally(() => {
        this.showNotifications = true
      })
  },

  formatDate(date, dateFormat) {
    if (dateFormat === 'relative')
      return formatRelative(date, new Date())
    else if (dateFormat === 'distance')
      return formatDistance(date, new Date(), { addSuffix: true })
    else return format(date, dateFormat)
  },

  isMobile() {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      // /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }

})