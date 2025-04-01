import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sistema Dental</Text>
      <View style={styles.gridContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Patients')}
        >
          <Ionicons name="people" size={32} color="#2196F3" />
          <Text style={styles.buttonText}>Pacientes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name="calendar" size={32} color="#4CAF50" />
          <Text style={styles.buttonText}>Calendario</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}
        onPress={() => navigation.navigate('Consultas')}>
          <Ionicons name="medical" size={32} color="#f44336" />
          <Text style={styles.buttonText}>Citas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Ionicons name="stats-chart" size={32} color="#9C27B0" />
          <Text style={styles.buttonText}>Reportes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    marginTop: 20,
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
  },
  button: {
    width: '40%',
    aspectRatio: 1,
    margin: '5%',
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});