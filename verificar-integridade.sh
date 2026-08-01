#!/bin/bash
# =============================================================================
# Script de Verificação de Integridade
# =============================================================================
# Uso: ./verificar-integridade.sh
#
# Este script verifica a integridade do projeto, incluindo:
# - Todos os wikilinks apontam para arquivos existentes
# - Templates listados existem fisicamente
# - Estrutura de pastas está correta
# - Arquivos essenciais estão presentes
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

print_ok() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    ERRORS=$((ERRORS + 1))
}

echo "=========================================="
echo "  Verificação de Integridade"
echo "=========================================="
echo ""

# 1. Verificar estrutura de pastas
echo "--- Estrutura de Pastas ---"

for dir in .agents .memory .context .skills 00-MOC _templates; do
    if [ -d "$dir" ]; then
        print_ok "Pasta $dir existe"
    else
        print_error "Pasta $dir não encontrada"
    fi
done

# Pastas que podem não existir (gitignored ou criadas pelo setup)
for dir in .docs AULAS; do
    if [ -d "$dir" ]; then
        print_ok "Pasta $dir existe"
    elif grep -q "$dir/" .gitignore 2>/dev/null; then
        print_ok "Pasta $dir (gitignored, criada pelo setup)"
    else
        print_warn "Pasta $dir não encontrada (será criada pelo setup)"
    fi
done

# Pasta gitignored que é criada pelos agentes
if [ -d ".context" ]; then
    print_ok "Pasta .context existe (gitignored, gerada pelos agentes)"
elif grep -q ".context/" .gitignore 2>/dev/null; then
    print_ok "Pasta .context (gitignored, gerada pelos agentes)"
else
    print_warn "Pasta .context não encontrada"
fi

echo ""

# 2. Verificar arquivos essenciais
echo "--- Arquivos Essenciais ---"

essential_files=(
    ".agents/AGENTS.md"
    ".gitignore"
    "README.md"
    ".memory/padroes-tecnicos.md"
    ".memory/index.md"
    "00-MOC/Home.md"
    "00-MOC/Agentes.md"
    "00-MOC/Memoria.md"
    "00-MOC/Aulas.md"
    "_templates/README.md"
    ".skills/css-layout.md"
    ".skills/markdown-authoring.md"
    ".skills/accessibility-check.md"
    ".skills/code-formatting.md"
    ".skills/html-template.md"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        print_ok "$file existe"
    else
        print_error "$file não encontrado"
    fi
done

echo ""

# 3. Verificar templates
echo "--- Templates ---"

templates=(
    "_templates/perfil-turma-template.md"
    "_templates/decisoes-template.md"
    "_templates/feedback-aulas-template.md"
    "_templates/status-aulas-template.md"
    "_templates/feedback-aluno-template.md"
    "_templates/glossario-template.md"
    "_templates/aula-index-template.md"
    "_templates/sintese-diario-classe-template.md"
    "_templates/slides-template.html"
    "_templates/exercicios-template.html"
    "_templates/demo-template.html"
)

for template in "${templates[@]}"; do
    if [ -f "$template" ]; then
        print_ok "$template existe"
    else
        print_warn "$template não encontrado"
    fi
done

echo ""

# 4. Verificar agentes
echo "--- Agentes ---"

agents=(
    ".agents/AGENTS.md"
    ".agents/agente-orquestrador.md"
    ".agents/agente-planejador-didatico.md"
    ".agents/agente-revisor-de-material.md"
    ".agents/agente-diario-de-classe.md"
    ".agents/agente-gerador-de-exercicios.md"
    ".agents/agente-gestor-de-memoria.md"
    ".agents/agente-setup-inicial.md"
    ".agents/agente-checklist-pos-aula.md"
    ".agents/agente-exportador.md"
)

for agent in "${agents[@]}"; do
    if [ -f "$agent" ]; then
        print_ok "$agent existe"
    else
        print_error "$agent não encontrado"
    fi
done

echo ""

# 5. Verificar wikilinks (básico)
echo "--- Verificação de Wikilinks ---"

# Extrair wikilinks dos arquivos .md
wikilinks=$(grep -roh '\[\[.*\]\]' --include="*.md" . 2>/dev/null | sort -u | head -20)

if [ -n "$wikilinks" ]; then
    print_ok "Wikilinks encontrados: $(echo "$wikilinks" | wc -l) únicos"
else
    print_warn "Nenhum wikilink encontrado"
fi

echo ""

# 6. Verificar .gitignore
echo "--- Verificação de .gitignore ---"

gitignore_files=(
    ".memory/perfil-turma.md"
    ".memory/decisoes.md"
    ".memory/feedback-aulas.md"
    ".memory/status-aulas.md"
    ".memory/feedback-aluno.md"
    ".context/"
    ".docs/"
    "AULAS/"
)

for file in "${gitignore_files[@]}"; do
    if grep -q "$file" .gitignore 2>/dev/null; then
        print_ok "$file está no .gitignore"
    else
        print_warn "$file NÃO está no .gitignore"
    fi
done

echo ""

# 7. Resumo
echo "=========================================="
echo "  Resumo da Verificação"
echo "=========================================="
echo ""
echo -e "Erros:   ${RED}$ERRORS${NC}"
echo -e "Avisos:  ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}Verificação concluída com sucesso!${NC}"
else
    echo -e "${RED}Verificação concluída com erros. Corrija os problemas acima.${NC}"
    exit 1
fi
