// ui.js - Gestão de Menus e Teclado Corrigida
function atualizarRelogio() {
    const agora = new Date();
    const d = document.getElementById('display-date');
    const t = document.getElementById('display-time');
    if (d) d.innerText = agora.toLocaleDateString('pt-BR');
    if (t) t.innerText = agora.toLocaleTimeString('pt-BR');
}

function mudarMenu(tipo, elemento) {
    const overlay = document.getElementById('menu-overlay');
    const mapaContainer = document.getElementById('mapa-container');
    const content = document.getElementById('menu-content');

    if (tipo === 'mapa') {
        overlay.classList.add('hidden');
        mapaContainer.classList.remove('hidden');
        if (window.map) window.map.invalidateSize();
        return;
    }

    overlay.classList.remove('hidden');
    mapaContainer.classList.add('hidden');
    document.getElementById('menu-titulo').innerText = tipo.toUpperCase();
    
    // Roteamento de Menus
    if (tipo === 'ajustes') {
        renderConfiguracao(content); // Nova função para os 3 ajustes
    } else if (tipo === 'alarmes') {
        renderAlarmes(content); // Caso já tenha o alarmes.js
    } else {
        content.innerHTML = `<p style="color:white; text-align:center;">Menu ${tipo} em desenvolvimento.</p>`;
    }
}

function renderConfiguracao(container) {
    const state = window.HMI_STATE;
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 10px;">
            <div class="calib-card" onclick="abrirTeclado('numLinhas')" style="background:var(--surface); padding:20px; border-radius:12px; border:1px solid var(--blue); text-align:center; cursor:pointer;">
                <span style="color:#888; font-size:12px;">Nº DE LINHAS (0-100)</span><br>
                <strong style="font-size:32px; color:var(--accent);">${state.numLinhas}</strong>
            </div>
            
            <div class="calib-card" onclick="abrirTeclado('anguloTractor')" style="background:var(--surface); padding:20px; border-radius:12px; border:1px solid var(--blue); text-align:center; cursor:pointer;">
                <span style="color:#888; font-size:12px;">ÂNGULO (0-180°)</span><br>
                <strong style="font-size:32px; color:var(--accent);">${state.anguloTractor}°</strong>
            </div>

            <div class="calib-card" onclick="abrirTeclado('velocidade')" style="background:var(--surface); padding:20px; border-radius:12px; border:1px solid var(--blue); text-align:center; grid-column: span 2; cursor:pointer;">
                <span style="color:#888; font-size:12px;">VELOCIDADE DE OPERAÇÃO</span><br>
                <strong style="font-size:32px; color:var(--accent);">${state.velocidade.toFixed(1)}</strong><small> km/h</small>
            </div>

            <button onclick="salvarConfiguracaoGeral()" style="grid-column: span 2; padding:20px; background:var(--accent); border:none; color:#000; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer; margin-top:10px;">
                <i class="fas fa-save"></i> SALVAR CONFIGURAÇÃO
            </button>
        </div>
    `;
}

function salvarConfiguracaoGeral() {
    const state = window.HMI_STATE;
    localStorage.setItem('num_linhas', state.numLinhas);
    localStorage.setItem('config_salva', 'true');
    alert("Configurações da Inverter Electric salvas com sucesso!");
    fecharMenu();
}

function confirmNum() {
    const display = document.getElementById('num-val');
    const valor = parseFloat(display.innerText);
    const state = window.HMI_STATE;

    if (!isNaN(valor)) {
        if (window.campoAtivo === 'numLinhas') {
            // Atualiza para até 100 linhas e recalcula largura
            state.numLinhas = Math.min(Math.max(valor, 0), 100);
            state.larguraImplemento = state.numLinhas * state.espacamentoLinhas;
        } else if (window.campoAtivo === 'anguloTractor') {
            state.anguloTractor = Math.min(Math.max(valor, 0), 180);
            if (typeof atualizarRotacaoSeta === 'function') atualizarRotacaoSeta(state.anguloTractor);
        } else if (window.campoAtivo === 'velocidade') {
            state.velocidade = Math.min(Math.max(valor, 0), 25);
        }
    }
    
    document.getElementById('numpad-overlay').classList.add('hidden');
    renderConfiguracao(document.getElementById('menu-content'));
}

// ui.js - Função confirmNum com cálculo de largura real
function confirmNum() {
    const display = document.getElementById('num-val');
    const valor = parseFloat(display.innerText);
    const state = window.HMI_STATE;

    if (!isNaN(valor)) {
        if (window.campoAtivo === 'numLinhas') {
            // Ajusta o número de linhas (1-15)
            state.numLinhas = Math.min(Math.max(valor, 1), 15);
            // CÁLCULO TECNOLÓGICO: Atualiza a largura real do implemento
            state.larguraImplemento = state.numLinhas * state.espacamentoLinhas;
            console.log("Nova largura de trabalho: " + state.larguraImplemento + "m");
            
        } else if (window.campoAtivo === 'anguloTractor') {
            state.anguloTractor = Math.min(Math.max(valor, 0), 180);
            if (typeof atualizarRotacaoSeta === 'function') {
                atualizarRotacaoSeta(state.anguloTractor);
            }
        } else if (window.campoAtivo === 'velocidade') {
            state.velocidade = Math.min(Math.max(valor, 0), 25);
        }
    }
    
    document.getElementById('numpad-overlay').classList.add('hidden');
    
    // Atualiza a tela de Ajustes para mostrar os novos valores
    if (document.getElementById('menu-titulo').innerText === 'AJUSTES') {
        renderConfiguracao(document.getElementById('menu-content'));
    }
}

function fecharMenu() { mudarMenu('mapa', null); }

function toggleSimulacao() {
    const state = window.HMI_STATE;
    const btn = document.getElementById('btn-iniciar');

    state.isRunning = !state.isRunning;

    if (state.isRunning) {
        btn.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
        btn.style.borderColor = 'var(--danger)';
        btn.style.color = 'var(--danger)';
        console.log("Movimento Iniciado");
    } else {
        btn.innerHTML = '<i class="fas fa-play"></i><span>INICIAR</span>';
        btn.style.borderColor = 'var(--accent)';
        btn.style.color = 'var(--accent)';
        console.log("Movimento Parado");
    }
}

// Lógica do Teclado Numérico
function abrirTeclado(campo) {
    window.campoAtivo = campo;
    document.getElementById('num-val').innerText = "";
    document.getElementById('numpad-overlay').classList.remove('hidden');
}

function numKey(val) {
    const display = document.getElementById('num-val');
    if (val === 'clear') display.innerText = "";
    else if (display.innerText.length < 5) display.innerText += val;
}

function confirmNum() {
    document.getElementById('numpad-overlay').classList.add('hidden');
}
