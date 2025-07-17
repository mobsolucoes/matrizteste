// Serviço de banco de dados local usando IndexedDB
class DatabaseService {
  constructor() {
    this.dbName = 'MatrizDesempenhoDB'
    this.dbVersion = 1
    this.db = null
  }

  // Inicializar o banco de dados
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Erro ao abrir o banco de dados'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Criar store para funcionários
        if (!db.objectStoreNames.contains('employees')) {
          const employeeStore = db.createObjectStore('employees', { keyPath: 'id' })
          employeeStore.createIndex('name', 'name', { unique: false })
          employeeStore.createIndex('area', 'area', { unique: false })
        }

        // Criar store para configurações
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'id' })
        }
      }
    })
  }

  // Salvar funcionários
  async saveEmployees(employees) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readwrite')
      const store = transaction.objectStore('employees')

      // Limpar dados existentes
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        // Adicionar novos dados
        const promises = employees.map(employee => {
          return new Promise((resolve, reject) => {
            const addRequest = store.add(employee)
            addRequest.onsuccess = () => resolve()
            addRequest.onerror = () => reject(addRequest.error)
          })
        })

        Promise.all(promises)
          .then(() => resolve())
          .catch(reject)
      }

      clearRequest.onerror = () => reject(clearRequest.error)
    })
  }

  // Carregar funcionários
  async loadEmployees() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readonly')
      const store = transaction.objectStore('employees')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Salvar configurações
  async saveSettings(settings) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      
      const request = store.put({
        id: 'weights',
        ...settings
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Carregar configurações
  async loadSettings() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      const request = store.get('weights')

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const { id, ...settings } = result
          resolve(settings)
        } else {
          // Configurações padrão
          resolve({
            competencia: 25,
            resultado: 25,
            cultura: 25,
            potencial: 25
          })
        }
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Adicionar um funcionário
  async addEmployee(employee) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readwrite')
      const store = transaction.objectStore('employees')
      const request = store.add(employee)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Remover um funcionário
  async removeEmployee(id) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readwrite')
      const store = transaction.objectStore('employees')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Atualizar um funcionário
  async updateEmployee(employee) {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees'], 'readwrite')
      const store = transaction.objectStore('employees')
      const request = store.put(employee)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Limpar todos os dados
  async clearAll() {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['employees', 'settings'], 'readwrite')
      const employeeStore = transaction.objectStore('employees')
      const settingsStore = transaction.objectStore('settings')

      const employeeRequest = employeeStore.clear()
      const settingsRequest = settingsStore.clear()

      Promise.all([
        new Promise((resolve, reject) => {
          employeeRequest.onsuccess = () => resolve()
          employeeRequest.onerror = () => reject(employeeRequest.error)
        }),
        new Promise((resolve, reject) => {
          settingsRequest.onsuccess = () => resolve()
          settingsRequest.onerror = () => reject(settingsRequest.error)
        })
      ])
        .then(() => resolve())
        .catch(reject)
    })
  }

  // Fazer backup dos dados
  async exportData() {
    const employees = await this.loadEmployees()
    const settings = await this.loadSettings()
    
    return {
      employees,
      settings,
      exportDate: new Date().toISOString()
    }
  }

  // Restaurar dados do backup
  async importData(data) {
    if (data.employees) {
      await this.saveEmployees(data.employees)
    }
    
    if (data.settings) {
      await this.saveSettings(data.settings)
    }
  }
}

// Instância singleton do serviço
const databaseService = new DatabaseService()

export default databaseService 