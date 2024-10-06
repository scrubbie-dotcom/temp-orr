import React from 'react';

const PlanetScene = ({ planet, onExplore, onExit }) => {
  return (
    <div className="planet-scene">
      <h1>{planet}</h1>
      <button onClick={onExplore}>Explore {planet}</button>
      <button onClick={onExit}>Return to Menu</button>
    </div>
  );
};

export default PlanetScene;
