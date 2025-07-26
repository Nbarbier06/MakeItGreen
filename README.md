# MakeItGreen

Test du mode Agent de ChatGPT


Voici une **version améliorée et enrichie** du **document de cadrage** intégrant davantage de fonctionnalités innovantes, ainsi que la prise en compte de la base de données produits.

---

## 1. **Contexte et Vision**

La transition écologique nécessite des outils concrets permettant aux citoyens de **comprendre leur impact, changer leurs habitudes et accéder facilement à des alternatives durables**.
Cette application vise à devenir **un compagnon écologique du quotidien**, combinant **simplicité, utilité et motivation**.

---

## 2. **Objectifs du Projet**

* **Informer** : donner des conseils contextualisés sur les achats et comportements.
* **Accompagner** : proposer des alternatives écologiques, locales ou DIY.
* **Motiver** : encourager l’adoption d’actions durables grâce à des défis et récompenses.
* **Connecter** : favoriser l’économie circulaire et les initiatives locales.

---

## 3. **Public Cible**

* **Citoyens sensibles** à l’écologie, souhaitant des solutions concrètes.
* **Jeunes adultes**, familles et étudiants cherchant à réduire leurs dépenses.
* **Collectivités locales** intéressées par des outils de sensibilisation.

---

## 4. **Fonctionnalités Clés**

| Priorité | Fonctionnalité                                | Description                                                              | Valeur                                                      |
| -------- | --------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **MVP**  | **OCR tickets de caisse**                     | Scan via smartphone → extraction produits → analyse écologique           | Identifier achats polluants, suggérer alternatives durables |
| **MVP**  | **Recommandations DIY**                       | Recettes/solutions maison pour remplacer produits industriels            | Économies + réduction produits chimiques                    |
| **MVP**  | **Guide recyclage intelligent**               | Recherche par produit ou scan emballage pour savoir où le jeter          | Réduction des erreurs de tri                                |
| **MVP**  | **Défis écologiques gamifiés**                | Missions simples (valider par checkbox/photo) + points                   | Motivation continue                                         |
| **V2**   | **Comparateur produits**                      | Comparer impact écologique (CO₂, emballage, origine) entre deux produits | Consommation éclairée                                       |
| **V2**   | **Carte des points verts**                    | Localisation recycleries, composteurs, magasins vrac                     | Favoriser achats et gestes locaux                           |
| **V2**   | **Historique & suivi de progrès**             | Visualisation des efforts : CO₂ économisé, score vert                    | Engagement renforcé                                         |
| **V3**   | **Troc et échanges communautaires**           | Plateforme pour donner/échanger objets entre utilisateurs                | Favorise économie circulaire                                |
| **V3**   | **Recommandations locales & circuits courts** | Liste producteurs locaux, AMAP, coopératives                             | Réduction empreinte transport                               |
| **V3**   | **Analyse alimentation**                      | Détection produits ultra-transformés, alternatives plus saines           | Bénéfice santé + écologie                                   |

---

## 5. **Nouveaux Modules Fonctionnels (Idées complémentaires)**

* 📸 **Scan de code-barres produits** (même logique que Yuka mais pour écologie) → affichage impact environnemental.
* 🛍️ **Wishlist écoresponsable** → alternatives écologiques à des produits courants.
* ♻️ **Mode "Zéro Déchet"** → liste de courses optimisée pour limiter les emballages.
* 💧 **Simulateur d’impact** → montre la différence entre un comportement classique et un geste écologique.
* 🏅 **Défis collaboratifs avec collectivités** → classements par ville/quartier avec récompenses locales (bons d’achat, réduction sur transports).

---

## 6. **Base de Données Produits (Nécessaire pour OCR et Comparateur)**

### 📌 **Besoins identifiés :**

* Identification des produits via **texte OCR** ou **EAN code-barres**.
* Informations à stocker : nom, catégorie, origine, type emballage, score environnemental, alternatives proposées.

### 📌 **Sources possibles :**

* **Open Food Facts (OFF)** : base open source mondiale avec produits alimentaires (EAN, ingrédients, scores Nutri et Eco-Score).
* **Open Beauty Facts** : pour cosmétiques.
* **Crowdsourcing utilisateurs** : ajout manuel de produits non référencés.
* **Partenariats** : magasins bio, marques locales.

### 📌 **Approche :**

1. **MVP** → intégration **Open Food Facts** + enrichissement interne progressif.
2. **Phase 2** → création **base propriétaire** avec ajout utilisateurs + validation modérateurs.

---

## 7. **Architecture Fonctionnelle (vue simplifiée)**

* **Frontend** : SPA (React / Vue.js) mobile-first.
* **Backend** : API REST (Node.js / Express).
* **Base de données** : PostgreSQL + connecteur vers Open Food Facts.
* **OCR** : Tesseract.js (côté client) + pré-traitement serveur.
* **Stockage images** : S3 ou équivalent.
* **Notifications** : envoi via Firebase ou service email.

---

## 8. **Analyse des Risques**

| Risque                              | Impact | Mitigation                               |
| ----------------------------------- | ------ | ---------------------------------------- |
| OCR imprécis sur certains tickets   | Moyen  | Ajout validation manuelle utilisateur    |
| Base de données produits incomplète | Élevé  | Connexion OFF + crowdsourcing            |
| Adoption faible                     | Moyen  | Gamification + partenariats locaux       |
| RGPD et vie privée                  | Élevé  | Stockage minimal, consentement explicite |
| Maintenance contenu DIY             | Moyen  | Intégration wiki communautaire           |
