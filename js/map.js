/* ==========================================================
   SYNDICATE Dashboard — Attack Map (map.js)
   ==========================================================
   IMPORTANT: This module does NOT self-initialize.
   Call window.initAttackMap() AFTER the app container
   is visible (i.e., after the login transition completes).
   This is required because Leaflet cannot measure
   container dimensions when they are display:none.
   ========================================================== */

(function () {
    'use strict';

    var mapReady  = false;
    var animFrame = null;
    var leafMap   = null;

    /* --------------------------------------------------------
       Public entry point — called from main.js
       -------------------------------------------------------- */
    window.initAttackMap = function () {
        if (mapReady) return; // Guard against double-init
        mapReady = true;

        var mapEl    = document.getElementById('cyber-map');
        var canvas   = document.getElementById('map-canvas');

        /* Safety: elements might not exist on the page */
        if (!mapEl || !canvas) return;

        /* ------------------------------------------------
           1. Init Leaflet
           ------------------------------------------------ */
        leafMap = L.map('cyber-map', {
            zoomControl:       false,
            attributionControl: false,
            dragging:          false,
            scrollWheelZoom:   false,
            doubleClickZoom:   false,
            boxZoom:           false,
            keyboard:          false,
            zoomAnimationThreshold: 0
        }).setView([25, 10], 2.2);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            maxZoom: 5
        }).addTo(leafMap);

        /* ------------------------------------------------
           2. Canvas sizing
           ------------------------------------------------ */
        var ctx    = canvas.getContext('2d');
        var width  = 0;
        var height = 0;

        function resizeCanvas() {
            var parent = canvas.parentElement;
            if (!parent) return;
            width  = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width  = width;
            canvas.height = height;
            if (leafMap) leafMap.invalidateSize();
        }

        /* Debounce resize so it doesn't fire 30×/sec */
        var resizeTimer = null;
        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeCanvas, 100);
        }

        window.addEventListener('resize', onResize);
        resizeCanvas(); // Initial sizing

        /* ------------------------------------------------
           3. Data
           ------------------------------------------------ */
        var attackTypes = [
            { color: '#ff2a2a' }, // DDOS — Red
            { color: '#00e5ff' }, // Scan — Cyan
            { color: '#a855f7' }  // Web  — Purple
        ];

        var regions = [
            { lat: 37.77,  lng: -122.41 }, // US West
            { lat: 40.71,  lng:  -74.00 }, // US East
            { lat: 51.50,  lng:   -0.12 }, // UK
            { lat: 48.85,  lng:    2.35 }, // France
            { lat: 52.52,  lng:   13.40 }, // Germany
            { lat: 55.75,  lng:   37.61 }, // Russia
            { lat: 39.90,  lng:  116.40 }, // China
            { lat: 35.67,  lng:  139.65 }, // Japan
            { lat: -33.86, lng:  151.20 }, // Australia
            { lat: -23.55, lng:  -46.63 }, // Brazil
            { lat: 20.59,  lng:   78.96 }, // India
            { lat: 25.20,  lng:   55.27 }  // UAE
        ];

        function pick(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        /* ------------------------------------------------
           4. Bézier helper
           ------------------------------------------------ */
        function bezierPoint(p0, cp, p1, t) {
            var mt = 1 - t;
            return {
                x: mt * mt * p0.x + 2 * mt * t * cp.x + t * t * p1.x,
                y: mt * mt * p0.y + 2 * mt * t * cp.y + t * t * p1.y
            };
        }

        /* ------------------------------------------------
           5. Attack class
           ------------------------------------------------ */
        function Attack() {
            this.src   = pick(regions);
            this.dst   = pick(regions);
            while (this.dst === this.src) { this.dst = pick(regions); }

            this.meta  = pick(attackTypes);
            this.t     = 0;                         // Progress 0→1
            this.speed = 0.004 + Math.random() * 0.006;
            this.tail  = 0.18;
            this.dead  = false;
        }

        Attack.prototype.update = function () {
            this.t += this.speed;
            if (this.t > 1 + this.tail) { this.dead = true; }
        };

        Attack.prototype.draw = function (ctx) {
            var sp = leafMap.latLngToContainerPoint([this.src.lat, this.src.lng]);
            var ep = leafMap.latLngToContainerPoint([this.dst.lat, this.dst.lng]);

            var sx = sp.x, sy = sp.y;
            var ex = ep.x, ey = ep.y;

            /* Control point arches upward */
            var cx = (sx + ex) / 2;
            var cy = (sy + ey) / 2 - Math.hypot(ex - sx, ey - sy) * 0.3;

            var head = Math.min(1, this.t);
            var tail = Math.max(0, this.t - this.tail);

            if (head <= tail) return;

            /* Ping at source */
            if (this.t < 0.25) {
                var pa = 1 - this.t / 0.25;
                ctx.beginPath();
                ctx.arc(sx, sy, 10 * (this.t / 0.25), 0, Math.PI * 2);
                ctx.globalAlpha = pa * 0.7;
                ctx.strokeStyle = this.meta.color;
                ctx.lineWidth   = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            /* Ping at destination */
            if (this.t > 0.8 && this.t < 1.05) {
                var pr = (this.t - 0.8) / 0.25;
                ctx.beginPath();
                ctx.arc(ex, ey, 10 * pr, 0, Math.PI * 2);
                ctx.globalAlpha = (1 - pr) * 0.8;
                ctx.strokeStyle = this.meta.color;
                ctx.lineWidth   = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            /* Animated trail */
            var SEGS = 24;
            var tailPt = bezierPoint({ x: sx, y: sy }, { x: cx, y: cy }, { x: ex, y: ey }, tail);
            var headPt = bezierPoint({ x: sx, y: sy }, { x: cx, y: cy }, { x: ex, y: ey }, head);

            var grad = ctx.createLinearGradient(tailPt.x, tailPt.y, headPt.x, headPt.y);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, this.meta.color);

            ctx.beginPath();
            for (var i = 0; i <= SEGS; i++) {
                var pt = bezierPoint(
                    { x: sx, y: sy }, { x: cx, y: cy }, { x: ex, y: ey },
                    tail + (head - tail) * (i / SEGS)
                );
                if (i === 0) { ctx.moveTo(pt.x, pt.y); }
                else         { ctx.lineTo(pt.x, pt.y); }
            }
            ctx.strokeStyle = grad;
            ctx.lineWidth   = 2;
            ctx.lineCap     = 'round';
            ctx.stroke();

            /* Glowing head particle */
            ctx.beginPath();
            ctx.arc(headPt.x, headPt.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle    = '#fff';
            ctx.shadowColor  = this.meta.color;
            ctx.shadowBlur   = 10;
            ctx.fill();
            ctx.shadowBlur   = 0;
        };

        /* ------------------------------------------------
           6. Animation loop
           ------------------------------------------------ */
        var MAX_ATTACKS = 25;   // Cap for performance
        var SPAWN_RATE  = 0.12; // Probability per frame to spawn one

        var attacks = [];

        function animate() {
            animFrame = requestAnimationFrame(animate);

            ctx.clearRect(0, 0, width, height);

            /* Spawn */
            if (Math.random() < SPAWN_RATE && attacks.length < MAX_ATTACKS) {
                attacks.push(new Attack());
            }

            /* Update & draw */
            for (var i = attacks.length - 1; i >= 0; i--) {
                attacks[i].update();
                if (attacks[i].dead) {
                    attacks.splice(i, 1);
                } else {
                    attacks[i].draw(ctx);
                }
            }
        }

        /* Start only when tab is visible (saves battery) */
        function handleVisibility() {
            if (document.hidden) {
                if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
            } else {
                if (!animFrame) { animate(); }
            }
        }

        document.addEventListener('visibilitychange', handleVisibility);
        animate();

        /* ------------------------------------------------
           7. Live stats ticker
           ------------------------------------------------ */
        var totalEl  = document.getElementById('total-attacks');
        var rateEl   = document.getElementById('attacks-per-sec');
        var total    = 14245601;
        var rate     = 2140;

        setInterval(function () {
            rate  += Math.floor(Math.random() * 200) - 100;
            rate   = Math.max(800, Math.min(5000, rate));
            total += Math.floor(rate / 2);

            if (totalEl) totalEl.textContent = total.toLocaleString('en-US');
            if (rateEl)  rateEl.textContent  = rate.toLocaleString('en-US');
        }, 600);
    };

})();
