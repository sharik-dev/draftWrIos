# Wild Rift Drafting Tool - SwiftUI (Local Version)

Cette version est une traduction complète du projet React/Python en **SwiftUI Native**.

## Caractéristiques
- **100% Local** : Aucun backend requis. Toute la logique du `DraftEngine` a été traduite de Python vers Swift.
- **Performance** : Utilise les structures de données natives Swift pour une réactivité instantanée.
- **Design Premium** : Interface sombre avec accents dorés, adaptée à l'univers Wild Rift.
- **Zéro Dépendance** : Pas besoin de `fastapi`, `uvicorn` ou de serveurs distants.

## Structure du Projet
- `Engine/DraftEngine.swift` : Le cœur logique (moteur de recommandation).
- `Models/Models.swift` : Définitions des données (Champions, Synergies, Counters).
- `Models/DraftViewModel.swift` : Gestion de l'état de la draft.
- `Views/MainView.swift` : L'interface utilisateur complète.
- `Resources/` : Contient les fichiers JSON de données.

## Comment l'utiliser dans Xcode
1. Créez un nouveau projet **SwiftUI** dans Xcode.
2. Glissez les dossiers `Engine`, `Models`, `Views` et `Resources` dans votre projet.
3. Assurez-vous que les fichiers JSON dans `Resources` sont bien ajoutés à votre **Target** (Build Phase > Copy Bundle Resources).
4. Remplacez le contenu de votre fichier principal `@main` par celui de `DraftingApp.swift`.
5. Dans `DraftEngine.swift`, remplacez le chargement des fichiers par `Bundle.main.url(forResource: ...)` pour une utilisation en production.

## Note sur la traduction Python -> Swift
Le code Python original (`draft_engine.py`) a été fidèlement traduit. Les algorithmes de score, les synergies, les counters et les poids adaptatifs selon l'étape de la draft sont identiques à la version originale.
