const { Dog, Temperament } = require('../db');
const axios = require('axios');
const { Op } = require('sequelize');
const { API_KEY } = process.env;

const createDog = async (req, res, next) => {
  try {
    const { imagen, nombre, altura, peso, anos_vida, origen, temperaments } =
      req.body;

    const existingDog = await Dog.findOne({
      where: { nombre },
    });

    if (existingDog) {
      return res
        .status(500)
        .json({ message: 'El perro ya existe en la base de datos' });
    }

    // Obtener el último registro de la tabla dogs
    const lastDog = await Dog.findOne({
      order: [['id', 'DESC']],
    });

    const lastId = lastDog ? lastDog.id : null;

    const apiDogs = await axios.get(
      `https://api.thedogapi.com/v1/breeds/search?q=${nombre}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      }
    );

    const existingApiDog = apiDogs.data.find((dog) => dog.name === nombre);
    if (existingApiDog) {
      return res.status(500).json({
        message: 'El perro ya existe en la API',
      });
    }

    const getAllBreeds = async () => {
      const response = await axios.get('https://api.thedogapi.com/v1/breeds', {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });
      return response.data;
    };

    const getRandomBreed = (breeds) => {
      // Obtener los valores de id de la respuesta
      const ids = breeds.map((breed) => breed.id);

      // Ordenar el array de ids
      ids.sort((a, b) => a - b);

      // Calcular el valor máximo de id
      const maxValue = Math.max(...ids);

      let randomIndex;

      let newlastId = lastId;
      if (!lastId || lastId < Math.max(maxValue, ids.length) * 10) {
        newlastId = Math.max(maxValue, ids.length) * 10;
      }

      randomIndex = newlastId + 1;

      return randomIndex;
    };

    const generateRandomBreed = async () => {
      const breeds = await getAllBreeds();

      const newBreed = getRandomBreed(breeds);
      return newBreed;
    };

    let uniqueTemperaments = [];

    if (temperaments) {
      uniqueTemperaments = temperaments
        .split(',')
        .map((temp) => temp.trim())
        .sort();

      if (uniqueTemperaments.length === 0) {
        return res.status(400).json({
          message: 'Se requiere al menos un temperamento para crear un perro',
        });
      }

      const existingTemperaments = await Temperament.findAll({
        where: { name: uniqueTemperaments },
      });

      const existingTemperamentNames = existingTemperaments.map(
        (temperament) => temperament.name
      );

      const nonExistingTemperamentNames = uniqueTemperaments.filter(
        (name) => !existingTemperamentNames.includes(name)
      );

      if (nonExistingTemperamentNames.length > 0) {
        const message =
          nonExistingTemperamentNames.length === 1
            ? `El temperamento ${nonExistingTemperamentNames[0]} no existe`
            : `Los temperamentos ${nonExistingTemperamentNames.join(
                ', '
              )} no existen`;

        return res.status(400).json({ message });
      }

      const finalTemperaments = existingTemperaments;

      const newBreed = await generateRandomBreed();
      const createdDog = await Dog.create({
        id: newBreed,
        imagen,
        nombre,
        altura,
        peso,
        anos_vida,
        origen,
      });
      await createdDog.setTemperaments(finalTemperaments);

      return res
        .status(201)
        .json({ message: 'El perro fue creado satisfactoriamente' });
    } else {
      const newBreed = await generateRandomBreed();
      await Dog.create({
        id: newBreed,
        imagen,
        nombre,
        altura,
        peso,
        anos_vida,
        origen,
      });

      return res
        .status(201)
        .json({ message: 'El perro fue creado satisfactoriamente' });
    }
  } catch (error) {
    next(error);
  }
};

const xxgetAllDogs = async (req, res, next) => {
  try {
    const allDogs = await Dog.findAll({
      include: [
        {
          model: Temperament,
          attributes: ['name'],
          through: {
            attributes: [],
          },
        },
      ],
    });

    const modifiedDogs = allDogs.map((dog) => {
      const temperaments = dog.temperaments.map(
        (temperament) => temperament.name
      );
      dog = dog.toJSON();

      if (temperaments.length > 0) {
        dog.temperaments =
          temperaments.length > 1 ? temperaments.join(',') : temperaments[0];
      } else {
        delete dog.temperaments;
      }

      return dog;
    });

    if (modifiedDogs.length === 0) {
      return res
        .status(404)
        .json({ message: 'No hay perros en la base de datos' });
    }

    return res.status(200).json(modifiedDogs);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Ocurrió un error al obtener los perros' });
  }
};

const getDogById = async (req, res) => {
  const idRaza = req.params.idRaza;

  try {
    // Buscar en la API
    let apiDog = null;
    try {
      const apiResponse = await axios.get(
        `https://api.thedogapi.com/v1/breeds/${idRaza}`
      );
      apiDog = apiResponse.data;
    } catch (apiError) {
      // Manejar el error de la API específicamente
      console.log(apiError);
      return res
        .status(500)
        .json({ message: 'Error al buscar la raza en la API' });
    }

    const dogFromAPI = {
      id: apiDog.id,
      imagen: {
        id: apiDog.reference_image_id,
      },
      nombre: apiDog.name,
      altura: {
        imperial: apiDog.height.imperial,
        metric: apiDog.height.metric,
      },
      peso: {
        imperial: apiDog.weight.imperial,
        metric: apiDog.weight.metric,
      },
      anos_vida: apiDog.life_span,
      temperament: apiDog.temperament,
      origen: 'API',
    };

    // Buscar en la base de datos
    let dbDog = null;
    try {
      dbDog = await Dog.findByPk(idRaza, {
        include: [
          {
            model: Temperament,
            attributes: ['name'],
            through: {
              attributes: [],
            },
          },
        ],
      });
    } catch (dbError) {
      // Manejar el error de la base de datos específicamente
      console.log(dbError);
      return res
        .status(500)
        .json({ message: 'Error al buscar la raza en la base de datos' });
    }

    let dog = null;
    if (dogFromAPI) {
      dog = dogFromAPI;
    } else if (dbDog) {
      const temperaments = dbDog.temperaments.map(
        (temperament) => temperament.name
      );
      dog = {
        id: dbDog.id,
        imagen: dbDog.imagen,
        nombre: dbDog.nombre,
        altura: dbDog.altura,
        peso: dbDog.peso,
        anos_vida: dbDog.anos_vida,
        origen: dbDog.origen,
        temperament: temperaments.join(', '),
      };
    }

    if (!dog) {
      return res.status(404).json({ message: 'No se encontró la raza' });
    }

    res.json(dog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al buscar la raza' });
  }
};

const fetchDataDogs = async () => {
  try {
    const response = await axios.get('https://api.thedogapi.com/v1/breeds');

    if (response.data) {
      const dogData = response.data.map((dog) => {
        const temperaments = dog.temperament
          ? dog.temperament.split(',').map((temp) => temp.trim())
          : [];

        return {
          id: dog.id,
          imagen: dog.image,
          nombre: dog.name,
          altura: dog.height,
          peso: dog.weight,
          anos_vida: dog.life_span,
          origen: 'API',
          temperaments: [...new Set(temperaments)],
        };
      });

      const uniqueTemperamentNames = new Set();

      dogData.forEach((dog) => {
        dog.temperaments.forEach((temperament) => {
          uniqueTemperamentNames.add(temperament);
        });
      });

      const sortedTemperamentNames = Array.from(uniqueTemperamentNames).sort();

      if (sortedTemperamentNames.length > 0) {
        const existingTemperaments = await Temperament.findAll({
          where: { name: sortedTemperamentNames },
        });

        const nonExistingTemperamentNames = sortedTemperamentNames.filter(
          (name) =>
            !existingTemperaments.some(
              (temperament) => temperament.name === name
            )
        );

        const newTemperaments = await Promise.all(
          nonExistingTemperamentNames.map((name) =>
            Temperament.create({ name })
          )
        );

        const createdTemperaments = [
          ...existingTemperaments,
          ...newTemperaments,
        ];

        for (const dog of dogData) {
          if (dog.temperaments.length > 0) {
            const temperaments = dog.temperaments.map((temperament) =>
              createdTemperaments.find((t) => t.name === temperament)
            );

            const createdDog = await Dog.create(dog);
            await createdDog.setTemperaments(temperaments);
          } else {
            await Dog.create(dog);
          }
        }
      } else {
        for (const dog of dogData) {
          await Dog.create(dog);
        }
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error('Error al obtener los datos de los perros');
  }
};

const getDogsByName = async (req, res) => {
  const name = req.query.name;
  // console.log(name);
  try {
    // Buscar en la API
    let apiDogs = [];
    try {
      const apiResponse = await axios.get(
        `https://api.thedogapi.com/v1/breeds/search?q=${name}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      apiDogs = await Promise.all(
        apiResponse.data.map(async (apiDog) => {
          let imagen = null;
          if (apiDog.reference_image_id !== undefined) {
            const extensions = ['.jpg', '.png', '.svg', '.bmp', '.webp'];
            const getImage = async () => {
              for (const extension of extensions) {
                const url = `https://cdn2.thedogapi.com/images/${apiDog.reference_image_id}${extension}`;
                try {
                  const response = await axios.get(url);
                  if (response.status === 200) {
                    imagen = {
                      id: apiDog.reference_image_id,
                      url: url,
                    };
                    break;
                  }
                } catch (error) {
                  // La URL no es válida, se intenta con la siguiente extensión
                }
              }
            };

            await getImage();
          }

          return {
            id: apiDog.id,
            imagen,
            nombre: apiDog.name,
            altura: {
              imperial: apiDog.height.imperial,
              metric: apiDog.height.metric,
            },
            peso: {
              imperial: apiDog.weight.imperial,
              metric: apiDog.weight.metric,
            },
            anos_vida: apiDog.life_span,
            origen: 'API',
            temperaments: apiDog.temperament,
          };
        })
      );
    } catch (apiError) {
      console.log(apiError);
      // Manejar el error de la API específicamente
      return res
        .status(500)
        .json({ message: 'Error al buscar las razas en la API' });
    }

    // Buscar en la base de datos
    let dbDogs = [];
    try {
      dbDogs = await Dog.findAll({
        where: {
          nombre: {
            [Op.iLike]: `%${name}%`,
          },
        },
        include: [
          {
            model: Temperament,
            attributes: ['name'],
            through: {
              attributes: [],
            },
          },
        ],
      });
    } catch (dbError) {
      console.log(dbError);
      // Manejar el error de la base de datos específicamente
      return res
        .status(500)
        .json({ message: 'Error al buscar las razas en la base de datos' });
    }

    const modifiedDbDogs = dbDogs.map((dbDog) => ({
      id: dbDog.id,
      imagen: dbDog.imagen,
      nombre: dbDog.nombre,
      altura: dbDog.altura,
      peso: dbDog.peso,
      anos_vida: dbDog.anos_vida,
      origen: 'BD',
      temperaments: dbDog.temperaments.map((temp) => temp.name),
    }));

    // Combinar perros de la API y de la base de datos
    const allDogs = [...apiDogs, ...modifiedDbDogs];

    // Eliminar perros duplicados por ID
    const uniqueDogs = allDogs.filter((dog, index, self) => {
      const foundIndex = self.findIndex((d) => d.id === dog.id);
      return index === foundIndex;
    });

    return res.json(uniqueDogs);
  } catch (error) {
    console.log(error);
    // Manejar cualquier otro error no específico
    return res
      .status(500)
      .json({ message: 'Error al buscar las razas de perros' });
  }
};
//-----------------------------------------------------------------
const getAllDogs = async (req, res, next) => {
  const name = req.query.name;
  // console.log(name);
  try {
    // Buscar en la API
    let apiDogs = [];
    try {
      const apiResponse = await axios.get(
        `https://api.thedogapi.com/v1/breeds`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      apiDogs = await Promise.all(
        apiResponse.data.map(async (apiDog) => {
          const temperaments = apiDog.temperament
            ? apiDog.temperament.split(',').map((temp) => temp.trim())
            : [];

          return {
            id: apiDog.id,
            imagen: apiDog.image,
            nombre: apiDog.name,
            altura: apiDog.height,
            peso: apiDog.weight,
            anos_vida: apiDog.life_span,
            origen: 'API',
            temperaments: [...new Set(temperaments)],
          };
        })
      );
    } catch (apiError) {
      console.log(apiError);
      // Manejar el error de la API específicamente
      return res
        .status(500)
        .json({ message: 'Error al buscar las razas en la API' });
    }

    // Buscar en la base de datos
    let dbDogs = [];
    try {
      dbDogs = await Dog.findAll({
        include: [
          {
            model: Temperament,
            attributes: ['name'],
            through: {
              attributes: [],
            },
          },
        ],
      });
    } catch (dbError) {
      console.log(dbError);
      // Manejar el error de la base de datos específicamente
      return res
        .status(500)
        .json({ message: 'Error al buscar las razas en la base de datos' });
    }

    const modifiedDbDogs = dbDogs.map((dbDog) => ({
      id: dbDog.id,
      imagen: dbDog.imagen,
      nombre: dbDog.nombre,
      altura: dbDog.altura,
      peso: dbDog.peso,
      anos_vida: dbDog.anos_vida,
      origen: 'BD',
      temperaments: dbDog.temperaments.map((temp) => temp.name),
    }));

    // Combinar perros de la API y de la base de datos
    const allDogs = [...apiDogs, ...modifiedDbDogs];

    // Eliminar perros duplicados por ID
    const uniqueDogs = allDogs.filter((dog, index, self) => {
      const foundIndex = self.findIndex((d) => d.id === dog.id);
      return index === foundIndex;
    });

    return res.json(uniqueDogs);
  } catch (error) {
    console.log(error);
    // Manejar cualquier otro error no específico
    return res
      .status(500)
      .json({ message: 'Error al buscar las razas de perros' });
  }
};

module.exports = {
  createDog,
  getAllDogs,
  getDogById,
  getDogsByName,
  fetchDataDogs,
};
