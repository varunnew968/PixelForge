import React, { createContext, useContext, useState } from 'react';

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [sharedImages, setSharedImages] = useState([]);

  const setImagesFromFiles = (files) => {
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setSharedImages(newImages);
  };

  const clearSharedImages = () => setSharedImages([]);

  return (
    <ImageContext.Provider value={{ sharedImages, setSharedImages, setImagesFromFiles, clearSharedImages }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = () => useContext(ImageContext);
