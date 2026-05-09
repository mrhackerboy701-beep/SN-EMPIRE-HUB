import admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function test() {
  try {
    await db.collection('test').add({ msg: 'Hello from ADC' });
    console.log('SUCCESS: Firestore Admin connected via ADC!');
  } catch (err: any) {
    console.error('ERROR:', err.message);
  }
}

test();
