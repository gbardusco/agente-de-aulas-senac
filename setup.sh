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
mkdir -p .docs/materiais-consulta
mkdir -p .memory
mkdir -p 00-MOC
mkdir -p .context
mkdir -p AULAS/assets
mkdir -p AULAS/registros-docentes

if [ ! -e ".docs/materiais-consulta/index.md" ]; then
    cp _templates/materiais-consulta-index-template.md .docs/materiais-consulta/index.md
fi

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

for asset in slides.css slides.js exercicios.css relatorio.css relatorio.js; do
    if [ ! -e "AULAS/assets/$asset" ]; then
        cp "_templates/assets/$asset" "AULAS/assets/$asset"
        print_msg "  → assets/$asset criado"
    else
        print_warn "  → assets/$asset já existe, preservado"
    fi
done

# Templates por aula permanecem em _templates/ ate o professor definir a aula.
# Nao inicializar, adicionar ou commitar arquivos automaticamente.

# 6. Resumo
echo ""
echo "=========================================="
echo "  Setup concluído!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "  1. Edite .memory/perfil-turma.md com os dados da turma"
echo "  2. Ajuste o número de aulas em .memory/status-aulas.md"
echo "  3. Adicione documentos oficiais em .docs/ e catalogue em .docs/materiais-consulta/index.md"
echo "  Rubricas e relatorios: modelos em _templates/; registros privados em AULAS/registros-docentes/"
echo "  Slides HTML/PPTX: npm ci e npm run slides -- <slides.json> <pasta-de-saida>"
echo "  4. Abra no Obsidian e verifique o graph view"
echo ""
echo "Professor novo? Comece pelo ONBOARDING.md (15 minutos, do zero a primeira aula)"
echo ""
echo "Para ajuda, consulte:"
echo "  - README.md (documentação principal)"
echo "  - _templates/README.md (lista de templates)"
echo "  - .agents/AGENTS.md (regras dos agentes)"
echo ""
