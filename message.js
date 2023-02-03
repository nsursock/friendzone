// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const { faker } = require('@faker-js/faker');

console.log('starting up');

(async () => {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    const table = 'messages.dev'

    var emails = (await supabase.from('users.dev').select('email')).data.map((item) => item.email).sort(() => 0.5 - Math.random())
    var ids = (await supabase.from('messages.dev').select('id')).data.map((item) => item.id).sort(() => 0.5 - Math.random())

    const num = 1000
    // const ids = [4673,4674,4675,4676,4677]
    for (let index = 0; index < num; index++) {

      var { data, error } = await supabase.from(table).insert({
        related_id: ids[index%ids.length],
        created_at: faker.date.recent(10),
        author: emails[index % emails.length],
        content: faker.lorem.text(),
        num_like: Math.round(Math.random() * 100),
        num_impr: Math.round(Math.random() * 1000)
      }).select('*')

      console.log({
        index, data
      });
    }


  } catch (error) {
    console.log(error)
  }
})();