'use strict';

const doc = require('documentation');

doc('lib/index.js', {}, (err, results) => {
  doc.formats.json(results, {}, (err, json) => {
    console.log(json);
  });
});
