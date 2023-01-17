// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const argon2 = require('argon2')
const { faker } = require('@faker-js/faker');
const { createApi } = require('unsplash-js')

// on your node server
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  //...other fetch options
});


function getNames(fakeEmail, sep) {
  const arr = fakeEmail.split('@')[0].split(sep)
  first_name = arr[0].replace(/\d+/g, '')
  last_name = arr[1].replace(/\d+/g, '')
  return ({ first_name, last_name })
}

// const NUM_USERS = 1

(async () => {
  try {

    // const avatars = await unsplash.photos.getRandom({
    //   query: 'face',
    //   count: NUM_USERS,
    // });
    // const covers = await unsplash.photos.getRandom({
    //   query: 'landscape',
    //   count: NUM_USERS,
    // });
    // console.log(avatars.response[0].urls);

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )
    for (let index = 0; index < 20; index++) {
      // const fakeEmail = faker.internet.email()
      const clearPassword = faker.internet.password()

      // let names = {}
      // if (fakeEmail.split('@')[0].includes('.')) names = getNames(fakeEmail, '.')
      // else if (fakeEmail.split('@')[0].includes('_')) names = getNames(fakeEmail, '_')
      // else names = { first_name: fakeEmail.split('@')[0].replace(/\d+/g, ''), last_name: faker.name.lastName() }

      const sex = faker.name.sex()
      const name = faker.name.fullName({ sex })
      if (name.split(' ').length === 2) {
        const names = {
          first_name: name.split(' ')[0],
          last_name: name.split(' ')[1]
        }

        const query = 'face,' + sex
        const avatar = await unsplash.photos.getRandom({
          query,
          count: 1,
        });
        const cover = await unsplash.photos.getRandom({
          query: 'landscape',
          count: 1,
        });

        const element = {
          email: faker.internet.email(names.first_name, names.last_name),
          password: await argon2.hash(clearPassword),
          passwd_clear: clearPassword,
          first_name: names.first_name,
          last_name: names.last_name,
          user_name: faker.internet.userName(names.first_name, names.last_name),
          avatar_url: avatar.response[0].urls.raw,
          cover_url: cover.response[0].urls.raw,
          description: faker.lorem.paragraph(3),
          website: faker.internet.url(),
          phone_number: faker.phone.number(),
          country: faker.address.country(),
          city: faker.address.city(),
          birthday: faker.date.birthdate(),
          title: faker.name.jobTitle(),
          company: faker.company.name()
        }
        console.log('processing: ', { index, element });

        const { data, error } = await supabase.from('users.dev').insert(element).select('*')
        if (error) throw new Error(error)
      }
    }
  } catch (error) {
    console.log(error)
  }
})();