import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useAppContext } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export function prin_cons() {
  const { appointments } = useAppContext();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/banner-dental.jpg')}
        style={styles.header}
        resizeMode="cover"
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, styles.homeButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <Text style={styles.mainTitle}>Citas</Text>

      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <Text>Fecha: {new Date(appointment.date).toLocaleDateString()}</Text>
            <Text>Hora: {new Date(appointment.date).toLocaleTimeString()}</Text>
            <Text>Descripción: {appointment.description}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noAppointments}>No hay citas programadas</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: Dimensions.get('window').height / 3,
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  headerButton: {
    padding: 8,
  },
  homeButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  appointmentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noAppointments: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 1
  },
});