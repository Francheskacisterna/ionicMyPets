const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importar CORS
const app = express();
const PORT = 4000;

const API_KEY = 'AIzaSyAeNurybimBeUIkl8wlulTalWbuxUmM2io'; // Tu API Key de Google

// Habilitar CORS para todas las solicitudes
app.use(cors());

app.get('/google-places', async (req, res) => {
  const { location, radius, type } = req.query;
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: { location, radius, type, key: API_KEY },
    });
    console.log('Respuesta de Google Places API:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error al realizar la solicitud a Google Places API:', error.response?.data || error.message);
    res.status(500).send('Error al consultar Google Places API');
  }
});

app.listen(PORT, () => {
    console.log(`Servidor proxy corriendo en http://localhost:${PORT}`);
  });
  