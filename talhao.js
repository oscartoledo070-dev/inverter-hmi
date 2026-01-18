// talhao.js - Ferramenta de Marcação de Área (Boundary)

function ativarMarcacao() {
    const state = window.HMI_STATE;
    state.modoMarcacao = true;
    state.pontosTalhao = []; // Limpa para um novo desenho
    
    if (window.poligonoTalhao && window.map) {
        window.map.removeLayer(window.poligonoTalhao);
    }
    alert("Modo de marcação ATIVO. Toque nos cantos da área no mapa.");
}

function carregarTalhaoSalvo() {
    const state = window.HMI_STATE;
    if (state.pontosTalhao.length > 2 && window.map) {
        desenharPoligono();
    }
}

function desenharPoligono() {
    const state = window.HMI_STATE;
    if (window.poligonoTalhao && window.map) {
        window.map.removeLayer(window.poligonoTalhao);
    }
    
    window.poligonoTalhao = L.polygon(state.pontosTalhao, {
        color: '#00ff00',
        fillColor: '#00ff00',
        fillOpacity: 0.2,
        weight: 3
    }).addTo(window.map);
}

function finalizarMarcacao() {
    const state = window.HMI_STATE;
    state.modoMarcacao = false;
    
    if (state.pontosTalhao.length > 2) {
        localStorage.setItem('pontos_talhao', JSON.stringify(state.pontosTalhao));
        alert("Área de trabalho salva com sucesso!");
    } else {
        alert("Marque pelo menos 3 pontos.");
    }
}

function limparTalhao() {
    const state = window.HMI_STATE;
    state.pontosTalhao = [];
    if (window.poligonoTalhao && window.map) {
        window.map.removeLayer(window.poligonoTalhao);
    }
    state.modoMarcacao = false;
    localStorage.removeItem('pontos_talhao');
}

function renderMenuTalhao(container) {
    if (!container) return;
    container.innerHTML = `
        <div style="padding:20px; text-align:center;">
            <h2 style="color:var(--accent, #00e676); margin-bottom:20px;">Ferramentas de Área</h2>
            <button class="btn-point" onclick="ativarMarcacao()" style="margin-bottom:15px; background:var(--surface); border:2px solid var(--blue); color:#fff; padding:15px; width:100%; border-radius:10px;">
                <i class="fas fa-edit"></i> DESENHAR NOVA ÁREA
            </button>
            <button class="btn-point" onclick="finalizarMarcacao()" style="margin-bottom:15px; background:var(--surface); border:2px solid var(--accent); color:#fff; padding:15px; width:100%; border-radius:10px;">
                <i class="fas fa-check"></i> FINALIZAR E SALVAR
            </button>
            <button class="btn-point" onclick="limparTalhao()" style="background:var(--surface); border:2px solid var(--danger); color:#fff; padding:15px; width:100%; border-radius:10px;">
                <i class="fas fa-trash"></i> APAGAR TALHÃO
            </button>
        </div>
    `;
}