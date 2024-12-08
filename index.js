const fs = require('fs');

const FILE_PATH = './saves/';
const ROWS = 6;
const COLS = 8;
const TOTAL_TRESORS = 16;
const MAX_TIRADES = 32;

// Estat del joc
let tauler = crearTauler(ROWS, COLS);
let taulerOcult = crearTauler(ROWS, COLS, true);
let tiradesRestants = MAX_TIRADES;
let tresorsTrobats = 0;
let mostrarTrampa = false;

// Funcions
function crearTauler(rows, cols, ambTresors = false) {
    const tauler = [];
    for (let i = 0; i < rows; i++) {
        const fila = Array(cols).fill('·');
        tauler.push(fila);
    }
    if (ambTresors) {
    amagaTresors(tauler);
    }
    return tauler;
}

function amagaTresors(tauler) {
    let tresorsRestants = TOTAL_TRESORS;
    while (tresorsRestants > 0) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);
        if (tauler[row][col] === '·') {
            tauler[row][col] = 'T';
            tresorsRestants--;
        }
    }
}

function imprimirTaulers(mostrarTrampa = false) {
    const COLS = 8;
    let header = ' ';
    for (let i = 0; i < COLS; i++) {
      header += i;
    }
    
    if (!mostrarTrampa) {
        // Mode normal: només un tauler
        console.log('Tauler actual (normal):');
        console.log(header);
        for (let row = 0; row < ROWS; row++) {
            const rowLabel = String.fromCharCode(65 + row);
            const fila = tauler[row].join('');
            console.log(`${rowLabel}${fila}`);
        }
    } else {
        // Mode trampa: dos taulers
        console.log('Tauler actual (normal) a l\'esquerra. Tauler amb trampa a la dreta:');
        console.log(`${header}       ${header}`); 

        for (let row = 0; row < ROWS; row++) {
            const rowLabel = String.fromCharCode(65 + row);
            const filaNormal = tauler[row].join('');
            const filaTrampa = taulerOcult[row].join('');
            console.log(`${rowLabel}${filaNormal}       ${rowLabel}${filaTrampa}`);
        }
        console.log('(Mode trampa activat: es mostren els tresors)');
    }
}

function calcularDistancia(row, col) {
    let distMinima = Infinity;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (taulerOcult[r][c] === 'T') {
                const distancia = Math.abs(r - row) + Math.abs(c - col);
                distMinima = Math.min(distMinima, distancia);
            }
        }
    }
    return distMinima;
}

function processarComanda(comanda) {
    const parts = comanda.split(' ');
    switch (parts[0].toUpperCase()) {
        case 'AJUDA':
        case 'HELP':
            console.log(`\nComandes disponibles:
- ajuda/help: Mostra la llista de comandes.
- carregar "nom_arxiu": Carrega una partida guardada.
- guardar "nom_guardar": Guarda la partida actual.
- activar/desactivar trampa: Mostra/amaga els tresors al tauler.
- destapar x,y: Destapa la casella especificada i mostra la distància al tresor més proper.
- puntuació: Mostra la puntuació actual i les tirades restants.\n`);
            break;

        case 'CARREGAR':
            carregarPartida(parts[1]);
            break;

        case 'GUARDAR':
            guardarPartida(parts[1]);
            break;

        case 'ACTIVAR':
        case 'DESACTIVAR':
            mostrarTrampa = !mostrarTrampa;
            console.log(`Trampa ${mostrarTrampa ? 'activada' : 'desactivada'}`);
            break;

        case 'DESTAPAR':
            if (parts.length < 2) {
                console.log('Falta especificar la casella (ex: destapar B3).');
                return;
            }
            destapar(parts[1]);
            break;

        case 'PUNTUACIO':
            console.log(`Puntuació: ${tresorsTrobats}/${TOTAL_TRESORS}`);
            console.log(`Tirades restants: ${tiradesRestants}`);
            break;

        default:
            console.log('Comanda no reconeguda. Escriu "ajuda" per veure les opcions.');
            break;
    }
}

function destapar(casella) {
    const row = casella[0].toUpperCase().charCodeAt(0) - 65;
    const col = parseInt(casella.slice(1), 10);

    if (isNaN(row) || isNaN(col) || row < 0 || row >= ROWS || col < 0 || col >= COLS) { // isNaN es una función en JavaScript que verifica si un valor es "No un número" (Not-a-Number).
        console.log('Casella invàlida. Escriu una casella en format correcte (ex: B3).');
        return;
    }

    if (tauler[row][col] !== '·') {
        console.log('Aquesta casella ja està destapada.');
        return;
    }

    if (taulerOcult[row][col] === 'T') {
        console.log('Tresor trobat!');
        tauler[row][col] = 'T';
        tresorsTrobats++;
        if (tresorsTrobats === TOTAL_TRESORS) {
            console.log(`Has guanyat amb només ${MAX_TIRADES - tiradesRestants} tirades!`);
            process.exit();
        }
    } else {
        const distancia = calcularDistancia(row, col);
        console.log(`Cap tresor trobat. Distància més propera: ${distancia}`);
        tauler[row][col] = '#';
        tiradesRestants--;
        if (tiradesRestants === 0) {
            console.log(`Has perdut, queden ${TOTAL_TRESORS - tresorsTrobats} tresors.`);
            process.exit();
        }
    }
}

function guardarPartida(nomArxiu) {
    const estat = {
        tauler,
        taulerOcult,
        tiradesRestants,
        tresorsTrobats,
    };
    fs.writeFileSync(FILE_PATH + nomArxiu+".json", JSON.stringify(estat));
    console.log(`Partida guardada a ${nomArxiu}`);
}

function carregarPartida(nomArxiu) {
    try {
        const data = fs.readFileSync(FILE_PATH + nomArxiu+".json");
        const estat = JSON.parse(data);
        tauler = estat.tauler;
        taulerOcult = estat.taulerOcult;
        tiradesRestants = estat.tiradesRestants;
        tresorsTrobats = estat.tresorsTrobats;
        console.log(`Partida carregada des de ${nomArxiu}`);
    } catch (error) {
        console.log(`Error carregant la partida: ${error.message}`);
    }
}

// Inici del joc
console.log('Benvingut al joc de tresors!\n\n');
imprimirTaulers();
console.log('\nEscriu "ajuda" per veure les opcions.');

process.stdin.on('data', (input) => {
    const comanda = input.toString().trim();
    processarComanda(comanda);
    imprimirTaulers(mostrarTrampa);
});
