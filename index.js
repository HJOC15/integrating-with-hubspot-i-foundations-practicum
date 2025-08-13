require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// ===== Configuración básica =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const CUSTOM_OBJECT_TYPE = process.env.CUSTOM_OBJECT_TYPE; // ej: 2-48617843
const PORT = process.env.PORT || 3000;

const hubspot = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// ===== Rutas =====

// 1) Formulario para crear registros del objeto personalizado
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    pageTitle: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

// 2) Procesa el POST del formulario y crea el registro en HubSpot
app.post('/update-cobj', async (req, res) => {
  try {
    const { name, bio, especie } = req.body; // usa los nombres internos de tus propiedades
    await hubspot.post(`/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`, {
      properties: { name, bio, especie },
    });
    return res.redirect('/');
  } catch (err) {
    console.error('Error creando registro:', err?.response?.data || err.message);
    return res.status(500).send('Error creando el registro. Revisa la consola para más detalle.');
  }
});

// 3) Homepage: lista los registros del objeto personalizado
app.get('/', async (req, res) => {
  try {
    const { data } = await hubspot.get(`/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`, {
      params: {
        properties: 'name,bio,especie',
        limit: 100,
        archived: false,
      },
    });
    const records = data?.results || [];
    res.render('homepage', {
      pageTitle: 'Homepage | Integrating With HubSpot I Practicum',
      records,
    });
  } catch (err) {
    console.error('Error obteniendo registros:', err?.response?.data || err.message);
    res.status(500).send('Error obteniendo registros. Revisa la consola para más detalle.');
  }
});

// ===== Arranque =====
app.listen(PORT, () => {
  console.log(`Servidor arriba en http://localhost:${PORT}`);
});
