const { Router } = require('express');
const {
  createDog,
  getAllDogs,
  getDogById,
  getDogsByName,
} = require('../controllers/dogController');

const router = Router();

// router.get('/', getAllDogs).post('/', createDog);

// Ruta POST /dogs
router.post('/', createDog);

// Ruta GET /dogs
router.get('/', getAllDogs);

// Ruta GET /dogs/:idRaza
router.get('/:idRaza', getDogById);

// Ruta GET /dogs/name?="..."
router.get('/name/search/', getDogsByName);

module.exports = router;
