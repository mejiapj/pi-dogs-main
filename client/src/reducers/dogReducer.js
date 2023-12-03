// dogReducer.js

const initialState = null; // Estado inicial nulo o con algún valor por defecto

const dogReducer = (state = initialState, action) => {
  switch (action.type) {
    // Definir los casos para las acciones específicas
    // ...
    default:
      return state; // Devolver el estado actual por defecto
  }
};

export default dogReducer;
