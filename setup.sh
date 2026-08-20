#!/bin/bash
# =============================================================================
# Script de Setup - Material Didático
# =============================================================================
# Uso: ./setup.sh [nome-do-projeto]
#
# Este script configura um novo projeto didático a partir dos templates.
# Execute na pasta onde o repositório foi clonado.
# =============================================================================

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_msg() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar se o nome do projeto foi fornecido
if [ -z "$1" ]; then
    print_error "Uso: ./setup.sh [nome-do-projeto]"
    echo "Exemplo: ./setup.sh 'Banco de Dados'"
    exit 1
fi

PROJECT_NAME="$1"

echo "=========================================="
echo "  Setup do Projeto: $PROJECT_NAME"
echo "=========================================="
echo ""

# 1. Criar estrutura de pastas
print_msg "Criando estrutura de pastas..."
mkdir -p .docs
mkdir -p .memory
mkdir -p 00-MOC
mkdir -p .context
mkdir -p AULAS/assets

# 2. Copiar templates de memória
print_msg "Copiando templates de memória..."

if [ ! -f ".memory/perfil-turma.md" ]; then
    cp _templates/perfil-turma-template.md .memory/perfil-turma.md
    print_msg "  → perfil-turma.md criado"
else
    print_warn "  → perfil-turma.md já existe, pulando"
fi

if [ ! -f ".memory/decisoes.md" ]; then
    cp _templates/decisoes-template.md .memory/decisoes.md
    print_msg "  → decisoes.md criado"
else
    print_warn "  → decisoes.md já existe, pulando"
fi

if [ ! -f ".memory/feedback-aulas.md" ]; then
    cp _templates/feedback-aulas-template.md .memory/feedback-aulas.md
    print_msg "  → feedback-aulas.md criado"
else
    print_warn "  → feedback-aulas.md já existe, pulando"
fi

if [ ! -f ".memory/status-aulas.md" ]; then
    cp _templates/status-aulas-template.md .memory/status-aulas.md
    print_msg "  → status-aulas.md criado"
else
    print_warn "  → status-aulas.md já existe, pulando"
fi

if [ ! -f ".memory/feedback-aluno.md" ]; then
    cp _templates/feedback-aluno-template.md .memory/feedback-aluno.md
    print_msg "  → feedback-aluno.md criado"
else
    print_warn "  → feedback-aluno.md já existe, pulando"
fi

# 3. Criar arquivos de referência
print_msg "Criando arquivos de referência..."

if [ ! -f "AULAS/index.md" ]; then
    echo "# Índice Geral de Aulas" > AULAS/index.md
    echo "" >> AULAS/index.md
    echo "## Aulas" >> AULAS/index.md
    echo "" >> AULAS/index.md
    print_msg "  → AULAS/index.md criado"
else
    print_warn "  → AULAS/index.md já existe, pulando"
fi

if [ ! -f "AULAS/sintese_diario_classe.md" ]; then
    cp _templates/sintese-diario-classe-template.md AULAS/sintese_diario_classe.md
    print_msg "  → sintese_diario_classe.md criado"
else
    print_warn "  → sintese_diario_classe.md já existe, pulando"
fi

# 4. Assets de apoio em AULAS/assets/
print_msg "Criando assets de apoio em AULAS/assets/..."

if [ ! -f "AULAS/assets/slides.css" ]; then
    echo "/* CSS padrão dos slides. Consulte .memory/padroes-tecnicos.md */" > AULAS/assets/slides.css
    print_msg "  → assets/slides.css criado"
else
    print_warn "  → assets/slides.css já existe, pulando"
fi

if [ ! -f "AULAS/assets/exercicios.css" ]; then
    echo "/* CSS padrão dos exercícios. Consulte .memory/padroes-tecnicos.md */" > AULAS/assets/exercicios.css
    print_msg "  → assets/exercicios.css criado"
else
    print_warn "  → assets/exercicios.css já existe, pulando"
fi

# 5. Inicializar git (opcional)
print_msg "Inicializando repositório git..."
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "feat: setup inicial do projeto - $PROJECT_NAME"
    print_msg "  → Repositório git inicializado"
else
    print_warn "  → Repositório git já existe, pulando"
fi

# 6. Resumo
echo ""
echo "=========================================="
echo "  Setup concluído!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "  1. Edite .memory/perfil-turma.md com os dados da turma"
echo "  2. Ajuste o número de aulas em .memory/status-aulas.md"
echo "  3. Adicione documentos oficiais em .docs/"
echo "  4. Abra no Obsidian e verifique o graph view"
echo ""
echo "Para ajuda, consulte:"
echo "  - README.md (documentação principal)"
echo "  - _templates/README.md (lista de templates)"
echo "  - .agents/AGENTS.md (regras dos agentes)"
echo ""
