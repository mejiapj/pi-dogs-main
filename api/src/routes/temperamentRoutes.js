const { Router } = require('express');
const {
  createTemperament,
  getAllTemperaments,
} = require('../controllers/temperamentController');

const router = Router();

router.get('/', getAllTemperaments).post('/', createTemperament);

module.exports = router;
