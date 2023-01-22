import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = process.env.NODE_ENV.startsWith('dev')
      ? 'messages.dev'
      : 'messages'

    switch (request.query.mode) {

      case 'post':
        const { author, content, relatedId } = request.body

        var { data, error } = await supabase.from(table).insert({
          author, content, related_id: relatedId
        }).select('*')

        if (error) throw new Error(error)
        response.status(200).json({ success: true })
        break

      case 'display':
        var { data, error } = (await supabase.from(table)
          .select('id, created_at, related_id, author ( first_name, last_name, avatar_url ), content')
          .eq('author', request.query.email))

        if (error) console.log(error)
        
        response.status(200).json({ data })
        break
    }

  } catch (error) {
    console.log(error);
    response.status(400).json({ message: 'Failed to manipulate messages.' })
  }
}
