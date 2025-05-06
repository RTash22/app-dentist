// screens/AdminHomeScreen.js (Para administradores)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../context/api';

const AdminHomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Cargar datos del usuario
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          setUserData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout
      await api.post('/logout');

      // Limpiar almacenamiento local
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');

      // Navegar al login
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);

      // Mostrar alerta si AsyncStorage no está disponible
      if (error instanceof ReferenceError && error.message.includes('AsyncStorage')) {
        Alert.alert('Error', 'AsyncStorage no está disponible. Por favor, verifica la configuración.');
      }

      // Aún si falla la petición, limpiar local y navegar a login
      await AsyncStorage.removeItem('authToken').catch(() => {});
      await AsyncStorage.removeItem('userData').catch(() => {});
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administrador</Text>
      {userData && userData.doctor && (
        <Text style={styles.subtitle}>Bienvenido, Dr. {userData.doctor.nombre}</Text>
      )}
      
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('DoctoresScreen')}
        >
          <Text style={styles.menuText}>Gestionar Doctores</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Todas las Consultas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Pacientes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Configuración</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  menuContainer: {
    marginVertical: 20,
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AdminHomeScreen;