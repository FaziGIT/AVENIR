# AVENIR

Application bancaire avec architecture hexagonale.

## 🚀 Démarrage

```bash
# 1. Démarrer PostgreSQL
docker compose --profile postgres up -d

# 2. Installer
cd back
npm install
cp .env.template .env

# 3. Lancer
npm run dev
```

**Serveur sur http://localhost:3000**

## 📦 Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Architecture**: Hexagonale (Clean Architecture)
- **DB**: PostgreSQL 16 / MySQL 8
- **Infrastructure**: Docker Compose

## 🔄 Changer de DB

Modifiez `DB_TYPE` dans `.env` :

```bash
# PostgreSQL
docker compose --profile postgres up -d
DB_TYPE=postgres

# MySQL  
docker compose --profile mysql up -d
DB_TYPE=mysql
```

## 📁 Structure

```
AVENIR/
├── back/
│   ├── domain/                     # Entités métier
│   ├── application/                # Use cases
│   └── infrastructure/
│       ├── config/                 # Configuration
│       ├── database/               # Contextes DB
│       │   ├── postgres/
│       │   └── mysql/
│       ├── repositories/           # Implémentations
│       │   ├── postgres/
│       │   └── mysql/
│       ├── factories/              # Factory pattern
│       └── framework/              # HTTP Server
│           └── fastify/
└── docker-compose.yml
```

## 🐳 Docker

```bash
# PostgreSQL
docker compose --profile postgres up -d
docker compose exec postgres psql -U avenir_user -d avenir_db

# MySQL
docker compose --profile mysql up -d
docker compose exec mysql mysql -u avenir_user -pavenir_password avenir_db

# Arrêter
docker compose down

# Réinitialiser
docker compose down -v
```

## 📡 API

### Health Check
```bash
GET http://localhost:3000/health
```

### Users

**GET /users/:id** - Récupérer un utilisateur

**POST /users** - Créer un utilisateur
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "identityNumber": "123456789",
  "passcode": "securePassword123"
}
```
