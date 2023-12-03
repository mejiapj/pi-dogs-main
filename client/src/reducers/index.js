import { combineReducers } from 'redux';
import dogReducer from './dogReducer';
import temperamentReducer from './temperamentReducer';

const rootReducer = combineReducers({
  dog: dogReducer,
  temperament: temperamentReducer,
});

export default rootReducer;
