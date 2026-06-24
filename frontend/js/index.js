// ─── CURSOR ───────────────────────────────────────────────
const cursor = document.getElementById('cursor');
let mx = 0, my = 0, cx = 0, cy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
document.addEventListener('mouseover', e => {
  if (e.target.closest('a, button, .product-card, .hero-cta, .color-swatch, .selector-btn, .carousel-btn, .wishlist-btn, .thumb, .review-card, .related-card-btn, .remove-btn, .checkout-btn, .continue-shop, .admin-sidebar li, .tab-btn, [onclick]')) {
    if (cursor) cursor.classList.add('hover');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('a, button, .product-card, .hero-cta, .color-swatch, .selector-btn, .carousel-btn, .wishlist-btn, .thumb, .review-card, .related-card-btn, .remove-btn, .checkout-btn, .continue-shop, .admin-sidebar li, .tab-btn, [onclick]')) {
    if (cursor) cursor.classList.remove('hover');
  }
});
(function animCursor() {
  cx += (mx - cx) * 0.15; cy += (my - cy) * 0.15;
  if(cursor) { cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; }
  requestAnimationFrame(animCursor);
})();

// ─── LOADER ───────────────────────────────────────────────
const loaderFill = document.getElementById('loader-fill');
const loaderPct = document.getElementById('loader-pct');
const loader = document.getElementById('loader');
let pct = 0;
if (loaderFill && loaderPct && loader) {
  const loaderInterval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 6 + 2, 100);
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = Math.floor(pct) + '%';
    if (pct >= 100) {
      clearInterval(loaderInterval);
      setTimeout(() => loader.classList.add('hidden'), 400);
    }
  }, 60);
}

// ─── SHARED SHOE GEOMETRY BUILDER ─────────────────────────
async function buildShoe(scene, color1 = 0xe8ff47, color2 = 0x111111, color3 = 0xffffff, modelPath) {
  const fallbackModel = 'assets/models/nike_air_zoom_pegasus_36.glb';
  const finalPath = modelPath || fallbackModel;
  
  // If it's a blob reference from IndexedDB, fetch and create local URL
  if (finalPath && finalPath.startsWith('blob:')) {
    const id = finalPath.split(':')[1];
    try {
      const file = await store.loadModel(id);
      if (file) {
        const blobUrl = URL.createObjectURL(file);
        return await new Promise((resolve) => {
          const loader = new THREE.GLTFLoader();
          loader.load(blobUrl, (gltf) => {
            const group = gltf.scene;
            normalizeShoe(group, scene);
            resolve(group);
          }, undefined, () => resolve(loadDefault(scene, fallbackModel)));
        });
      }
    } catch (e) { console.error('Model load fail', e); }
  }

  return loadDefault(scene, finalPath);
}

function normalizeShoe(group, scene) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3(); box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = (maxDim > 0) ? 2.5 / maxDim : 1; 
  group.scale.set(scaleFactor, scaleFactor, scaleFactor);
  const center = new THREE.Vector3(); box.getCenter(center);
  group.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);
  scene.add(group);
}

function loadDefault(scene, path) {
  return new Promise((resolve) => {
    const loader = new THREE.GLTFLoader();
    loader.load(path, (gltf) => {
      const group = gltf.scene;
      normalizeShoe(group, scene);
      resolve(group);
    }, undefined, (err) => {
      console.error('Error loading model:', path, err);
      const emptyGroup = new THREE.Group(); scene.add(emptyGroup); resolve(emptyGroup);
    });
  });
}

function canvasBox(canvas) {
  const wrap = canvas.parentElement || canvas;
  const w = Math.max(1, wrap.offsetWidth || canvas.clientWidth || window.innerWidth);
  const h = Math.max(1, wrap.offsetHeight || canvas.clientHeight || window.innerHeight);
  return { wrap, w, h, aspect: w / h };
}

function setRendererSize(renderer, camera, canvas) {
  const { w, h, aspect } = canvasBox(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  return { w, h, aspect };
}

function responsiveSceneScale(width, height, base = 1) {
  const shortest = Math.min(width, height);
  if (shortest < 360) return base * 0.82;
  if (shortest < 520) return base * 0.9;
  if (width / height < 0.75) return base * 0.94;
  if (width / height > 1.8) return base * 1.02;
  return base;
}

// ─── HERO SCENE ──────────────────────────────────────────
(async function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.5, 7);
  camera.lookAt(0, 0, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xe8ff47, 2.5);
  key.position.set(5, 8, 5); key.castShadow = true;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xff4d2e, 1.2);
  fill.position.set(-6, 2, -4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(0, 6, -6); scene.add(rim);

  // Ground plane
  const planeGeo = new THREE.PlaneGeometry(20, 20);
  const planeMat = new THREE.MeshStandardMaterial({ color: 0x0a0a08, roughness: 0.9 });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2; plane.position.y = -1.5;
  plane.receiveShadow = true; scene.add(plane);

  // Shadow ring under shoe
  const ringGeo = new THREE.CircleGeometry(2.5, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.set(1.0, -1.4, 0);
  scene.add(ring);

  const shoe = await buildShoe(scene, 0xe8ff47, 0x111111, 0xffffff);
  shoe.position.set(1.0, 0.2, 0);
  shoe.rotation.y = 0.5;
  shoe.scale.set(3,3,3);

  // Floating particles
  const partGeo = new THREE.BufferGeometry();
  const partCount = 200;
  const positions = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const partMat = new THREE.PointsMaterial({ color: 0xe8ff47, size: 0.04, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(partGeo, partMat));

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (w < 900) {
      camera.position.z = 7.5; // increase size
      shoe.position.x = 0;     // center align
      shoe.position.y = 0;
      ring.position.x = 0;     // center ring
    } else {
      camera.position.z = 7;
      shoe.position.x = 1.0;
      shoe.position.y = 0.2;
      ring.position.x = 1.0;
    }
  }
  resize();
  window.addEventListener('resize', resize);
  new ResizeObserver(resize).observe(canvas.parentElement || canvas);

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    shoe.rotation.y = 0.5 + mouseX * 0.3 + Math.sin(t) * 0.08;
    shoe.position.y = 0.2 + Math.sin(t * 0.8) * 0.12;
    renderer.render(scene, camera);
  })();
})();

// ─── PRODUCT CARD SCENES ─────────────────────────────────
const palettes = [
  [0xe8ff47, 0x1a1a00, 0xffffff],
  [0xff4d2e, 0x1a0800, 0xfff0ee],
  [0xc4b5e0, 0x1a0a2e, 0xffffff],
  [0x47ffe8, 0x001a1a, 0xffffff],
  [0xff47e8, 0x1a001a, 0xffffff],
];

async function initProductScenes() {
  const canvases = document.querySelectorAll('.product-canvas');
  for (let idx = 0; idx < canvases.length; idx++) {
    const canvas = canvases[idx];
    if (canvas.dataset.initialized) continue;
    canvas.dataset.initialized = 'true';

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0.8, 7);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(4, 6, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(palettes[idx % palettes.length][0], 1.5);
    fill.position.set(-5, 2, -3); scene.add(fill);

    const palette = palettes[idx % palettes.length];
    const modelPath = canvas.dataset.model || 'assets/models/nike_air_zoom_pegasus_36.glb';
    const shoe = await buildShoe(scene, palette[0], palette[1], palette[2], modelPath);
    shoe.rotation.y = -0.6 - idx * 0.2;

    const wrap = canvas.parentElement;
    let { w, h } = setRendererSize(renderer, camera, canvas);
    shoe.scale.setScalar(responsiveSceneScale(w, h, 1));
    camera.position.z = Math.min(8, Math.max(5.8, 7.2 - (w / h - 1) * 0.7));

    const ro = new ResizeObserver(() => {
      const size = setRendererSize(renderer, camera, canvas);
      w = size.w; h = size.h;
      shoe.scale.setScalar(responsiveSceneScale(w, h, 1));
      camera.position.z = Math.min(8, Math.max(5.8, 7.2 - (w / h - 1) * 0.7));
    });
    ro.observe(wrap);

    let hovered = false;
    wrap.parentElement.addEventListener('mouseenter', () => hovered = true);
    wrap.parentElement.addEventListener('mouseleave', () => hovered = false);

    let t = idx * 1.2;
    (function animate() {
      requestAnimationFrame(animate);
      t += 0.012;
      shoe.rotation.y += hovered ? 0.02 : 0.005;
      shoe.position.y = Math.sin(t) * 0.08;
      renderer.render(scene, camera);
    })();
  }
}

// Auto-init on load if canvases exist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductScenes);
} else {
  initProductScenes();
}

// ─── FEATURE SCENE ───────────────────────────────────────
(async function() {
  const canvas = document.getElementById('feature-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1, 7);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xff4d2e, 3.5);
  key.position.set(6, 8, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0x080808, 1);
  fill.position.set(-5, 2, -4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2);
  rim.position.set(0, 4, -5); scene.add(rim);

  const shoe = await buildShoe(scene, 0xff4d2e, 0x080808, 0xf0ece4);
  shoe.position.set(2, -0.3, 0);
  shoe.rotation.y = 0.8;
  shoe.scale.set(3, 3, 3);

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (w < 900) {
      camera.position.z = 8; // increase size
      shoe.position.x = 0;   // center align
      shoe.position.y = 0;
    } else {
      camera.position.z = 7;
      shoe.position.x = 2.0; // reset to 2.0 on desktop
      shoe.position.y = -0.3;
    }
  }
  resize(); window.addEventListener('resize', resize);

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    shoe.rotation.y = 0.8 - mouseX * 0.25 + Math.sin(t * 0.7) * 0.06;
    shoe.position.y = -0.3 + Math.sin(t) * 0.1;
    renderer.render(scene, camera);
  })();
})();

// ─── SCROLL ANIMATIONS ────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.style.opacity = '1', e.target.style.transform = 'translateY(0)';
  });
}, { threshold: 0.15 });

document.querySelectorAll('.product-card, .section-header').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  obs.observe(el);
});

