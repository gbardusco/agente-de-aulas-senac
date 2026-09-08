#!/bin/bash
# =============================================================================
# Script de Verificação de Integridade
# =============================================================================
# Uso: ./verificar-integridade.sh [--modo=desenvolvimento|distribuicao] [--aula=aula-XX] [--formato=texto|json]
#
# Compatibilidade com o verificador canonico em scripts/verificar.mjs.
# Falha explicitamente quando Node.js ou dependencias estiverem indisponiveis,
# em vez de declarar uma verificacao parcial como concluida.
# =============================================================================

set -e

if ! command -v node >/dev/null 2>&1; then
    echo "[✗] Node.js nao encontrado. Instale Node.js 20+ para executar a verificacao completa." >&2
    exit 1
fi

if [ ! -f "package.json" ] || [ ! -f "scripts/verificar.mjs" ]; then
    echo "[✗] Verificador canonico ausente neste diretorio." >&2
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[✗] Dependencias nao instaladas. Execute 'npm ci' antes da verificacao completa." >&2
    exit 1
fi

exec npm run verificar -- "$@"
