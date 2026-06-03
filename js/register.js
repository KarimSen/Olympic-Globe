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
  var champMdp = document.getElementById('password');
  if (!boutonOeil || !champMdp) return;

  var iconeOuvert = '<svg viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="10" rx="7.5" ry="4.5" stroke="currentColor" stroke-width="1.3"/><circle cx="10" cy="10" r="2" fill="currentColor"/></svg>';
  var iconeFerme = '<svg viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M8.5 8.7a2 2 0 0 0 2.8 2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5.3 6.2C3.9 7.2 2.8 8.5 2.5 10c.9 4 4.6 6.5 7.5 6.5 1.4 0 2.8-.5 4-1.3M8 4.1C8.6 4 9.3 4 10 4c2.9 0 6.6 2.5 7.5 6.5-.3 1.4-1 2.6-2 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

  boutonOeil.addEventListener('click', function () {
    var estCache = champMdp.type === 'password';
    champMdp.type = estCache ? 'text' : 'password';
    boutonOeil.innerHTML = estCache ? iconeFerme : iconeOuvert;
  });
})();

// ===== JAUGE FORCE MOT DE PASSE =====
(function () {
  var champMdp = document.getElementById('password');
  var barreForce = [
    document.getElementById('sb1'),
    document.getElementById('sb2'),
    document.getElementById('sb3'),
    document.getElementById('sb4'),
  ];

  function calculerForce(valeur) {
    var score = 0;
    if (valeur.length >= 8) score++;
    if (valeur.length >= 12) score++;
    if (/[A-Z]/.test(valeur) && /[a-z]/.test(valeur)) score++;
    if (/\d/.test(valeur)) score++;
    if (/[^A-Za-z0-9]/.test(valeur)) score++;
    return Math.min(4, score);
  }

  function mettreAJourBarres(force) {
    barreForce.forEach(function (barre, i) {
      barre.className = 'sb sb-' + (i + 1);
      if (i < force) barre.classList.add('active-' + force);
    });
  }

  if (champMdp) {
    champMdp.addEventListener('input', function () {
      mettreAJourBarres(champMdp.value ? calculerForce(champMdp.value) : 0);
    });
  }
})();

// ===== INSCRIPTION =====
(function () {
  var boutonSoumettre = document.getElementById('btn-inscription');
  var corpsFormulaire = document.getElementById('form-inscription');
  var ecranSucces = document.getElementById('ecran-succes');
  var nomSucces = document.getElementById('nom-succes');
  var piedFormulaire = document.querySelector('.pied-carte');

  var champs = {
    prenom:   { el: document.getElementById('prenom'),            err: document.getElementById('erreur-prenom') },
    nom:      { el: document.getElementById('nom'),               err: document.getElementById('erreur-nom') },
    email:    { el: document.getElementById('email'),             err: document.getElementById('erreur-email') },
    motdepasse: { el: document.getElementById('password'),        err: document.getElementById('erreur-mdp') },
    confirmation: { el: document.getElementById('confirm-password'), err: document.getElementById('erreur-confirmation') },
    conditions: { el: document.getElementById('conditions'),      err: document.getElementById('erreur-conditions') },
  };

  function afficherErreur(cle, message) {
    var f = champs[cle];
    f.err.textContent = message;
    if (f.el.type !== 'checkbox') f.el.classList.toggle('is-error', !!message);
  }

  function emailValide(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function validerTout() {
    var ok = true;

    if (!champs.prenom.el.value.trim()) {
      afficherErreur('prenom', 'Le prénom est requis.'); ok = false;
    } else { afficherErreur('prenom', ''); }

    if (!champs.nom.el.value.trim()) {
      afficherErreur('nom', 'Le nom est requis.'); ok = false;
    } else { afficherErreur('nom', ''); }

    if (!champs.email.el.value.trim()) {
      afficherErreur('email', "L'e-mail est requis."); ok = false;
    } else if (!emailValide(champs.email.el.value)) {
      afficherErreur('email', 'Adresse e-mail invalide.'); ok = false;
    } else { afficherErreur('email', ''); }

    if (!champs.motdepasse.el.value) {
      afficherErreur('motdepasse', 'Le mot de passe est requis.'); ok = false;
    } else if (champs.motdepasse.el.value.length < 8) {
      afficherErreur('motdepasse', 'Minimum 8 caractères.'); ok = false;
    } else { afficherErreur('motdepasse', ''); }

    if (!champs.confirmation.el.value) {
      afficherErreur('confirmation', 'Veuillez confirmer le mot de passe.'); ok = false;
    } else if (champs.confirmation.el.value !== champs.motdepasse.el.value) {
      afficherErreur('confirmation', 'Les mots de passe ne correspondent pas.'); ok = false;
    } else { afficherErreur('confirmation', ''); }

    if (!champs.conditions.el.checked) {
      afficherErreur('conditions', 'Vous devez accepter les conditions.'); ok = false;
    } else { afficherErreur('conditions', ''); }

    return ok;
  }

  Object.keys(champs).forEach(function (cle) {
    var f = champs[cle];
    var typeEvenement = f.el.type === 'checkbox' ? 'change' : 'input';
    f.el.addEventListener(typeEvenement, function () { afficherErreur(cle, ''); });
  });

  boutonSoumettre.addEventListener('click', function () {
    if (!validerTout()) return;

    boutonSoumettre.disabled = true;
    boutonSoumettre.querySelector('.texte-bouton').textContent = 'Création…';

    // Sauvegarder le compte dans localStorage
    var comptesExistants = JSON.parse(localStorage.getItem('comptes_utilisateurs') || '[]');
    var nouveauCompte = {
      prenom: champs.prenom.el.value.trim(),
      nom: champs.nom.el.value.trim(),
      email: champs.email.el.value.trim().toLowerCase(),
      motdepasse: champs.motdepasse.el.value
    };
    comptesExistants.push(nouveauCompte);
    localStorage.setItem('comptes_utilisateurs', JSON.stringify(comptesExistants));

    setTimeout(function () {
      var prenomSaisi = champs.prenom.el.value.trim();
      corpsFormulaire.style.transition = 'opacity 0.3s ease';
      corpsFormulaire.style.opacity = '0';

      setTimeout(function () {
        corpsFormulaire.style.display = 'none';
        if (piedFormulaire) piedFormulaire.style.display = 'none';
        nomSucces.textContent = prenomSaisi;
        ecranSucces.classList.add('visible');

        setTimeout(function () {
          window.location.href = '../index.html';
        }, 2000);
      }, 300);
    }, 900);
  });
})();
