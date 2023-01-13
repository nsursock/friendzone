import { format, formatRelative, formatDistance } from 'date-fns'

export default () => ({

  notifications: [],

  formatDate(date, dateFormat) {
    if (dateFormat === 'relative')
      return formatRelative(date, new Date())
    else if (dateFormat === 'distance')
      return formatDistance(date, new Date(), { addSuffix: true })
    else return format(date, dateFormat)
  },

})