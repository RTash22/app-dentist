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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {patient.imageUri ? (
            <Image 
              source={{ uri: patient.imageUri }} 
              style={styles.imagePlaceholder}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="person" size={60} color="#ffffff" />
            </View>
          )}
        </View>
        <Text style={styles.name}>{patient.name}</Text>
      </View>

      <View style={styles.infoSection}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.replace('EditPatient', { patientId: patient.id })}
        >
          <Ionicons name="pencil" size={24} color="white" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

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
            <Text style={styles.infoValue}>{patient.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => navigation.navigate('Consultas', { patientId: patient.id })}
        >
          <Ionicons name="medical" size={24} color="white" />
          <Text style={styles.actionButtonText}>Nueva Consulta</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name="calendar" size={24} color="white" />
          <Text style={styles.actionButtonText}>Ver Historial</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0D4D8D',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageContainer: {
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#0D95D4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});