import mongoose from 'mongoose';

export default function(url) {
  return new Promise((resolve, reject) => {
    mongoose.connect(url, {
      server: {
        auto_reconnect: true,
        socketOptions: {
          keepAlive: 1,
          socketTimeoutMS: 10000
        },
      },
      replset: {
        socketOptions: {
          keepAlive: 1,
        },
      },
    });

    mongoose.connection.on('connected', resolve);
    mongoose.connection.on('error', reject);

    // FIXME: handle disconnecting purposely vs. accidentally
    /*
    mongoose.connection.on('disconnected', function disconnected() {
      console.log('MongoDB disconnected!');
      mongoose.connect(url, { server: { auto_reconnect: true }});
    });
    */
  });
}
