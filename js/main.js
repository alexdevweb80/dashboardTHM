/* ==========================================================
   SYNDICATE Dashboard — Main JS
   ==========================================================*/
(function () {
    'use strict';

    /* --------------------------------------------------------
       Helpers
       -------------------------------------------------------- */
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

    /* --------------------------------------------------------
       1. LOGIN SCREEN — auto-type then auto-submit
       -------------------------------------------------------- */
    var bootScreen = $('#boot-screen');
    var appContainer = $('#app-container');
    var loginForm = $('#login-form');
    var loginBtn = $('#login-btn');
    var loginSucc = $('#login-success');
    var passField = $('#field-pass');

    function showApp() {
        bootScreen.classList.add('fade-out');
        setTimeout(function () {
            bootScreen.style.display = 'none';
            appContainer.classList.remove('hidden');
            appContainer.style.opacity = '0';
            appContainer.style.transition = 'opacity 0.8s ease';

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    appContainer.style.opacity = '1';

                    /* Init attack map AFTER container is visible so
                       Leaflet can correctly measure its dimensions.   */
                    setTimeout(function () {
                        if (typeof window.initAttackMap === 'function') {
                            window.initAttackMap();
                        }
                    }, 850); /* wait for opacity transition to finish */
                });
            });
        }, 900);
    }

    var bootTerminal = $('#boot-terminal');
    var loginBox = $('#login-box');

    /* Array of fake dmesg lines for Kali boot */
    var bootLines = [
        "[    0.000000] Linux version 6.6.9-kali1-amd64 (devel@kali.org) (gcc-13) #1 SMP PREEMPT_DYNAMIC",
        "[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.6.9 root=UUID=8a4c28b9 ro quiet splash",
        "[    0.000000] BIOS-provided physical RAM map:",
        "[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable",
        "[    0.023451] secureboot: Secure boot could not be determined",
        "[    0.100923] smpboot: CPU0: Intel(R) Core(TM) i9-14900K (family: 0x6, model: 0xba, stepping: 0x2)",
        "[    0.150000] [<span class='ok'>  OK  </span>] Found device /dev/sda1.",
        "[    0.165000] [<span class='ok'>  OK  </span>] Started File System Check on /dev/sda1.",
        "[    0.180000] [<span class='ok'>  OK  </span>] Mounted /boot/efi.",
        "[    0.190000] [<span class='ok'>  OK  </span>] Reached target Local File Systems.",
        "[    0.205000] [<span class='warn'> WARN </span>] Failed to start Network Time Synchronization.",
        "[    0.280000] [<span class='ok'>  OK  </span>] Started Network Manager.",
        "[    0.350000] [<span class='ok'>  OK  </span>] Reached target Network.",
        "[    0.410000] [<span class='ok'>  OK  </span>] Started WPA supplicant.",
        "[    0.485000] [<span class='ok'>  OK  </span>] Started Authorization Manager.",
        "[    0.510000] [<span class='ok'>  OK  </span>] Started Modem Manager.",
        "[    0.620000] [<span class='fail'>FAILED</span>] Failed to start OpenBSD Secure Shell server.",
        "[    0.650000] [<span class='ok'>  OK  </span>] Started LSB: start and stop PostgreSQL cluster.",
        "[    0.720000] [<span class='ok'>  OK  </span>] Started User Login Management.",
        "[    0.850000] [<span class='ok'>  OK  </span>] Reached target Multi-User System.",
        "[    0.910000] [<span class='ok'>  OK  </span>] Reached target Graphical Interface.",
        "Starting Kali Linux...",
        "",
        ""
    ];

    function startAutoLogin() {
        if (!loginForm || !passField) return;
        /* Read-only during auto-type */
        passField.readOnly = true;

        var autoPass = 'roottoor';
        var charIdx = 0;

        /* Start typing shortly after login box appears */
        setTimeout(function () {
            var iv = setInterval(function () {
                if (charIdx < autoPass.length) {
                    passField.value += autoPass[charIdx++];
                } else {
                    clearInterval(iv);
                    /* Submit after typing finishes */
                    setTimeout(function () { loginBtn.click(); }, 400);
                }
            }, 80);
        }, 600);
    }

    if (bootTerminal && loginBox) {
        var lineIdx = 0;
        var bootInterval = setInterval(function () {
            if (lineIdx < bootLines.length) {
                var div = document.createElement('div');
                div.innerHTML = bootLines[lineIdx];
                bootTerminal.appendChild(div);

                /* Auto-scroll */
                bootTerminal.scrollTop = bootTerminal.scrollHeight;

                lineIdx++;
            } else {
                clearInterval(bootInterval);
                /* Wait a moment before showing login */
                setTimeout(function () {
                    bootTerminal.classList.add('hidden');
                    loginBox.classList.remove('hidden');
                    startAutoLogin();
                }, 500);
            }
        }, 50); /* Extremely fast typing like real boot */
    } else {
        startAutoLogin();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            loginBtn.disabled = true;
            loginBtn.textContent = 'Authenticating...';
            loginBtn.style.opacity = '0.5';

            /* Show progress bar */
            setTimeout(function () {
                loginSucc.classList.remove('hidden');
            }, 400);

            /* Transition to app */
            setTimeout(showApp, 2600);
        });
    }

    /* --------------------------------------------------------
       1.5 BRUTE FORCE TERMINAL
       -------------------------------------------------------- */
    var bfTerminal = $('#bf-terminal');
    if (bfTerminal) {
        var bfUsers = ['root', 'admin', 'administrator', 'user', 'guest', 'oracle', 'postgres', 'mysql'];
        var bfPasses = ['123456', 'password', 'admin', 'qwerty', 'root', 'toor', 'admin123', 'kali', 'P@ssw0rd'];
        var targetIP = '192.168.1.105';

        function addBFLine() {
            var isSuccess = Math.random() < 0.05; // 5% chance of success
            var user = bfUsers[Math.floor(Math.random() * bfUsers.length)];
            var pass = bfPasses[Math.floor(Math.random() * bfPasses.length)];

            var div = document.createElement('div');
            div.className = 'bf-line';

            var padUser = (user + '          ').substring(0, 10);

            if (isSuccess) {
                div.innerHTML = '[<span class="success">22</span>][<span class="port">ssh </span>] host: <span class="ip">' + targetIP + '</span>   login: <span class="success">' + padUser + '</span>   password: <span class="success">' + pass + '</span>';
            } else {
                div.innerHTML = '[<span class="warn">22</span>][<span class="port">ssh </span>] host: <span class="ip">' + targetIP + '</span>   login: <span class="try">' + padUser + '</span>   password: <span class="try">' + pass + '</span>';
            }

            bfTerminal.appendChild(div);
            bfTerminal.scrollTo({ top: bfTerminal.scrollHeight, behavior: 'instant' });

            // Keep only last 8 lines for better stability
            if (bfTerminal.childElementCount > 8) {
                bfTerminal.removeChild(bfTerminal.firstChild);
            }
        }

        setInterval(addBFLine, 450); // Slower updates to reduce layout thrashing
    }

    /* --------------------------------------------------------
       1.6 NMAP SCAN TERMINAL
       -------------------------------------------------------- */
    var nmapTerminal = $('#nmap-terminal');
    if (nmapTerminal) {
        var scanTarget = '10.10.23.85';
        var commonPorts = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995, 1723, 3306, 3389, 5900, 8080];

        function addNmapLine() {
            var port = commonPorts[Math.floor(Math.random() * commonPorts.length)];
            var isOpen = Math.random() < 0.3; // 30% chance of being open
            var protocol = (port === 53) ? 'udp' : 'tcp';

            var div = document.createElement('div');
            div.className = 'nmap-line';

            if (isOpen) {
                div.innerHTML = 'Discovered <span class="port-open">open</span> port <span class="header">' + port + '/' + protocol + '</span> on <span class="ip">' + scanTarget + '</span>';
            } else {
                div.innerHTML = 'Discovered <span class="port-closed">closed</span> port <span class="header">' + port + '/' + protocol + '</span> on <span class="ip">' + scanTarget + '</span>';
            }

            nmapTerminal.appendChild(div);
            nmapTerminal.scrollTo({ top: nmapTerminal.scrollHeight, behavior: 'instant' });

            // Keep only last 8 lines
            if (nmapTerminal.childElementCount > 8) {
                nmapTerminal.removeChild(nmapTerminal.firstChild);
            }
        }

        // Initial Nmap header
        var headerDiv = document.createElement('div');
        headerDiv.className = 'nmap-line';
        headerDiv.innerHTML = 'Starting Nmap 7.94SVN at ' + new Date().toISOString().split('T')[0] + '...<br>Nmap scan report for <span class="ip">' + scanTarget + '</span><br>Host is up (0.0012s latency).<br>';
        nmapTerminal.appendChild(headerDiv);

        setInterval(addNmapLine, 600); // Slower updates to reduce layout thrashing
    }

    /* --------------------------------------------------------
       2. MOBILE SIDEBAR
       -------------------------------------------------------- */
    var sidebar = $('#sidebar');
    var overlay = $('#nav-overlay');
    var hamburger = $('#hamburger-btn');
    var closeBtn = $('#sidebar-close');

    function openNav() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        overlay.style.display = 'block';
        /* Allow display:block to paint before animating opacity */
        requestAnimationFrame(function () {
            overlay.classList.add('visible');
        });
    }

    function closeNav() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        /* Hide after transition */
        setTimeout(function () {
            overlay.style.display = 'none';
        }, 300);
    }

    if (hamburger) { hamburger.addEventListener('click', openNav); }
    if (closeBtn) { closeBtn.addEventListener('click', closeNav); }
    if (overlay) { overlay.addEventListener('click', closeNav); }

    /* --------------------------------------------------------
       3. NAVIGATION — page switching
       -------------------------------------------------------- */
    var navItems = $$('.nav-item');
    var pages = $$('.page');

    function navigateTo(pageId) {
        var scroller = $('.scrollable-content');
        var target = $('#' + pageId);
        
        /* Check if already on this page */
        if (target && target.classList.contains('active')) return;

        /* Switch sections */
        pages.forEach(function (p) { p.classList.remove('active'); });
        if (target) target.classList.add('active');

        /* Update nav highlight */
        navItems.forEach(function (li) {
            li.classList.toggle('active', li.dataset.page === pageId);
        });

        /* Close mobile nav */
        closeNav();

        /* Scroll to top only on actual navigation */
        if (scroller) scroller.scrollTop = 0;
    }

    navItems.forEach(function (li) {
        var link = li.querySelector('a');
        if (!link) return;

        link.addEventListener('click', function (e) {
            e.preventDefault();
            navigateTo(li.dataset.page);
        });
    });

    /* --------------------------------------------------------
       3.5 SCROLL ANIMATIONS (Intersection Observer & Parallax)
       -------------------------------------------------------- */
    var scrollerElem = $('.scrollable-content');
    
    var observerOptions = {
        root: scrollerElem,
        rootMargin: '0px',
        threshold: 0.15 
    };

    var observer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    function initScrollAnimations() {
        var animElements = $$('.animate-on-scroll');
        animElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* Subtle Parallax Effect (using CSS variables to avoid layout jitter) */
    if (scrollerElem) {
        scrollerElem.addEventListener('scroll', function() {
            var visibleItems = $$('.animate-on-scroll.is-visible');
            var scrollerHeight = scrollerElem.offsetHeight;
            
            visibleItems.forEach(function(item) {
                if (item.classList.contains('col-full')) return;

                var rect = item.getBoundingClientRect();
                var scrollerRect = scrollerElem.getBoundingClientRect();
                var relativeY = rect.top - scrollerRect.top;
                
                var speed = 0.05; 
                var offset = (relativeY - scrollerHeight / 2) * speed;
                
                // Use CSS variable instead of overwriting transform
                item.style.setProperty('--plx', offset + 'px');
            });
        }, { passive: true });
    }

    initScrollAnimations();

    /* --------------------------------------------------------
       4. THEME TOGGLE (Local Storage & Body Class)
       -------------------------------------------------------- */
    var themeBtn = $('#theme-btn');
    var currentTheme = localStorage.getItem('theme') || 'dark';

    // Apply saved theme on load
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeBtn) {
            var icon = themeBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            document.body.classList.toggle('light-theme');
            var isLight = document.body.classList.contains('light-theme');
            
            // Save preference
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Switch icon
            var icon = themeBtn.querySelector('i');
            if (icon) {
                if (isLight) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
        });
    }

    /* --------------------------------------------------------
       5. BRAND CRYPTO EFFECT
       -------------------------------------------------------- */
    var cryptoBrands = $$('.glitch-crypto');
    var cryptoChars = '!<>-_\\\\/[]{}—=+*^?#________';
    
    cryptoBrands.forEach(function(el) {
        var originalText = el.dataset.text;
        var interval = null;

        function runCryptoEffect() {
            var iterations = 0;
            clearInterval(interval);
            
            interval = setInterval(function() {
                el.innerText = originalText.split('').map(function(letter, index) {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return cryptoChars[Math.floor(Math.random() * cryptoChars.length)];
                }).join('');
                
                if (iterations >= originalText.length) {
                    clearInterval(interval);
                }
                iterations += 1 / 3; // Controls speed of decryption
            }, 30);
        }

        // Run on hover
        el.addEventListener('mouseover', runCryptoEffect);
        
        // Run occasionally automatically
        setInterval(function() {
            if (Math.random() < 0.2) { // 20% chance every 5 seconds
                runCryptoEffect();
            }
        }, 5000);
    });

})();
