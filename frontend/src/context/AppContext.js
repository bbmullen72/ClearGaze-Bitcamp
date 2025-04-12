import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [eyeData, setEyeData] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  const updateEyeData = (data) => {
    setEyeData(data);
  };

  const completeCalibration = () => {
    setIsCalibrated(true);
  };

  return (
    <AppContext.Provider
      value={{
        isCalibrated,
        eyeData,
        isTracking,
        startTracking,
        stopTracking,
        updateEyeData,
        completeCalibration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 