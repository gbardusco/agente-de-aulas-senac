// ===== Dashboard IoT — Script Principal =====

function gerarLeitura(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function horaAtual() {
    return new Date().toLocaleTimeString("pt-BR");
}

function adicionarLog(mensagem, tipo) {
    let logContainer = document.getElementById("log-container");
    let entry = document.createElement("p");
    entry.className = "log-entry" + (tipo ? " " + tipo : "");
    entry.textContent = `[${horaAtual()}] ${mensagem}`;
    logContainer.prepend(entry);

    // Limitar a 20 entradas
    while (logContainer.children.length > 20) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// ===== ATUALIZAÇÃO DE SENSORES =====
function atualizarSensores() {
    let temp = gerarLeitura(15, 42);
    let umid = gerarLeitura(30, 95);
    let luz = gerarLeitura(0, 1200);
    let hora = horaAtual();

    // Temperatura
    document.getElementById("v-temp").textContent = temp;
    document.getElementById("v-temp").style.color = temp > 35 ? "#ef4444" : temp > 28 ? "#fbbf24" : "#34d399";
    document.getElementById("h-temp").textContent = `Atualizado: ${hora}`;

    let cardTemp = document.getElementById("card-temp");
    if (temp > 35) {
        cardTemp.classList.add("alerta-visual");
        adicionarLog(`⚠️ Alerta: Temperatura atingiu ${temp}°C`, "alerta");

        // Automação: ligar ventilador automaticamente
        let ctrlVent = document.getElementById("ctrl-ventilador");
        if (!ctrlVent.classList.contains("ligado")) {
            toggleControle("ventilador");
            adicionarLog(`🤖 Automação: Ventilador ligado (temp > 35°C)`, "automacao");
        }
    } else {
        cardTemp.classList.remove("alerta-visual");
    }

    // Umidade
    document.getElementById("v-umid").textContent = umid;
    document.getElementById("v-umid").style.color = umid > 80 ? "#3b82f6" : "#34d399";
    document.getElementById("h-umid").textContent = `Atualizado: ${hora}`;

    // Luminosidade
    document.getElementById("v-luz").textContent = luz;
    document.getElementById("v-luz").style.color = luz < 200 ? "#fbbf24" : "#34d399";
    document.getElementById("h-luz").textContent = `Atualizado: ${hora}`;

    if (luz < 200) {
        let ctrlLamp = document.getElementById("ctrl-lampada");
        if (!ctrlLamp.classList.contains("ligado")) {
            toggleControle("lampada");
            adicionarLog(`🤖 Automação: Iluminação ligada (luz < 200 lux)`, "automacao");
        }
    }

    document.getElementById("relogio").textContent = hora;
}

// ===== CONTROLES (TOGGLE) =====
function toggleControle(nome) {
    let ctrl = document.getElementById("ctrl-" + nome);
    let status = document.getElementById("st-" + nome);
    let btn = document.getElementById("btn-" + nome);

    if (ctrl.classList.contains("ligado")) {
        ctrl.classList.remove("ligado");
        status.textContent = "⚫ Desligado" + (nome === "lampada" ? "a" : "");
        btn.textContent = "Ligar";
        adicionarLog(`${nome.charAt(0).toUpperCase() + nome.slice(1)} desligado manualmente`);
    } else {
        ctrl.classList.add("ligado");
        status.textContent = "🟢 Ligado" + (nome === "lampada" ? "a" : "");
        btn.textContent = "Desligar";
        adicionarLog(`${nome.charAt(0).toUpperCase() + nome.slice(1)} ligado manualmente`);
    }
}

// Event listeners para botões de controle
document.getElementById("btn-ventilador").addEventListener("click", function() { toggleControle("ventilador"); });
document.getElementById("btn-lampada").addEventListener("click", function() { toggleControle("lampada"); });
document.getElementById("btn-alarme").addEventListener("click", function() { toggleControle("alarme"); });

// Inicializar e atualizar a cada 5 segundos
atualizarSensores();
setInterval(atualizarSensores, 5000);
