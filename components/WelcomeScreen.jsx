import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ImageBackground,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'react-native'

export default function WelcomeScreen({ navigation }) {
  const [balance, setBalance] = useState('')

  const handleStart = async () => {
    if (!balance) return
    await AsyncStorage.setItem('initialBalance', balance)
    navigation.replace('Home')
  }
  return (
    <ImageBackground
      source={require('../assets/nami.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <Image source={require('../assets/logo.png')} style={styles.logo} />
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
        <Button title="Inizia" onPress={handleStart} />
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 6.25,
    marginBottom: 20,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
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
