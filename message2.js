// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const { faker } = require('@faker-js/faker');
const Cryptr = require('cryptr');
const { subtle } = require('crypto').webcrypto

function ab2b64(arrayBuffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
}

function b642ab(base64string) {
  return Uint8Array.from(atob(base64string), c => c.charCodeAt(0));
}

async function createKeys() {
  const keyPair = await subtle
    .generateKey({
      name: "ECDH",
      namedCurve: "P-256"
    }, true, ["deriveKey", "deriveBits"]);

  const publicKey = await subtle
    .exportKey("jwk", keyPair.publicKey);

  const privateKey = await subtle
    .exportKey("jwk", keyPair.privateKey);

  return { publicKey, privateKey };
}

async function handleKeys(senderEmail, receiverEmail) {

  const keys = await createKeys();

  let spublicKey = '', sprivateKey = '';
  await fetch(`http://localhost:8888/api/contact?mode=sender_keys&email=${senderEmail}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      publicKey: JSON.stringify(keys.publicKey),
      privateKey: JSON.stringify(keys.privateKey)
    })
  })
    // .then((response) => response.json())
    // .then(async (message) => {

    //   spublicKey = JSON.parse(message.data.publicKey)
    //   sprivateKey = JSON.parse(message.data.privateKey)

    //   spublicKey = await subtle
    //     .importKey("jwk", spublicKey, {
    //       name: "ECDH",
    //       namedCurve: "P-256"
    //     }, true, []);

    //   sprivateKey = await subtle
    //     .importKey("jwk", sprivateKey, {
    //       name: "ECDH",
    //       namedCurve: "P-256"
    //     }, true, ["deriveKey", "deriveBits"]);

    //   console.log(JSON.stringify(spublicKey), JSON.stringify(sprivateKey))
    // })

  if (receiverEmail) {

    const keys2 = await createKeys();

    await fetch(`http://localhost:8888/api/contact?mode=sender_keys&email=${receiverEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publicKey: JSON.stringify(keys2.publicKey),
        privateKey: JSON.stringify(keys2.privateKey)
      })
    })
      // .then((response) => response.json())
      // .then(async (message) => {

      //   let rpublicKey = JSON.parse(message.data.publicKey)
      //   let rprivateKey = JSON.parse(message.data.privateKey)

      //   rpublicKey = await subtle
      //     .importKey("jwk", rpublicKey, {
      //       name: "ECDH",
      //       namedCurve: "P-256"
      //     }, true, []);

      //   rprivateKey = await subtle
      //     .importKey("jwk", rprivateKey, {
      //       name: "ECDH",
      //       namedCurve: "P-256"
      //     }, true, ["deriveKey", "deriveBits"]);

      //   console.log(JSON.stringify(rpublicKey), JSON.stringify(rprivateKey))

      //   return await subtle
      //     .deriveKey({
      //       name: "ECDH",
      //       public: rpublicKey
      //     }, sprivateKey, {
      //       name: "AES-GCM",
      //       length: 256
      //     }, true, ["encrypt", "decrypt"]);
      // });
  }
}


(async () => {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = 'users.dev'
    var { data, error } = await supabase.from(table).select()
    var emails = data.map(x => x.email)

    const num = 1000
    for (let index = 0; index < num; index++) {

      const si = index % emails.length
      const ri = Math.round(Math.random() * emails.length)

      console.log('treating #', { index, s: emails[si], r: emails[ri] })

      let derivedKey = await handleKeys(emails[si], emails[ri])
      // console.log(derivedKey);

      if (derivedKey) {
        const initializationVector = crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(faker.lorem.text());

        const encryptedBuffer = await subtle
          .encrypt({
            name: "AES-GCM",
            iv: initializationVector,
            tagLength: 128
          }, derivedKey, encodedData);

        const encryptedDataBase64 = this.ab2b64(encryptedBuffer);
        const initializationVectorBase64 = this.ab2b64(initializationVector);
        const content = `${encryptedDataBase64}.${initializationVectorBase64}`;

        var table = 'messages2.dev'
        var { data, error } = await supabase.from(table).insert({
          created_at: faker.date.recent(20),
          sender: emails[si],
          receiver: emails[ri],
          content: content,
          unread: true
        }).select('*')

        console.log({
          index, data
        });
      }
    }


  } catch (error) {
    console.log(error)
  }
})();