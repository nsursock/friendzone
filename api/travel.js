import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = process.env.NODE_ENV.startsWith('dev')
      ? 'travels.dev'
      : 'travels.dev'

    switch (request.query.mode) {
      case 'edit':
        var { traveler, arrival_date, from, to } = request.body

        var object = { traveler, arrival_date, from, to }
        var { data, error } = await supabase.from(table).update(object).eq('id', request.query.id).select('*')

        if (error) throw new Error(error)
        response.status(200).json({ success: true })
        break

      case 'create':
        var { traveler, arrival_date, from, to } = request.body

        var object = { traveler, arrival_date, from, to }
        var { data, error } = await supabase.from(table).insert(object).select('*')

        if (error) throw new Error(error)
        response.status(200).json({ success: true })
        break

      case 'read':
        const date1 = new Date(request.query.arrival)
        const date2 = new Date(request.query.arrival)
        date2.setDate(date2.getDate() + 1)
        const dateString1 = date1.toISOString().split('T').shift()
        const dateString2 = date2.toISOString().split('T').shift()

        var { data, error } = (
          await supabase
            .from(table)
            .select('id, traveler (email, first_name, last_name, avatar_url), arrival_date, from')
            .lt('arrival_date', dateString2)
            .gt('arrival_date', dateString1)
        )
        if (error) throw new Error(error)
        response.status(200).json({ data })
        break
    }
  } catch (error) {
    response.status(400).json({ message: 'Failed to fetch travels.' })
  }
}