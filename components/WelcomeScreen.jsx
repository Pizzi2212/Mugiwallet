import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'react-native'

export default function WelcomeScreen({ navigation }) {
  const [balance, setBalance] = useState('')
  const [isLoading, setIsLoading] = useState(false) // Stato di caricamento

  const handleStart = async () => {
    if (balance === '') {
      alert('Per favore inserisci un saldo valido')
      return
    }

    setIsLoading(true) // Avvia il caricamento

    try {
      // Salva il saldo in AsyncStorage prima di navigare
      await AsyncStorage.setItem('initialBalance', balance)

      // Naviga alla schermata Home dopo aver salvato il saldo
      navigation.replace('Home')
    } catch (error) {
      console.error('Errore nel salvataggio del saldo:', error)
      alert('Si è verificato un errore. Riprova più tardi.')
    } finally {
      setIsLoading(false) // Termina il caricamento, anche in caso di errore
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ImageBackground
        source={require('../assets/nami.webp')}
        style={styles.background}
        resizeMode="cover"
      >
        <Image style={styles.logo} source={require('../assets/logo.png')} />
        <View style={styles.overlay}>
          <Text style={styles.title}>Benvenuto!</Text>
          <Text style={styles.subtitle}>Quanti soldi hai adesso?</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Es: 1000"
            placeholderTextColor="#aaa"
            value={balance}
            onChangeText={setBalance}
          />

          {isLoading ? (
            // Mostra un indicatore di caricamento mentre si salva il saldo
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Inizia" onPress={handleStart} />
          )}
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 3,
    marginBottom: 50,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    marginBottom: 20,
    borderRadius: 5,
    textAlign: 'center',
  },
})
