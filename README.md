# Matriz de Desempenho Scansource 3D

Sistema de análise de talentos com avaliação 3D: Competência, Resultado, Cultura e Potencial.

## 🚀 Funcionalidades

- **Avaliação 3D**: Sistema de pontuação baseado em 4 critérios
- **Gráficos Radar**: Visualização interativa dos dados
- **Configuração de Pesos**: Personalização dos critérios de avaliação
- **Gestão de Funcionários**: CRUD completo de colaboradores
- **Exportação**: PNG, JPEG, CSV e JSON
- **Backup/Restauração**: Sistema de backup dos dados
- **Banco de Dados MongoDB**: Persistência robusta dos dados

## 🛠️ Tecnologias

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Banco de Dados**: MongoDB + Mongoose
- **Gráficos**: Recharts
- **UI Components**: Radix UI

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- pnpm (ou npm)
- MongoDB rodando e acessível

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd matriz-desempenho-atualizada
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure o MongoDB**
   
   Certifique-se de que o MongoDB está rodando e acessível na URI:
   ```
   mongodb://mongo:102030@production_mongo_scan:27017/?tls=false
   ```

## 🚀 Executando o Projeto

### Opção 1: Executar Frontend e Backend Separadamente

**Terminal 1 - Backend:**
```bash
pnpm run server
```

**Terminal 2 - Frontend:**
```bash
pnpm run dev
```

### Opção 2: Executar Tudo Junto
```bash
pnpm run dev:full
```

## 📊 Acessos

- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3001/api

## 🎯 Como Usar

### 1. Configuração de Pesos
- Acesse o painel "Configuração de Pesos"
- Defina as porcentagens para cada critério
- Clique em "Atualizar Pesos"

### 2. Adicionar Funcionários
- Preencha os dados do funcionário
- Avalie cada critério (1-5)
- Clique em "Adicionar Funcionário"

### 3. Visualizar Dados
- Use os filtros por nome e área
- Visualize gráficos por área ou funcionários individuais
- Exporte dados em diferentes formatos

### 4. Faixas de Avaliação
- **4,5-5,0**: Excelência 🌟
- **4,0-4,49**: Muito Bom
- **3,5-3,99**: Regular com Potencial
- **3,0-3,49**: Em Desenvolvimento
- **< 3,0**: Crítico

## 🔌 API Endpoints

### Funcionários
- `GET /api/employees` - Listar funcionários
- `POST /api/employees` - Adicionar funcionário
- `DELETE /api/employees/:id` - Remover funcionário
- `DELETE /api/employees` - Limpar todos os funcionários

### Pesos
- `GET /api/weights` - Obter pesos atuais
- `PUT /api/weights` - Atualizar pesos

## 🚀 Deploy no Vercel

### Pré-requisitos:
- Conta no [Vercel](https://vercel.com)
- MongoDB configurado e acessível
- Projeto no GitHub/GitLab

### Passos para Deploy:

#### 1. Preparar o Projeto
```bash
# Instalar dependências
pnpm install

# Testar build local
pnpm run build
```

#### 2. Configurar Variáveis de Ambiente no Vercel

No dashboard do Vercel, adicione as seguintes variáveis:

```env
MONGODB_URI=mongodb://mongo:102030@161.97.73.53:27017/?tls=false
VITE_API_URL=https://seu-projeto.vercel.app/api
```

#### 3. Deploy via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

#### 4. Deploy via GitHub (Recomendado)

1. **Push do código para GitHub**
2. **Conectar repositório no Vercel**
3. **Configurar variáveis de ambiente**
4. **Deploy automático**

### Estrutura para Vercel:

```
matriz-desempenho-atualizada/
├── api/
│   └── index.js          # Serverless functions
├── src/
│   └── ...               # Frontend React
├── vercel.json           # Configuração Vercel
├── package.json
└── vite.config.js
```

### URLs após Deploy:

- **Frontend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api`

### Troubleshooting:

#### Erro de CORS:
- Verificar se `cors()` está configurado no backend
- Confirmar se as origens estão corretas

#### Erro de MongoDB:
- Verificar se a URI do MongoDB está correta
- Confirmar se o MongoDB está acessível externamente

#### Build falha:
- Verificar se todas as dependências estão no `package.json`
- Confirmar se o Node.js version está compatível

## 🚀 Deploy e Configuração Externa

### Para rodar com acesso externo (mesmo IP/host):

```bash
# Desenvolvimento com host externo
pnpm run dev:external

# Ou individualmente:
pnpm run server    # Backend na porta 3001
pnpm run dev       # Frontend na porta 5173
```

### Para produção:

```bash
# Build do frontend
pnpm run build

# Servir arquivos estáticos
pnpm run preview

# Backend separado
pnpm run start
```

### Configuração de Portas:

- **Frontend**: 5173 (Vite)
- **Backend**: 3001 (Express)
- **MongoDB**: 27017 (externo)

### Acesso:

- **Frontend**: `http://SEU_IP:5173`
- **API**: `http://SEU_IP:3001/api`

### Firewall (Linux):

```bash
# Abrir portas necessárias
sudo ufw allow 5173
sudo ufw allow 3001
```

### Docker (opcional):

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001 5173
CMD ["npm", "run", "dev:external"]
```

## 📁 Estrutura do Projeto

```
matriz-desempenho-atualizada/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/         # Hooks customizados
│   ├── services/      # Serviços
│   └── App.jsx        # Componente principal
├── server.js          # Servidor Express
├── package.json       # Dependências
└── README.md         # Documentação
```

## 🔧 Configuração de Ambiente

Para configurar variáveis de ambiente, crie um arquivo `.env`:

```env
MONGODB_URI=mongodb://mongo:102030@production_mongo_scan:27017/?tls=false
PORT=3001
NODE_ENV=development
```

## 🐛 Troubleshooting

### Erro de Conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a URI de conexão
- Verifique as credenciais

### Erro de CORS
- O servidor já está configurado com CORS
- Verifique se as portas estão corretas

### Dados não Carregam
- Verifique se o backend está rodando
- Confirme a conexão com o MongoDB
- Verifique os logs do console

## 📝 Licença

Este projeto é de uso interno da Scansource.

## 👥 Contribuição

Para contribuir com o projeto:
1. Faça um fork
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request 