import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:102030@161.97.73.53:27017/?tls=false';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  console.log('🔧 Verifique se o MongoDB está rodando e acessível');
  console.log('📝 URI de conexão:', MONGODB_URI);
});

// Schema do Funcionário
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, required: true },
  competencia: { type: Number, required: true, min: 1, max: 5 },
  resultado: { type: Number, required: true, min: 1, max: 5 },
  cultura: { type: Number, required: true, min: 1, max: 5 },
  potencial: { type: Number, required: true, min: 1, max: 5 },
  finalScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Schema dos Pesos
const weightsSchema = new mongoose.Schema({
  competencia: { type: Number, default: 25 },
  resultado: { type: Number, default: 25 },
  cultura: { type: Number, default: 25 },
  potencial: { type: Number, default: 25 }
});

const Employee = mongoose.model('Employee', employeeSchema);
const Weights = mongoose.model('Weights', weightsSchema);

// Rotas da API
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, area, competencia, resultado, cultura, potencial } = req.body;
    
    // Buscar pesos atuais
    let weights = await Weights.findOne();
    if (!weights) {
      weights = new Weights();
      await weights.save();
    }
    
    // Calcular nota final
    const finalScore = (
      (competencia * weights.competencia) +
      (resultado * weights.resultado) +
      (cultura * weights.cultura) +
      (potencial * weights.potencial)
    ) / 100;
    
    const employee = new Employee({
      name,
      area,
      competencia,
      resultado,
      cultura,
      potencial,
      finalScore
    });
    
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Funcionário removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/weights', async (req, res) => {
  try {
    let weights = await Weights.findOne();
    if (!weights) {
      weights = new Weights();
      await weights.save();
    }
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/weights', async (req, res) => {
  try {
    const { competencia, resultado, cultura, potencial } = req.body;
    
    let weights = await Weights.findOne();
    if (!weights) {
      weights = new Weights();
    }
    
    weights.competencia = competencia;
    weights.resultado = resultado;
    weights.cultura = cultura;
    weights.potencial = potencial;
    
    await weights.save();
    
    // Recalcular notas finais de todos os funcionários
    const employees = await Employee.find();
    for (const employee of employees) {
      employee.finalScore = (
        (employee.competencia * weights.competencia) +
        (employee.resultado * weights.resultado) +
        (employee.cultura * weights.cultura) +
        (employee.potencial * weights.potencial)
      ) / 100;
      await employee.save();
    }
    
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees', async (req, res) => {
  try {
    await Employee.deleteMany({});
    res.json({ message: 'Todos os funcionários foram removidos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de teste simples
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota específica para a raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota catch-all para outras rotas do frontend (exceto /api)
app.get('*', (req, res, next) => {
  // Se for uma rota da API, passar para o próximo middleware
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Middleware para rotas não encontradas (deve ser o último)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar servidor
console.log('🚀 Servidor unificado rodando na porta', PORT);
console.log('📊 API disponível em: http://localhost:' + PORT + '/api');
console.log('🌐 Frontend: http://localhost:' + PORT);
console.log('🧪 Teste: http://localhost:' + PORT + '/test');
console.log('⚠️  Para desenvolvimento completo, rode também: pnpm run dev');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor iniciado com sucesso!`);
}); 