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
  const [error, setError] = useState('');

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
    setDogForm((prevDogForm) => ({
      ...prevDogForm,
      [name]: value,
    }));
  };

  const handleTemperamentoChange = (event) => {
    const selectedTemperamentos = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setDogForm((prevDogForm) => ({
      ...prevDogForm,
      temperamentos: selectedTemperamentos,
    }));
  };

  const validateForm = () => {
    const {
      imagenUrl,
      nombre,
      alturaMinima,
      alturaMaxima,
      pesoMinimo,
      pesoMaximo,
      anosVida,
      temperamentos,
    } = dogForm;

    const showError = (errorMessage, fieldName) => {
      setError(errorMessage);
      setTimeout(() => {
        setError('');
      }, 5000);
      focusOnErrorField(fieldName);
      return false;
    };

    const validateNumberRange = (minValue, maxValue, fieldName) => {
      if (minValue > maxValue || minValue <= 0 || maxValue <= 0) {
        return showError(
          `El valor mínimo debe ser menor que el valor máximo y ambos deben ser mayores a cero`,
          fieldName
        );
      }
      return true;
    };

    const validateYearsOfLife = (anosVidaValue) => {
      const anosVidaPattern = /^(\d+-\d+|\d+)$/;

      if (!anosVidaPattern.test(anosVidaValue)) {
        return showError(
          `El formato de los años de vida es inválido. Debe ser en el formato: número-número (ejemplo: 1-10) o un solo número mayor a cero`,
          'anosVida'
        );
      }

      if (anosVidaValue.includes('-')) {
        const [minAnosVida, maxAnosVida] = anosVidaValue.split('-');
        if (parseInt(minAnosVida) > parseInt(maxAnosVida)) {
          return showError(
            `El primer número de los años de vida no puede ser mayor al segundo número`,
            'anosVida'
          );
        }
      } else {
        if (parseInt(anosVidaValue) <= 0) {
          return showError(
            `El número de años de vida debe ser mayor a cero`,
            'anosVida'
          );
        }
      }

      return true;
    };

    if (!/^https?:\/\/\S+$/.test(imagenUrl)) {
      return showError(`La URL de la imagen no es válida`, 'imagenUrl');
    }

    if (!/^[a-zA-Z ]*$/.test(nombre)) {
      return showError(`El nombre no puede contener números`, 'nombre');
    }

    if (
      !validateNumberRange(
        Number(alturaMinima),
        Number(alturaMaxima),
        'alturaMinima'
      )
    ) {
      return false;
    }

    if (
      !validateNumberRange(Number(pesoMinimo), Number(pesoMaximo), 'pesoMinimo')
    ) {
      return false;
    }

    if (!validateYearsOfLife(anosVida)) {
      return false;
    }

    if (temperamentos.length === 0) {
      return showError(
        `Debe seleccionar al menos un temperamento`,
        'temperamentos'
      );
    }

    return true;
  };

  const focusOnErrorField = (fieldName) => {
    const fieldElement = document.getElementById(fieldName);
    if (fieldElement) {
      fieldElement.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const {
      imagenUrl,
      alturaMinima,
      alturaMaxima,
      pesoMinimo,
      pesoMaximo,
      anosVida,
    } = dogForm;

    const dogData = {
      imagen: {
        url: imagenUrl,
      },
      altura: {
        imperial: `${alturaMinima} - ${alturaMaxima}`,
        metric: `${alturaMinima * 2.54} - ${alturaMaxima * 2.54}`,
      },
      peso: {
        imperial: `${pesoMinimo} - ${pesoMaximo}`,
        metric: `${pesoMinimo * 0.45} - ${pesoMaximo * 0.45}`,
      },
      nombre: dogForm.nombre,
      anos_vida: anosVida,
      temperaments: dogForm.temperamentos.join(','),
      origen: 'BD',
    };

    axios
      .post('http://localhost:5001/dogs', dogData)
      .then((response) => {
        history.goBack();
      })
      .catch((error) => {
        setError('Error al crear la raza: ' + error.response.data.message);
        setTimeout(() => {
          setError('');
        }, 5000);
      });
  };

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <div className="dog-form-container">
      <form className="dog-form" onSubmit={handleSubmit}>
        <h1>Dog Form Page</h1>

        {error && <div className="error-message">{error}</div>}

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
