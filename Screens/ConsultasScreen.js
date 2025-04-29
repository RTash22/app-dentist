import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Platform, ScrollView, SafeAreaView, Dimensions, ActionSheetIOS, Keyboard, ImageBackground } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export function ConsultasScreen() {
  const navigation = useNavigation();
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
  const [mode, setMode] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');

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

    // Validar que la fecha no sea pasada
    const now = new Date();
    if (formData.date < now) {
      Alert.alert('Error', 'No se pueden agendar consultas en fechas pasadas');
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

  const showDatepicker = () => {
    setMode('date');
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setMode('time');
    setShowTimePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(false);
    setShowTimePicker(false);
    
    if (selectedDate) {
      if (mode === 'date') {
        const newDate = new Date(currentDate);
        newDate.setHours(formData.date.getHours());
        newDate.setMinutes(formData.date.getMinutes());
        setFormData(prev => ({ ...prev, date: newDate }));
      } else {
        const newDate = new Date(formData.date);
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());
        setFormData(prev => ({ ...prev, date: newDate }));
      }
    }
  };

  const handleSelectPatient = () => {
    if (Platform.OS === 'ios') {
      const options = ['Cancelar', ...patients.map(p => p.name)];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex !== 0) { // Si no es cancelar
            const selectedPatient = patients[buttonIndex - 1];
            setFormData({
              ...formData,
              patientId: selectedPatient.id,
              patientName: selectedPatient.name
            });
          }
        }
      );
    } else {
      setShowPatientPicker(true);
    }
  };

  const handleDateTimeSelection = () => {
    if (Platform.OS === 'ios') {
      // Mostrar el DateTimePicker en modo spinner
      setShowDatePicker(true);
    } else {
      showDatepicker();
    }
  };

  const handleTimeSelection = () => {
    if (Platform.OS === 'ios') {
      // Mostrar el DateTimePicker en modo spinner para hora
      setShowTimePicker(true);
    } else {
      showTimepicker();
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/banner-dental.jpg')}
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
            onPress={() => navigation.navigate('Min')}
          >
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.greetingContainer}>
        
        <Text style={styles.greeting}>Consultas</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar consultas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      <Text style={styles.sectionTitle}>Lista de Consultas</Text>

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {editingAppointment ? 'Editar Consulta' : 'Nueva Consulta'}
            </Text>

            <TouchableOpacity
              style={[styles.input, { backgroundColor: '#fff' }]}
              onPress={handleSelectPatient}
            >
              <Text>{formData.patientName || 'Seleccionar Paciente'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.input}
              onPress={showDatepicker}
            >
              <Text>Fecha: {formatDate(formData.date)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.input}
              onPress={showTimepicker}
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
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
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

            {/* Date/Time Picker */}
            {(showDatePicker || showTimePicker) && (
              <View style={styles.datePickerOverlay}>
                <View style={styles.dateTimePickerWrapper}>
                  <View style={styles.pickerHeaderContainer}>
                    <TouchableOpacity 
                      onPress={() => {
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                      }}
                      style={styles.pickerHeaderButton}
                    >
                      <Text style={styles.pickerHeaderButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={styles.pickerTitle}>
                      {mode === 'date' ? 'Seleccionar Fecha' : 'Seleccionar Hora'}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        onDateChange({ type: 'set' }, formData.date);
                      }}
                      style={styles.pickerHeaderButton}
                    >
                      <Text style={styles.pickerHeaderButtonText}>Aceptar</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={formData.date}
                      mode={mode}
                      is24Hour={true}
                      onChange={onDateChange}
                      display="spinner"
                      themeVariant="light"
                      textColor="black"
                      style={{
                        width: Platform.OS === 'ios' ? 320 : '100%',
                        height: 300,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Solo mostrar el modal de pacientes en Android */}
      {Platform.OS === 'android' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPatientPicker}
          onRequestClose={() => setShowPatientPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccionar Paciente</Text>
              <FlatList
                style={styles.patientsList}
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
                    <Text style={styles.patientItemText}>{item.name}</Text>
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
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  greetingContainer: {
    position: 'absolute',
    top: 90,
    left: 30,
  },
  smallGreeting: {
    fontSize: 17,
    fontWeight: '400',
    color: '#333',
    marginBottom: 5,
  },
  greeting: {
    top: 240,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    position: 'absolute',
    top: 380,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3e2e0',
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    position: 'absolute',
    top: 418,
    left: 20,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  addButton: {
    top: 22,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 23, 
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentCard: {
    top: 160,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: Platform.OS === 'ios' ? '90%' : '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  patientPickerModal: {
    width: Platform.OS === 'ios' ? '90%' : '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  patientsList: {
    width: '100%',
    maxHeight: '70%',
  },
  patientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  patientItemText: {
    fontSize: 16,
  },
  iosDatePicker: {
    backgroundColor: 'white',
    width: '100%',
  },
  iosPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  iosPickerButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  iosModalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 200,
    backgroundColor: 'white',
  },
  iosModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  iosModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.7,
  },
  iosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iosModalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  iosModalButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  iosPatientsList: {
    flex: 1,
  },
  iosPatientItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  iosPatientItemText: {
    fontSize: 17,
    color: '#000',
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  iosModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  iosDateTimePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 0,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iosPickerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  iosPickerButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  iosDateTimePicker: {
    height: 200,
    width: '100%',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dateTimePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  dateTimePickerWrapper: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePickerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  dateTimePickerWrapper: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  pickerHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerHeaderButton: {
    padding: 5,
  },
  pickerHeaderButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  datePickerContainer: {
    paddingVertical: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    minHeight: 300,
  },
  datePicker: {
    width: Platform.OS === 'ios' ? 320 : '100%',
    height: 200,
  },
<<<<<<< HEAD
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
=======
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
  headerButton: {
    padding: 8,
  },
  homeButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3.5,
    borderColor: '#77C4FF',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: null,
    shadowOpacity: 0,
    shadowRadius: 0,
>>>>>>> c0ccd290ad0595cff17403e79ae937addf8bf981
  },
});