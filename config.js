// config.js - O Cérebro da HMI Pro v13.0
window.HMI_STATE = {
    isRunning: false,
    modoMarcacao: false,
    isOverlap: false,

    velocidade: 25.0, 
    areaHa: 0.00,
    sementesEconomizadas: 0,
    
    // Configuração de Escala Industrial
    numLinhas: parseInt(localStorage.getItem('num_linhas')) || 15, 
    espacamentoLinhas: 0.45, // 45 cm fixos
    // Largura total calculada: ex: 100 linhas * 0.45m = 45m
    larguraImplemento: (parseInt(localStorage.getItem('num_linhas')) || 15) * 0.45,

    posicaoTractor: [-12.518, -55.714],
    anguloTractor: 80, 
    pontosTalhao: JSON.parse(localStorage.getItem('pontos_talhao')) || []
};

console.log("Sistema de Configuração Global carregado com sucesso.");