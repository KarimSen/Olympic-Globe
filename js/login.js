var champEmail       = document.getElementById('champ-email');
var champMotdepasse  = document.getElementById('champ-mdp');
var erreurEmail      = document.getElementById('msg-erreur-email');
var erreurMotdepasse = document.getElementById('msg-erreur-mdp');
var boutonConnexion  = document.getElementById('btn-connexion');
var formulaireConnexion = document.getElementById('form-connexion');
var messageSucces    = document.getElementById('bloc-succes');

function emailValide(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function afficherErreur(champ, elementErreur, message) {
  elementErreur.textContent = message;
  champ.style.borderColor = '#e05555';
}

function effacerErreur(champ, elementErreur) {
  elementErreur.textContent = '';
  champ.style.borderColor = '';
}

champEmail.addEventListener('input', function () {
  effacerErreur(champEmail, erreurEmail);
});

champMotdepasse.addEventListener('input', function () {
  effacerErreur(champMotdepasse, erreurMotdepasse);
});

function verifierIdentifiants(email, motdepasse) {
  // Récupérer les comptes enregistrés lors de l'inscription
  var comptes = JSON.parse(localStorage.getItem('comptes_utilisateurs') || '[]');
  return comptes.some(function (compte) {
    return compte.email === email.toLowerCase() && compte.motdepasse === motdepasse;
  });
}

function validerFormulaire() {
  var ok = true;

  if (champEmail.value.trim() === '') {
    afficherErreur(champEmail, erreurEmail, 'Veuillez entrer votre e-mail.');
    ok = false;
  } else if (!emailValide(champEmail.value.trim())) {
    afficherErreur(champEmail, erreurEmail, "L'adresse e-mail n'est pas valide.");
    ok = false;
  }

  if (champMotdepasse.value === '') {
    afficherErreur(champMotdepasse, erreurMotdepasse, 'Veuillez entrer votre mot de passe.');
    ok = false;
  } else if (champMotdepasse.value.length < 6) {
    afficherErreur(champMotdepasse, erreurMotdepasse, 'Minimum 6 caractères.');
    ok = false;
  }

  return ok;
}

boutonConnexion.addEventListener('click', function () {
  if (!validerFormulaire()) return;

  boutonConnexion.disabled = true;
  boutonConnexion.querySelector('.texte-bouton').textContent = 'Connexion...';

  setTimeout(function () {
    var emailSaisi = champEmail.value.trim();
    var mdpSaisi   = champMotdepasse.value;

    // Vérification des identifiants
    if (!verifierIdentifiants(emailSaisi, mdpSaisi)) {
      // Identifiants incorrects : afficher erreur
      boutonConnexion.disabled = false;
      boutonConnexion.querySelector('.texte-bouton').textContent = 'Se connecter';
      afficherErreur(champEmail, erreurEmail, 'E-mail ou mot de passe incorrect.');
      afficherErreur(champMotdepasse, erreurMotdepasse, 'Vérifiez vos identifiants.');
      return;
    }

    // Identifiants corrects : afficher succès et rediriger
    formulaireConnexion.style.opacity = '0';
    formulaireConnexion.style.transition = 'opacity 0.3s';

    setTimeout(function () {
      formulaireConnexion.style.display = 'none';
      messageSucces.style.display = 'flex';

      setTimeout(function () {
        sessionStorage.setItem('connecte', 'true');
        window.location.replace('../index.html');
      }, 1200);
    }, 300);
  }, 800);
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    boutonConnexion.click();
  }
});

// ===== ANIMATION ETOILES =====
(function () {
  var canvasEtoiles = document.getElementById('canvas-etoiles');
  var contexte = canvasEtoiles.getContext('2d');
  var largeur, hauteur, listeEtoiles = [];

  function redimensionner() {
    largeur = canvasEtoiles.width = window.innerWidth;
    hauteur = canvasEtoiles.height = window.innerHeight;
    creerEtoiles();
  }

  function creerEtoiles() {
    listeEtoiles = Array.from({ length: 200 }, function () {
      return {
        x: Math.random() * largeur,
        y: Math.random() * hauteur,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random(),
        da: (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      };
    });
  }

  function dessiner() {
    contexte.clearRect(0, 0, largeur, hauteur);
    listeEtoiles.forEach(function (etoile) {
      etoile.a = Math.max(0.05, Math.min(1, etoile.a + etoile.da));
      if (etoile.a <= 0.05 || etoile.a >= 1) etoile.da *= -1;
      contexte.beginPath();
      contexte.arc(etoile.x, etoile.y, etoile.r, 0, Math.PI * 2);
      contexte.fillStyle = 'rgba(240, 238, 234, ' + etoile.a + ')';
      contexte.fill();
    });
    requestAnimationFrame(dessiner);
  }

  window.addEventListener('resize', redimensionner);
  redimensionner();
  dessiner();
})();

// ===== AFFICHER/MASQUER MOT DE PASSE =====
(function () {
  var boutonOeil = document.getElementById('btn-afficher-mdp');
  var champMdp = document.getElementById('champ-mdp');
  if (!boutonOeil || !champMdp) return;

  var iconeOuvert = '<svg viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="10" rx="7.5" ry="4.5" stroke="currentColor" stroke-width="1.3"/><circle cx="10" cy="10" r="2" fill="currentColor"/></svg>';
  var iconeFerme = '<svg viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M8.5 8.7a2 2 0 0 0 2.8 2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5.3 6.2C3.9 7.2 2.8 8.5 2.5 10c.9 4 4.6 6.5 7.5 6.5 1.4 0 2.8-.5 4-1.3M8 4.1C8.6 4 9.3 4 10 4c2.9 0 6.6 2.5 7.5 6.5-.3 1.4-1 2.6-2 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

  boutonOeil.addEventListener('click', function () {
    var estCache = champMdp.type === 'password';
    champMdp.type = estCache ? 'text' : 'password';
    boutonOeil.innerHTML = estCache ? iconeFerme : iconeOuvert;
  });
})();
