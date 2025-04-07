import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../context/AppContext';

export function EditPatientScreen({ route, navigation }) {
  const { patientId } = route.params;
  const { patients, updatePatient, deletePatient } = useAppContext();
  const patient = patients.find(p => p.id === patientId);

  const [formData, setFormData] = useState({
    id: patient.id,
    name: patient.name,
    age: patient.age,
    phone: patient.phone,
    imageUri: patient.imageUri,
  });

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la foto');
      }
    })();
  }, []);

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
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.age || !formData.phone) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    updatePatient(formData);
    navigation.replace('PatientDetails', { patientId: patient.id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar este paciente? También se eliminarán todas sus consultas asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          onPress: () => {
            deletePatient(patient.id);
            navigation.reset({
              index: 1,
              routes: [
                { name: 'Home' },
                { name: 'Patients' }
              ],
            });
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <View style={styles.form}>
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={pickImage}
            >
              {formData.imageUri ? (
                <Image 
                  source={{ uri: formData.imageUri }} 
                  style={styles.image}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="person" size={60} color="#cccccc" />
                  <Text style={styles.imagePlaceholderText}>Toca para cambiar foto</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              returnKeyType="next"
            />

            <Text style={styles.label}>Edad</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              keyboardType="numeric"
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              returnKeyType="next"
              onSubmitEditing={Keyboard.dismiss}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="Teléfono (solo números)"
              value={formData.phone}
              keyboardType="number-pad"
              onChangeText={handlePhoneChange}
              maxLength={12}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit();
              }}
            >
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
              <Text style={styles.deleteButtonText}>Eliminar Paciente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0D4D8D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#D40D0D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});