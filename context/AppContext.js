import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

// Pacientes de ejemplo
const initialPatients = [
  {
    id: '1',
    name: 'Juan Pérez',
    age: '35',
    phone: '555-0101',
    imageUri: null
  },
  {
    id: '2',
    name: 'María García',
    age: '28',
    phone: '555-0102',
    imageUri: null
  },
  {
    id: '3',
    name: 'Carlos López',
    age: '42',
    phone: '555-0103',
    imageUri: null
  }
];

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