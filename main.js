// main.js - O ORQUESTRADOR (Versão Modular)

function rodarSimulacao() {
    setInterval(() => {
        atualizarRelogio(); // Função que está no ui.js
        const state = window.HMI_STATE;

        if (!state.isRunning || !window.tractorMarker) return;

        // 1. Cálculo de Movimento
        let baseStep = 0.0000045; 
        let step = (state.velocidade || 8.0) * baseStep; 
        let rad = (state.anguloTractor * Math.PI) / 180;
        
        let newLat = window.tractorMarker.getLatLng().lat + (step * Math.cos(rad));
        let newLng = window.tractorMarker.getLatLng().lng + (step * Math.sin(rad));
        let newPos = L.latLng(newLat, newLng);

        // 2. Verificação de Sobreposição e Rastro
        state.isOverlap = verificarSobreposicaoReal(newPos);
        
        if (state.isOverlap) {
            state.sementesEconomizadas += (state.numLinhas * 2);
        } else {
            state.areaHa += (state.numLinhas * 0.000001);
            adicionarPontoRastro(newPos, 12 + (Math.random() - 0.5));
        }

        // 3. Atualização Visual
        window.tractorMarker.setLatLng(newPos);
        window.map.panTo(newPos);
        
        // Atualiza UI
        document.getElementById('speed').innerText = (state.isRunning ? 8.0 : 0.0).toFixed(1);
        document.getElementById('seeds-saved').innerText = Math.floor(state.sementesEconomizadas);
        document.getElementById('area-val').innerText = state.areaHa.toFixed(2);
    }, 1000);
}

window.onload = () => { 
    if (typeof initMap === 'function') initMap(); 
    if (typeof carregarTalhaoSalvo === 'function') carregarTalhaoSalvo(); 
    rodarSimulacao(); 
};