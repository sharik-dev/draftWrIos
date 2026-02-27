
# **Wild Rift Draft Tool – AI-Based**

## **Description du projet**

Ce projet vise à créer un **outil de draft pour Wild Rift** capable de recommander les meilleurs champions à chaque phase de draft. Contrairement aux outils traditionnels basés sur la méta ou les winrates, cet outil se concentre sur les **kits intrinsèques des champions**, leurs **synergies** et les **counters connus par kit**. L’objectif est de fournir des recommandations **explicables**, **robustes aux patchs**, et utiles même pour des joueurs souhaitant apprendre les interactions entre champions.

---

## **Objectifs principaux**

1. Construire un **moteur de draft** basé sur les caractéristiques des champions (tags de kit).
2. Implémenter un système de **synergies de kit** et de **counters de kit** pour guider les picks.
3. Ajouter un filtre de **viabilité par rôle / lane**, afin que l’outil ne recommande pas un champion hors de ses lanes viables.
4. Fournir un système **explicable**, avec une justification pour chaque recommandation (ex : “pick recommandé pour engage fiable + AoE CC”).
5. (Optionnel) Ajouter un ajustement basé sur des **tier lists RAG** pour départager des picks équivalents.

---

## **Données nécessaires (datasets)**

1. **Champion kits**
   * Tags de kit : engage, burst, poke, mobility, sustain, peel, AoE, etc.
   * Scaling : early / mid / late
   * Type de dégâts : AD / AP / mixed
2. **Synergies de kit**
   * Combinaisons de tags et score de synergie
3. **Counters de kit**
   * Combinaisons de tags counter et score de counter
4. **Viabilité par lane / rôle**
   * Score de viabilité par champion et rôle (0–1 ou 0–10)
   * Facteurs optionnels pour jungle : clear, sustain, gank, objectif
5. **Optional : Tier list RAG**
   * Score faible pour ajuster légèrement le ranking

---

## **Étapes du projet**

### **Phase 1 – Planification & conception**

* Définir les **tags de kit** à utiliser (20–30 max)
* **Identifier les ****synergies universelles**
* **Identifier les ****counters universels**
* Définir les rôles / lanes et les scores de viabilité

### **Phase 2 – Création des datasets**

* Construire un **dataset initial JSON** pour 10–30 champions
* Inclure :
  * Tags de kit
  * Synergies
  * Counters
  * Viabilité par lane

### **Phase 3 – Développement du moteur de draft**

* **Implémenter le ****filtre de viabilité par lane**
* Calculer le **score de synergie** pour l’équipe
* Calculer le **score de counter** contre l’équipe ennemie
* Combiner les scores pour générer **la recommandation finale**
* Ajouter un **système d’explications** pour chaque pick

### **Phase 4 – Interface utilisateur (MVP)**

* UI simple pour :
  * Sélection de champions / bans ennemis
  * Affichage des recommandations
  * Affichage des explications

### **Phase 5 – Test & itérations**

* Tester avec les champions du dataset initial
* Vérifier cohérence des recommandations
* Ajuster scores et règles si nécessaire

### **Phase 6 – Extension (optionnel)**

* Ajouter tous les champions Wild Rift
* Ajouter RAG / tier lists pour départager les picks
* Ajouter un moteur IA pour simulation avancée

---

## **Technologies suggérées**

* **Backend / moteur de draft** : Python (FastAPI ou simple script)
* **Frontend** : React
* **Données** : JSON ou SQLite pour commencer, PostgreSQL si extension
* **Optional IA** : PyTorch / TensorFlow
