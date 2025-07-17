import { useState, useEffect } from 'react'

// Detectar o host atual e usar a mesma porta do servidor
const getApiBaseUrl = () => {
  // Em produção (Vercel), usar a variável de ambiente
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Em desenvolvimento, usar o host atual
  const host = window.location.hostname
  const port = '3001' // Porta do servidor backend
  return `http://${host}:${port}/api`
}

const API_BASE_URL = getApiBaseUrl()

export function useDatabase() {
  const [employees, setEmployees] = useState([])
  const [weights, setWeights] = useState({
    competencia: 25,
    resultado: 25,
    cultura: 25,
    potencial: 25
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar dados iniciais
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar funcionários
      const employeesResponse = await fetch(`${API_BASE_URL}/employees`)
      if (!employeesResponse.ok) throw new Error('Erro ao carregar funcionários')
      const employeesData = await employeesResponse.json()
      
      // Carregar pesos
      const weightsResponse = await fetch(`${API_BASE_URL}/weights`)
      if (!weightsResponse.ok) throw new Error('Erro ao carregar pesos')
      const weightsData = await weightsResponse.json()
      
      setEmployees(employeesData)
      setWeights(weightsData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addEmployee = async (employeeData) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      })
      
      if (!response.ok) throw new Error('Erro ao adicionar funcionário')
      
      const newEmployee = await response.json()
      setEmployees(prev => [newEmployee, ...prev])
      return newEmployee
    } catch (err) {
      console.error('Erro ao adicionar funcionário:', err)
      setError(err.message)
      throw err
    }
  }

  const removeEmployee = async (id) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Erro ao remover funcionário')
      
      setEmployees(prev => prev.filter(emp => emp._id !== id))
    } catch (err) {
      console.error('Erro ao remover funcionário:', err)
      setError(err.message)
      throw err
    }
  }

  const updateWeights = async (newWeights) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/weights`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWeights),
      })
      
      if (!response.ok) throw new Error('Erro ao atualizar pesos')
      
      const updatedWeights = await response.json()
      setWeights(updatedWeights)
      
      // Recarregar funcionários para obter as notas finais recalculadas
      const employeesResponse = await fetch(`${API_BASE_URL}/employees`)
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData)
      }
      
      return updatedWeights
    } catch (err) {
      console.error('Erro ao atualizar pesos:', err)
      setError(err.message)
      throw err
    }
  }

  const resetWeights = async () => {
    try {
      setError(null)
      const defaultWeights = {
        competencia: 25,
        resultado: 25,
        cultura: 25,
        potencial: 25
      }
      
      const response = await fetch(`${API_BASE_URL}/weights`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultWeights),
      })
      
      if (!response.ok) throw new Error('Erro ao resetar pesos')
      
      const updatedWeights = await response.json()
      setWeights(updatedWeights)
      
      // Recarregar funcionários para obter as notas finais recalculadas
      const employeesResponse = await fetch(`${API_BASE_URL}/employees`)
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData)
      }
      
      return updatedWeights
    } catch (err) {
      console.error('Erro ao resetar pesos:', err)
      setError(err.message)
      throw err
    }
  }

  const clearAllData = async () => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Erro ao limpar dados')
      
      setEmployees([])
    } catch (err) {
      console.error('Erro ao limpar dados:', err)
      setError(err.message)
      throw err
    }
  }

  const exportData = async () => {
    try {
      setError(null)
      const employeesResponse = await fetch(`${API_BASE_URL}/employees`)
      const weightsResponse = await fetch(`${API_BASE_URL}/weights`)
      
      if (!employeesResponse.ok || !weightsResponse.ok) {
        throw new Error('Erro ao exportar dados')
      }
      
      const employeesData = await employeesResponse.json()
      const weightsData = await weightsResponse.json()
      
      return {
        employees: employeesData,
        weights: weightsData,
        exportedAt: new Date().toISOString()
      }
    } catch (err) {
      console.error('Erro ao exportar dados:', err)
      setError(err.message)
      throw err
    }
  }

  const importData = async (data) => {
    try {
      setError(null)
      
      // Limpar dados existentes
      await clearAllData()
      
      // Importar pesos
      if (data.weights) {
        await updateWeights(data.weights)
      }
      
      // Importar funcionários
      if (data.employees && Array.isArray(data.employees)) {
        for (const employee of data.employees) {
          const { _id, __v, createdAt, ...employeeData } = employee
          await addEmployee(employeeData)
        }
      }
      
      // Recarregar dados
      await loadData()
    } catch (err) {
      console.error('Erro ao importar dados:', err)
      setError(err.message)
      throw err
    }
  }

  return {
    employees,
    weights,
    loading,
    error,
    addEmployee,
    removeEmployee,
    updateWeights,
    resetWeights,
    clearAllData,
    exportData,
    importData,
    refreshData: loadData
  }
} 