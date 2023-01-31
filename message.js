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

    //var emails = (await supabase.from('users.dev').select('email')).data.map((item) => item.email)
      const emails = [
        'Neal.Abernathy92@gmail.com',
  'William62@yahoo.com',
  'Rachel_Zemlak@gmail.com',
  'Ollie.Murazik@gmail.com',
  'Ora.Kuvalis52@hotmail.com',
  'Casey.Kautzer59@yahoo.com',
  'Harry48@gmail.com',
  'Clint.Murazik44@hotmail.com',
  'Jamie.Jones58@yahoo.com',
  'Caleb43@yahoo.com',
  'Lance_Turner@yahoo.com',
  'Kelly_Hamill35@hotmail.com',
  'Ella.Buckridge@gmail.com',
  'Bradford_Hodkiewicz@hotmail.com',
  'Paul6@yahoo.com',
  'Virgil.Altenwerth@gmail.com',
  'Gwendolyn_Volkman@yahoo.com',
  'Jimmie91@yahoo.com',
  'Perry.Tremblay37@hotmail.com',
  'Terrell_Graham@gmail.com',
  'Edith57@gmail.com',
  'Edmond_Schultz90@gmail.com',
  'Clara_Hirthe41@gmail.com',
  'Eugene.Collins@gmail.com',
  'Frankie72@yahoo.com',
  'Alfred65@hotmail.com',
  'Shari.Lind42@hotmail.com'
      ]
    // var ids = (await supabase.from('messages.dev').select('id')).data.map((item) => item.id).sort(() => 0.5 - Math.random()).slice(0, 5)

    const num = 1000
    const ids = [4278]
    for (let index = 0; index < num; index++) {

      var { data, error } = await supabase.from(table).insert({
        related_id: null,//ids[index%ids.length],
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