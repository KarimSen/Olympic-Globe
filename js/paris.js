/* ==========================================================================
   paris.js — Scripts interactifs de la page Paris 2024
   Auteur : Projet Web L2 Informatique
   
   Ce fichier gère :
   1. Le slider automatique de la section hero
   2. Le carrousel interactif des disciplines sportives
   ========================================================================== */


/* ==========================================================================
   1. SLIDER AUTOMATIQUE (section hero)
   
   Principe : on garde l'index de l'image actuellement affichée.
   Toutes les 3,5 secondes, on retire la classe "active" de l'image courante,
   on passe à la suivante, et on lui ajoute la classe "active".
   ========================================================================== */

var indexSlideActuel = 0;
var toutesLesSlides = document.querySelectorAll('.slide');

function afficherSlidesuivante() {
    // Si aucune slide n'existe, on arrête tout de suite
    if (toutesLesSlides.length === 0) return;

    // On retire la classe "active" de la slide actuellement visible
    toutesLesSlides[indexSlideActuel].classList.remove('active');

    // On calcule l'index de la prochaine slide (retour à 0 si on est à la fin)
    indexSlideActuel = (indexSlideActuel + 1) % toutesLesSlides.length;

    // On affiche la nouvelle slide
    toutesLesSlides[indexSlideActuel].classList.add('active');
}

// On démarre le défilement automatique seulement si des slides existent
if (toutesLesSlides.length > 0) {
    setInterval(afficherSlidesuivante, 3500);
}


/* ==========================================================================
   2. CARROUSEL INTERACTIF (section sports)
   
   Principe : on translate le "rail" de cartes vers la gauche ou la droite
   en fonction de l'index de la carte active. La formule est :
       déplacement = index * (largeur_carte + espace_entre_cartes)
   ========================================================================== */

var railCarrousel = document.querySelector('.carousel-track');
var boutonSuivant = document.querySelector('.next-btn');
var boutonPrecedent = document.querySelector('.prev-btn');

var indexCarteActive = 0;

/**
 * Met à jour la position du rail pour afficher la bonne carte.
 * Utilise la propriété CSS "transform: translateX()" pour glisser le rail.
 */
function mettreAJourCarrousel() {
    // Sécurité : si le rail n'existe pas, on ne fait rien
    if (!railCarrousel) return;

    var premiereCarte = document.querySelector('.sport-card');
    if (!premiereCarte) return;

    var largeurCarte = premiereCarte.offsetWidth;
    var espaceEntreCarte = 40; // doit correspondre au "gap" défini dans le CSS
    var deplacement = indexCarteActive * (largeurCarte + espaceEntreCarte);

    // On déplace le rail
    railCarrousel.style.transform = 'translateX(-' + deplacement + 'px)';
}

// On ajoute les écouteurs d'événements seulement si les boutons existent
if (railCarrousel && boutonSuivant && boutonPrecedent) {

    // Clic sur le bouton "Suivant" (flèche droite)
    boutonSuivant.addEventListener('click', function () {
        var nombreDeCartes = railCarrousel.children.length;
        var indexMaximal = nombreDeCartes - 1;

        // On n'avance que si on n'est pas déjà à la dernière carte
        if (indexCarteActive < indexMaximal) {
            indexCarteActive++;
            mettreAJourCarrousel();
        }
    });

    // Clic sur le bouton "Précédent" (flèche gauche)
    boutonPrecedent.addEventListener('click', function () {
        // On recule seulement si on n'est pas à la première carte
        if (indexCarteActive > 0) {
            indexCarteActive--;
            mettreAJourCarrousel();
        }
    });

    // Si l'utilisateur redimensionne la fenêtre, on recalcule la position
    // pour éviter un décalage visuel
    window.addEventListener('resize', mettreAJourCarrousel);
}

(function() {
        const markers    = document.querySelectorAll('.map-point');
        const mapContainer = document.querySelector('.paris-map-container');
        let activeTooltip  = null;
        let hideTimer      = null;

        function positionTooltip(tooltip, markerEl) {
          const containerRect = mapContainer.getBoundingClientRect();
          const markerRect    = markerEl.getBoundingClientRect();

          // Centre du marqueur relatif au container
          const cx = markerRect.left + markerRect.width  / 2 - containerRect.left;
          const cy = markerRect.top  + markerRect.height / 2 - containerRect.top;

          // Forcer le rendu pour avoir offsetHeight réel
          tooltip.style.visibility = 'hidden';
          tooltip.style.display    = 'block';
          const tw = tooltip.offsetWidth  || 320;
          const th = tooltip.offsetHeight || 230;
          tooltip.style.visibility = '';
          tooltip.style.display    = '';

          const gap = 18;
          let left = cx - tw / 2;
          let top  = cy - th - gap;   // par défaut : au-dessus

          // Si ça dépasse en haut → mettre en dessous
          if (top < 8) top = cy + gap + 18;

          // Bornes horizontales
          if (left < 8) left = 8;
          if (left + tw > containerRect.width - 8) left = containerRect.width - tw - 8;

          tooltip.style.left = left + 'px';
          tooltip.style.top  = top  + 'px';
        }

        function showTooltip(tooltip, marker) {
          clearTimeout(hideTimer);
          // Cacher tous les autres
          document.querySelectorAll('.venue-tooltip.visible').forEach(function(t) {
            if (t !== tooltip) t.classList.remove('visible');
          });
          positionTooltip(tooltip, marker);
          tooltip.classList.add('visible');
          activeTooltip = tooltip;
        }

        function scheduleHide(tooltip) {
          hideTimer = setTimeout(function() {
            tooltip.classList.remove('visible');
            if (activeTooltip === tooltip) activeTooltip = null;
          }, 120);  // petit délai pour laisser le curseur entrer dans le tooltip
        }

        markers.forEach(function(marker) {
          const venue   = marker.getAttribute('data-venue');
          const tooltip = document.getElementById('tooltip-' + venue);
          if (!tooltip) return;

          // Survol du marqueur
          marker.addEventListener('mouseenter', function() {
            showTooltip(tooltip, marker);
          });
          marker.addEventListener('mouseleave', function() {
            scheduleHide(tooltip);
          });

          // Survol du tooltip lui-même — annuler le masquage
          tooltip.addEventListener('mouseenter', function() {
            clearTimeout(hideTimer);
          });
          tooltip.addEventListener('mouseleave', function() {
            scheduleHide(tooltip);
          });

          // Tap mobile : toggle
          marker.addEventListener('click', function(e) {
            e.stopPropagation();
            if (tooltip.classList.contains('visible')) {
              tooltip.classList.remove('visible');
              activeTooltip = null;
            } else {
              showTooltip(tooltip, marker);
            }
          });
        });

        // Clic en dehors = fermer
        document.addEventListener('click', function() {
          document.querySelectorAll('.venue-tooltip.visible').forEach(function(t) {
            t.classList.remove('visible');
          });
          activeTooltip = null;
        });

        // Empêcher le clic dans le tooltip de fermer
        document.querySelectorAll('.venue-tooltip').forEach(function(t) {
          t.addEventListener('click', function(e) { e.stopPropagation(); });
        });
      })();


/* ==========================================================================
   3. CARTES D'ATHLÈTES — OUVERTURE / FERMETURE AU TAP (mobile)

   Sur PC, la carte de l'athlète s'agrandit au survol (géré en CSS).
   Mais sur un écran tactile, le survol "reste collé" : une fois ouverte,
   la carte ne se refermait jamais.
   On ajoute donc ici une ouverture au clic : on met (ou on enlève) la
   classe "ouvert" sur l'ancre de l'athlète. Taper une 2e fois la referme,
   et taper ailleurs sur la page la referme aussi.
   ========================================================================== */

(function () {
    // On récupère toutes les pastilles d'athlètes de la page
    var pastillesAthletes = document.querySelectorAll('.athlete-avatar');

    pastillesAthletes.forEach(function (pastille) {
        // L'ancre est le parent qui reçoit la classe "ouvert"
        var ancre = pastille.closest('.athlete-anchor');
        if (!ancre) return;

        pastille.addEventListener('click', function (evenement) {
            // On empêche ce clic de remonter jusqu'au document
            // (sinon il refermerait aussitôt la carte)
            evenement.stopPropagation();

            // Est-ce que cette carte est déjà ouverte ?
            var dejaOuverte = ancre.classList.contains('ouvert');

            // On ferme d'abord toutes les autres cartes ouvertes
            document.querySelectorAll('.athlete-anchor.ouvert').forEach(function (autre) {
                autre.classList.remove('ouvert');
            });

            // Si elle n'était pas ouverte, on l'ouvre ; sinon elle reste fermée
            if (!dejaOuverte) {
                ancre.classList.add('ouvert');
            }
        });
    });

    // Cliquer ailleurs sur la page referme la carte ouverte
    document.addEventListener('click', function () {
        document.querySelectorAll('.athlete-anchor.ouvert').forEach(function (ancre) {
            ancre.classList.remove('ouvert');
        });
    });
})();
