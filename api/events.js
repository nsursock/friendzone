import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )
    const storageName = process.env.NODE_ENV.startsWith('dev')
      ? 'users.dev'
      : 'users.dev'

    const dateString = new Date().toISOString().split('T').shift()
    const date1 = new Date();
    const date2 = new Date();
    date1.setDate(date1.getDate() - 1)
    date2.setDate(date2.getDate() + 1)
    const dateString1 = date1.toISOString().split('T').shift()
    const dateString2 = date2.toISOString().split('T').shift()
    // console.log(dateString1, dateString2)

    const { data, error } = (
      await supabase
        .from(storageName)
        .select('*')
        // .eq('birthday', dateString)
      .lt('birthday', dateString2)
      .gt('birthday', dateString1)
    )
    if (error) console.log(error)

    response.status(200).json({ data })
  } catch (error) {
    response.status(400).json({ message: 'Failed to fetch birthdays.' })
  }
}
