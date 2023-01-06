import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    const { email, password } = request.body
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    response.status(200).send({ success: true, user: data })
    
  } catch (error) {
    console.log(error)
    response
      .status(400)
      .send({ success: false, error: 'Sorry, an error occurred' })
  }
}