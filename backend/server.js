// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'scores.json');

app.use(cors());
app.use(express.json());

// Función auxiliar para leer los scores del archivo JSON
function leerScores() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Función auxiliar para guardar los scores
function guardarScores(scores) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2), 'utf8');
}

// RUTA GET: Obtener el Top 10 de puntajes globales
app.get('/scores', (req, res) => {
    const scores = leerScores();
    // Ordenar de mayor a menor puntaje y limitar a los primeros 10
    const top10 = scores.sort((a, b) => b.puntos - a.puntos).slice(0, 10);
    res.json(top10);
});

// RUTA POST: Guardar un nuevo puntaje
app.post('/scores', (req, res) => {
    const { nombre, puntos, tiempo } = req.body;

    if (!nombre || typeof puntos !== 'number') {
        return res.status(400).json({ error: 'Datos inválidos. Se requiere nombre y puntos.' });
    }

    const scores = leerScores();
    const nuevoScore = {
        nombre: nombre.slice(0, 3).toUpperCase(), // Máximo 3 iniciales estilo arcade
        puntos,
        tiempo: tiempo || "00:00",
        fecha: new Date().toISOString()
    };

    scores.push(nuevoScore);
    guardarScores(scores);

    res.status(201).json({ mensaje: '¡Puntaje registrado con éxito!', score: nuevoScore });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});