//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
require('dotenv').config();

const cors = require('cors');

const server = require('./src/app.js');
const {
  fetchDataTemperaments,
} = require('./src/controllers/temperamentController.js');
const { fetchDataDogs } = require('./src/controllers/dogController.js');
const { conn } = require('./src/db.js');

// NODE_ENV en "development" entorno de desarrollo y en "production" entorno de producción
// FORCE_SYNC_DB es true forzará la sincronización de la base de datos

const { PORT, NODE_ENV = 'development', FORCE_SYNC_DB = 'true' } = process.env;

const isDevelopment = NODE_ENV === 'development';
const shouldForceSyncDB = isDevelopment && FORCE_SYNC_DB === 'true';

conn.sync({ force: shouldForceSyncDB }).then(async () => {
  try {
    if (shouldForceSyncDB) {
      await fetchDataTemperaments();
      /*await fetchDataDogs();*/
    }
    server.use(cors());
    server.listen(PORT, () => {
      console.log(`Server listening at ${PORT}`);
      console.log(NODE_ENV, FORCE_SYNC_DB);
    });
  } catch (error) {
    console.log(error);
  }
});
