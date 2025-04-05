import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

export function PacientsScreen({ navigation }) {
  const { patients, addPatient, updatePatient, deletePatient } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    phone: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.age || !formData.phone) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (editingPatient) {
      updatePatient({ ...formData, id: editingPatient.id });
    } else {
      addPatient({ ...formData, id: Date.now().toString() });
    }

    setModalVisible(false);
    setEditingPatient(null);
    setFormData({ id: '', name: '', age: '', phone: '' });
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar este paciente? También se eliminarán todas sus consultas asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          onPress: () => deletePatient(id)
        }
      ]
    );
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.searchBar} 
        placeholder="Buscar" 
        placeholderTextColor="#aaa" 
      />

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.patientCard}>
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="person" size={40} color="#cccccc" />
              </View>
            </View>
            <TouchableOpacity 
              style={styles.patientButton}
              onPress={() => {
                navigation.navigate('PatientDetails', {
                  patientId: item.id
                });
              }}
            >
              <Text style={styles.patientText}>{item.name}</Text>
              <Text style={styles.patientDetails}>Edad: {item.age} | Tel: {item.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Edad"
              value={formData.age}
              keyboardType="numeric"
              onChangeText={(text) => setFormData({...formData, age: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={formData.phone}
              keyboardType="phone-pad"
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingPatient(null);
                  setFormData({ id: '', name: '', age: '', phone: '' });
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          setEditingPatient(null);
          setFormData({ id: '', name: '', age: '', phone: '' });
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  searchBar: {
    backgroundColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    color: '#000',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#0D4D8D',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    padding: 10,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  patientButton: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  patientText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientDetails: {
    color: '#e0e0e0',
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#D40D0D',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    marginRight: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#0D95D4',
    padding: 16,
    borderRadius: 50,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#D40D0D',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#0D95D4',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});