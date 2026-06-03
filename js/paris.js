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
