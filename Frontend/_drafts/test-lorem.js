const url = 'https://loremflickr.com/300/300/pizza';
async function test() {
  const res = await fetch(url);
  console.log('loremflickr:', res.status, res.headers.get('content-type'));
}
test();
