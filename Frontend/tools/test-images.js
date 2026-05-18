const urls = [
  'https://images.unsplash.com/photo-1614316710777-6d60a5e2f7ac',
  'https://images.unsplash.com/photo-1623653387945-2f8832a8ba30',
  'https://images.unsplash.com/photo-1605333580556-32dbeb75a18b',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591',
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b',
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b',
  'https://images.unsplash.com/photo-1505075937812-706f9adbc955',
  'https://images.unsplash.com/photo-1524114664604-cd8133cd67af',
  'https://images.unsplash.com/photo-1551024506-0bccd828d307',
  'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
  'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
  'https://images.unsplash.com/photo-1516280440502-86134dcdebf7',
  'https://images.unsplash.com/photo-1558227092-28c946f007b8',
  'https://images.unsplash.com/photo-1520699918507-3c3e05c46b0c',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67'
];

async function test() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(url, res.status);
    } catch (e) {
      console.log(url, 'Error');
    }
  }
}
test();
