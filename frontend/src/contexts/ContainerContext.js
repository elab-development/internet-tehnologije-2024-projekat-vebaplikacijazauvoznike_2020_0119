import React, { createContext, useState, useContext, useMemo } from 'react';

export const ContainerContext = createContext();

export const useContainer = () => useContext(ContainerContext);

const CONTAINER_CAPACITY = 100; // m³

export const ContainerProvider = ({ children }) => {
  const [containerItems, setContainerItems] = useState([]);
  const [shipmentHistory, setShipmentHistory] = useState([]);

  const currentVolume = useMemo(() => {
    return containerItems.reduce((total, item) => total + (item.volume * item.quantity), 0);
  }, [containerItems]);

  const addItemToContainer = (product, quantity) => {
    const addedVolume = product.volume * quantity;
    if (currentVolume + addedVolume > CONTAINER_CAPACITY) {
      alert(`Cannot add item: Exceeds container capacity of ${CONTAINER_CAPACITY} m³. Current volume: ${currentVolume} m³.`);
      return false;
    }

    setContainerItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    alert(`${quantity} x "${product.name}" added to container.`);
    return true;
  };

  const removeItemFromContainer = (itemId) => {
    setContainerItems(prevItems => prevItems.filter(item => item.id !== itemId));
    alert('Item removed from container.');
  };

  const shipContainer = () => {
    if (containerItems.length === 0) return;

    const newShipment = {
      id: Date.now(),
      date: new Date(),
      items: containerItems,
      totalVolume: currentVolume,
    };

    setShipmentHistory(prevHistory => [newShipment, ...prevHistory]);
    setContainerItems([]);
    alert('Container has been shipped! You can view it in your history.');
  };

  const value = {
    containerItems,
    shipmentHistory,
    addItemToContainer,
    removeItemFromContainer,
    shipContainer, // Renamed from clearContainer
    currentVolume,
    CONTAINER_CAPACITY,
  };

  return React.createElement(ContainerContext.Provider, { value: value }, children);
};