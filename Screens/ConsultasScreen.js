import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '../context/AppContext';

export function ConsultasScreen({ navigation }) {
  const { patients, appointments, addAppointment, updateAppointment, deleteAppointment } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    patientId: '',
    patientName: '',
    date: new Date(),
    description: '',
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = () => {
    if (!formData.patientId || !formData.description) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (editingAppointment) {
      updateAppointment({ ...formData, id: editingAppointment.id });
    } else {
      addAppointment({ ...formData, id: Date.now().toString() });
    }

    setModalVisible(false);
    setEditingAppointment(null);
    resetForm();
  };

  const deleteAppointmentHandler = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar esta consulta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          onPress: () => {
            deleteAppointment(id);
          }
        }
      ]
    );
  };

  const editAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setFormData(appointment);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      patientId: '',
      patientName: '',
      date: new Date(),
      description: '',
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = selectedDate;
      newDate.setHours(formData.date.getHours());
      newDate.setMinutes(formData.date.getMinutes());
      setFormData({ ...formData, date: newDate });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(formData.date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setFormData({ ...formData, date: newDate });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Nueva Consulta</Text>
      </TouchableOpacity>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentInfo}>
              <Text style={styles.patientName}>{item.patientName}</Text>
              <Text>Fecha: {formatDate(new Date(item.date))}</Text>
              <Text>Hora: {formatTime(new Date(item.date))}</Text>
              <Text>Descripción: {item.description}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => editAppointment(item)}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteAppointmentHandler(item.id)}
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
            {editingAppointment ? 'Editar Consulta' : 'Nueva Consulta'}
          </Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPatientPicker(true)}
          >
            <Text>{formData.patientName || 'Seleccionar Paciente'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>Fecha: {formatDate(formData.date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
          >
            <Text>Hora: {formatTime(formData.date)}</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción de la consulta"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            multiline={true}
            numberOfLines={4}
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

      {showDatePicker && (
        <DateTimePicker
          value={formData.date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.date}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPatientPicker}
        onRequestClose={() => setShowPatientPicker(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Seleccionar Paciente</Text>
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.patientItem}
                onPress={() => {
                  setFormData({
                    ...formData,
                    patientId: item.id,
                    patientName: item.name
                  });
                  setShowPatientPicker(false);
                }}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowPatientPicker(false)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
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
  appointmentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  appointmentInfo: {
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
    justifyContent: 'center',
  },
  textArea: {
    height: 100,
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
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  patientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});