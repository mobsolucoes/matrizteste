import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Dados em memória para demonstração
let employees = [];
let weights = {
  competencia: 25,
  resultado: 25,
  cultura: 25,
  potencial: 25
};

// Função para calcular nota final
const calculateFinalScore = (employee) => {
  return (
    (employee.competencia * weights.competencia) +
    (employee.resultado * weights.resultado) +
    (employee.cultura * weights.cultura) +
    (employee.potencial * weights.potencial)
  ) / 100;
};

// Função para recalcular todas as notas finais
const recalculateAllScores = () => {
  employees = employees.map(emp => ({
    ...emp,
    finalScore: calculateFinalScore(emp)
  }));
};

// Rotas
app.get('/api/employees', async (req, res) => {
  try {
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, area, competencia, resultado, cultura, potencial } = req.body;
    
    const employee = {
      _id: Date.now().toString(),
      name,
      area,
      competencia,
      resultado,
      cultura,
      potencial,
      finalScore: calculateFinalScore({ competencia, resultado, cultura, potencial }),
      createdAt: new Date()
    };
    
    employees.unshift(employee);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    employees = employees.filter(emp => emp._id !== req.params.id);
    res.json({ message: 'Funcionário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/weights', async (req, res) => {
  try {
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/weights', async (req, res) => {
  try {
    const { competencia, resultado, cultura, potencial } = req.body;
    
    weights = {
      competencia,
      resultado,
      cultura,
      potencial
    };
    
    // Recalcular notas finais de todos os funcionários
    recalculateAllScores();
    
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees', async (req, res) => {
  try {
    employees = [];
    res.json({ message: 'Todos os funcionários foram removidos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor de demonstração funcionando',
    employeesCount: employees.length,
    weights: weights
  });
});

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de Demonstração rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`📝 Status: http://localhost:${PORT}/api/status`);
  console.log(`⚠️  Modo: Demonstração (sem MongoDB)`);
}); 