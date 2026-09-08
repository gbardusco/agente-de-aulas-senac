(() => {
    const aula = document.querySelector('main')?.dataset.aula || 'aula-XX';
    const dadosEmbutidos = document.getElementById('relatorio-dados');
    const statusRelatorio = document.getElementById('relatorio-status');
    const exportar = document.getElementById('exportar-json');
    const importar = document.getElementById('importar-json');
    const automatico = document.getElementById('salvamento-local');
    const limpar = document.getElementById('limpar-local');
    const avisoLocal = document.getElementById('local-warning');
    const chavePreferencia = `relatorio-docente:preferencia:${aula}`;
    const chaveDados = `relatorio-docente:dados:${aula}`;
    let alteracoesPendentes = false;
    let salvamentoAgendado;

    const armazenamento = {
        ler(chave) {
            try { return window.localStorage.getItem(chave); } catch { return null; }
        },
        gravar(chave, valor) {
            try { window.localStorage.setItem(chave, valor); return true; } catch { return false; }
        },
        apagar(chave) {
            try { window.localStorage.removeItem(chave); return true; } catch { return false; }
        }
    };

    function textoRotulo(id) {
        const rotulo = document.querySelector(`label[for="${id}"]`);
        return rotulo ? rotulo.textContent.replace(/\s+/g, ' ').trim() : id;
    }

    function sincronizarImpressao(campo, impresso) {
        impresso.textContent = campo.value;
    }

    function ligarEspelho(campo) {
        const impresso = document.createElement('div');
        impresso.className = 'print-value';
        impresso.setAttribute('aria-hidden', 'true');
        campo.after(impresso);
        const sincronizar = () => sincronizarImpressao(campo, impresso);
        campo.addEventListener('input', () => { sincronizar(); marcarAlteracoes(true); });
        window.addEventListener('beforeprint', sincronizar);
        sincronizar();
    }

    function ligarBotaoCopia(botao) {
        const campo = document.getElementById(botao.dataset.copy);
        const status = document.getElementById(`status-${botao.dataset.copy}`);
        if (!campo || !status) return;
        botao.setAttribute('aria-describedby', status.id);
        botao.addEventListener('click', async () => {
            botao.disabled = true;
            status.textContent = 'Copiando...';
            try {
                if (!navigator.clipboard?.writeText) throw new Error('Clipboard indisponivel');
                await navigator.clipboard.writeText(campo.value);
                status.textContent = 'Texto copiado.';
            } catch {
                campo.focus();
                campo.select();
                campo.setSelectionRange(0, campo.value.length);
                status.textContent = 'Copia automatica indisponivel. Texto selecionado: use Ctrl+C, Command+C ou a opcao Copiar do dispositivo.';
            } finally {
                botao.disabled = false;
            }
        });
    }

    function grupoSecao(grupo) {
        return document.querySelector(`section[data-grupo="${grupo}"]`) || document.querySelector('section[data-grupo="personalizado"]') || document.querySelector('main');
    }

    function acrescentarCampo(campo) {
        if (document.getElementById(campo.id)) return;
        const secao = grupoSecao(campo.grupo || 'personalizado');
        const bloco = document.createElement('div');
        bloco.className = 'campo-dinamico';
        const rotulo = document.createElement('label');
        rotulo.setAttribute('for', campo.id);
        rotulo.textContent = campo.rotulo || campo.id;
        const area = document.createElement('textarea');
        area.id = campo.id;
        area.rows = 5;
        area.value = campo.valor || '';
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.dataset.copy = campo.id;
        botao.textContent = `Copiar ${campo.rotulo || campo.id}`.slice(0, 80);
        const status = document.createElement('p');
        status.className = 'copy-status';
        status.id = `status-${campo.id}`;
        status.setAttribute('role', 'status');
        bloco.append(rotulo, area, botao, status);
        secao.append(bloco);
        ligarEspelho(area);
        ligarBotaoCopia(botao);
    }

    function lerDadosEmbutidos() {
        if (!dadosEmbutidos) return { campos: [], evidencias: [], fontes: [], historico: [] };
        try {
            const dados = JSON.parse(dadosEmbutidos.textContent);
            if (dados.version !== 1 || dados.aulaId !== aula || !Array.isArray(dados.campos)) throw new Error('dados invalidos');
            return { evidencias: [], fontes: [], historico: [], ...dados };
        } catch {
            return { campos: [], evidencias: [], fontes: [], historico: [] };
        }
    }

    function coletarCampos() {
        return [...document.querySelectorAll('textarea')].map((campo) => ({
            id: campo.id,
            rotulo: textoRotulo(campo.id),
            grupo: campo.closest('section')?.dataset.grupo || 'personalizado',
            valor: campo.value
        }));
    }

    function montarJson() {
        const embutidos = lerDadosEmbutidos();
        return {
            ...embutidos,
            version: 1,
            aulaId: aula,
            atualizadoEm: new Date().toISOString(),
            campos: coletarCampos()
        };
    }

    function marcarAlteracoes(pendentes, mensagem) {
        alteracoesPendentes = pendentes;
        if (!statusRelatorio) return;
        if (mensagem) statusRelatorio.textContent = mensagem;
        else if (pendentes) statusRelatorio.textContent = 'Alteracoes ainda nao exportadas.';
        else statusRelatorio.textContent = `Exportado em ${new Date().toLocaleString('pt-BR')}.`;
    }

    function aplicarJson(dados, origem) {
        if (!dados || dados.version !== 1 || dados.aulaId !== aula || !Array.isArray(dados.campos)) {
            throw new Error('Arquivo JSON incompativel com este relatorio.');
        }
        for (const campo of dados.campos) {
            if (!campo || typeof campo.id !== 'string') continue;
            if (!document.getElementById(campo.id)) acrescentarCampo(campo);
            const area = document.getElementById(campo.id);
            if (area) area.value = campo.valor || '';
            area?.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (dadosEmbutidos) dadosEmbutidos.textContent = JSON.stringify(dados);
        marcarAlteracoes(false, `${origem} em ${new Date().toLocaleString('pt-BR')}.`);
    }

    function salvarLocal() {
        if (!automatico?.checked) return;
        const ok = armazenamento.gravar(chaveDados, JSON.stringify(montarJson()));
        if (statusRelatorio) statusRelatorio.textContent = ok ? `Salvo neste navegador em ${new Date().toLocaleString('pt-BR')}. Exporte o JSON para guarda permanente.` : 'Nao foi possivel salvar neste navegador. Exporte o JSON.';
    }

    function agendarSalvamento() {
        window.clearTimeout(salvamentoAgendado);
        salvamentoAgendado = window.setTimeout(salvarLocal, 500);
    }

    for (const campo of document.querySelectorAll('textarea')) ligarEspelho(campo);
    for (const botao of document.querySelectorAll('[data-copy]')) ligarBotaoCopia(botao);

    if (automatico && limpar && avisoLocal) {
        const preferencia = armazenamento.ler(chavePreferencia) === '1';
        automatico.checked = preferencia;
        avisoLocal.hidden = !preferencia;
        limpar.disabled = !armazenamento.ler(chaveDados);
        if (preferencia) {
            try {
                const salvos = armazenamento.ler(chaveDados);
                if (salvos) aplicarJson(JSON.parse(salvos), 'Dados locais restaurados');
            } catch {
                if (statusRelatorio) statusRelatorio.textContent = 'Dados locais invalidos. Exporte novamente a partir dos campos.';
            }
        }
        automatico.addEventListener('change', () => {
            avisoLocal.hidden = !automatico.checked;
            if (automatico.checked) {
                armazenamento.gravar(chavePreferencia, '1');
                salvarLocal();
            } else {
                armazenamento.apagar(chavePreferencia);
                marcarAlteracoes(true, 'Salvamento local desativado. Exporte o JSON para guardar as alteracoes.');
            }
            limpar.disabled = !armazenamento.ler(chaveDados);
        });
        limpar.addEventListener('click', () => {
            armazenamento.apagar(chaveDados);
            armazenamento.apagar(chavePreferencia);
            automatico.checked = false;
            avisoLocal.hidden = true;
            limpar.disabled = true;
            marcarAlteracoes(true, 'Dados locais apagados. Exporte o JSON para guardar as alteracoes.');
        });
    }

    document.querySelector('main')?.addEventListener('input', (evento) => {
        if (evento.target instanceof HTMLTextAreaElement) {
            marcarAlteracoes(true);
            agendarSalvamento();
        }
    });
    window.addEventListener('beforeunload', (evento) => {
        if (alteracoesPendentes) {
            evento.preventDefault();
            evento.returnValue = '';
        }
    });

    exportar?.addEventListener('click', () => {
        const dados = montarJson();
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio-${aula}.json`;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        marcarAlteracoes(false);
    });

    importar?.addEventListener('change', async () => {
        const arquivo = importar.files?.[0];
        if (!arquivo) return;
        try {
            aplicarJson(JSON.parse(await arquivo.text()), 'Arquivo importado');
        } catch {
            if (statusRelatorio) statusRelatorio.textContent = 'Arquivo JSON invalido ou incompativel. Nenhum campo foi alterado.';
        } finally {
            importar.value = '';
        }
    });
})();
