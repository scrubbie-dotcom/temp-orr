import React, { useEffect, useState } from 'react';
import { getPlanetInfo } from '../api';

const PlanetInfo = ({ planet }) => {
  const [info, setInfo] = useState({});
  const [currentInfo, setCurrentInfo] = useState(0);

  useEffect(() => {
    // Fetch planet info from mock API
    const fetchPlanetInfo = async () => {
      const data = await getPlanetInfo(planet);
      setInfo(data);
    };

    fetchPlanetInfo();
  }, [planet]);

  useEffect(() => {
    if (Object.keys(info).length > 0) {
      const interval = setInterval(() => {
        setCurrentInfo(prev => prev + 1);
      }, 10000); // 10 seconds for each info display

      return () => clearInterval(interval);
    }
  }, [info]);

  const infoKeys = Object.keys(info);

  return (
    <div className="planet-info">
      {infoKeys.length > 0 && (
        <div>
          <h2>{infoKeys[currentInfo]}</h2>
          <p>{info[infoKeys[currentInfo]]}</p>
        </div>
      )}
    </div>
  );
};

export default PlanetInfo;
