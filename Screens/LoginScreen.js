import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function LoginScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [password, setPassword] = useState('');
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const apiBaseUrl = 'http://192.168.0.32:8000/api';

  useEffect(() => {
    checkExistingSession();
    fetchDoctors();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Eliminamos cualquier sesión existente para forzar el login en cada inicio
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/doctores-lista`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron obtener los doctores`);
      }
      
      const data = await response.json();
      console.log('Doctores obtenidos:', data);
      
      // Establecer los doctores según el formato de la respuesta
      if (Array.isArray(data)) {
        setDoctors(data);
      } else if (data.data && Array.isArray(data.data)) {
        setDoctors(data.data);
      } else {
        console.error('Formato de respuesta no reconocido:', data);
        setDoctors([]);  // Array vacío en lugar de datos de prueba
        Alert.alert('Error', 'No se pudieron cargar los doctores. El formato de respuesta es incorrecto.');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);  // Array vacío en lugar de datos de prueba
      Alert.alert('Error', 'No se pudieron cargar los doctores. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setLoginModalVisible(true);
  };

  const handleLogin = async () => {
    if (!selectedDoctor || !password) {
      Alert.alert('Error', 'Por favor ingrese su contraseña');
      return;
    }

    setLoadingLogin(true);

    try {
      console.log(`Intentando login con doctor ID: ${selectedDoctor.id} y contraseña: ${password}`);
      
      // IMPORTANTE: Forzar rol de administrador para pruebas
      // Esto garantiza que siempre tendrás acceso al botón de Doctores después de cerrar sesión
      const testRole = 'admin'; 
      console.log(`ASIGNANDO ROL FIJO: ${testRole}`);
      
      // Crear el objeto de datos que se enviará al servidor
      const loginData = {
        email: selectedDoctor.email || selectedDoctor.correo, // Intentar con ambas opciones
        password: password
      };

      // Si no hay email, intentar con id_doctor
      if (!loginData.email) {
        loginData.id_doctor = selectedDoctor.id;
      }
      
      console.log('Datos enviados:', JSON.stringify(loginData));
      
      const loginResponse = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Importante para Laravel Sanctum
        },
        body: JSON.stringify(loginData)
      });

      console.log('Status code:', loginResponse.status);
      
      const responseBody = await loginResponse.text();
      console.log('Respuesta completa:', responseBody);
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseBody);
      } catch (e) {
        console.error('Error al parsear respuesta:', e);
      }
      
      if (!loginResponse.ok) {
        let errorMessage = 'Credenciales incorrectas';
        if (parsedResponse && parsedResponse.message) {
          errorMessage = parsedResponse.message;
        }
        throw new Error(errorMessage);
      }

      // Si la respuesta fue exitosa pero no es JSON válido
      if (!parsedResponse) {
        throw new Error('La respuesta del servidor no es válida');
      }

      // Obtener el token de autenticación y datos del usuario
      const token = parsedResponse.data?.token || parsedResponse.token || "dummy_token_123";
      
      // IMPORTANTE: Usar el rol de administrador forzado para garantizar acceso a todas las funcionalidades
      const userRole = testRole;
      
      // Guardar el token y los datos del usuario en AsyncStorage con rol forzado a admin
      const userDataToSave = {
        id: selectedDoctor.id,
        nombre: selectedDoctor.nombre,
        especialidad: selectedDoctor.especialidad || 'Odontología',
        email: selectedDoctor.email || selectedDoctor.correo,
        rol: userRole // Usar el rol forzado
      };
      
      console.log('Guardando datos de usuario:', JSON.stringify(userDataToSave));
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));

      setLoginModalVisible(false);
      setPassword('');
      navigation.replace('HomeScreen');
    } catch (error) {
      console.error('Error durante login:', error);
      Alert.alert('Error de inicio de sesión', error.message || 'Contraseña incorrecta. Por favor intente nuevamente.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const renderDoctorCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.doctorCard}
      onPress={() => handleDoctorSelect(item)}
    >
      <View style={styles.doctorAvatarContainer}>
        <View style={styles.doctorAvatar}>
          <Text style={styles.doctorInitials}>
            {item.nombre ? item.nombre.charAt(0).toUpperCase() : 'D'}
          </Text>
        </View>
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.nombre}</Text>
        <Text style={styles.doctorSpecialty}>{item.especialidad}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando doctores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#21588E', '#2FA0AD']}
        style={styles.headerGradient}
      >
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appTitle}>Sistema Dental</Text>
        <Text style={styles.subtitle}>Inicie sesión para continuar</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Seleccione su Doctor
        </Text>

        {doctors.length > 0 ? (
          <FlatList
            data={doctors}
            renderItem={renderDoctorCard}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.doctorsList}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="medical" size={50} color="#ccc" />
            <Text style={styles.noDataText}>No hay doctores disponibles</Text>
          </View>
        )}
      </View>

      <Modal
        visible={loginModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLoginModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDoctor && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Iniciar Sesión</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setLoginModalVisible(false);
                      setPassword('');
                    }}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedDoctorContainer}>
                  <View style={[styles.doctorAvatar, styles.largeAvatar]}>
                    <Text style={[styles.doctorInitials, styles.largeInitials]}>
                      {selectedDoctor.nombre.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.selectedDoctorName}>{selectedDoctor.nombre}</Text>
                  <Text style={styles.selectedDoctorSpecialty}>{selectedDoctor.especialidad || ''}</Text>
                </View>

                <TextInput
                  style={styles.passwordInput}
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.loginButton, !password && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={!password || loadingLogin}
                >
                  {loadingLogin ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.developerNote}>
        <Text style={styles.developerNoteText}>Sistema en desarrollo v0.1</Text>
      </View>
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    height: windowHeight * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  doctorsList: {
    paddingBottom: 20,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  doctorAvatarContainer: {
    marginRight: 15,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  doctorInitials: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  largeInitials: {
    fontSize: 32,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 15,
    color: '#999',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: windowWidth * 0.85,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  selectedDoctorContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  selectedDoctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  selectedDoctorSpecialty: {
    fontSize: 16,
    color: '#666',
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  developerNote: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  developerNoteText: {
    color: '#aaa',
    fontSize: 12,
  }
});