const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createWorker } = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

/*
 * In‑memory stores for demonstration purposes only.
 * A production application should use a real database and authentication mechanism.
 */
const users = new Map();
const missions = [
  { id: 1, title: 'Utiliser un sac réutilisable', description: 'Emmenez votre propre sac lors de vos courses.', points: 10 },
  { id: 2, title: 'Réparer un objet cassé', description: 'Réparez un objet plutôt que de le jeter.', points: 20 },
  { id: 3, title: 'Planter un arbre', description: "Participez à une initiative locale ou plantez un arbre dans votre jardin.", points: 50 }
];

/*
 * Simple login / registration endpoints.
 */
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }
  if (users.has(email)) {
    return res.status(409).json({ message: 'Cet utilisateur existe déjà.' });
  }
  users.set(email, { password, points: 0, completedMissions: [] });
  return res.json({ message: 'Compte créé avec succès.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Identifiants invalides.' });
  }
  return res.json({ message: 'Connexion réussie.', user: { email, points: user.points, completedMissions: user.completedMissions } });
});

/*
 * Missions endpoints.
 */
app.get('/api/missions', (req, res) => {
  res.json(missions);
});

app.post('/api/missions/complete', (req, res) => {
  const { email, missionId } = req.body;
  const user = users.get(email);
  const mission = missions.find(m => m.id === missionId);
  if (!user) {
    return res.status(401).json({ message: 'Utilisateur non trouvé.' });
  }
  if (!mission) {
    return res.status(404).json({ message: 'Mission introuvable.' });
  }
  if (user.completedMissions.includes(missionId)) {
    return res.status(400).json({ message: 'Mission déjà complétée.' });
  }
  user.completedMissions.push(missionId);
  user.points += mission.points;
  return res.json({ message: 'Mission validée!', points: user.points });
});

/*
 * OCR endpoint: accepts base64 image data and returns a list of extracted words.
 * On the client side, convert the uploaded file to a base64 string and send it here.
 */
app.post('/api/ocr', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ message: 'Image manquante.' });
  }
  const worker = await createWorker('fra');
  try {
    const { data } = await worker.recognize(image);
    await worker.terminate();
    // Split the extracted text into lines and words
    const lines = data.text.split(/\n+/).map(l => l.trim()).filter(Boolean);
    return res.json({ lines });
  } catch (error) {
    await worker.terminate();
    return res.status(500).json({ message: 'Erreur OCR', error: String(error) });
  }
});

/*
 * Product scoring endpoint.
 * Accepts a list of product names or barcodes and returns a simple environmental score and recommendations.
 * The Open Food Facts API is used for food products, and a small internal table covers some non‑food items.
 */
const DIY_RECIPES = {
  "nettoyant multiusage": {
    title: 'Nettoyant multiusage maison',
    instructions: 'Mélangez 1 litre d’eau chaude avec 2 c. à soupe de bicarbonate et 1 c. à soupe de vinaigre blanc. Ajouter quelques gouttes d’huile essentielle de citron.',
  },
  "dentifrice": {
    title: 'Dentifrice naturel',
    instructions: 'Mélangez 3 c. à soupe de bicarbonate avec 1 c. à soupe d’argile blanche et quelques gouttes d’huile essentielle de menthe poivrée.',
  }
};

function computeScore(nutriScore) {
  // Map eco scores to simple categories
  switch ((nutriScore || '').toUpperCase()) {
    case 'A': return { grade: 'vert', label: 'Bon' };
    case 'B': return { grade: 'vert', label: 'Bon' };
    case 'C': return { grade: 'orange', label: 'Moyen' };
    case 'D': return { grade: 'rouge', label: 'Mauvais' };
    case 'E': return { grade: 'rouge', label: 'Mauvais' };
    default: return { grade: 'gris', label: 'Inconnu' };
  }
}

app.post('/api/products/score', async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Liste de produits manquante.' });
  }
  const results = [];
  for (const term of items) {
    let productInfo = {
      name: term,
      score: { grade: 'gris', label: 'Inconnu' },
      diy: null,
      alternatives: []
    };
    try {
      // Attempt to fetch from Open Food Facts via search by product name
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&json=true&page_size=1`;
      const { data } = await axios.get(url);
      if (data && data.products && data.products.length > 0) {
        const product = data.products[0];
        const ecoScore = product.nutrition_grades || product.ecoscore_grade;
        productInfo.score = computeScore(ecoScore);
        productInfo.alternatives.push(`Privilégiez un produit biologique ou local pour "${term}".`);
      }
    } catch (error) {
      // ignore API errors and keep default values
    }
    // Provide DIY alternative if available
    const key = term.trim().toLowerCase();
    if (DIY_RECIPES[key]) {
      productInfo.diy = DIY_RECIPES[key];
    }
    results.push(productInfo);
  }
  return res.json(results);
});

/*
 * Recycling guide endpoint.
 */
const RECYCLING_GUIDE = {
  'papier': 'À recycler dans le bac bleu. Retirez les agrafes et plastiques.',
  'bouteille plastique': 'À recycler dans le bac jaune. Videz et écrasez la bouteille.',
  'canette': 'À recycler dans le bac jaune. Rincez si nécessaire.',
  'pile': 'À déposer dans un point de collecte spécialisé (supermarché, déchetterie).'
};

app.get('/api/recycle/:query', (req, res) => {
  const query = (req.params.query || '').toLowerCase();
  const instructions = RECYCLING_GUIDE[query];
  if (!instructions) {
    return res.json({ result: 'Aucune information de tri trouvée pour ce produit.' });
  }
  return res.json({ result: instructions });
});

/*
 * Recycling by barcode endpoint.  Accepts an EAN/UPC code and returns recycling instructions
 * from Open Food Facts if available.  If no information exists the standard recycling guide
 * is returned based on the product name.
 */
app.post('/api/recycle/barcode', async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) {
    return res.status(400).json({ message: 'Code-barres manquant.' });
  }
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const { data } = await axios.get(url);
    if (data && data.status === 1) {
      const product = data.product;
      // Attempt to use recycling instructions, otherwise packaging text
      const recycling = product.miscellaneous_tags?.find(t => t.startsWith('recycling:')) || product.packaging_text;
      if (recycling) {
        return res.json({ result: recycling });
      }
      // Fallback: derive instructions from product name
      const name = (product.product_name || '').toLowerCase();
      const instruction = Object.keys(RECYCLING_GUIDE).find(key => name.includes(key));
      if (instruction) {
        return res.json({ result: RECYCLING_GUIDE[instruction] });
      }
    }
    return res.json({ result: 'Aucune information de recyclage disponible.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur lors de la récupération du produit.' });
  }
});

/*
 * Leaderboard endpoint.  Returns the top users sorted by points in descending order.
 */
app.get('/api/leaderboard', (req, res) => {
  const list = [];
  for (const [email, info] of users.entries()) {
    list.push({ email, points: info.points });
  }
  list.sort((a, b) => b.points - a.points);
  return res.json(list.slice(0, 10));
});

// Fallback route
app.get('/', (req, res) => {
  res.send('Eco App Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});