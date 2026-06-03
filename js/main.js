/* ════════════════════════════════════════════════════════════
   js/main.js  —  Globe 3D interactif avec Three.js
   
   Structure du code :
   1. Données des villes hôtes
   2. Initialisation de la scène Three.js
   3. Création des étoiles (fond spatial)
   4. Création de la Terre (sphère + texture)
   5. Atmosphère (halo lumineux)
   6. Création des marqueurs des villes
   7. Éclairage
   8. Gestion de la souris (rotation, hover, clic)
   9. Boucle d'animation
   10. Transition vers une page
   ════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   1. DONNÉES DES VILLES HÔTES (4 dernières éditions)
   ══════════════════════════════════════════════════════════ */

const OLYMPIC_CITIES = [
  {
    name:    'Paris',
    country: 'France',
    year:    2024,
    edition: 'JO de Paris 2024',
    lat:     48.8566,
    lon:     2.3522,
    page:    'pages/paris-2024.html',
    color:   0x3a86ff,      // bleu vif
    glowHex: '#3a86ff',
    flag:    '🇫🇷'
  },
  {
    name:    'Tokyo',
    country: 'Japon',
    year:    2020,
    edition: 'JO de Tokyo 2020',
    lat:     35.6762,
    lon:     139.6503,
    page:    'pages/tokyo-2020.html',
    color:   0xff4d6d,      // rouge carmin
    glowHex: '#ff4d6d',
    flag:    '🇯🇵'
  },
  {
    name:    'Rio de Janeiro',
    country: 'Brésil',
    year:    2016,
    edition: 'JO de Rio 2016',
    lat:     -22.9068,
    lon:     -43.1729,
    page:    'pages/rio-2016.html',
    color:   0x38d996,      // vert émeraude
    glowHex: '#38d996',
    flag:    '🇧🇷'
  },
  {
    name:    'Londres',
    country: 'Royaume-Uni',
    year:    2012,
    edition: 'JO de Londres 2012',
    lat:     51.5074,
    lon:    -0.1278,
    page:    'pages/london-2012.html',
    color:   0xffbe0b,      // or
    glowHex: '#ffbe0b',
    flag:    '🇬🇧'
  }
];

/* ══════════════════════════════════════════════════════════
   2. INITIALISATION DE LA SCÈNE THREE.JS
   ══════════════════════════════════════════════════════════ */

const canvas   = document.getElementById('globe-canvas');
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0); // fond transparent (la couleur est dans le CSS)

// Position initiale de la caméra
camera.position.set(0, 0, 5.2);
camera.lookAt(0, 0, 0);

// Groupe principal : la Terre et les marqueurs tournent ensemble
const earthGroup = new THREE.Group();
scene.add(earthGroup);

const EARTH_RADIUS = 2; // rayon de la sphère en "unités 3D"

/* ══════════════════════════════════════════════════════════
   3. CRÉATION DES ÉTOILES (fond spatial)
   ══════════════════════════════════════════════════════════ */

function createStarfield() {
  const starCount  = 3500;
  const positions  = new Float32Array(starCount * 3);
  const sizes      = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Positions aléatoires sur une grande sphère autour de la scène
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 50 + Math.random() * 200;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = Math.random() * 1.5 + 0.3;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

  const mat = new THREE.PointsMaterial({
    color:        0xffffff,
    size:         0.08,
    sizeAttenuation: true,
    transparent:  true,
    opacity:      0.8,
  });

  scene.add(new THREE.Points(geo, mat));
}

createStarfield();

/* ══════════════════════════════════════════════════════════
   4. CRÉATION DE LA TERRE (sphère avec texture)
   ══════════════════════════════════════════════════════════ */

// Texture chargée depuis GitHub de Three.js (accès CORS autorisé)
const TEXTURE_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/r160/examples/textures/land_ocean_ice_cloud_2048.jpg';

const textureLoader = new THREE.TextureLoader();
const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
let   earth;

// Matériau par défaut (si la texture ne charge pas)
const earthMaterial = new THREE.MeshPhongMaterial({
  color:    0x1a6fa8,
  specular: 0x333355,
  shininess: 15,
});

earth = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earth);

// Chargement de la texture (nécessite une connexion internet)
textureLoader.load(
  TEXTURE_URL,
  (texture) => {
    // Succès : on applique la texture
    earthMaterial.map      = texture;
    earthMaterial.color    = new THREE.Color(0xffffff);
    earthMaterial.needsUpdate = true;
  },
  undefined,
  (error) => {
    // Erreur : la sphère bleue reste visible
    console.warn('Texture non chargée — mode hors-ligne. La sphère bleue est utilisée.');
  }
);

/* ══════════════════════════════════════════════════════════
   5. ATMOSPHÈRE (halo lumineux bleu autour de la Terre)
   ══════════════════════════════════════════════════════════ */

// Shader custom : calcule l'intensité selon l'angle de la normale
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal     = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    // Plus l'angle est rasant (bord du globe), plus l'atmosphère est visible
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    intensity = max(0.0, intensity);
    gl_FragColor  = vec4(0.2, 0.5, 1.0, 1.0) * intensity;
  }
`;

const atmosphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(EARTH_RADIUS * 1.12, 64, 64),
  new THREE.ShaderMaterial({
    vertexShader:   atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending:       THREE.AdditiveBlending,
    side:           THREE.BackSide,  // rendu depuis l'intérieur vers l'extérieur
    transparent:    true,
  })
);
// L'atmosphère ne fait pas partie de earthGroup car elle ne doit pas tourner
// (elle reste fixe autour de la Terre, mais avec le bon effet visuel)
earthGroup.add(atmosphereMesh);

/* ══════════════════════════════════════════════════════════
   FONCTION UTILITAIRE : conversion latitude/longitude → vecteur 3D
   ══════════════════════════════════════════════════════════ */

function latLonToVec3(lat, lon, radius) {
  const phi   = (90 - lat) * (Math.PI / 180); // latitude → angle polaire
  const theta = (lon + 180) * (Math.PI / 180); // longitude → angle azimutal

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ══════════════════════════════════════════════════════════
   6. CRÉATION DES MARQUEURS DES VILLES
   ══════════════════════════════════════════════════════════ */

const markerMeshes = []; // liste des sphères-marqueurs (pour le raycasting)

function createCityMarker(city) {
  // === Point central (petite sphère lumineuse) ===
  const dotGeo = new THREE.SphereGeometry(0.035, 16, 16);
  const dotMat = new THREE.MeshBasicMaterial({ color: city.color });
  const dot    = new THREE.Mesh(dotGeo, dotMat);

  // === Halo pulsant (grande sphère transparente) ===
  const haloGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color:       city.color,
    transparent: true,
    opacity:     0.35,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);

  // === Rayon lumineux (spike vers le haut) ===
  const spikeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.4, 6);
  const spikeMat = new THREE.MeshBasicMaterial({
    color:       city.color,
    transparent: true,
    opacity:     0.6,
  });
  const spike = new THREE.Mesh(spikeGeo, spikeMat);
  spike.position.y = 0.2; // décalage vers le haut

  // === Groupe du marqueur ===
  const group = new THREE.Group();
  group.add(dot);
  group.add(halo);
  group.add(spike);

  // Positionnement sur la surface de la Terre
  const pos = latLonToVec3(city.lat, city.lon, EARTH_RADIUS);
  group.position.copy(pos);

  // Le groupe doit "regarder" vers l'extérieur de la sphère
  group.lookAt(pos.clone().multiplyScalar(2));

  earthGroup.add(group);

  // On stocke la référence pour le raycasting et l'animation
  dot.userData = { city, halo, spike };
  markerMeshes.push(dot);

  return { dot, halo, spike };
}

// Création de tous les marqueurs
const markers = OLYMPIC_CITIES.map(city => ({
  city,
  ...createCityMarker(city)
}));

/* ══════════════════════════════════════════════════════════
   7. ÉCLAIRAGE
   ══════════════════════════════════════════════════════════ */

// Lumière ambiante (éclaire toute la scène de façon uniforme)
scene.add(new THREE.AmbientLight(0x223355, 1.5));

// Lumière directionnelle (simule le soleil)
const sunLight = new THREE.DirectionalLight(0xfff8e7, 2.0);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

// Faible lumière de remplissage (pour éviter les zones totalement noires)
const fillLight = new THREE.DirectionalLight(0x1a3a6a, 0.4);
fillLight.position.set(-5, -3, -5);
scene.add(fillLight);

/* ══════════════════════════════════════════════════════════
   8. GESTION DE LA SOURIS (rotation, hover, clic)
   ══════════════════════════════════════════════════════════ */

// Variables de rotation
let isMouseDown   = false;
let mouseX        = 0, mouseY = 0;
let targetRotY    = 0, targetRotX = 0;
let currentRotY   = 0, currentRotX = 0;
let autoRotate    = true;
let autoRotTimer  = null;

// Variables d'état
let hoveredMarker = null;
let isTransitioning = false;

// Éléments DOM du tooltip
const tooltip    = document.getElementById('tooltip');
const ttCity     = document.getElementById('tt-city');
const ttYear     = document.getElementById('tt-year');
const ttFlag     = document.getElementById('tt-flag');

// Raycaster (pour détecter les clics / survols sur les marqueurs 3D)
const raycaster  = new THREE.Raycaster();
const mouse2d    = new THREE.Vector2();

// ── Événements souris ──────────────────────────────────────

canvas.addEventListener('mousedown', (e) => {
  if (isTransitioning) return;
  isMouseDown = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
  canvas.style.cursor = 'grabbing';

  // Arrêter l'auto-rotation quand l'utilisateur interagit
  autoRotate = false;
  if (autoRotTimer) clearTimeout(autoRotTimer);
});

window.addEventListener('mouseup', () => {
  if (!isMouseDown) return;
  isMouseDown = false;
  canvas.style.cursor = hoveredMarker ? 'pointer' : 'grab';

  // Reprendre l'auto-rotation après 3 secondes d'inactivité
  if (autoRotTimer) clearTimeout(autoRotTimer);
  autoRotTimer = setTimeout(() => { autoRotate = true; }, 3000);
});

window.addEventListener('mousemove', (e) => {
  if (isTransitioning) return;

  // ─ Rotation du globe si bouton maintenu ─
  if (isMouseDown) {
    const dx = e.clientX - mouseX;
    const dy = e.clientY - mouseY;
    targetRotY += dx * 0.007;
    targetRotX += dy * 0.004;
    // Limiter l'inclinaison verticale
    targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  // ─ Raycasting pour détecter les marqueurs sous la souris ─
  mouse2d.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse2d.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse2d, camera);

  const intersects = raycaster.intersectObjects(markerMeshes);

  if (intersects.length > 0) {
    const hit  = intersects[0].object;
    const city = hit.userData.city;

    if (hoveredMarker !== hit) {
      hoveredMarker = hit;
      // Afficher le tooltip
      ttCity.textContent = city.name;
      ttYear.textContent = 'Jeux Olympiques ' + city.year;
      ttFlag.textContent = city.flag;
      tooltip.classList.add('visible');
    }

    // Positionner le tooltip près du curseur
    tooltip.style.left = (e.clientX + 20) + 'px';
    tooltip.style.top  = (e.clientY - 20) + 'px';
    canvas.style.cursor = 'pointer';

  } else {
    if (hoveredMarker) {
      hoveredMarker = null;
      tooltip.classList.remove('visible');
    }
    if (!isMouseDown) canvas.style.cursor = 'grab';
  }
});

// ── Clic sur un marqueur ───────────────────────────────────

canvas.addEventListener('click', (e) => {
  if (isTransitioning || isMouseDown) return;

  mouse2d.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse2d.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse2d, camera);

  const intersects = raycaster.intersectObjects(markerMeshes);

  if (intersects.length > 0) {
    const city = intersects[0].object.userData.city;
    triggerTransition(e.clientX, e.clientY, city);
  }
});

// ── Redimensionnement de la fenêtre ───────────────────────

function updateCameraForScreen() {
  const w = window.innerWidth;
  // On mobile, zoom out to show full globe
  if (w <= 480) {
    camera.position.set(0, 0, 7.0);
  } else if (w <= 768) {
    camera.position.set(0, 0, 6.2);
  } else if (w <= 1024) {
    camera.position.set(0, 0, 5.6);
  } else {
    camera.position.set(0, 0, 5.2);
  }
}

updateCameraForScreen();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  updateCameraForScreen();
});

/* ══════════════════════════════════════════════════════════
   9. BOUCLE D'ANIMATION (appelée ~60 fois par seconde)
   ══════════════════════════════════════════════════════════ */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // ─ Auto-rotation douce du globe ─
  if (autoRotate) {
    targetRotY += 0.0015;
  }

  // ─ Interpolation (effet d'inertie) ─
  currentRotY += (targetRotY - currentRotY) * 0.08;
  currentRotX += (targetRotX - currentRotX) * 0.08;

  earthGroup.rotation.y = currentRotY;
  earthGroup.rotation.x = currentRotX;

  // ─ Animation des marqueurs (pulsation) ─
  markers.forEach((m, i) => {
    // Chaque marqueur pulse à sa propre fréquence
    const pulse  = Math.sin(elapsed * 2.2 + i * 1.4) * 0.5 + 0.5; // 0 → 1
    const scale  = 1 + pulse * 0.8;

    m.halo.scale.setScalar(scale);
    m.halo.material.opacity = 0.15 + pulse * 0.3;

    // Clignotement léger du spike
    m.spike.material.opacity = 0.3 + pulse * 0.5;
  });

  renderer.render(scene, camera);
}

/* ══════════════════════════════════════════════════════════
   10. TRANSITION VERS UNE PAGE VILLE
   ══════════════════════════════════════════════════════════ */

const overlay    = document.getElementById('transition-overlay');
const toCityName = document.getElementById('to-city-name');
const toYearName = document.getElementById('to-year-name');

function triggerTransition(screenX, screenY, city) {
  if (isTransitioning) return;
  isTransitioning = true;

  // Cacher le tooltip
  tooltip.classList.remove('visible');
  autoRotate = false;

  // Remplir le contenu de l'overlay
  toCityName.textContent = city.name;
  toYearName.textContent = 'Jeux Olympiques ' + city.year;

  // ─ Étape 1 : révélation circulaire depuis le point cliqué ─
  overlay.style.visibility  = 'visible';
  overlay.style.clipPath    = `circle(0% at ${screenX}px ${screenY}px)`;
  // Forcer un reflow pour que l'animation démarre depuis 0%
  overlay.offsetWidth;

  overlay.style.transition  = 'clip-path 0.75s cubic-bezier(0.76, 0, 0.24, 1)';
  overlay.style.clipPath    = `circle(150% at ${screenX}px ${screenY}px)`;

  // ─ Étape 2 : afficher le texte dans l'overlay ─
  setTimeout(() => {
    overlay.classList.add('active');
  }, 200);

  // ─ Étape 3 : naviguer vers la page de la ville ─
  setTimeout(() => {
    window.location.href = city.page;
  }, 1400);
}

/* ══════════════════════════════════════════════════════════
   DÉMARRAGE
   ══════════════════════════════════════════════════════════ */

// Lancer la boucle d'animation
animate();

// Masquer l'écran de chargement et afficher l'interface
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('navbar').classList.add('visible');
    document.getElementById('hero-text').classList.add('visible');
  }, 800);
});

// Curseur initial
canvas.style.cursor = 'grab';
