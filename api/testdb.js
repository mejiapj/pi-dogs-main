require('dotenv').config();

// Importa las dependencias necesarias
const { Sequelize } = require('sequelize');

// Define las credenciales de la base de datos de Heroku
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT, DB_URI } = process.env;

// Configuración de Sequelize para la conexión a la base de datos
const sequelize = new Sequelize(DB_URI, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Para evitar errores de certificado no confiable en local
    },
  },
});

// Verifica la conexión a la base de datos
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
  }
}

// Ejecuta la función para probar la conexión a la base de datos
testDatabaseConnection();

// Exporta la instancia de Sequelize para su uso en otros módulos
module.exports = sequelize;
