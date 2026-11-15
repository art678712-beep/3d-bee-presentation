// Optional 3D bee. Drop the model at assets/bee.glb (e.g. "The Honeybee", Kenny.Maguire.Studio, CC BY).
// If the file is absent, nothing happens and the photo-based scenes stay as they are.
const MODEL = 'assets/bee.glb';

async function exists(url) {
  try { const r = await fetch(url, { method: 'HEAD' }); return r.ok; } catch { return false; }
}

(async () => {
  if (!(await exists(MODEL))) return;
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/+esm');
  const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm');
  const { RoomEnvironment } = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js/+esm');

  const slot = document.querySelector('[data-bee-slot="hero"]');
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  slot.querySelector('img').style.opacity = '0';
  slot.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-2, 3, 2); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb14a, 3.0); rim.position.set(3, 1.5, -3); scene.add(rim);

  const gltf = await new GLTFLoader().loadAsync(MODEL);
  const bee = gltf.scene;
  const box = new THREE.Box3().setFromObject(bee), size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
  bee.position.sub(centre); bee.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
  const pivot = new THREE.Group(); pivot.add(bee); scene.add(pivot);
  const wings = []; bee.traverse(o => { if (/wing/i.test(o.name)) wings.push({ o, r: o.rotation.clone() }); });

  function resize() { const w = slot.clientWidth, h = slot.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  const hero = document.getElementById('s1');
  function tick(t) {
    const r = hero.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    if (r.bottom > 0) {
      pivot.rotation.y = -0.6 + p * 1.4; pivot.rotation.x = 0.15;
      camera.position.set(0, 0.1, 2.2 - p * 0.9); camera.lookAt(0, 0, 0);
      wings.forEach(({ o, r }, i) => { o.rotation.z = r.z + Math.sin(t / 18 + i) * 0.5; });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
