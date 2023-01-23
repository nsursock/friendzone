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

    var emails = (await supabase.from('users.dev').select('email')).data.map((item) => item.email)


    const num = 1000
    for (let index = 0; index < num; index++) {

      var { data, error } = await supabase.from(table).insert({
        related_id: null,
        created_at: faker.date.recent(10),
        author: emails[index % emails.length],
        content: faker.lorem.text(),
        num_like: Math.round(Math.random() * 100),
        num_impr: Math.round(Math.random() * 1000)
      }).select('*')

      console.log({
        index,
      });
    }


  } catch (error) {
    console.log(error)
  }
})();