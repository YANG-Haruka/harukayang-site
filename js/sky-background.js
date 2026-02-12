// ========== THREE.JS SHINKAI-STYLE TWILIGHT SKY ==========
// Usage: SkyBackground.init('a, button, ...')
// The parameter specifies selectors for interactive elements that should NOT trigger meteor spawn on click.

window.SkyBackground = (function() {
    let scene, camera, renderer;
    let starField, meteors = [];
    let starGlowTexture, meteorGlowTexture;
    let width, height;
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768 && ('ontouchstart' in window));
    const mobileMaxSprites = 30;
    const MAX_METEORS = isMobile ? 4 : 10;
    const clock = new THREE.Clock();
    let isPageVisible = true;
    let meteorTimer = 0;
    let nextMeteorDelay = 4000 + Math.random() * 4000;
    let lastFrameTime = 0;
    let skyMesh = null;

    function initScene() {
        width = window.innerWidth;
        height = window.innerHeight;

        scene = new THREE.Scene();

        camera = new THREE.OrthographicCamera(
            -width / 2, width / 2,
            height / 2, -height / 2,
            0.1, 1000
        );
        camera.position.z = 100;

        const maxPixelRatio = isMobile ? 1.5 : 2;
        renderer = new THREE.WebGLRenderer({
            antialias: !isMobile,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

        document.getElementById('sky-container').appendChild(renderer.domElement);

        starGlowTexture = createStarGlowTexture();
        meteorGlowTexture = createMeteorGlowTexture();

        createSkyBackground();
        createStarField();

        window.addEventListener('resize', onResize);
    }

    function createStarGlowTexture() {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const cx = size / 2;
        const cy = size / 2;

        ctx.clearRect(0, 0, size, size);

        const vGrad = ctx.createLinearGradient(cx, 0, cx, size);
        vGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vGrad.addColorStop(0.35, 'rgba(220, 240, 255, 0.15)');
        vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        vGrad.addColorStop(0.65, 'rgba(220, 240, 255, 0.15)');
        vGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 3, cy);
        ctx.lineTo(cx, size);
        ctx.lineTo(cx - 3, cy);
        ctx.closePath();
        ctx.fill();

        const hGrad = ctx.createLinearGradient(0, cy, size, cy);
        hGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        hGrad.addColorStop(0.35, 'rgba(220, 240, 255, 0.15)');
        hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        hGrad.addColorStop(0.65, 'rgba(220, 240, 255, 0.15)');
        hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(cx, cy + 3);
        ctx.lineTo(size, cy);
        ctx.lineTo(cx, cy - 3);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        ctx.translate(-cx, -cy);

        const d1Grad = ctx.createLinearGradient(cx, size * 0.2, cx, size * 0.8);
        d1Grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        d1Grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        d1Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = d1Grad;
        ctx.beginPath();
        ctx.moveTo(cx, size * 0.2);
        ctx.lineTo(cx + 2, cy);
        ctx.lineTo(cx, size * 0.8);
        ctx.lineTo(cx - 2, cy);
        ctx.closePath();
        ctx.fill();

        const d2Grad = ctx.createLinearGradient(size * 0.2, cy, size * 0.8, cy);
        d2Grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        d2Grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        d2Grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = d2Grad;
        ctx.beginPath();
        ctx.moveTo(size * 0.2, cy);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(size * 0.8, cy);
        ctx.lineTo(cx, cy - 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function createMeteorGlowTexture() {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.1, 'rgba(230, 245, 255, 0.7)');
        gradient.addColorStop(0.25, 'rgba(200, 230, 250, 0.4)');
        gradient.addColorStop(0.45, 'rgba(170, 210, 240, 0.2)');
        gradient.addColorStop(0.7, 'rgba(150, 195, 230, 0.08)');
        gradient.addColorStop(1, 'rgba(140, 185, 220, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function createSkyBackground() {
        const skyGeometry = new THREE.PlaneGeometry(width * 1.5, height * 1.5);

        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;

                vec3 gradient(float t) {
                    vec3 c0 = vec3(0.039, 0.086, 0.157);
                    vec3 c1 = vec3(0.071, 0.145, 0.29);
                    vec3 c2 = vec3(0.118, 0.227, 0.373);
                    vec3 c3 = vec3(0.239, 0.165, 0.361);
                    vec3 c4 = vec3(0.361, 0.239, 0.361);
                    vec3 c5 = vec3(0.545, 0.353, 0.42);
                    vec3 c6 = vec3(0.769, 0.471, 0.353);
                    vec3 c7 = vec3(0.831, 0.647, 0.455);

                    if (t < 0.25) return mix(c0, c1, t / 0.25);
                    if (t < 0.45) return mix(c1, c2, (t - 0.25) / 0.2);
                    if (t < 0.6) return mix(c2, c3, (t - 0.45) / 0.15);
                    if (t < 0.75) return mix(c3, c4, (t - 0.6) / 0.15);
                    if (t < 0.85) return mix(c4, c5, (t - 0.75) / 0.1);
                    if (t < 0.92) return mix(c5, c6, (t - 0.85) / 0.07);
                    return mix(c6, c7, (t - 0.92) / 0.08);
                }

                void main() {
                    float t = 1.0 - vUv.y;
                    vec3 color = gradient(t);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            depthWrite: false
        });

        skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
        skyMesh.position.z = -50;
        scene.add(skyMesh);
    }

    function createStarField() {
        const maxStars = isMobile ? 100 : 200;
        const starDensity = isMobile ? 8000 : 5500;
        const starCount = Math.min(maxStars, Math.floor((width * height) / starDensity));

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const phases = new Float32Array(starCount);
        const speeds = new Float32Array(starCount);
        const baseAlphas = new Float32Array(starCount);
        const rotations = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * width;
            const y = (Math.random() * 0.82) * height - height * 0.18;
            const z = -5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const sizeFactor = Math.random();
            const sizeScale = isMobile ? 0.7 : 1.0;
            if (sizeFactor < 0.65) {
                sizes[i] = (8 + Math.random() * 10) * sizeScale;
            } else if (sizeFactor < 0.88) {
                sizes[i] = (18 + Math.random() * 14) * sizeScale;
            } else {
                sizes[i] = (32 + Math.random() * 20) * sizeScale;
            }

            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = 1.2 + Math.random() * 2.0;
            rotations[i] = Math.random() * Math.PI * 0.25;

            const normalizedY = (y + height * 0.18) / height;
            const horizonFade = normalizedY > 0.25 ? 1.0 : Math.pow(normalizedY / 0.25, 0.6);
            baseAlphas[i] = (0.5 + Math.random() * 0.5) * horizonFade;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
        geometry.setAttribute('baseAlpha', new THREE.BufferAttribute(baseAlphas, 1));
        geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                starTexture: { value: starGlowTexture },
                pixelRatio: { value: renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                attribute float phase;
                attribute float speed;
                attribute float baseAlpha;
                attribute float rotation;
                uniform float time;
                uniform float pixelRatio;
                varying float vAlpha;
                varying float vRotation;

                void main() {
                    float twinkle = sin(time * speed * 1.5 + phase) * 0.4 +
                                   sin(time * speed * 3.2 + phase * 1.7) * 0.3 +
                                   sin(time * speed * 1.1 + phase * 3.1) * 0.2;

                    vAlpha = baseAlpha * (0.2 + max(0.0, twinkle + 0.8));

                    float sizeVar = size * (0.65 + twinkle * 0.5 + 0.35);

                    vRotation = rotation + time * 0.15;

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = sizeVar * pixelRatio;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D starTexture;
                varying float vAlpha;
                varying float vRotation;

                void main() {
                    vec2 uv = gl_PointCoord - 0.5;
                    float c = cos(vRotation);
                    float s = sin(vRotation);
                    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + 0.5;

                    vec4 texColor = texture2D(starTexture, uv);
                    gl_FragColor = vec4(texColor.rgb, texColor.a * vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        starField = new THREE.Points(geometry, material);
        scene.add(starField);
    }

    class Meteor {
        constructor() {
            this.active = true;
            this.group = new THREE.Group();
            this.sprites = [];
            this.coreSprites = [];
            this.maxSprites = isMobile ? mobileMaxSprites : 60;
            this.reset();
        }

        reset() {
            this.sprites.forEach(s => {
                this.group.remove(s);
                s.material.dispose();
            });
            this.coreSprites.forEach(s => {
                this.group.remove(s);
                s.material.dispose();
            });
            this.sprites = [];
            this.coreSprites = [];

            this.asymmetryDir = Math.random() > 0.5 ? 1 : -1;
            this.asymmetryAmount = 0.3 + Math.random() * 0.4;

            for (let i = 0; i < this.maxSprites; i++) {
                const material = new THREE.SpriteMaterial({
                    map: meteorGlowTexture,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const sprite = new THREE.Sprite(material);
                sprite.visible = false;
                this.sprites.push(sprite);
                this.group.add(sprite);
            }

            for (let i = 0; i < this.maxSprites; i++) {
                const material = new THREE.SpriteMaterial({
                    map: meteorGlowTexture,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const sprite = new THREE.Sprite(material);
                sprite.visible = false;
                this.coreSprites.push(sprite);
                this.group.add(sprite);
            }

            this.startX = (Math.random() - 0.5) * width * 0.85;
            this.startY = height / 2 + 50;

            const horizontalBias = (Math.random() - 0.5) * 0.6;
            this.dirX = horizontalBias;
            this.dirY = -1;
            const len = Math.sqrt(this.dirX * this.dirX + this.dirY * this.dirY);
            this.dirX /= len;
            this.dirY /= len;

            this.perpX = -this.dirY;
            this.perpY = this.dirX;

            this.curvature = (Math.random() - 0.5) * 0.0006;
            this.wobbleFreq = 0.012 + Math.random() * 0.008;
            this.wobbleAmp = 0.06 + Math.random() * 0.04;

            this.x = this.startX;
            this.y = this.startY;
            this.speed = 2.2 + Math.random() * 1.2;
            this.time = 0;

            this.trail = [];
            this.maxTrailLength = this.maxSprites;

            this.totalDistance = height * (0.5 + Math.random() * 0.35);
            this.traveled = 0;

            this.opacity = 0;
            this.fadeIn = true;
            this.fadeOut = false;
            this.currentScale = 1.0;

            scene.add(this.group);
            this.active = true;
        }

        update() {
            if (!this.active) return;

            if (this.fadeIn) {
                this.opacity = Math.min(1, this.opacity + 0.05);
                if (this.opacity >= 1) this.fadeIn = false;
            }

            if (this.fadeOut) {
                this.fadeOutTimer = (this.fadeOutTimer || 0) + 1;
                this.opacity = Math.max(0, this.opacity - 0.015);
                if (this.trail.length > 0 && this.fadeOutTimer % 2 === 0) {
                    this.trail.pop();
                }
                if ((this.opacity <= 0 && this.trail.length === 0) || this.fadeOutTimer > 180) {
                    this.dispose();
                    return;
                }
            }

            if (!this.fadeOut) {
                this.time++;

                const wobble = Math.sin(this.time * this.wobbleFreq) * this.wobbleAmp;
                const curveOffset = this.curvature * this.time;

                this.x += (this.dirX + wobble * 0.08 + curveOffset) * this.speed;
                this.y += this.dirY * this.speed;
                this.traveled += this.speed;

                const fallProgress = this.traveled / this.totalDistance;
                this.currentScale = Math.max(0.2, 1 - fallProgress * 0.65);

                this.trail.unshift({
                    x: this.x,
                    y: this.y,
                    scale: this.currentScale
                });

                if (this.trail.length > this.maxTrailLength) {
                    this.trail.pop();
                }

                if (this.traveled >= this.totalDistance) {
                    this.fadeOut = true;
                }
            }

            this.updateSprites();
        }

        updateSprites() {
            const len = this.trail.length;
            if (len < 2) return;

            for (let i = 0; i < this.maxSprites; i++) {
                const sprite = this.sprites[i];
                const coreSprite = this.coreSprites[i];

                if (i < len) {
                    const point = this.trail[i];
                    const progress = i / len;

                    const alphaCurve = Math.pow(1 - progress, 1.4);

                    let sizeMult, offset;
                    if (progress < 0.08) {
                        sizeMult = 0.3 + progress * 8;
                        offset = 0;
                    } else if (progress < 0.25) {
                        const t = (progress - 0.08) / 0.17;
                        sizeMult = 0.94 + t * 0.6;
                        offset = t * 3 * this.asymmetryDir;
                    } else if (progress < 0.55) {
                        const t = (progress - 0.25) / 0.3;
                        sizeMult = 1.54 + Math.sin(t * Math.PI) * 0.8;
                        offset = (3 + Math.sin(t * Math.PI) * 8) * this.asymmetryDir * this.asymmetryAmount;
                    } else {
                        const t = (progress - 0.55) / 0.45;
                        sizeMult = (1.54 + 0.8) * (1 - t * 0.5) * (1 + t * 0.3);
                        offset = (11 * this.asymmetryAmount) * (1 - t * 0.7) * this.asymmetryDir;
                    }

                    const meteorSizeScale = isMobile ? 0.65 : 1.0;
                    const baseSize = 40 * point.scale * sizeMult * meteorSizeScale;
                    const alpha = alphaCurve * this.opacity * point.scale * 0.7;

                    const offsetX = this.perpX * offset * point.scale;
                    const offsetY = this.perpY * offset * point.scale;

                    sprite.position.set(
                        point.x + offsetX,
                        point.y + offsetY,
                        i * 0.01
                    );
                    sprite.scale.set(baseSize, baseSize * 0.85, 1);
                    sprite.material.opacity = alpha * 0.6;
                    sprite.material.color.setHSL(0.57, 0.35, 0.55 + (1 - progress) * 0.25);
                    sprite.visible = alpha > 0.008;

                    const coreSize = 10 * point.scale * (1 - progress * 0.7);
                    const coreAlpha = Math.pow(1 - progress, 2.2) * this.opacity * point.scale * 0.8;
                    const coreOffset = -offset * 0.15;

                    coreSprite.position.set(
                        point.x + this.perpX * coreOffset * point.scale,
                        point.y + this.perpY * coreOffset * point.scale,
                        i * 0.01 + 0.5
                    );
                    coreSprite.scale.set(coreSize, coreSize, 1);
                    coreSprite.material.opacity = coreAlpha;
                    coreSprite.material.color.setHSL(0.58, 0.15, 0.9);
                    coreSprite.visible = coreAlpha > 0.02;

                } else {
                    sprite.visible = false;
                    coreSprite.visible = false;
                }
            }

            if (len > 0 && !this.fadeOut) {
                const headScale = isMobile ? 0.65 : 1.0;
                const headSprite = this.sprites[0];
                headSprite.material.opacity = this.opacity * 0.7;
                headSprite.material.color.setHSL(0.57, 0.25, 0.8);
                headSprite.scale.set(18 * this.currentScale * headScale, 18 * this.currentScale * headScale, 1);
                headSprite.position.set(this.trail[0].x, this.trail[0].y, 0.6);

                const headCore = this.coreSprites[0];
                headCore.material.opacity = this.opacity * 0.9;
                headCore.material.color.setHSL(0.58, 0.1, 0.95);
                headCore.scale.set(6 * this.currentScale * headScale, 6 * this.currentScale * headScale, 1);
                headCore.position.set(this.trail[0].x, this.trail[0].y, 0.7);
            }
        }

        dispose() {
            this.active = false;
            scene.remove(this.group);
            this.sprites.forEach(s => s.material.dispose());
            this.coreSprites.forEach(s => s.material.dispose());
            this.sprites = [];
            this.coreSprites = [];
        }
    }

    function spawnMeteor() {
        for (let i = meteors.length - 1; i >= 0; i--) {
            if (!meteors[i].active) {
                meteors.splice(i, 1);
            }
        }

        if (meteors.length < MAX_METEORS) {
            const meteor = new Meteor();
            meteors.push(meteor);
            return true;
        }
        return false;
    }

    let resizeTimer = null;

    function onResize() {
        width = window.innerWidth;
        height = window.innerHeight;

        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (skyMesh) {
            skyMesh.geometry.dispose();
            skyMesh.geometry = new THREE.PlaneGeometry(width * 1.5, height * 1.5);
        }

        // Debounce star field rebuild to avoid thrashing during drag-resize
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (starField) {
                starField.geometry.dispose();
                starField.material.dispose();
                scene.remove(starField);
                starField = null;
            }
            createStarField();
        }, 200);
    }

    function animate(timestamp) {
        requestAnimationFrame(animate);

        if (!isPageVisible) {
            lastFrameTime = timestamp;
            return;
        }

        if (lastFrameTime === 0) lastFrameTime = timestamp;
        const rawDelta = timestamp - lastFrameTime;
        const delta = Math.min(rawDelta, 100);
        lastFrameTime = timestamp;

        const time = clock.getElapsedTime();

        if (starField) {
            starField.material.uniforms.time.value = time;
        }

        meteorTimer += delta;
        if (meteorTimer >= nextMeteorDelay) {
            meteorTimer = 0;
            nextMeteorDelay = 4000 + Math.random() * 4000;
            spawnMeteor();
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
            if (meteors[i].active) {
                meteors[i].update();
            }
            if (!meteors[i].active) {
                meteors.splice(i, 1);
            }
        }

        renderer.render(scene, camera);
    }

    return {
        init: function(interactiveSelectors) {
            initScene();
            animate(0);

            // Spawn initial meteor after a short delay
            meteorTimer = nextMeteorDelay - 500;

            // Handle page visibility changes
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    isPageVisible = false;
                    clock.stop();
                } else {
                    isPageVisible = true;
                    clock.start();
                    meteorTimer = 0;
                    nextMeteorDelay = 2000 + Math.random() * 3000;
                    lastFrameTime = 0;
                }
            });

            // Click to spawn meteor
            document.addEventListener('mousedown', function(e) {
                var target = e.target;
                if (!target.closest(interactiveSelectors)) {
                    e.preventDefault();
                    spawnMeteor();
                }
            });

            // Touch to spawn meteor
            document.addEventListener('touchstart', function(e) {
                var target = e.target;
                if (!target.closest(interactiveSelectors)) {
                    spawnMeteor();
                }
            }, { passive: true });
        }
    };
})();
