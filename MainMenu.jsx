import React from 'react';
import './MainMenu.css';

const planets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

const MainMenu = ({ onPlanetSelect }) => {
  return (
    <div className="main-menu">
      <h1>Select a Planet to Visit</h1>
      <ul>
        {planets.map(planet => (
          <li key={planet}>
            <button onClick={() => onPlanetSelect(planet)}>{planet}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MainMenu;
