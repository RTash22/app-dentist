import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
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
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setFormData({ id: '', name: '', age: '', phone: '' });
          setEditingPatient(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Añadir Paciente</Text>
      </TouchableOpacity>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.patientCard}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{item.name}</Text>
              <Text>Edad: {item.age}</Text>
              <Text>Teléfono: {item.phone}</Text>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
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
              onPress={() => setModalVisible(false)}
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    elevation: 5,
    marginTop: 100,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
});