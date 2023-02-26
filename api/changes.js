import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = process.env.NODE_ENV.startsWith('dev')
      ? 'messages2.dev'
      : 'messages2.dev'

    switch (request.query.mode) {
      case 'contacts':
        const channel = supabase
          .channel('contact-chat-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: table,
            },
            (payload) => {
              console.log(payload)
              response.status(200).json({ data: payload })
            }
          )
          .subscribe()
        break
    }
  } catch (error) {
  }
}