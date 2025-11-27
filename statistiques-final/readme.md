
# 🦾 NeonFit Stat - Documentation Technique & Design System

## 1. Philosophie du Design (The "Why")

NeonFit Stat n'est pas un simple dashboard ; c'est une interface de type **HUD (Heads-Up Display)** inspirée du style Cyberpunk/Sci-Fi. 

L'objectif visuel est de simuler un **équipement physique rétro-futuriste** (écrans OLED, jauges analogiques-numériques, châssis en carbone) tout en restant une application web fluide.

### Les Piliers Esthétiques :
1.  **Noir Profond & Contrastes** : Nous n'utilisons pas simplement `black`. Nous utilisons des nuances précises :
    *   `#010101` (Fond global)
    *   `#050505` (Headers des cartes)
    *   `#020202` (Corps des cartes)
    *   `#080808` (Footers)
2.  **Lumière & Néon** : Les couleurs ne sont pas plates. Elles doivent "émettre" de la lumière via des ombres portées (`box-shadow` ou `drop-shadow` en CSS).
    *   Cyan (`#22d3ee`) : État nominal / Info.
    *   Amber (`#f59e0b`) : Optimisation / Gold standard.
    *   Red (`#ef4444`) : Alerte / Intense.
3.  **Contenant Technique** : Chaque composant est encapsulé dans une "Coque" (Shell) avec des bordures très fines (`border-white/10`) pour imiter des jointures de panneaux métalliques.

---

## 2. Intégration & Data Flow (IMPORTANT)

Cette application de statistiques est construite en React mais conçue pour s'intégrer dans un environnement Vanilla JS existant via le fichier `stats.html`.

### Comment envoyer des données à la page stats ?

La page écoute les changements dans le `localStorage` du navigateur. Voici comment mettre à jour les jauges depuis votre application principale :

```javascript
// Dans votre app Vanilla JS (quand un exercice est fini)
function updateStats(newScore, newVolume, newSets) {
    const statsData = {
        score: newScore,     // 0-100
        volume: newVolume,   // en kg
        sets: newSets,       // nombre total
        sessions: 4          // nombre de séances
    };

    // 1. Sauvegarder dans le storage
    localStorage.setItem('NEONFIT_DATA', JSON.stringify(statsData));

    // 2. (Optionnel) Si la page stats est ouverte dans un autre onglet, 
    // elle se mettra à jour automatiquement.
}
```

### Structure du fichier `stats.html`
C'est un fichier "Standalone". Il ne nécessite **aucun serveur de build** (pas de `npm run build`).
*   Il charge React, ReactDOM et Babel depuis des CDN (`esm.sh`, `unpkg`).
*   Il compile le code React à la volée dans le navigateur.
*   Il contient TOUS les composants (NeonTracker, VolumeGauge, etc.) à l'intérieur de la balise `<script>`.

---

## 3. Architecture Technique

### Stack
*   **React 19** : Pour la gestion d'état et le cycle de vie des composants.
*   **Tailwind CSS** : Pour le styling utilitaire rapide.
*   **HTML5 Canvas** : Pour les jauges complexes (NeonTracker, VolumeGauge) nécessitant 60fps sans surcharge du DOM.
*   **SVG** : Pour les graphiques vectoriels interactifs (Radar Chart, Turbine, Courbes).

### Typographie
Le choix des polices est critique pour l'effet HUD :
*   **Orbitron** (`font-display`) : Titres, gros chiffres, jauges. Aspect futuriste.
*   **JetBrains Mono** (`font-mono`) : Labels techniques, petits détails, données brutes.
*   **Inter** (`font-sans`) : Texte de lecture standard (rarement utilisé).

---

## 4. Analyse Détaillée des Composants

### A. NeonTracker
**Type** : Canvas 2D
**Fonctionnement** : C'est le cœur du système. Il utilise un `<canvas>` pour dessiner des arcs concentriques.
*   **Logique** : Utilise `requestAnimationFrame` pour interpoler les valeurs (Lerp) afin que les jauges se remplissent avec fluidité.

### B. VolumeGauge
**Type** : Canvas 2D
**Particularité** : L'aiguille physique.
*   **Physique** : Contrairement à une animation CSS linéaire, l'aiguille utilise une fonction d'amortissement (Damping) pour avoir un mouvement organique.

### C. MuscleHud
**Type** : SVG Interactif (Radar Chart)
**Mathématiques** : Utilise la trigonométrie pour placer les points sur un cercle.
*   **Style Harmonisé** : Cadre gris (`border-white/10`), fond noir, pas de halo bleu externe pour respecter la charte.

---

## 5. Comment créer un nouveau composant ?

Si vous devez créer un nouveau composant (ex: "Sleep Analysis"), suivez strictement ce **Template d'Anatomie** pour garantir l'harmonie :

```tsx
export const NewComponent = () => {
  return (
    // 1. LE CONTENEUR (Shell)
    // Toujours : bg-black, border-white/10, rounded-3xl, overflow-hidden
    <div className="relative w-full bg-black border-[2px] border-white/10 rounded-3xl flex flex-col overflow-hidden group">
      
      {/* 2. LE HEADER */}
      {/* Toujours : bg-[#050505], border-b border-white/10 */}
      <div className="bg-[#050505] px-6 py-4 border-b border-white/10 flex justify-between">
         {/* Titre avec icône et sous-titre mono */}
      </div>

      {/* 3. LE CORPS (Body) */}
      {/* Toujours : bg-[#020202] */}
      <div className="flex-1 bg-[#020202] p-6 relative">
         {/* Votre contenu (Canvas, SVG, etc.) */}
      </div>

      {/* 4. LE FOOTER */}
      {/* Toujours : bg-[#080808], border-t border-white/10 */}
      <div className="bg-[#080808] border-t border-white/10">
         {/* Stats secondaires */}
      </div>
    </div>
  )
}
```
