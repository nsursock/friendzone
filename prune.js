// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()


console.log('starting up');


(async () => {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = 'users.dev'
    var { data } = await supabase.from(table).select()
    await Promise.all(data.forEach(async (x) => {
      console.log('treating', x.email);
      const { error } = await supabase.rpc('prune', {
        email: x.email
      })
      if (error) console.error(error)
    }))

  } catch (error) {
    console.log(error)
  }
})();