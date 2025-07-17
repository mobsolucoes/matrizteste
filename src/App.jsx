import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Trash2, Download, Upload, Database, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { useDatabase } from './hooks/useDatabase.js'
import * as XLSX from 'xlsx'
import './App.css'

function App() {
  const {
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
    importData
  } = useDatabase()

  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [nameFilter, setNameFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [viewMode, setViewMode] = useState('area') // 'area' ou 'employees'
  const chartRef = useRef(null)
  
  // Estado local para pesos temporários
  const [tempWeights, setTempWeights] = useState(weights)
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    area: '',
    competencia: 1,
    resultado: 1,
    cultura: 1,
    potencial: 1
  })

  // Sincronizar pesos temporários quando os pesos do banco mudarem
  useEffect(() => {
    setTempWeights(weights)
  }, [weights])

  // Filtrar funcionários quando os filtros mudarem
  useEffect(() => {
    let filtered = employees
    
    if (nameFilter) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
    }
    
    if (areaFilter) {
      filtered = filtered.filter(emp => 
        emp.area.toLowerCase().includes(areaFilter.toLowerCase())
      )
    }
    
    setFilteredEmployees(filtered)
  }, [employees, nameFilter, areaFilter])

  const handleAddEmployee = async () => {
    if (newEmployee.name && newEmployee.area) {
      try {
        await addEmployee(newEmployee)
        setNewEmployee({
          name: '',
          area: '',
          competencia: 1,
          resultado: 1,
          cultura: 1,
          potencial: 1
        })
      } catch (err) {
        console.error('Erro ao adicionar funcionário:', err)
      }
    }
  }

  const handleRemoveEmployee = async (id) => {
    try {
      await removeEmployee(id)
    } catch (err) {
      console.error('Erro ao remover funcionário:', err)
    }
  }

  const handleUpdateWeights = async () => {
    try {
      await updateWeights(tempWeights)
    } catch (err) {
      console.error('Erro ao atualizar pesos:', err)
    }
  }

  const handleResetWeights = async () => {
    try {
      await resetWeights()
    } catch (err) {
      console.error('Erro ao resetar pesos:', err)
    }
  }

  const handleClearAllData = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      try {
        await clearAllData()
      } catch (err) {
        console.error('Erro ao limpar dados:', err)
      }
    }
  }

  const handleExportData = async () => {
    try {
      const data = await exportData()
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      link.download = `matriz-desempenho-backup-${new Date().toISOString().split('T')[0]}.json`
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error('Erro ao exportar dados:', err)
    }
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          
          if (window.confirm('Tem certeza que deseja importar estes dados? Os dados atuais serão substituídos.')) {
            await importData(data)
          }
        } catch (err) {
          console.error('Erro ao importar dados:', err)
          alert('Erro ao importar dados. Verifique se o arquivo é válido.')
        }
      }
    }
    input.click()
  }

  const getRadarData = () => {
    if (viewMode === 'area') {
      // Agrupar por área e calcular médias
      const areaGroups = {}
      filteredEmployees.forEach(emp => {
        if (!areaGroups[emp.area]) {
          areaGroups[emp.area] = {
            competencia: [],
            resultado: [],
            cultura: [],
            potencial: []
          }
        }
        areaGroups[emp.area].competencia.push(emp.competencia)
        areaGroups[emp.area].resultado.push(emp.resultado)
        areaGroups[emp.area].cultura.push(emp.cultura)
        areaGroups[emp.area].potencial.push(emp.potencial)
      })

      const areas = Object.keys(areaGroups)
      return [
        {
          subject: 'Competência',
          ...areas.reduce((acc, area, index) => {
            const avg = areaGroups[area].competencia.reduce((a, b) => a + b, 0) / areaGroups[area].competencia.length
            acc[`area${index}`] = avg
            return acc
          }, {})
        },
        {
          subject: 'Resultado',
          ...areas.reduce((acc, area, index) => {
            const avg = areaGroups[area].resultado.reduce((a, b) => a + b, 0) / areaGroups[area].resultado.length
            acc[`area${index}`] = avg
            return acc
          }, {})
        },
        {
          subject: 'Cultura',
          ...areas.reduce((acc, area, index) => {
            const avg = areaGroups[area].cultura.reduce((a, b) => a + b, 0) / areaGroups[area].cultura.length
            acc[`area${index}`] = avg
            return acc
          }, {})
        },
        {
          subject: 'Potencial',
          ...areas.reduce((acc, area, index) => {
            const avg = areaGroups[area].potencial.reduce((a, b) => a + b, 0) / areaGroups[area].potencial.length
            acc[`area${index}`] = avg
            return acc
          }, {})
        }
      ]
    } else {
      // Mostrar funcionários individuais
      return [
        {
          subject: 'Competência',
          ...filteredEmployees.reduce((acc, emp, index) => {
            acc[`employee${index}`] = emp.competencia
            return acc
          }, {})
        },
        {
          subject: 'Resultado',
          ...filteredEmployees.reduce((acc, emp, index) => {
            acc[`employee${index}`] = emp.resultado
            return acc
          }, {})
        },
        {
          subject: 'Cultura',
          ...filteredEmployees.reduce((acc, emp, index) => {
            acc[`employee${index}`] = emp.cultura
            return acc
          }, {})
        },
        {
          subject: 'Potencial',
          ...filteredEmployees.reduce((acc, emp, index) => {
            acc[`employee${index}`] = emp.potencial
            return acc
          }, {})
        }
      ]
    }
  }

  const getRadarElements = () => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']
    
    if (viewMode === 'area') {
      const areas = [...new Set(filteredEmployees.map(emp => emp.area))]
      return areas.map((area, index) => (
        <Radar
          key={area}
          name={area}
          dataKey={`area${index}`}
          stroke={colors[index % colors.length]}
          fill={colors[index % colors.length]}
          fillOpacity={0.3}
        />
      ))
    } else {
      return filteredEmployees.map((emp, index) => (
        <Radar
          key={emp._id}
          name={`${emp.name} (${emp.area})`}
          dataKey={`employee${index}`}
          stroke={colors[index % colors.length]}
          fill={colors[index % colors.length]}
          fillOpacity={0.3}
        />
      ))
    }
  }

  const exportToPNG = () => {
    console.log('Iniciando exportação PNG...')
    if (chartRef.current) {
      console.log('chartRef encontrado')
      const svgElement = chartRef.current.querySelector('svg')
      console.log('SVG element:', svgElement)
      
      if (svgElement) {
        try {
          // Método alternativo usando html2canvas ou captura direta
          const svgData = new XMLSerializer().serializeToString(svgElement)
          console.log('SVG serializado com sucesso')
          
          // Criar um blob URL em vez de data URL
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(svgBlob)
          
          const img = new Image()
          img.onload = () => {
            console.log('Imagem carregada, criando canvas...')
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            // Definir tamanho do canvas baseado no SVG
            const rect = svgElement.getBoundingClientRect()
            canvas.width = rect.width || 800
            canvas.height = rect.height || 600
            
            // Fundo branco
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Desenhar a imagem
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            
            // Criar link de download
            canvas.toBlob((blob) => {
              const link = document.createElement('a')
              link.download = 'matriz-desempenho.png'
              link.href = URL.createObjectURL(blob)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(link.href)
              console.log('Download iniciado')
            }, 'image/png')
            
            URL.revokeObjectURL(url)
          }
          
          img.onerror = (error) => {
            console.error('Erro ao carregar imagem:', error)
            URL.revokeObjectURL(url)
          }
          
          img.src = url
          
        } catch (error) {
          console.error('Erro na exportação PNG:', error)
        }
      } else {
        console.error('SVG element não encontrado')
      }
    } else {
      console.error('chartRef.current não encontrado')
    }
  }

  const exportToJPEG = () => {
    console.log('Iniciando exportação JPEG...')
    if (chartRef.current) {
      console.log('chartRef encontrado')
      const svgElement = chartRef.current.querySelector('svg')
      console.log('SVG element:', svgElement)
      
      if (svgElement) {
        try {
          const svgData = new XMLSerializer().serializeToString(svgElement)
          console.log('SVG serializado com sucesso')
          
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(svgBlob)
          
          const img = new Image()
          img.onload = () => {
            console.log('Imagem carregada, criando canvas...')
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            const rect = svgElement.getBoundingClientRect()
            canvas.width = rect.width || 800
            canvas.height = rect.height || 600
            
            // Fundo branco para JPEG
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            
            canvas.toBlob((blob) => {
              const link = document.createElement('a')
              link.download = 'matriz-desempenho.jpg'
              link.href = URL.createObjectURL(blob)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(link.href)
              console.log('Download JPEG iniciado')
            }, 'image/jpeg', 0.9)
            
            URL.revokeObjectURL(url)
          }
          
          img.onerror = (error) => {
            console.error('Erro ao carregar imagem:', error)
            URL.revokeObjectURL(url)
          }
          
          img.src = url
          
        } catch (error) {
          console.error('Erro na exportação JPEG:', error)
        }
      } else {
        console.error('SVG element não encontrado')
      }
    } else {
      console.error('chartRef.current não encontrado')
    }
  }

  const exportToCSV = () => {
    const headers = ['Nome', 'Área', 'Competência', 'Resultado', 'Cultura', 'Potencial', 'Nota Final']
    const csvContent = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.area,
        emp.competencia,
        emp.resultado,
        emp.cultura,
        emp.potencial,
        emp.finalScore.toFixed(2)
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.download = 'funcionarios.csv'
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredEmployees, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'funcionarios.json'
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  // Exportar para Excel
  const exportToExcel = () => {
    const headers = ['Nome', 'Área', 'Competência', 'Resultado', 'Cultura', 'Potencial', 'Nota Final']
    const data = filteredEmployees.map(emp => [
      emp.name,
      emp.area,
      emp.competencia,
      emp.resultado,
      emp.cultura,
      emp.potencial,
      emp.finalScore.toFixed(2)
    ])
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionarios')
    XLSX.writeFile(wb, 'funcionarios.xlsx')
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Calcular a média dos valores
      const average = payload.reduce((sum, entry) => sum + entry.value, 0) / payload.length
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}`}
            </p>
          ))}
          <hr className="my-2" />
          <p className="font-semibold text-gray-700">
            {`Nota Média: ${average.toFixed(2)}`}
          </p>
        </div>
      )
    }
    return null
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Matriz de Desempenho Scansource 3D</h1>
          <p className="text-xl text-white/90">Análise de Talentos: Competência, Resultado, Cultura e Potencial</p>
          
          {/* Indicador de persistência */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Database className="h-4 w-4 text-white/80" />
            <span className="text-sm text-white/80">Dados persistidos localmente</span>
          </div>
        </header>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel Esquerdo */}
          <div className="space-y-6">
            {/* Configuração de Pesos */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Pesos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Competência (%)</Label>
                  <Input
                    type="number"
                    value={tempWeights.competencia}
                    onChange={(e) => setTempWeights({...tempWeights, competencia: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Resultado (%)</Label>
                  <Input
                    type="number"
                    value={tempWeights.resultado}
                    onChange={(e) => setTempWeights({...tempWeights, resultado: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Cultura (%)</Label>
                  <Input
                    type="number"
                    value={tempWeights.cultura}
                    onChange={(e) => setTempWeights({...tempWeights, cultura: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Potencial (%)</Label>
                  <Input
                    type="number"
                    value={tempWeights.potencial}
                    onChange={(e) => setTempWeights({...tempWeights, potencial: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateWeights} className="flex-1">Atualizar Pesos</Button>
                  <Button onClick={handleResetWeights} variant="outline" className="flex-1">Resetar Padrão</Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total dos Pesos: {tempWeights.competencia + tempWeights.resultado + tempWeights.cultura + tempWeights.potencial}%
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Funcionário */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Funcionário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Nome do Funcionário"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                />
                <Input
                  placeholder="Área/Departamento"
                  value={newEmployee.area}
                  onChange={(e) => setNewEmployee({...newEmployee, area: e.target.value})}
                />
                
                <div>
                  <Label>Competência (1-5):</Label>
                  <Select value={newEmployee.competencia.toString()} onValueChange={(value) => setNewEmployee({...newEmployee, competencia: Number(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Resultado (1-5):</Label>
                  <Select value={newEmployee.resultado.toString()} onValueChange={(value) => setNewEmployee({...newEmployee, resultado: Number(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cultura (1-5):</Label>
                  <Select value={newEmployee.cultura.toString()} onValueChange={(value) => setNewEmployee({...newEmployee, cultura: Number(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Potencial (1-5):</Label>
                  <Select value={newEmployee.potencial.toString()} onValueChange={(value) => setNewEmployee({...newEmployee, potencial: Number(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddEmployee} className="w-full bg-green-600 hover:bg-green-700">
                  Adicionar Funcionário
                </Button>
              </CardContent>
            </Card>

            {/* Gerenciamento de Dados */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleExportData} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Backup
                  </Button>
                  <Button onClick={handleImportData} variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                </div>
                <Button onClick={handleClearAllData} variant="destructive" className="w-full">
                  Limpar Todos os Dados
                </Button>
                <div className="text-sm text-muted-foreground">
                  Total de funcionários: {employees.length}
                </div>
              </CardContent>
            </Card>

            {/* Faixas de Notas Ponderadas e Qualificações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-800">Faixas de Notas Ponderadas e Qualificações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Abaixo estão as faixas de notas finais e suas respectivas classificações qualitativas para avaliação de colaboradores:
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌟</span>
                      <div>
                        <div className="font-semibold">4,5 – 5,0 | Excelência</div>
                        <div className="text-xs text-gray-600">Alto desempenho e total alinhamento cultural. Potencial de liderança.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                      <div>
                        <div className="font-semibold">4,0 – 4,49 | Muito Bom</div>
                        <div className="text-xs text-gray-600">Entrega sólida, boas competências, perfil engajado. Pode crescer mais.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-yellow-500 rounded-full"></span>
                      <div>
                        <div className="font-semibold">3,5 – 3,99 | Regular com Potencial</div>
                        <div className="text-xs text-gray-600">Resultados aceitáveis, mas com áreas claras de desenvolvimento.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-orange-500 rounded-full"></span>
                      <div>
                        <div className="font-semibold">3,0 – 3,49 | Em Desenvolvimento</div>
                        <div className="text-xs text-gray-600">Gaps relevantes em um ou mais critérios. Precisa de acompanhamento.</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                      <div>
                        <div className="font-semibold">&lt; 3,0 | Crítico</div>
                        <div className="text-xs text-gray-600">Performance abaixo do esperado. Avaliação de permanência recomendada.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel Central e Direito */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controles de Visualização */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <Label>Tipo de Visualização</Label>
                    <Select defaultValue="radar">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="radar">Gráfico Radar 3D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Visualizar Área</Label>
                    <Select defaultValue="todas">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas as Áreas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Colorir por</Label>
                    <Select defaultValue="nota">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nota">Nota Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="destructive" onClick={() => {
                    setNameFilter('')
                    setAreaFilter('')
                    setViewMode('area')
                  }}>
                    Resetar Visualização
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Funcionários Cadastrados */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionários Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4 items-center">
                  <Input 
                    placeholder="Filtrar por nome..." 
                    className="flex-1" 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                  <Input 
                    placeholder="Filtrar por área..." 
                    className="flex-1" 
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                  />
                  <Button onClick={exportToExcel} disabled={filteredEmployees.length === 0} variant="outline">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
                
                {filteredEmployees.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum funcionário encontrado.</p>
                ) : (
                  <div className="space-y-2">
                    {filteredEmployees.map((emp) => (
                      <div key={emp._id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{emp.name} ({emp.area})</div>
                          <div className="text-sm text-muted-foreground">
                            Competência: {emp.competencia} | Resultado: {emp.resultado} | Cultura: {emp.cultura} | Potencial: {emp.potencial}
                          </div>
                          <div className="text-sm font-medium">
                            Nota Final: {emp.finalScore.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveEmployee(emp._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfico Radar */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Gráfico Radar 3D - {viewMode === 'area' ? 'Por Área' : 'Por Funcionários'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Button 
                    className={`${viewMode === 'area' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                    onClick={() => setViewMode('area')}
                  >
                    Visualizar por Área
                  </Button>
                  <Button 
                    className={`${viewMode === 'employees' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                    onClick={() => setViewMode('employees')}
                  >
                    Visualizar Funcionários
                  </Button>
                </div>
                
                <div className="h-96" ref={chartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} />
                      <Tooltip content={<CustomTooltip />} />
                      {getRadarElements()}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex gap-4 mt-4">
                  <Button onClick={exportToPNG} disabled={filteredEmployees.length === 0}>
                    Exportar PNG
                  </Button>
                  <Button onClick={exportToJPEG} disabled={filteredEmployees.length === 0}>
                    Exportar JPEG
                  </Button>
                  <Button onClick={exportToCSV} disabled={filteredEmployees.length === 0}>
                    Exportar CSV
                  </Button>
                  <Button onClick={exportToJSON} disabled={filteredEmployees.length === 0}>
                    Exportar JSON
                  </Button>
                  <Button onClick={exportToExcel} disabled={filteredEmployees.length === 0}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
                
                {filteredEmployees.length === 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-800">Adicione funcionários para habilitar a exportação.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

