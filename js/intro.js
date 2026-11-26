// Intro v6: static image -> ~120k particles (Three.js + shaders) -> ASCII layer.
//
// 1. Every bright pixel of assets/scene.jpg becomes a particle that remembers
//    its home position and brightness.
// 2. Sand particles float along a curl-noise flow field (big regions turn
//    together, each grain has its own wobble). The two figures stay steady;
//    the left one (your digital twin) gets an RGB channel offset.
// 3. A post-processing pass overlays faint ASCII glyphs: bold strokes in
//    bright areas, fine dots in dark ones.
// 4. A sand storm sweeps across and covers everything -> pure white ->
//    sparse characters pop in one by one -> the terminal appears.
//
// Debug: ?intro&introT=3.0 renders a frozen frame at t = 3.0 s.

const IMG_W = 1814, IMG_H = 1044;
// Figure regions in image pixels (ellipses: cx, cy, rx, ry; rect: x0, y0, x1, y1)
const FIG_ELLIPSES = [[675, 440, 62, 190], [688, 282, 34, 36], [1050, 455, 82, 197], [1028, 292, 32, 36], [1112, 470, 28, 62]];
const FIG_RECT = [700, 298, 1000, 385];
const TWIN = [675, 400, 75, 230];       // left figure (gets the RGB treatment)
const FOCUS = [870, 470];               // image point kept near screen centre

// Timeline (s)
const T = { assemble: 1.3, float0: 0.6, storm0: 4.2, white: 5.7, chars0: 5.8, chars1: 7.3, end: 7.6 };

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec2 curl(vec2 p, float t){
  float e = .35;
  float a = snoise(vec3(p.x, p.y + e, t)) - snoise(vec3(p.x, p.y - e, t));
  float b = snoise(vec3(p.x + e, p.y, t)) - snoise(vec3(p.x - e, p.y, t));
  return vec2(a, -b) / (2. * e);
}`;

const POINT_VERT = /* glsl */ `
attribute vec2 aHome;
attribute float aLum;
attribute vec4 aSeed;
attribute float aFig;
uniform float uTime, uAssemble, uFloat, uStorm, uPx;
uniform vec4 uView;          // x0, y0, x1, y1 (image px)
varying float vL;
${NOISE}
void main(){
  float sand = 1. - aFig;
  vec2 p = aHome;
  // floating: flock-like flow field (large regions turn together) + per-grain wobble
  vec2 f = curl(p * .0035 + aSeed.zw * .15, uTime * .12);
  vec2 drift = f * 11. * uFloat * sand;
  drift += vec2(sin(uTime * 1.1 + aSeed.w * 6.283), cos(uTime * .9 + aSeed.z * 6.283)) * 1.6 * uFloat * sand;
  drift += vec2(7., -3.) * uFloat * sand * aSeed.z * aSeed.z;                    // light breeze
  drift += (aSeed.xy - .5) * (1. + 2. * uFloat * smoothstep(.2, .6, sand)); // edge shimmer
  vec2 pos = p + drift;
  vL = aLum;

  // storm: a wave of sand sweeps left -> right and fills the screen
  if (uStorm > 0.) {
    float across = (aHome.x - uView.x) / (uView.z - uView.x);
    float k = smoothstep(0., 1., uStorm * 1.8 - across * .8 - aSeed.x * .25);
    vec2 target = uView.xy + aSeed.yz * (uView.zw - uView.xy) + curl(aSeed.xw * 3., uTime * .4) * 90.;
    pos = mix(pos, target, k);
    vL = mix(aLum, .55 + .45 * aSeed.w, k);
  }
  // assemble: grains fly in from random places, each with its own delay
  vec2 scatter = uView.xy + aSeed.xy * (uView.zw - uView.xy);
  float a = smoothstep(aSeed.z * .5, aSeed.z * .5 + .5, uAssemble);
  pos = mix(scatter, pos, a);
  vL *= .25 + .75 * a;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.x, -pos.y, 0., 1.);
  float size = uPx * (.8 + 1.1 * aLum);
  size *= 1. + uStorm * uStorm * 9.;
  gl_PointSize = size;
}`;

const POINT_FRAG = /* glsl */ `
varying float vL;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .15, d);
  gl_FragColor = vec4(vec3(vL * a), 1.);
}`;

const POST_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

const POST_FRAG = /* glsl */ `
uniform sampler2D uScene, uGlyphs;
uniform vec2 uRes;
uniform float uCell, uAscii, uWhite, uTime;
uniform vec4 uTwin;          // twin ellipse in uv: cx, cy, rx, ry
varying vec2 vUv;
float L(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
void main(){
  vec3 c = texture2D(uScene, vUv).rgb;

  // RGB offset on the digital twin
  vec2 q = (vUv - uTwin.xy) / uTwin.zw;
  float tw = smoothstep(1., .6, length(q)) * (1. - uWhite);
  if (tw > 0.) {
    float off = 2. / uRes.x;
    float r = texture2D(uScene, vUv - vec2(off, 0.)).r;
    float b = texture2D(uScene, vUv + vec2(off, 0.)).b;
    // only the fringes get colour: red on one side, blue on the other, a hint of green inside
    vec3 fringe = vec3(max(r - c.r, 0.), 0., max(b - c.b, 0.));
    c = c * (1. - .18 * tw) + vec3(fringe.r * .55, c.g * .04, fringe.b * .7) * tw;
  }

  // ASCII layer: one glyph per cell, chosen by the cell's brightness
  vec2 px = vUv * uRes;
  vec2 cell = floor(px / vec2(uCell, uCell * 1.6));
  vec2 cuv = (cell + .5) * vec2(uCell, uCell * 1.6) / uRes;
  float o = uCell / uRes.x;
  float cl = (L(texture2D(uScene, cuv).rgb) + L(texture2D(uScene, cuv + vec2(o, 0.)).rgb) + L(texture2D(uScene, cuv - vec2(o, 0.)).rgb)) / 3.;
  cl = clamp(cl * 1.6, 0., 1.);
  float idx = floor(cl * 9.99);
  vec2 local = fract(px / vec2(uCell, uCell * 1.6));
  float g = texture2D(uGlyphs, vec2((idx + local.x) / 10., 1. - local.y)).r;
  c = max(c, vec3(g * cl * uAscii));

  c = mix(c, vec3(1.), uWhite);
  gl_FragColor = vec4(c, 1.);
}`;

function glyphAtlas(THREE) {
  const chars = " .:-=+*#%@";
  const cw = 24, ch = 38;
  const cv = document.createElement("canvas");
  cv.width = cw * chars.length; cv.height = ch;
  const g = cv.getContext("2d");
  g.fillStyle = "#000"; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = "#fff";
  g.font = `bold ${ch * 0.82}px ui-monospace, Menlo, Consolas, monospace`;
  g.textAlign = "center"; g.textBaseline = "middle";
  [...chars].forEach((c, i) => g.fillText(c, i * cw + cw / 2, ch / 2 + 2));
  const t = new THREE.CanvasTexture(cv);
  t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
  return t;
}

function inFigure(x, y) {
  let w = 0;
  for (const [cx, cy, rx, ry] of FIG_ELLIPSES) {
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
    w = Math.max(w, d < 0.75 ? 1 : d < 1.15 ? (1.15 - d) / 0.4 : 0);
  }
  const [x0, y0, x1, y1] = FIG_RECT;
  if (x > x0 && x < x1 && y > y0 && y < y1) w = Math.max(w, 1);
  return w;
}

async function buildParticles(url, maxCount) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const cv = document.createElement("canvas");
  cv.width = IMG_W; cv.height = IMG_H;
  const g = cv.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, IMG_W, IMG_H);
  const d = g.getImageData(0, 0, IMG_W, IMG_H).data;
  const stride = 2;
  const cand = [];
  for (let y = 0; y < IMG_H; y += stride) {
    for (let x = 0; x < IMG_W; x += stride) {
      let l = 0;   // brightest pixel in the stride block
      for (let yy = 0; yy < stride; yy++) for (let xx = 0; xx < stride; xx++) l = Math.max(l, d[((y + yy) * IMG_W + x + xx) * 4]);
      l /= 255;
      if (l > 0.16 && Math.random() < Math.min(1, l * 1.25)) cand.push(x + Math.random() * stride, y + Math.random() * stride, l);
    }
  }
  let n = cand.length / 3;
  const keep = Math.min(1, maxCount / n);
  const home = [], lum = [], seed = [], fig = [];
  for (let i = 0; i < n; i++) {
    if (keep < 1 && Math.random() > keep) continue;
    const x = cand[i * 3], y = cand[i * 3 + 1];
    home.push(x, y); lum.push(cand[i * 3 + 2]);
    seed.push(Math.random(), Math.random(), Math.random(), Math.random());
    fig.push(inFigure(x, y));
  }
  return { home: new Float32Array(home), lum: new Float32Array(lum), seed: new Float32Array(seed), fig: new Float32Array(fig), count: lum.length };
}

export function runIntro({ overlay, statusEl, textEl, skipBtn, labels = {}, config = {}, reveal }) {
  return new Promise(async (resolve) => {
    const params = new URLSearchParams(location.search);
    const freeze = parseFloat(params.get("introT"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let THREE;
    try { THREE = await import("../vendor/three.min.js"); } catch (e) { console.warn("three.js failed", e); resolve(); return; }

    overlay.hidden = false;
    statusEl.textContent = labels.sub || "";
    const narrow = innerWidth < 600;
    let P;
    try { P = await buildParticles(config.image || "assets/scene.jpg", narrow ? 70000 : 140000); }
    catch (e) { console.warn("intro image failed", e); overlay.hidden = true; resolve(); return; }

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" }); }
    catch (e) { console.warn("WebGL unavailable", e); overlay.hidden = true; resolve(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 1);
    const glEl = renderer.domElement;
    const chars = document.createElement("canvas");
    overlay.prepend(chars);
    overlay.prepend(glEl);
    const cctx = chars.getContext("2d");

    // particles
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(P.count * 3), 3));
    geo.setAttribute("aHome", new THREE.BufferAttribute(P.home, 2));
    geo.setAttribute("aLum", new THREE.BufferAttribute(P.lum, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(P.seed, 4));
    geo.setAttribute("aFig", new THREE.BufferAttribute(P.fig, 1));
    const pm = new THREE.ShaderMaterial({
      vertexShader: POINT_VERT, fragmentShader: POINT_FRAG,
      uniforms: { uTime: { value: 0 }, uAssemble: { value: 0 }, uFloat: { value: 0 }, uStorm: { value: 0 }, uPx: { value: 2 }, uView: { value: [0, 0, 1, 1] } },
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true,
    });
    const points = new THREE.Points(geo, pm);
    points.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(points);
    const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);

    // post pass
    const rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const post = new THREE.ShaderMaterial({
      vertexShader: POST_VERT, fragmentShader: POST_FRAG, depthTest: false, depthWrite: false,
      uniforms: { uScene: { value: rt.texture }, uGlyphs: { value: glyphAtlas(THREE) }, uRes: { value: new THREE.Vector2(1, 1) },
        uCell: { value: 8 }, uAscii: { value: 0.35 }, uWhite: { value: 0 }, uTime: { value: 0 }, uTwin: { value: [0, 0, 1, 1] } },
    });
    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let W, H, dpr, raf = 0, done = false, view = [0, 0, 1, 1];
    const resize = () => {
      W = overlay.clientWidth; H = overlay.clientHeight; dpr = renderer.getPixelRatio();
      renderer.setSize(W, H);
      rt.setSize(W * dpr, H * dpr);
      chars.width = W * dpr; chars.height = H * dpr;
      chars.style.width = W + "px"; chars.style.height = H + "px";
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      post.uniforms.uRes.value.set(W * dpr, H * dpr);
      post.uniforms.uCell.value = (W < 600 ? 6 : 8) * dpr;
    };
    resize();
    addEventListener("resize", resize);

    const finish = () => {
      if (done) return;
      done = true;
      // skipped early: still make sure the terminal gets laid out
      if (!requested && reveal) { requested = true; Promise.resolve(reveal()).catch(() => {}); }
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("keydown", finish);
      overlay.classList.add("fade-out");
      setTimeout(() => {
        renderer.dispose(); geo.dispose(); pm.dispose(); post.dispose(); rt.dispose();
        glEl.remove(); chars.remove();
        overlay.hidden = true;
        overlay.classList.remove("fade-out");
        textEl.classList.remove("show", "leaving");
        resolve();
      }, 500);
    };
    skipBtn.onclick = finish;
    addEventListener("keydown", finish);

    // White screen: characters pop in one by one exactly where the terminal's
    // real text sits (reveal() lays the terminal out underneath and returns the
    // position of every glyph), scramble briefly, then settle into the real text.
    const pool = "01<>/\\[]{}=+*#%@$&?!;:ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const rnd = () => pool[(Math.random() * pool.length) | 0];
    let targets = null, requested = false, strays = [];
    const prepareTargets = (glyphs) => {
      const span = T.chars1 - 0.3 - T.chars0;
      targets = glyphs.map((g) => ({ ...g, at: T.chars0 + Math.pow(Math.random(), 1.4) * span, scr: rnd() }));
      targets.sort((a, b) => (a.font < b.font ? -1 : 1));
      strays = Array.from({ length: Math.round(Math.min(90, W * H / 9000)) }, () => ({
        x: Math.random() * W, y: Math.random() * H, at: T.chars0 + Math.random() * 0.5, c: rnd(),
      }));
    };
    function drawChars(t) {
      cctx.clearRect(0, 0, W, H);
      if (!targets) return;
      cctx.textBaseline = "middle";
      // stray glyphs: appear first, fade away as the real text settles
      cctx.font = `${W < 600 ? 13 : 15}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      const fade = 1 - smooth(T.chars0 + 0.6, T.chars1 - 0.1, t);
      for (const s of strays) {
        if (t < s.at || fade <= 0) continue;
        if (Math.random() < 0.1) s.c = rnd();
        cctx.fillStyle = `rgba(30,30,30,${0.45 * fade})`;
        cctx.fillText(s.c, s.x, s.y);
      }
      let font = "";
      for (const g of targets) {
        if (t < g.at) continue;
        if (g.font !== font) { cctx.font = font = g.font; }
        const settling = t < g.at + 0.2;
        if (settling && Math.random() < 0.5) g.scr = rnd();
        cctx.fillStyle = settling ? "rgba(40,40,40,.55)" : g.color;
        cctx.fillText(settling ? g.scr : g.ch, g.x, g.y);
      }
    }

    function frame(t) {
      // camera: "cover" fit around FOCUS, slow push-in
      const zoom = 1 + 0.07 * smooth(0, T.storm0 + 1, t);
      const aspect = W / H;
      let vh = IMG_H / zoom, vw = vh * aspect;
      if (vw > IMG_W / zoom) { vw = IMG_W / zoom; vh = vw / aspect; }
      let x0 = Math.min(Math.max(FOCUS[0] - vw / 2, 0), IMG_W - vw);
      let y0 = Math.min(Math.max(FOCUS[1] - vh * 0.52, 0), IMG_H - vh);
      if (aspect < 0.8) {        // phones: keep both figures in frame (black beyond the image is fine)
        vw = 660 / zoom; vh = vw / aspect;
        x0 = FOCUS[0] - vw / 2; y0 = FOCUS[1] - vh * 0.5;
      }
      view = [x0, y0, x0 + vw, y0 + vh];
      cam.left = x0; cam.right = x0 + vw; cam.top = -y0; cam.bottom = -(y0 + vh);
      cam.updateProjectionMatrix();

      const storm = smooth(T.storm0, T.white, t);
      const u = pm.uniforms;
      u.uTime.value = t;
      u.uAssemble.value = clamp01(t / T.assemble);
      u.uFloat.value = smooth(T.float0, T.float0 + 2.2, t);
      u.uStorm.value = storm;
      u.uPx.value = 2 * (H / vh) * dpr * 1.05;
      u.uView.value = view;

      const tw = [(TWIN[0] - x0) / vw, 1 - (TWIN[1] - y0) / vh, TWIN[2] / vw, TWIN[3] / vh];
      post.uniforms.uTwin.value = tw;
      post.uniforms.uTime.value = t;
      post.uniforms.uAscii.value = 0.45 + 0.35 * storm;
      post.uniforms.uWhite.value = smooth(T.white - 0.7, T.white, t);

      renderer.setRenderTarget(rt);
      renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);

      if (!requested && reveal && t > T.chars0 - 0.35) {
        requested = true;
        Promise.resolve(reveal()).then(prepareTargets).catch(() => prepareTargets([]));
      }
      drawChars(t);
      if (t > 0.5 && t < T.storm0) textEl.classList.add("show");
      if (t >= T.storm0) textEl.classList.add("leaving");
      return t >= T.end;
    }

    if (!Number.isNaN(freeze)) { frame(freeze); return; }
    if (reduced) { frame(3); setTimeout(finish, 1500); return; }
    const start = performance.now();
    const loop = () => {
      if (frame((performance.now() - start) / 1000)) return finish();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  });
}
