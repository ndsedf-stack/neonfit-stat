
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

## 2. Architecture Technique

### Stack
*   **React 19** : Pour la gestion d'état et le cycle de vie des composants.
*   **Tailwind CSS** : Pour le styling utilitaire rapide.
*   **HTML5 Canvas** : Pour les jauges complexes (NeonTracker, VolumeGauge) nécessitant 60fps sans surcharge du DOM.
*   **SVG** : Pour les graphiques vectoriels interactifs (Radar Chart, Turbine, Courbes).
*   **Lucide React** : Pour l'iconographie.

### Typographie
Le choix des polices est critique pour l'effet HUD :
*   **Orbitron** (`font-display`) : Titres, gros chiffres, jauges. Aspect futuriste.
*   **JetBrains Mono** (`font-mono`) : Labels techniques, petits détails, données brutes.
*   **Inter** (`font-sans`) : Texte de lecture standard (rarement utilisé).

---

## 3. Analyse Détaillée des Composants

### A. NeonTracker (`components/NeonTracker.tsx`)
**Type** : Canvas 2D
**Fonctionnement** :
C'est le cœur du système. Il utilise un `<canvas>` pour dessiner des arcs concentriques.
*   **Logique** : Utilise `requestAnimationFrame` pour interpoler les valeurs (Lerp) afin que les jauges se remplissent avec fluidité, simulée comme une aiguille physique.
*   **Couches (Layers)** :
    1.  *Chassis* : Un cercle avec un dégradé métallique.
    2.  *Face Carbone* : Un motif généré procéduralement (`createCarbonPattern`) qui dessine des micro-pixels pour imiter la fibre de carbone.
    3.  *Rings* : Des arcs de cercle (`ctx.arc`) avec des ombres portées (`ctx.shadowBlur`) pour l'effet néon.

### B. VolumeGauge (`components/VolumeGauge.tsx`)
**Type** : Canvas 2D
**Particularité** : L'aiguille physique.
*   **Physique** : Contrairement à une animation CSS linéaire, l'aiguille utilise une fonction d'amortissement (Damping) dans la boucle de rendu pour avoir un mouvement organique (accélération/décélération).
*   **Zone Optimale** : Dessinée dynamiquement selon les props `optimalMin` et `optimalMax`.

### C. MuscleHud (`components/MuscleHud.tsx`)
**Type** : SVG Interactif (Radar Chart)
**Mathématiques** :
*   Utilise la trigonométrie pour placer les points sur un cercle :
    `x = center + radius * cos(angle)`
    `y = center + radius * sin(angle)`
*   **Animation** : La prop `buildFactor` (0 à 1) multiplie le rayon lors du montage du composant pour donner l'impression que le graphique se "déploie" depuis le centre.

### D. MuscleWorkload (`components/MuscleWorkload.tsx`)
**Type** : SVG (Turbine)
**Logique** :
*   Chaque muscle est une "pale" de turbine.
*   La taille de la pale est proportionnelle au volume d'entraînement.
*   **SVG Paths** : Utilise une fonction `describeBlade` qui génère des chemins d'arc complexes (`d="M... A... L..."`).

### E. WeeklyProgress (`components/WeeklyProgress.tsx`)
**Type** : Hybride (SVG pour la ligne + HTML pour les badges)
**Style** :
*   La ligne lumineuse est un SVG avec un filtre `<feGaussianBlur>` pour créer le flou néon.
*   Le dégradé de la ligne est animé via CSS/SVG.

---

## 4. Guide des Animations

Les animations sont divisées en deux catégories :

### 1. Animations CSS (Tailwind config)
Utilisées pour les éléments d'interface (texte, apparition, rotation continue).
*   `animate-spin-slow` : Rotation lente (Turbines, ventilateurs).
*   `animate-scan` : Une ligne qui descend verticalement pour simuler un scan biométrique.
*   `animate-slideIn` : Apparition des cartes lors du démarrage.

### 2. Animations Javascript (Frame-based)
Utilisées dans les Canvas (`useEffect` + `requestAnimationFrame`).
*   **Pourquoi ?** Pour synchroniser parfaitement le dessin des jauges avec le taux de rafraîchissement de l'écran (60hz/120hz) et éviter les saccades.
*   **Lerp (Linear Interpolation)** : Formule utilisée partout :
    `valeurActuelle = valeurActuelle + (valeurCible - valeurActuelle) * 0.1`

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
         
         {/* Fond technique optionnel (Grille) */}
         <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none"></div>
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

## 6. Installation & Dépendances

Si vous devez réinstaller le projet ailleurs :

```json
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "latest",
  "clsx": "latest", // Optionnel, pour gérer les classes conditionnelles
  "tailwind-merge": "latest" // Optionnel
}
```

**Note sur Tailwind** : Dans ce projet spécifique, la configuration Tailwind est injectée via CDN dans `index.html`. Pour un projet de production, déplacez la configuration `tailwind.config` dans un fichier `tailwind.config.js`.

---

## 7. Résolution de problèmes courants

*   **Le Canvas est flou sur mobile** :
    Vérifiez la fonction `handleResize` dans les composants Canvas. Elle doit prendre en compte `window.devicePixelRatio`.
    `canvas.width = rect.width * dpr;`

*   **Les animations sont lentes** :
    Assurez-vous de ne pas avoir trop d'ombres portées (`box-shadow` ou `filter: drop-shadow`) sur de très grands éléments. Préférez les dégradés ou les opacités pour les effets de fond.

*   **L'alignement ne correspond pas** :
    Tous les composants utilisent `max-w-md` (max width medium) pour s'aligner sur une colonne centrale type "Mobile App".
