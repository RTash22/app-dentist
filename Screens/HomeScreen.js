// filepath: d:\React\app-dentist\Screens\HomeScreen.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, StatusBar, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppContext } from '../context/AppContext';

export function HomeScreen() {
  const navigation = useNavigation();
  const { userData, logout, loadingUser, isAdmin } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  const upcomingAppointments = [
    { id: '1', patientName: 'Juan Pérez', date: '27/04/2025', time: '09:00' },
    { id: '2', patientName: 'María García', date: '27/04/2025', time: '10:30' },
    { id: '3', patientName: 'Carlos López', date: '28/04/2025', time: '11:00' },
    { id: '4', patientName: 'Ana Martínez', date: '28/04/2025', time: '12:30' }
  ];

  const baseServices = [
    { id: 1, name: 'Agenda', icon: 'calendar' },
    { id: 4, name: 'Citas', icon: 'medical' },  
    { id: 3, name: 'Pacientes', icon: 'people' },
    { id: 2, name: 'Historial', icon: 'time' }    
  ];
  
  const adminServices = [
    { id: 5, name: 'Doctores', icon: 'medkit' }
  ];

  const services = useMemo(() => {
    if (isAdmin) {
      return [...baseServices, ...adminServices];
    }
    return baseServices;
  }, [isAdmin]);

  const filteredServices = useMemo(() => {
    return services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, services]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleServicePress = (serviceName) => {
    if (serviceName === 'Agenda') {
      navigation.navigate('Calendar');
    }
    if (serviceName === 'Citas') {
      navigation.navigate('ConsultasScreen');
    }
    if (serviceName === 'Pacientes') {
      navigation.navigate('Patients');
    }
    if (serviceName === 'Doctores') {
      navigation.navigate('Doctors');
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } else {
      Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
    }
  };

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando información del usuario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient
          colors={['#21588E', '#2FA0AD']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.smallGreeting}>¡Hola, {userData?.nombre || 'Doctor'}!</Text>
              <Text style={styles.greeting}>{getTimeBasedGreeting()}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.topSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar servicios..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#666"
              />
            </View>
            
            <View style={styles.userInfoBox}>
              <Text style={styles.userRole}>{userData?.especialidad || 'Odontología'}</Text>
              <Text style={styles.userSubtitle}>{userData?.rol === 'admin' ? 'Administrador' : 'Doctor'}</Text>
            </View>
          </View>

          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Servicios</Text>

            <View style={styles.gridContainer}>
              {filteredServices.map(service => (
                <TouchableOpacity 
                  key={service.id} 
                  style={styles.gridItem}
                  onPress={() => handleServicePress(service.name)}
                >
                  <Ionicons name={service.icon} size={32} color="#378DD0" />
                  <Text style={styles.gridItemText}>{service.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.appointmentsContainer}>
            <Text style={styles.appointmentsTitle}>Próximas Citas</Text>
            <FlatList
              data={upcomingAppointments}
              keyExtractor={(item) => item.id}
              style={styles.appointmentsList}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={[
                  styles.appointmentCard,
                  { 
                    borderColor: index % 2 === 0 ? '#21588E' : '#2FA0AD',
                    backgroundColor: index % 2 === 0 ? '#21588E' : '#2FA0AD'
                  }
                ]}>
                  <Text style={[styles.patientName, { color: 'white' }]}>
                    {item.patientName}
                  </Text>
                  <Text style={[styles.appointmentTime, { color: 'white' }]}>
                    {item.date} - {item.time}
                  </Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  greetingContainer: {
    flex: 1,
  },
  smallGreeting: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    padding: 5,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    backgroundColor: 'transparent',
    zIndex: 2,
    height: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '65%',
    height: 45,
    marginTop: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  userInfoBox: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    width: '30%',
    marginTop: 25,
  },
  userRole: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#21588E',
  },
  userSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  servicesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: 'white',
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gridItemText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  appointmentsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  appointmentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  appointmentsList: {
    marginBottom: 10,
  },
  appointmentCard: {
    width: 200,
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    borderLeftWidth: 5,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  appointmentTime: {
    fontSize: 14,
  },
});
