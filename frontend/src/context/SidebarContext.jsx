// frontend/src/context/SidebarContext.jsx contains project logic or configuration with inline comments for maintainability.
// Imports React because this file renders JSX components.
import React, { createContext, useState, useContext } from 'react';

const SidebarContext = createContext();

// SidebarProvider renders the sidebar provider screen and connects its UI behavior.
export const SidebarProvider = ({ children }) => {
  // Stores the isOpen value so the UI can update when it changes.
  const [isOpen, setIsOpen] = useState(false);

  // openSidebar contains reusable logic for this file.
  const openSidebar = () => setIsOpen(true);
  // closeSidebar contains reusable logic for this file.
  const closeSidebar = () => setIsOpen(false);

  // Renders the JSX markup for this component.
  return (
    <SidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// useSidebar contains reusable logic for this file.
export const useSidebar = () => useContext(SidebarContext);
