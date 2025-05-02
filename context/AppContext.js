import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Estados para las diferentes entidades
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // Nuevo estado de carga

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const loadUserData = async () => {
      setLoadingUser(true); // Iniciar carga
      try {
        // Limpiar los datos de usuario al iniciar la aplicación para forzar el login
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
        setUserData(null);
        setIsAdmin(false);
      } catch (error) {
        console.error('Error clearing user data:', error);
        setUserData(null);
        setIsAdmin(false);
      } finally {
        setLoadingUser(false); // Finalizar carga
      }
    };

    loadUserData();
  }, []);

  // Función para actualizar datos del usuario después de login
  const updateUserData = async (newUserData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      setUserData(newUserData);
      setIsAdmin(newUserData?.rol === 'admin');
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUserData(null);
      setIsAdmin(false);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  // Funciones para manejar doctores
  const addDoctor = (doctor) => {
    setDoctors(prevDoctors => [...prevDoctors, doctor]);
  };

  const updateDoctor = (updatedDoctor) => {
    setDoctors(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === updatedDoctor.id ? updatedDoctor : doctor
      )
    );
  };

  const deleteDoctor = (doctorId) => {
    setDoctors(prevDoctors =>
      prevDoctors.filter(doctor => doctor.id !== doctorId)
    );
  };

  // Funciones para manejar pacientes
  const addPatient = (patient) => {
    setPatients(prevPatients => [...prevPatients, patient]);
  };

  const updatePatient = (updatedPatient) => {
    setPatients(prevPatients =>
      prevPatients.map(patient =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
  };

  const deletePatient = (patientId) => {
    setPatients(prevPatients =>
      prevPatients.filter(patient => patient.id !== patientId)
    );
  };

  // Funciones para manejar citas
  const addAppointment = (appointment) => {
    setAppointments(prevAppointments => [...prevAppointments, appointment]);
  };

  const updateAppointment = (updatedAppointment) => {
    setAppointments(prevAppointments =>
      prevAppointments.map(appointment =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      )
    );
  };

  const deleteAppointment = (appointmentId) => {
    setAppointments(prevAppointments =>
      prevAppointments.filter(appointment => appointment.id !== appointmentId)
    );
  };

  // Función para verificar si un usuario tiene permisos de administrador
  const checkIsAdmin = () => {
    return isAdmin;
  };

  return (
    <AppContext.Provider
      value={{
        // Datos de usuario y estado de la aplicación
        userData,
        setUserData,
        isAdmin,
        checkIsAdmin,
        logout,
        loadingUser,
        updateUserData, // Exponer la nueva función
        
        // Doctores
        doctors,
        setDoctors,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        
        // Pacientes
        patients,
        setPatients,
        addPatient,
        updatePatient,
        deletePatient,
        
        // Citas
        appointments,
        setAppointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}