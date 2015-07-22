import mongojs from 'mongojs';

export default {
  remove() {
    const db = mongojs('mongodb://laddr:pook!00FF@ds047440.mongolab.com:47440/laddr-dev', [
      'users',
      'animals',
      'people',
    ]);

    return new Promise((resolve, reject) => {
      db.users.remove({}, false, err => {
        if (err) {
          return reject(err);
        }

        db.animals.remove({}, false, _err => {
          if (_err) {
            return reject(_err);
          }

          db.people.remove({}, false, __err => {
            if (__err) {
              return reject(__err);
            }

            resolve();
          });
        });
      });
    });
  },
};
