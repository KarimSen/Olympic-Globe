/* ==========================================================================
   index.js — Scripts de la page d'accueil (index.html)
   Auteur : Projet Web L2 Informatique
   
   Ce fichier gère :
   1. Le bouton de déconnexion
   2. Le formulaire d'inscription à la newsletter
   3. La navigation fluide (smooth scroll) via les liens de la navbar
   4. La flèche de défilement vers le bas
   5. L'affichage de l'indication du globe après chargement
   ========================================================================== */


/* ==========================================================================
   1. BOUTON DÉCONNEXION
   
   On supprime la clé "connecte" du sessionStorage, ce qui déclenchera
   la redirection vers la page de connexion au prochain chargement.
   ========================================================================== */

var boutonDeconnexion = document.getElementById('bouton-deconnexion');

if (boutonDeconnexion) {
    boutonDeconnexion.addEventListener('click', function () {
        // Supprimer la session de l'utilisateur
        sessionStorage.removeItem('connecte');
        // Rediriger vers la page de connexion
        window.location.replace('pages/login.html');
    });
}


/* ==========================================================================
   2. FORMULAIRE NEWSLETTER
   
   Vérifie que l'e-mail saisi est valide avant de "l'inscrire" (simulation).
   On utilise une expression régulière (regex) pour valider le format.
   ========================================================================== */

var boutonNewsletter       = document.getElementById('bouton-newsletter');
var champEmailNewsletter   = document.getElementById('champ-email-newsletter');
var messageNewsletter      = document.getElementById('message-newsletter');

// Expression régulière pour valider un format d'e-mail
var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (boutonNewsletter) {
    boutonNewsletter.addEventListener('click', function () {
        var emailSaisi = champEmailNewsletter.value.trim();

        // Vérification 1 : le champ ne doit pas être vide
        if (emailSaisi === '') {
            messageNewsletter.style.color = '#e05555';
            messageNewsletter.textContent = 'Veuillez entrer votre adresse e-mail.';
            return;
        }

        // Vérification 2 : le format de l'e-mail doit être valide
        if (!regexEmail.test(emailSaisi)) {
            messageNewsletter.style.color = '#e05555';
            messageNewsletter.textContent = 'Adresse e-mail invalide.';
            return;
        }

        // Si tout est bon : on sauvegarde et on affiche un message de succès
        localStorage.setItem('newsletter_email', emailSaisi);

        messageNewsletter.style.color = '#4caf7d';
        messageNewsletter.textContent = '✓ Inscription réussie ! Merci de rejoindre la communauté.';

        // On réinitialise le champ et on désactive le bouton pour éviter le double envoi
        champEmailNewsletter.value = '';
        boutonNewsletter.disabled = true;
        boutonNewsletter.style.opacity = '0.5';
    });
}


/* ==========================================================================
   3. NAVIGATION FLUIDE (smooth scroll)
   
   Quand l'utilisateur clique sur un lien de la navbar, au lieu de sauter
   directement à la section, on fait défiler la page doucement.
   ========================================================================== */

var liensNavigation = document.querySelectorAll('.nav-lien');

liensNavigation.forEach(function (lien) {
    lien.addEventListener('click', function (evenement) {
        // On empêche le comportement par défaut du navigateur (saut immédiat)
        evenement.preventDefault();

        var idCible = lien.getAttribute('href'); // ex: "#section-apropos"
        var sectionCible = document.querySelector(idCible);

        if (sectionCible) {
            sectionCible.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


/* ==========================================================================
   4. FLÈCHE DE DÉFILEMENT VERS LE BAS
   
   La flèche affichée sur le hero permet de descendre vers le contenu.
   ========================================================================== */

var fleche = document.querySelector('.hero-fleche-bas');

if (fleche) {
    fleche.addEventListener('click', function (evenement) {
        evenement.preventDefault();
        var sectionApropos = document.getElementById('section-apropos');
        if (sectionApropos) {
            sectionApropos.scrollIntoView({ behavior: 'smooth' });
        }
    });
}


/* ==========================================================================
   5. AFFICHAGE DE L'INDICATION DU GLOBE
   
   Après 2 secondes, on affiche le texte "Glisser pour tourner" sous le globe.
   ========================================================================== */

window.addEventListener('load', function () {
    setTimeout(function () {
        var indicationGlobe = document.querySelector('.globe-hint');
        if (indicationGlobe) {
            indicationGlobe.classList.add('visible');
        }
    }, 2000);
});
