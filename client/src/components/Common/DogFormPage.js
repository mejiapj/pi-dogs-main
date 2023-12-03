import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './DogFormPage.css';

const DogFormPage = () => {
  const history = useHistory();

  const [dogForm, setDogForm] = useState({
    imagenUrl: '',
    nombre: '',
    alturaMinima: '',
    alturaMaxima: '',
    pesoMinimo: '',
    pesoMaximo: '',
    anosVida: '',
    temperamentos: [],
  });

  const [temperamentos, setTemperamentos] = useState([]);

  useEffect(() => {
    const fetchTemperamentos = async () => {
      try {
        const response = await axios.get('http://localhost:5001/temperaments');
        setTemperamentos(response.data);
      } catch (error) {
        console.error('Error al obtener los temperamentos:', error);
      }
    };

    fetchTemperamentos();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setDogForm({ ...dogForm, [name]: value });
  };

  const handleTemperamentoChange = (event) => {
    const selectedTemperamentos = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setDogForm({ ...dogForm, temperamentos: selectedTemperamentos });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Validaciones de formulario aquí

    // Crear objeto JSON para enviar al servidor
    const dogData = {
      imagen: {
        url: dogForm.imagenUrl,
      },
      altura: {
        imperial: `${dogForm.alturaMinima} - ${dogForm.alturaMaxima}`,
        metric: `${dogForm.alturaMinima * 2.54} - ${
          dogForm.alturaMaxima * 2.54
        }`,
      },
      peso: {
        imperial: `${dogForm.pesoMinimo} - ${dogForm.pesoMaximo}`,
        metric: `${dogForm.pesoMinimo * 0.45} - ${dogForm.pesoMaximo * 0.45}`,
      },
      nombre: dogForm.nombre,
      anos_vida: dogForm.anosVida,
      temperaments: dogForm.temperamentos.join(','),
      origen: 'BD',
    };
    // console.log(JSON.stringify(dogData));
    // Enviar el objeto JSON al servidor usando la ruta POST /dogs

    axios
      .post('http://localhost:5001/dogs', dogData)
      .then((response) => {
        // console.log('Raza creada:', response.data);
        // Realizar acciones adicionales después de crear la raza
        history.goBack(); // Redireccionar a la página anterior
      })
      .catch((error) => {
        console.error('Error al crear la raza:', error);
        // Manejar el error de alguna manera
      });
  };

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <div className="dog-form-container">
      <form className="dog-form" onSubmit={handleSubmit}>
        <h1>Dog Form Page</h1>

        <div className="form-group">
          <label htmlFor="imagenUrl">Imagen URL:</label>
          <input
            type="text"
            id="imagenUrl"
            name="imagenUrl"
            value={dogForm.imagenUrl}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={dogForm.nombre}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="alturaMinima">Altura Mínima (en cm):</label>
          <input
            type="number"
            id="alturaMinima"
            name="alturaMinima"
            value={dogForm.alturaMinima}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="alturaMaxima">Altura Máxima (en cm):</label>
          <input
            type="number"
            id="alturaMaxima"
            name="alturaMaxima"
            value={dogForm.alturaMaxima}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pesoMinimo">Peso Mínimo (en kg):</label>
          <input
            type="number"
            id="pesoMinimo"
            name="pesoMinimo"
            value={dogForm.pesoMinimo}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pesoMaximo">Peso Máximo (en kg):</label>
          <input
            type="number"
            id="pesoMaximo"
            name="pesoMaximo"
            value={dogForm.pesoMaximo}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="anosVida">Años de Vida:</label>
          <input
            type="text"
            id="anosVida"
            name="anosVida"
            value={dogForm.anosVida}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="temperamentos">Temperamentos:</label>

          <select
            multiple
            id="temperamentos"
            name="temperamentos"
            value={dogForm.temperamentos}
            onChange={handleTemperamentoChange}
            required
          >
            {temperamentos.map((temperamento) => (
              <option key={temperamento.name} value={temperamento.name}>
                {temperamento.name}
              </option>
            ))}
          </select>
        </div>
        <div className="button-group">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button type="submit">Crear Raza</button>
        </div>
      </form>
    </div>
  );
};

export default DogFormPage;
