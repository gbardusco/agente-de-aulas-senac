#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ] || [ -z "$1" ]; then
    printf 'Uso: bash preparar.sh "Nome da Disciplina"\n' >&2
    exit 1
fi
if [ ! -f package-lock.json ] || [ ! -f setup.sh ] || [ ! -d _templates/assets ]; then
    printf 'Abra o terminal na pasta do projeto, que contém preparar.sh e package-lock.json.\n' >&2
    exit 1
fi
for command in node npm; do
    if ! command -v "$command" >/dev/null 2>&1; then
        printf 'Instale Node.js 20+ (inclui npm): https://nodejs.org/en/download\n' >&2
        exit 1
    fi
done
node -e 'if (Number(process.versions.node.split(".")[0]) < 20) { console.error("Requer Node.js 20+: https://nodejs.org/en/download"); process.exit(1); }'
# Verify every setup input before installing or creating the workspace.
for template in materiais-consulta-index perfil-turma decisoes feedback-aulas status-aulas feedback-aluno sintese-diario-classe; do
    test -r "_templates/$template-template.md" || { printf 'Template ausente: %s\n' "$template" >&2; exit 1; }
done
for asset in slides.css slides.js exercicios.css relatorio.css relatorio.js; do
    test -r "_templates/assets/$asset" || { printf 'Asset ausente: %s\n' "$asset" >&2; exit 1; }
done
printf 'Instalando dependências do lockfile…\n'
npm ci
bash setup.sh "$1"
printf '\nPreparado. Abra o chat nesta pasta e peça: leia .agents/AGENTS.md e .agents/agente-setup-inicial.md e me ajude a cadastrar a turma.\n'
