/* ==========================================================
   SYNDICATE Dashboard — Contact Form (contact.js)
   Cyberpunk / Terminal theme with Discord Webhook Integration
   ========================================================== */

/* 🚨 REMPLACE ICI_PAR_TON_TOKEN_DISCORD_WEBHOOK_URL 🚨 */
const DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1483397809204887705/hnJFtHYN_he6AJ2JPp0oDJccCwXsECqjLRh3vdqpvSY36lSguOv3ogCgAIoq89HgkTwn";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cyber-contact-form');
    const msgInput = document.getElementById('contact-msg');
    const charCount = document.getElementById('msg-char-count');
    const statusDiv = document.getElementById('form-status');
    const ipDisplay = document.getElementById('client-ip-display');
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!form || !msgInput || !charCount || !statusDiv) return;

    // --- 1. Fake IP Generation ---
    function generateFakeIP() {
        return Math.floor(Math.random() * 255) + '.' + 
               Math.floor(Math.random() * 255) + '.' + 
               Math.floor(Math.random() * 255) + '.' + 
               Math.floor(Math.random() * 255);
    }
    if (ipDisplay) {
        ipDisplay.innerText = '[IP: ' + generateFakeIP() + ']';
    }

    // --- 2. Character Counter ---
    msgInput.addEventListener('input', function() {
        const currentLen = this.value.length;
        const maxLen = this.getAttribute('maxlength') || 500;
        charCount.innerText = '[DATA: ' + currentLen + '/' + maxLen + ' bytes]';
        
        if (currentLen >= maxLen) {
            charCount.style.color = 'var(--red)';
        } else {
            charCount.style.color = 'var(--text3)';
        }
    });

    // --- 3. Typing Effect for Status Messages ---
    let typingTimeout;
    function typeStatusMessage(message, type) {
        clearTimeout(typingTimeout);
        statusDiv.className = 'form-status typing ' + type;
        statusDiv.innerText = '';
        
        let i = 0;
        function typeChar() {
            if (i < message.length) {
                statusDiv.innerText += message.charAt(i);
                i++;
                typingTimeout = setTimeout(typeChar, 30); // Speed of typing
            } else {
                statusDiv.classList.remove('typing');
            }
        }
        typeChar();
    }

    // --- 4. Form Submission & Discord Webhook ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Anti-bot Honeypot check
        const honeypot = document.getElementById('contact-honeypot');
        if (honeypot && honeypot.value !== "") {
            console.warn("Bot detected by honeypot.");
            typeStatusMessage("[ERREUR] Accès refusé. Anomalie détectée.", "error");
            return;
        }

        // Gather data
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = msgInput.value.trim();

        // Validation
        if (!name || !email || !message) {
            typeStatusMessage("[ERREUR] Champ requis manquant. Transmission annulée.", "error");
            return;
        }

        // Disable UI during transmission
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        typeStatusMessage("> ENVOI DES PAQUETS EN COURS...", "");

        // Construct Discord Embed Payload
        const payload = {
            username: "Syndicate Terminal",
            avatar_url: "https://i.imgur.com/4M34hi2.png", // Generic hacker icon or null
            embeds: [{
                title: "📡 NOUVELLE TRANSMISSION",
                color: 65365, // Neon Green equivalent in decimal (#00ff41)
                timestamp: new Date().toISOString(),
                fields: [
                    { name: "Opérateur", value: "```" + name + "```", inline: true },
                    { name: "Canal", value: "```" + email + "```", inline: true },
                    { name: "Message", value: "```text\n" + message + "\n```" }
                ],
                footer: {
                    text: "Système de contact sécurisé | IP Source: " + (ipDisplay ? ipDisplay.innerText.replace('[IP: ', '').replace(']', '') : "Unknown")
                }
            }]
        };

        // Send to Discord
        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                typeStatusMessage("[SUCCÈS] Message transmis. Code: 200 OK", "success");
                form.reset();
                charCount.innerText = '[DATA: 0/500 bytes]';
                charCount.style.color = 'var(--text3)';
            } else {
                throw new Error("HTTP " + response.status);
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            typeStatusMessage("[ERREUR] Échec de la transmission. Code: 0x" + Math.floor(Math.random() * 999), "error");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        });
    });
});
