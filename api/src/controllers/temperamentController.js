const { Temperament, Dog } = require('../db');
const axios = require('axios');
const { conn } = require('../db');
const sequelize = conn;

async function fetchDataTemperaments() {
  try {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.thedogapi.com/v1/breeds',
      headers: {},
    };

    const response = await axios.request(config);

    if (response.data) {
      const temperaments = extractTemperaments(response.data);
      temperaments.sort((a, b) => a.name.localeCompare(b.name));
      await deleteExistingTemperaments();
      await fillDbTemperaments(temperaments);
    }
  } catch (error) {
    console.log(error);
  }
}

function extractTemperaments(data) {
  const temperaments = data.reduce((acc, obj) => {
    if (
      obj.temperament &&
      typeof obj.temperament === 'string' &&
      obj.temperament.trim() !== ''
    ) {
      const splitTemperaments = obj.temperament.split(', ');
      splitTemperaments.forEach((temp) => {
        const trimmedTemp = temp.trim();
        if (!acc.some((item) => item.name === trimmedTemp)) {
          acc.push({ name: trimmedTemp });
        }
      });
    }
    return acc;
  }, []);

  return temperaments;
}

async function deleteExistingTemperaments() {
  await Temperament.destroy({ where: {} });
}

async function fillDbTemperaments(temperaments) {
  const t = await sequelize.transaction();

  try {
    for (const [index, temperament] of temperaments.entries()) {
      const existingTemperament = await Temperament.findOne({
        where: { name: temperament.name },
        transaction: t,
        include: [{ model: Dog }],
      });

      if (!existingTemperament) {
        const lastTemperament = await Temperament.findOne({
          order: [['id', 'DESC']],
          transaction: t,
        });

        const newId = lastTemperament ? lastTemperament.id + 1 : index + 1;

        await Temperament.create(
          { id: newId, name: temperament.name },
          { transaction: t }
        );
      }
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
}

const createTemperament = async (req, res, next) => {
  const { name } = req.body;

  try {
    const existingTemperament = await Temperament.findOne({ where: { name } });

    if (existingTemperament) {
      return res
        .status(500)
        .json({ message: 'El Temperament ya existe en la base de datos' });
    }

    await Temperament.create({ name });

    res
      .status(201)
      .json({ message: 'El Temperament fue creado satisfactoriamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTemperaments = async (req, res, next) => {
  try {
    await fetchDataTemperaments();

    const allTemperament = await Temperament.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json(allTemperament);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createTemperament,
  getAllTemperaments,
  fetchDataTemperaments,
};
