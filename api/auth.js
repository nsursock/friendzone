import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    const { email, password } = request.body

    if (request.query.mode === 'signup') {
      const { user, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })
      if (error)
        response.status(400).send({ success: false, error: error.message })
      else
        response.status(200).send({ success: true, user: user })

    } else if (request.query.mode === 'login') {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error)
        response.status(400).send({ success: false, error: error.message })
      else
        response.status(200).send({ success: true, user: user })
    }

  } catch (error) {
    console.log(error)
    response
      .status(400)
      .send({ success: false, error: 'Sorry, an error occurred' })
  }
}