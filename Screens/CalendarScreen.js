import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export function CalendarScreen({ navigation }) {
  const { appointments } = useAppContext();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [dayAppointments, setDayAppointments] = useState([]);

  useEffect(() => {
    // Preparar las fechas marcadas
    const marks = {};
    appointments.forEach(appointment => {
      const dateString = new Date(appointment.date).toISOString().split('T')[0];
      marks[dateString] = {
        marked: true,
        dotColor: '#2196F3',
        selectedColor: '#2196F3'
      };
    });
    setMarkedDates(marks);
  }, [appointments]);

  const handleDayPress = (day) => {
    const selectedDateString = day.dateString;
    setSelectedDate(selectedDateString);
    
    // Filtrar las consultas del día seleccionado
    const dayAppts = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
      return appointmentDate === selectedDateString;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    setDayAppointments(dayAppts);
    setModalVisible(true);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Min')}
        >
          <Ionicons name="home" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Agenda</Text>
      </View>

      <View style={{ paddingTop: 60 }}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: '#2196F3',
            todayTextColor: '#2196F3',
            arrowColor: '#2196F3',
          }}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Consultas del {selectedDate ? formatDate(selectedDate) : ''}
            </Text>
            
            <ScrollView style={styles.appointmentsList}>
              {dayAppointments.length > 0 ? (
                dayAppointments.map((appointment, index) => (
                  <View key={appointment.id} style={styles.appointmentItem}>
                    <Text style={styles.appointmentTime}>
                      {formatTime(appointment.date)}
                    </Text>
                    <Text style={styles.appointmentPatient}>
                      {appointment.patientName}
                    </Text>
                    <Text style={styles.appointmentDesc}>
                      {appointment.description}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noAppointments}>
                  No hay consultas programadas para este día
                </Text>
              )}
            </ScrollView>

            <Text 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              Cerrar
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerButton: {
    padding: 8,
  },
  greetingContainer: {
    position: 'absolute',
    top: 90,
    left: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  appointmentsList: {
    maxHeight: '80%',
  },
  appointmentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 5,
  },
  appointmentDesc: {
    fontSize: 14,
    color: '#666',
  },
  noAppointments: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  closeButton: {
    marginTop: 15,
    textAlign: 'center',
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
});