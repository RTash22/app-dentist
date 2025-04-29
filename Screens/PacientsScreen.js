import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert, 
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';

export function PacientsScreen({ navigation }) {
  const { patients, addPatient, updatePatient, deletePatient } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    phone: '',
    imageUri: null,
  });

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la foto');
      }
    })();
  }, []);

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (text) => {
    const numericText = text.replace(/\D/g, '');
    const formatted = formatPhoneNumber(numericText);
    setFormData({...formData, phone: formatted});
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFormData({ ...formData, imageUri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setFormData({ id: '', name: '', age: '', phone: '', imageUri: null });
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
        placeholder="Buscar paciente" 
        placeholderTextColor="#aaa"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.patientCard}
            onPress={() => navigation.navigate('PatientDetails', { patientId: item.id })}
          >
            <View style={styles.patientInfo}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.patientImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="person" size={30} color="#cccccc" />
                </View>
              )}
              <View style={styles.textContainer}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.patientDetails}>Edad: {item.age}</Text>
                <Text style={styles.patientDetails}>Tel: {item.phone}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </Text>

              <TouchableOpacity 
                style={styles.modalImageContainer}
                onPress={pickImage}
              >
                {formData.imageUri ? (
                  <Image 
                    source={{ uri: formData.imageUri }} 
                    style={styles.modalImage}
                  />
                ) : (
                  <View style={styles.modalImagePlaceholder}>
                    <Ionicons name="camera" size={40} color="#999" />
                    <Text style={styles.modalImageText}>Agregar foto</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Edad"
                value={formData.age}
                keyboardType="numeric"
                onChangeText={(text) => setFormData({...formData, age: text})}
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.phone}
                keyboardType="number-pad"
                onChangeText={handlePhoneChange}
                maxLength={12}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalVisible(false);
                    setEditingPatient(null);
                    setFormData({ id: '', name: '', age: '', phone: '', imageUri: null });
                  }}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleSubmit();
                  }}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          setEditingPatient(null);
          setFormData({ id: '', name: '', age: '', phone: '', imageUri: null });
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  modalImageText: {
    marginTop: 5,
    color: '#999',
    fontSize: 14,
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
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  patientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  patientName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});