import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

export function PatientDetailsScreen({ route, navigation }) {
  const { patientId } = route.params;
  const { patients } = useAppContext();
  
  const patient = patients.find(p => p.id === patientId);

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text>Paciente no encontrado</Text>
      </View>
    );
  }

  return (    <ScrollView style={styles.container}>
      <View style={styles.header}>
      </View>
      
      <View style={[styles.emptySection, styles.profileSection]}>
        <View style={styles.imageContainer}>
          {patient.imageUri ? (
            <Image 
              source={{ uri: patient.imageUri }} 
              style={styles.imagePlaceholder}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="person" size={60} color="#76C2FD" />
            </View>
          )}
        </View>
        <Text style={styles.name}>{patient.name}</Text>
      </View>
      
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={24} color="#0D4D8D" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Edad</Text>
            <Text style={styles.infoValue}>{patient.age} años</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={24} color="#0D4D8D" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{patient.phone}</Text>          </View>        </View>
      </View>

      <View style={styles.emptySection}>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.replace('EditPatient', { patientId: patient.id })}
        >
          <Ionicons name="pencil" size={24} color="white" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },  header: {
    backgroundColor: '#26749A',
    height: 150,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },  profileSection: {
    marginTop: 30,
    alignItems: 'center',
    zIndex: 1,
    width: '62%',
    height: 160,
    backgroundColor: 'white',
    borderRadius: 15,
    alignSelf: 'center',
    elevation: 8, // Aumentando la elevación para más sombra en Android
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35, // Aumentando la opacidad de la sombra
    shadowRadius: 5.84, // Aumentando el radio de la sombra
  },
  imageContainer: {
    marginBottom: 10
  },
  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: '#C0E9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#76C2FD',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#26749A',
    textAlign: 'center',
    height: 10, // Altura del contenedor de texto
    lineHeight: 10, // Centrar verticalmente el texto
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptySection: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: 100, // Esto le dará una altura mínima al cuadrado
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 2,
  },  bottomContainer: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#26749A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    width: '25%',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});