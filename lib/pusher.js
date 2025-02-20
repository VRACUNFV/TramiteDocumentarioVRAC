import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,       // Configurado en Vercel
  key: process.env.PUSHER_KEY,            // Configurado en Vercel
  secret: process.env.PUSHER_SECRET,      // Configurado en Vercel
  cluster: process.env.PUSHER_CLUSTER,    // Configurado en Vercel
  useTLS: true,
});

export default pusher;
