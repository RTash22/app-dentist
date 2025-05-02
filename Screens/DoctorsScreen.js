import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAppContext } from '../context/AppContext';

export function DoctorsScreen({ navigation }) {
  const { doctors, setDoctors, addDoctor, updateDoctor, deleteDoctor, userData } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    correo: '',
    telefono: '',
    especialidad: '',
    status: 'activo', // Por defecto activo
  });
  const [credentialsData, setCredentialsData] = useState({
    id_doctor: '',
    usuario: '',
    contraseña: '',
    rol: 'doctor', // Por defecto rol doctor
  });
  
  // Definir la URL base de la API - Usar la dirección IP correcta
  const apiBaseUrl = 'http://192.168.0.32:8000/api';
  const apiUrl = `${apiBaseUrl}/doctores`;
  
  // Token de autenticación
  const [token, setToken] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar el rol del usuario actual
  useEffect(() => {
    if (userData) {
      // Si el usuario no es admin, redirigir a la pantalla principal
      if (userData.rol !== 'admin') {
        Alert.alert(
          'Acceso Restringido', 
          'Solo los administradores pueden acceder a esta sección.',
          [{ 
            text: 'Volver', 
            onPress: () => navigation.goBack() 
          }]
        );
      } else {
        // Si es admin, establecer isAdmin en true
        setIsAdmin(true);
      }
    }
  }, [userData, navigation]);

  // Cargar doctores desde la API al iniciar
  useEffect(() => {
    getAuthToken();
  }, []);

  // Función para obtener el token de autenticación
  const getAuthToken = async () => {
    try {
      // 1. Primero intentamos hacer login para obtener un token
      console.log('Intentando autenticar...');
      
      const loginResponse = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@example.com',  // Usa credenciales válidas de tu sistema
          password: 'password'
        })
      });
      
      if (loginResponse.ok) {
        const data = await loginResponse.json();
        console.log('Login exitoso:', data);
        
        // Guardar el token
        if (data.token) {
          setToken(data.token);
          checkUserRole(data.token);
          console.log('Token guardado:', data.token);
        } else {
          console.error('No se recibió token en la respuesta');
        }
      } else {
        console.log('Error en login, intentando cargar doctores sin autenticación...');
        // Intenta usar un endpoint sin autenticación si existe
        setToken('');
        setIsAdmin(true); // Para desarrollo
      }
      
      // Cargar doctores después de intentar autenticar
      fetchDoctors();
    } catch (error) {
      console.error('Error en autenticación:', error);
      // Intenta cargar doctores sin autenticación
      fetchDoctors();
    }
  };

  // Verificar el rol del usuario
  const checkUserRole = async (accessToken) => {
    try {
      // Obtener información del usuario autenticado
      const userResponse = await fetch(`${apiBaseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('Datos de usuario:', userData);
        
        // Verificar si el usuario es admin
        const isAdminUser = userData.rol === 'admin';
        setIsAdmin(isAdminUser);
        console.log('Usuario es admin:', isAdminUser);
      } else {
        console.error('No se pudo obtener información del usuario');
      }
    } catch (error) {
      console.error('Error al verificar rol:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      console.log('Fetching doctors from:', apiUrl);
      
      // Intentando primero un endpoint público si existe
      let endpoint = `${apiBaseUrl}/doctores-lista`;
      let headers = {};
      
      // Si tenemos token, usamos el endpoint autenticado
      if (token) {
        endpoint = apiUrl;
        headers = { 'Authorization': `Bearer ${token}` };
      }
      
      console.log('Using endpoint:', endpoint);
      console.log('Using headers:', headers);
      
      const response = await fetch(endpoint, { headers });
      
      if (!response.ok) {
        // Si falla y tenemos token, intentamos con el endpoint autenticado
        if (!token && response.status === 401) {
          throw new Error('Se requiere autenticación. Por favor inicie sesión.');
        }
        
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Error al obtener doctores (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Doctors fetched successfully:', data);
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(data)) {
        setDoctors(data);
      } else if (data.data && Array.isArray(data.data)) {
        setDoctors(data.data);
      } else {
        setDoctors([]);
        console.warn('Formato de respuesta inesperado:', data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', `No se pudieron cargar los doctores: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.correo || !formData.especialidad) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Verificamos si tiene permisos para crear/editar
      if (!token) {
        throw new Error('No estás autenticado. Por favor inicia sesión primero.');
      }
      
      if (!isAdmin && !editingDoctor) {
        throw new Error('No tienes permisos para crear doctores.');
      }

      let method;
      let url = apiUrl;

      if (editingDoctor) {
        method = 'PUT';
        url = `${apiUrl}/${editingDoctor.id}`;
      } else {
        method = 'POST';
      }

      console.log(`Sending ${method} request to:`, url);
      console.log('Request data:', formData);
      
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Error al ${editingDoctor ? 'actualizar' : 'agregar'} doctor (${response.status}): ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Doctor saved successfully:', responseData);

      // Creación de credenciales
      if (!editingDoctor && credentialsData.usuario && credentialsData.contraseña) {
        const doctorData = responseData.data || responseData;
        
        const credentials = {
          ...credentialsData,
          id_doctor: doctorData.id
        };
        
        console.log('Creating credentials:', credentials);
        
        const credentialsResponse = await fetch(`${apiBaseUrl}/usuarios`, {
          method: 'POST',
          headers,
          body: JSON.stringify(credentials),
        });
        
        if (!credentialsResponse.ok) {
          const credErrorText = await credentialsResponse.text();
          console.error('Credentials API Error:', credentialsResponse.status, credErrorText);
          Alert.alert('Advertencia', `Doctor creado pero hubo un problema al crear las credenciales: ${credErrorText}`);
        } else {
          console.log('Credentials created successfully');
        }
      }

      // Actualizar estado local
      if (editingDoctor) {
        updateDoctor({...formData});
      } else {
        const newDoctor = responseData.data || responseData;
        addDoctor(newDoctor);
      }
      
      // Actualizar la lista de doctores
      fetchDoctors();
      
      setModalVisible(false);
      setEditingDoctor(null);
      resetForm();
      
      Alert.alert(
        'Éxito', 
        editingDoctor ? 'Doctor actualizado correctamente' : 'Doctor agregado correctamente'
      );
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      nombre: '',
      correo: '',
      telefono: '',
      especialidad: '',
      status: 'activo',
    });
    setCredentialsData({
      id_doctor: '',
      usuario: '',
      contraseña: '',
      rol: 'doctor',
    });
  };

  const handleDelete = async (id) => {
    // Solo los administradores pueden eliminar doctores
    if (!isAdmin) {
      Alert.alert('Error', 'No tienes permisos para eliminar doctores');
      return;
    }
    
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de que desea eliminar este doctor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar',
          onPress: async () => {
            setLoading(true);
            try {
              const deleteUrl = `${apiUrl}/${id}`;
              console.log('Deleting doctor:', deleteUrl);
              
              const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: token ? {
                  'Authorization': `Bearer ${token}`
                } : {}
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete API Error:', response.status, errorText);
                throw new Error(`Error al eliminar doctor (${response.status}): ${errorText}`);
              }

              console.log('Doctor deleted successfully');
              // Actualizar el estado local después de eliminar
              deleteDoctor(id);
              Alert.alert('Éxito', 'Doctor eliminado correctamente');
            } catch (error) {
              console.error('Error deleting doctor:', error);
              Alert.alert('Error', `No se pudo eliminar el doctor: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      id: doctor.id,
      nombre: doctor.nombre || '',
      correo: doctor.correo || '',
      telefono: doctor.telefono || '',
      especialidad: doctor.especialidad || '',
      status: doctor.status || 'activo',
    });
    setModalVisible(true);
  };

  const renderActionButtons = (item) => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        
        {isAdmin && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isAdmin && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>Añadir Doctor</Text>
        </TouchableOpacity>
      )}

      {loading && !modalVisible ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.doctorCard}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.nombre}</Text>
                <Text>Especialidad: {item.especialidad}</Text>
                <Text>Correo: {item.correo}</Text>
                <Text>Teléfono: {item.telefono}</Text>
                <Text>Estado: <Text style={item.status === 'activo' ? styles.activeStatus : styles.inactiveStatus}>
                  {item.status}
                </Text></Text>
              </View>
              {renderActionButtons(item)}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay doctores disponibles</Text>
            </View>
          }
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
              {editingDoctor ? 'Editar Doctor' : 'Nuevo Doctor'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre *"
              value={formData.nombre}
              onChangeText={(text) => setFormData({...formData, nombre: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico *"
              value={formData.correo}
              keyboardType="email-address"
              onChangeText={(text) => setFormData({...formData, correo: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={formData.telefono}
              keyboardType="phone-pad"
              onChangeText={(text) => setFormData({...formData, telefono: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Especialidad *"
              value={formData.especialidad}
              onChangeText={(text) => setFormData({...formData, especialidad: text})}
            />

            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Estado:</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, formData.status === 'activo' && styles.selectedStatus]}
                  onPress={() => setFormData({...formData, status: 'activo'})}
                >
                  <Text style={formData.status === 'activo' ? styles.selectedStatusText : styles.statusText}>Activo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, formData.status === 'inactivo' && styles.selectedStatus]}
                  onPress={() => setFormData({...formData, status: 'inactivo'})}
                >
                  <Text style={formData.status === 'inactivo' ? styles.selectedStatusText : styles.statusText}>Inactivo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {!editingDoctor && isAdmin && (
              <View style={styles.credentialsSection}>
                <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Usuario"
                  value={credentialsData.usuario}
                  onChangeText={(text) => setCredentialsData({...credentialsData, usuario: text})}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  value={credentialsData.contraseña}
                  secureTextEntry={true}
                  onChangeText={(text) => setCredentialsData({...credentialsData, contraseña: text})}
                />
              </View>
            )}

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
  doctorCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  doctorInfo: {
    marginBottom: 10,
  },
  doctorName: {
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
  activeStatus: {
    color: 'green',
    fontWeight: 'bold',
  },
  inactiveStatus: {
    color: 'red',
    fontWeight: 'bold',
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
  statusContainer: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedStatus: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusText: {
    color: '#333',
  },
  selectedStatusText: {
    color: 'white',
  },
  credentialsSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});