import React from 'react';
import { useHistory } from 'react-router-dom';
import './DogDetailPage.css';

const DogDetailPage = (props) => {
  const history = useHistory();
  const dog = props.location.state.dog;

  const { id, imagen, nombre, altura, peso, temperaments, anos_vida } = dog;

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <div className="dog-detail">
      <h1>{nombre}</h1>
      <div>
        {imagen && imagen.url ? (
          <img src={imagen.url} alt={nombre} width="300" height="200" />
        ) : (
          <p>No hay imagen disponible</p>
        )}
      </div>
      <div>
        <h2>ID: {id}</h2>
        <p>Altura: {altura.imperial} pulg.</p>
        <p>{altura.metric} mts.</p>
        <p>Peso: {peso.imperial} lbs</p>
        <p>{peso.metric} kg</p>
        <p className="temperaments">
          Temperaments:{' '}
          {Array.isArray(temperaments) ? temperaments.join(', ') : temperaments}
        </p>
        <p>Años de vida: {anos_vida}</p>
      </div>
      <button onClick={handleGoBack}>Volver</button>
    </div>
  );
};

export default DogDetailPage;
