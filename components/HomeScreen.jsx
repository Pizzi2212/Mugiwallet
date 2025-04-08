import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native'
import { PieChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import dayjs from 'dayjs'
import 'dayjs/locale/it'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native' // Importa useNavigation

const screenWidth = Dimensions.get('window').width

const categories = [
  { key: 'Salute', color: '#f44336', emoji: '❤️' },
  { key: 'Ristorante', color: '#ff9800', emoji: '🍽️' },
  { key: 'Spesa', color: '#ffeb3b', emoji: '🛒' },
  { key: 'Benzina', color: '#4caf50', emoji: '⛽' },
  { key: 'Casa', color: '#3f51b5', emoji: '🏡' },
  { key: 'Mezzi', color: '#9c27b0', emoji: '🚌' },
  { key: 'Regali', color: '#00bcd4', emoji: '🎁' },
  { key: 'Shopping', color: '#2196f3', emoji: '👕' },
  { key: 'Viaggi', color: '#3f51b5', emoji: '✈️' },
  { key: 'Abbonamenti', color: '#9c27b0', emoji: '📺' },
  { key: 'Svago', color: '#00bcd4', emoji: '🎮' },
  { key: 'Altro', color: '#607d8b', emoji: '❓' },
]

export default function MonthlyExpenseScreen() {
  const navigation = useNavigation() // Aggiungi useNavigation
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [filteredIncome, setFilteredIncome] = useState([])
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [amount, setAmount] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    dayjs.locale('it')
  }, [])

  useEffect(() => {
    loadExpenses()
    loadIncome()
    loadBalance()
  }, [])

  useEffect(() => {
    const filteredExpenses = expenses.filter((e) =>
      dayjs(e.date).isSame(currentMonth, 'month')
    )
    const filteredIncome = income.filter((e) =>
      dayjs(e.date).isSame(currentMonth, 'month')
    )
    setFilteredExpenses(filteredExpenses)
    setFilteredIncome(filteredIncome)
  }, [expenses, income, currentMonth])

  const loadExpenses = async () => {
    const data = await AsyncStorage.getItem('expenses')
    if (data) setExpenses(JSON.parse(data))
  }

  const loadIncome = async () => {
    const data = await AsyncStorage.getItem('income')
    if (data) setIncome(JSON.parse(data))
  }

  const loadBalance = async () => {
    const data = await AsyncStorage.getItem('initialBalance')
    if (data) setBalance(parseFloat(data))
  }

  const saveExpense = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Errore', 'Inserisci un importo e seleziona una categoria')
      return
    }
    const newExpense = {
      amount: parseFloat(amount),
      category: selectedCategory,
      date: currentMonth.toISOString(),
    }
    const newExpenses = [...expenses, newExpense]
    setExpenses(newExpenses)
    await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses))
    setAmount('')
    setSelectedCategory(null)
    updateBalance(-newExpense.amount)
  }

  const saveIncome = async () => {
    if (!incomeAmount) {
      Alert.alert('Errore', 'Inserisci un importo per aggiungere denaro')
      return
    }
    const newIncome = {
      amount: parseFloat(incomeAmount),
      date: currentMonth.toISOString(),
    }
    const newIncomeArray = [...income, newIncome]
    setIncome(newIncomeArray)
    await AsyncStorage.setItem('income', JSON.stringify(newIncomeArray))
    setIncomeAmount('')
    updateBalance(newIncome.amount)
  }

  const handleAmountChange = (value) => {
    const formattedValue = value.replace(',', '.')
    setAmount(formattedValue)
  }

  const handleIncomeAmountChange = (value) => {
    const formattedValue = value.replace(',', '.')
    setIncomeAmount(formattedValue)
  }

  const updateBalance = async (amount) => {
    const newBalance = balance + amount
    setBalance(newBalance)
    await AsyncStorage.setItem('initialBalance', newBalance.toString())
  }

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  }

  const getTotalIncome = () => {
    return filteredIncome.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  }

  const getChartData = () => {
    const sums = {}
    filteredExpenses.forEach((e) => {
      sums[e.category] = (sums[e.category] || 0) + parseFloat(e.amount)
    })
    return Object.entries(sums).map(([category, value]) => {
      const cat = categories.find((c) => c.key === category)
      return {
        name: category,
        amount: value,
        color: cat?.color || '#ccc',
        legendFontColor: '#fff',
        legendFontSize: 14,
      }
    })
  }

  const balanceDifference = () => {
    const totalIncome = getTotalIncome()
    const totalExpenses = getTotalExpenses()
    return totalIncome - totalExpenses
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('WelcomeScreen')}>
          <Icon name="arrow-left" size={25} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>
        Spese - {currentMonth.format('MMMM YYYY')}
      </Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balance}>Saldo: {balance.toFixed(2)} €</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Aggiungi denaro"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={incomeAmount}
        onChangeText={handleIncomeAmountChange}
      />
      <TouchableOpacity onPress={saveIncome} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Aggiungi denaro</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Importo spesa"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={amount}
        onChangeText={handleAmountChange}
      />

      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setSelectedCategory(cat.key)}
            style={[
              styles.categoryBtn,
              selectedCategory === cat.key && { backgroundColor: cat.color },
            ]}
          >
            <Text style={styles.categoryText}>{cat.emoji}</Text>
            <Text style={styles.categoryText2}>{cat.key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={saveExpense} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Aggiungi Spesa</Text>
      </TouchableOpacity>

      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
        >
          <Icon name="chevron-left" size={20} color="white" />
        </TouchableOpacity>

        <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>

        <TouchableOpacity
          onPress={() =>
            currentMonth.isBefore(dayjs().startOf('month')) &&
            setCurrentMonth(currentMonth.add(1, 'month'))
          }
          disabled={currentMonth.isSame(dayjs().startOf('month'), 'month')}
        >
          <Icon
            name="chevron-right"
            size={20}
            color={
              currentMonth.isSame(dayjs().startOf('month'), 'month')
                ? '#ccc'
                : 'white'
            }
          />
        </TouchableOpacity>
      </View>

      <PieChart
        data={getChartData()}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          color: () => `white`,
          labelColor: () => 'white',
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="10"
        center={[10, 10]}
        absolute
      />

      <Text style={styles.total}>
        Totale Spese: {getTotalExpenses().toFixed(2)} €
      </Text>
      <Text style={styles.total}>
        Totale Entrate: {getTotalIncome().toFixed(2)} €
      </Text>
      <Text style={styles.total}>
        Differenza (Entrate - Spese): {balanceDifference().toFixed(2)} €
      </Text>

      {getChartData().map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.label}>{item.name}</Text>
          <Text style={styles.percent}>
            {((item.amount / Math.max(1, getTotalExpenses())) * 100).toFixed(0)}
            %
          </Text>
          <Text style={styles.amount}>{item.amount.toFixed(2)} €</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e2b18',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  total: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 15,
    fontFamily: 'Roboto',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2e3d25',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 3,
  },
  label: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  percent: {
    color: '#ccc',
    fontSize: 15,
  },
  amount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balance: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2e3d25',
    padding: 14,
    borderRadius: 10,
    color: 'white',
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  categoryBtn: {
    width: '22%',
    backgroundColor: '#444',
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  categoryText: {
    flex: 1,
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  categoryText2: {
    flex: 1,
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#3f51b5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChart: {
    marginBottom: 20,
  },
})
