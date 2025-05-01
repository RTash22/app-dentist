import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAppContext } from '../context/AppContext';

export function PacientsScreen({ navigation }) {
  const { patients, setPatients, addPatient, updatePatient, deletePatient } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    correo: '',
    descripcion: '',
    fecha_registro: new Date().toISOString().split('T')[0],
  });

  const apiUrl = 'http://192.168.0.32:8000/api/pacientes';

  // Cargar pacientes desde la API al iniciar
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Error al obtener pacientes');
      }
      const data = await response.json();
      setPatients(data); // Actualizar el estado global con los datos de la API
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.apellidos || !formData.telefono) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      let response;
      let method;
      let url = apiUrl;

      if (editingPatient) {
        method = 'PUT';
        url = `${apiUrl}/${editingPatient.id}`;
      } else {
        method = 'POST';
      }

      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error al ${editingPatient ? 'actualizar' : 'agregar'} paciente`);
      }

      // Actualizar la lista de pacientes
      fetchPatients();
      
      setModalVisible(false);
      setEditingPatient(null);
      setFormData({
        id: '',
        nombre: '',
        apellidos: '',
        telefono: '',
        correo: '',
        descripcion: '',
        fecha_registro: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar este paciente? También se eliminarán todas sus consultas asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Error al eliminar paciente');
              }

              // Actualizar el estado local después de eliminar
              deletePatient(id);
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'No se pudo eliminar el paciente');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    // Ajustar los nombres de los campos si es necesario
    setFormData({
      id: patient.id,
      nombre: patient.nombre || '',
      apellidos: patient.apellidos || '',
      telefono: patient.telefono || '',
      correo: patient.correo || '',
      descripcion: patient.descripcion || '',
      fecha_registro: patient.fecha_registro || new Date().toISOString().split('T')[0],
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setFormData({
            id: '',
            nombre: '',
            apellidos: '',
            telefono: '',
            correo: '',
            descripcion: '',
            fecha_registro: new Date().toISOString().split('T')[0],
          });
          setEditingPatient(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Añadir Paciente</Text>
      </TouchableOpacity>

      {loading && !modalVisible ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.patientCard}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.nombre} {item.apellidos}</Text>
                <Text>Teléfono: {item.telefono}</Text>
                <Text>Correo: {item.correo}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalView}>
            <Text style={styles.modalTitle}>
              {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre *"
              value={formData.nombre}
              onChangeText={(text) => setFormData({...formData, nombre: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Apellidos *"
              value={formData.apellidos}
              onChangeText={(text) => setFormData({...formData, apellidos: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Teléfono *"
              value={formData.telefono}
              keyboardType="phone-pad"
              onChangeText={(text) => setFormData({...formData, telefono: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={formData.correo}
              keyboardType="email-address"
              onChangeText={(text) => setFormData({...formData, correo: text})}
            />

            <TextInput
              style={styles.inputMultiline}
              placeholder="Descripción"
              value={formData.descripcion}
              multiline={true}
              numberOfLines={4}
              onChangeText={(text) => setFormData({...formData, descripcion: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginTop: 50,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  patientInfo: {
    marginBottom: 10,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
    minWidth: 80,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  inputMultiline: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
});