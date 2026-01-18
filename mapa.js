// mapa.js - Motor de GPS e Rastro com Escala Real (v13.0)
window.map = null;
window.tractorMarker = null;
let trailSegments = [];
let allTrailPoints = []; 

/**
 * Converte uma medida em metros para pixels no nível de zoom atual do mapa.
 * Essencial para que o rastro acompanhe a escala real do terreno.
 */
function metrosParaPixels(metros) {
    if (!window.map) return 10;
    
    const centro = window.map.getCenter();
    const zoom = window.map.getZoom();
    
    // Cálculo da escala do mapa: metros por pixel
    const metrosPorPixel = 40075016.686 * Math.abs(Math.cos(centro.lat * Math.PI / 180)) / Math.pow(2, zoom + 8);
    
    return metros / metrosPorPixel;
}

function initMap() {
    const state = window.HMI_STATE; // Acessa o cérebro global
    if (!document.getElementById('map')) return;

    // Inicialização do mapa Leaflet
    window.map = L.map('map', { 
        zoomControl: false, 
        attributionControl: false,
        preferCanvas: true // Otimiza o desenho de milhares de pontos
    }).setView(state.posicaoTractor, 17); 

    // Camada de Satélite (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(window.map);

    // Ícone do Trator (Seta)
    const tractorIcon = L.divIcon({
        className: 'tractor-div',
        html: `<div id="tractor-arrow" style="transform: rotate(${state.anguloTractor}deg); transition: transform 0.3s ease;">
                <i class="fas fa-arrow-up" style="color:#ffffff; font-size:32px; text-shadow: 0 0 10px black;"></i>
               </div>`
    });
    
    window.tractorMarker = L.marker(state.posicaoTractor, { icon: tractorIcon }).addTo(window.map);
    
    // Gestão de Cliques no Mapa
    window.map.on('click', (e) => {
        if (state.modoMarcacao) {
            state.pontosTalhao.push([e.latlng.lat, e.latlng.lng]);
            if (typeof desenharPoligono === 'function') desenharPoligono();
        } else if (!state.isRunning) {
            // Reposiciona o trator se a simulação estiver parada
            window.tractorMarker.setLatLng(e.latlng);
            state.posicaoTractor = [e.latlng.lat, e.latlng.lng];
        }
    });

    // ATUALIZAÇÃO DE ESCALA: Ajusta a largura do rastro quando o usuário muda o zoom
    window.map.on('zoomend', () => {
        const novaLargura = metrosParaPixels(state.larguraImplemento || 4.5);
        trailSegments.forEach(segmento => {
            segmento.setStyle({ weight: novaLargura });
        });
    });
}

function verificarSobreposicaoReal(novaPos) {
    const limiteDistancia = 0.00008; 
    const inicio = Math.max(0, allTrailPoints.length - 2000); // Foca nos pontos recentes para performance
    
    for (let i = inicio; i < allTrailPoints.length - 40; i++) {
        let p = allTrailPoints[i];
        let dist = Math.sqrt(Math.pow(novaPos.lat - p.lat, 2) + Math.pow(novaPos.lng - p.lng, 2));
        if (dist < limiteDistancia) return true;
    }
    return false;
}

function adicionarPontoRastro(pos, sementes) {
    const state = window.HMI_STATE;
    if (state.isOverlap) return; 
    
    // Calcula a espessura visual baseada na largura total (ex: 45 metros para 100 linhas)
    const larguraEmPixels = metrosParaPixels(state.larguraImplemento);

    const lastSegment = trailSegments[trailSegments.length - 1];
    
    if (!lastSegment || lastSegment.options.color !== cor) {
        const newPoly = L.polyline([pos], { 
            color: cor, 
            weight: larguraEmPixels, // Engrossa conforme o número de linhas aumenta
            opacity: 0.6, 
            lineCap: 'square' 
        }).addTo(window.map);
        trailSegments.push(newPoly);
    } else {
        lastSegment.addLatLng(pos);
        lastSegment.setStyle({ weight: larguraEmPixels });
    }
}