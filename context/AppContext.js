import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

// Estado inicial vacío - los datos vendrán de la API
const initialPatients = [];

export function AppProvider({ children }) {
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState([]);

  const addPatient = (patient) => {
    setPatients([...patients, patient]);
  };

  const updatePatient = (updatedPatient) => {
    setPatients(patients.map(p => 
      p.id === updatedPatient.id ? updatedPatient : p
    ));
  };

  const deletePatient = (patientId) => {
    setPatients(patients.filter(p => p.id !== patientId));
    // También eliminar las consultas asociadas
    setAppointments(appointments.filter(a => a.patientId !== patientId));
  };

  const addAppointment = (appointment) => {
    setAppointments([...appointments, appointment]);
  };

  const updateAppointment = (updatedAppointment) => {
    setAppointments(appointments.map(a => 
      a.id === updatedAppointment.id ? updatedAppointment : a
    ));
  };

  const deleteAppointment = (appointmentId) => {
    setAppointments(appointments.filter(a => a.id !== appointmentId));
  };

  return (
    <AppContext.Provider value={{
      patients,
      setPatients, // Exportamos setPatients para poder usarlo directamente
      appointments,
      addPatient,
      updatePatient,
      deletePatient,
      addAppointment,
      updateAppointment,
      deleteAppointment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}