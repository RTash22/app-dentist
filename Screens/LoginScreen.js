// LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../context/api'; // Asegúrate de tener configurado el cliente axios

const LoginScreen = ({ navigation }) => {
  // Estado para manejar el tipo de login (doctor o admin)
  const [loginType, setLoginType] = useState('doctor');
  
  // Estados para los formularios
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [usuario, setUsuario] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Estado para la lista de doctores
  const [doctores, setDoctores] = useState([]);
  
  // Estados para manejar carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingDoctores, setLoadingDoctores] = useState(true);
  const [error, setError] = useState('');

  // Cargar la lista de doctores al montar el componente
  useEffect(() => {
    const fetchDoctores = async () => {
      try {
        setLoadingDoctores(true);
        const response = await api.get('/doctores-lista');
        
        if (response.data.status === 'success') {
          setDoctores(response.data.data || []);
        } else {
          setError('Error al cargar la lista de doctores');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('No se pudieron cargar los doctores. Por favor intente nuevamente.');
      } finally {
        setLoadingDoctores(false);
      }
    };

    fetchDoctores();
  }, []);

  // Función para manejar el login de doctores
  const handleDoctorLogin = async () => {
    if (!doctorId) {
      return Alert.alert('Error', 'Por favor seleccione un doctor');
    }
    
    if (!password) {
      return Alert.alert('Error', 'Por favor ingrese la contraseña');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/login', {
        id_doctor: doctorId,
        password: password
      });
      
      console.log('Doctor login response:', response.data);
      
      if (response.data.status === 'success') {
        // Guardar el token
        await AsyncStorage.setItem('authToken', response.data.data.token);
        
        // Guardar datos del usuario (importante para verificar el rol después)
        const userData = response.data.data.user;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Limpiar el formulario
        setDoctorId('');
        setPassword('');
        
        // Redireccionar según el rol
        if (userData.is_admin) {
          navigation.replace('AdminHomeScreen');
        } else {
          navigation.replace('HomeScreen');
        }
      } else {
        setError('Error en el inicio de sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 
               error.response?.data?.errors?.password?.[0] || 
               'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el login de administradores
  const handleAdminLogin = async () => {
    if (!usuario) {
      return Alert.alert('Error', 'Por favor ingrese el nombre de usuario');
    }
    
    if (!adminPassword) {
      return Alert.alert('Error', 'Por favor ingrese la contraseña');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/login-admin', {
        usuario: usuario,
        password: adminPassword
      });
      
      console.log('Admin login response:', response.data);
      
      if (response.data.status === 'success') {
        // Guardar el token
        await AsyncStorage.setItem('authToken', response.data.data.token);
        
        // Guardar datos del usuario completos (no solo el doctor)
        const userData = response.data.data.user;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Limpiar el formulario
        setUsuario('');
        setAdminPassword('');
        
        // Redireccionar al home de administrador
        navigation.replace('AdminHomeScreen');
      } else {
        setError('Error en el inicio de sesión');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError(error.response?.data?.message || 
               error.response?.data?.errors?.usuario?.[0] || 
               'Error al iniciar sesión como administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Consultorio Dental</Text>
            <Text style={styles.subtitle}>Inicio de sesión</Text>
          </View>
          
          {/* Selector de tipo de login */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                loginType === 'doctor' ? styles.activeTab : null
              ]}
              onPress={() => setLoginType('doctor')}
            >
              <Text 
                style={[
                  styles.tabText,
                  loginType === 'doctor' ? styles.activeTabText : null
                ]}
              >
                Doctor
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                loginType === 'admin' ? styles.activeTab : null
              ]}
              onPress={() => setLoginType('admin')}
            >
              <Text 
                style={[
                  styles.tabText,
                  loginType === 'admin' ? styles.activeTabText : null
                ]}
              >
                Administrador
              </Text>
            </TouchableOpacity>
          </View>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <View style={styles.formContainer}>
            {loginType === 'doctor' ? (
              // Formulario de login para doctores
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Seleccione Doctor</Text>
                  {loadingDoctores ? (
                    <ActivityIndicator size="small" color="#0066cc" style={styles.loadingIndicator} />
                  ) : (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={doctorId}
                        onValueChange={(itemValue) => setDoctorId(itemValue)}
                        style={styles.picker}
                        enabled={!loading}
                      >
                        <Picker.Item label="Seleccione un doctor" value="" />
                        {doctores.map((doctor) => (
                          <Picker.Item
                            key={doctor.id}
                            label={doctor.nombre}
                            value={doctor.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Ingrese su contraseña"
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleDoctorLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // Formulario de login para administradores
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Usuario</Text>
                  <TextInput
                    style={styles.input}
                    value={usuario}
                    onChangeText={setUsuario}
                    placeholder="Ingrese su usuario"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={styles.input}
                    value={adminPassword}
                    onChangeText={setAdminPassword}
                    placeholder="Ingrese su contraseña"
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleAdminLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Iniciar como Administrador</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0066cc',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  picker: {
    height: 50,
  },
  loadingIndicator: {
    marginVertical: 15,
  },
  loginButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;