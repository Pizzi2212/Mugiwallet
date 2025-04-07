import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen() {
  const [balance, setBalance] = useState('0')
  const [modBalance, setModBalance] = useState('')

  useEffect(() => {
    const getBalance = async () => {
      const saved = await AsyncStorage.getItem('initialBalance')
      setBalance(saved || '0')
    }
    getBalance()
  }, [])

  const updateBalance = async (amount) => {
    const newBalance = parseInt(balance) + amount
    setBalance(newBalance.toString())
    await AsyncStorage.setItem('initialBalance', newBalance.toString())
    setModBalance('')
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Saldo attuale</Text>
        <Text style={styles.balance}>€ {balance}</Text>
        <TextInput
          style={styles.input}
          placeholder="Inserisci importo"
          keyboardType="numeric"
          value={modBalance}
          onChangeText={setModBalance}
        />
        <View style={styles.row}>
          <Button
            title="Aggiungi"
            onPress={() => updateBalance(parseInt(modBalance) || 0)}
            color="blue"
          />
          <Button
            title="Rimuovi"
            onPress={() => updateBalance(-(parseInt(modBalance) || 0))}
            color="red"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 70,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
})
