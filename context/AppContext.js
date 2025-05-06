"use client"

import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const AppContext = createContext()

export function AppProvider({ children }) {
  // Estados para las diferentes entidades
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Cargar datos del usuario al iniciar
  useEffect(() => {

    const loadUserData = async () => {
      try {
        // Intentar cargar datos de sesión guardados
        const storedUserData = await AsyncStorage.getItem('userData')
        const token = await AsyncStorage.getItem('userToken')
        
        if (storedUserData && token) {
          const userData = JSON.parse(storedUserData)
          setUserData(userData)
          // Verificar si el rol es admin (usando toLowerCase para hacer la comparación insensible a mayúsculas)
          const userRole = userData.rol ? userData.rol.toLowerCase() : '';
          setIsAdmin(userRole === 'admin')
          setIsAuthenticated(true)
          console.log('Sesión restaurada:', userData)
        } else {
          setUserData(null)
          setIsAdmin(false)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error al cargar datos de usuario:', error)
        setUserData(null)
        setIsAdmin(false)
        setIsAuthenticated(false)
      } finally {
        setLoadingUser(false)
      }
    }
    
    loadUserData()
  }, [])

  // Función para actualizar datos del usuario después de login
  const updateUserData = async (newUserData, token) => {
    try {
      // Guardar en AsyncStorage para persistencia entre sesiones
      await AsyncStorage.setItem('userToken', token)
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData))
      
      setUserData(newUserData)
      
      // Verificar si el rol es admin (usando toLowerCase para hacer la comparación insensible a mayúsculas)
      const userRole = newUserData.rol ? newUserData.rol.toLowerCase() : '';
      console.log('Rol del usuario:', userRole)
      setIsAdmin(userRole === 'admin')
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Error updating user data:", error)
      return false
    }
  }

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken")
      await AsyncStorage.removeItem("userData")
      setUserData(null)
      setIsAdmin(false)
      setIsAuthenticated(false)
      return true
    } catch (error) {
      console.error("Error during logout:", error)
      return false
    }
  }

  // Funciones para manejar doctores
  const addDoctor = (doctor) => {
    setDoctors((prevDoctors) => [...prevDoctors, doctor])
  }

  const updateDoctor = (updatedDoctor) => {
    setDoctors((prevDoctors) => prevDoctors.map((doctor) => (doctor.id === updatedDoctor.id ? updatedDoctor : doctor)))
  }

  const deleteDoctor = (doctorId) => {
    setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.id !== doctorId))
  }

  // Funciones para manejar pacientes
  const addPatient = (patient) => {
    setPatients((prevPatients) => [...prevPatients, patient])
  }

  const updatePatient = (updatedPatient) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient)),
    )
  }

  const deletePatient = (patientId) => {
    setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== patientId))
  }

  // Funciones para manejar citas
  const addAppointment = (appointment) => {
    setAppointments((prevAppointments) => [...prevAppointments, appointment])
  }

  const updateAppointment = (updatedAppointment) => {
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment,
      ),
    )
  }

  const deleteAppointment = (appointmentId) => {
    setAppointments((prevAppointments) => prevAppointments.filter((appointment) => appointment.id !== appointmentId))
  }

  return (
    <AppContext.Provider
      value={{
        // Datos de usuario y estado de la aplicación
        userData,
        setUserData,
        isAdmin,
        isAuthenticated,
        logout,
        loadingUser,
        updateUserData,

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
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
