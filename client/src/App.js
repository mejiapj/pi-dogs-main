import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import DogDetailPage from './components/DogDetailPage';
import DogFormPage from './components/DogFormPage';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/dogs/:id" component={DogDetailPage} />
        <Route exact path="/create-dog" component={DogFormPage} />
      </Switch>
    </Router>
  );
};

export default App;
