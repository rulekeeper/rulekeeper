const fs = require('fs');
let file = fs.createWriteStream(`results/benchmark.csv`, { flags: 'a' });
file.write(`context, cookies, access_control, ownership, transfer, total\n`)

module.exports = {
  measureTime(app) {
    app.use((req, res, next) => {
      const start = process.hrtime()

      res.on('finish', () => {
        const diff = process.hrtime(start)
        const end = (diff[0] * 1e9 + diff[1]) / 1e6
        file.write(`${end.toLocaleString()}\n`)
      })
      next();
    });
  },

  startTime() {
    return process.hrtime()
    //return null
  },

  getDurationInMilliseconds(start) {
    const diff = process.hrtime(start)
    const end = (diff[0] * 1e9 + diff[1]) / 1e6
    file.write(`${end.toLocaleString()},`)
  }
};
