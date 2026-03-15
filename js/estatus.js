
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Configuración por defecto
        const firebaseConfigDefault = {
            apiKey: "AIzaSyBIO9an0ZFAMdvJNOuV_Mb6ulZzVego_N8",
            authDomain: "comentariosgeminis-coc.firebaseapp.com",
            projectId: "comentariosgeminis-coc",
            storageBucket: "comentariosgeminis-coc.firebasestorage.app",
            messagingSenderId: "227180378242",
            appId: "1:227180378242:web:7ab611322962fba91fdc9b"
        };

        // Usar variables de entorno si están disponibles
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfigDefault;
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'genesis-coc';

        const contentDiarias = document.getElementById('contentDiarias');
        const contentLiga = document.getElementById('contentLiga');
        const loading = document.getElementById('loading');

        const icons = { ascenso: '🏆', penalizacion: '💀', degradacion: '⏳' };

        const start = async () => {
            // Regla 3: Autenticación prioritaria
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (authError) {
                console.error("Error en autenticación:", authError);
                loading.innerText = "Error de conexión con la aldea.";
                return;
            }

            // Escuchar cambios de estado de autenticación antes de consultar Firestore
            onAuthStateChanged(auth, (user) => {
                if (!user) return;

                // Regla 1: Ruta estricta
                const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'estatus_eventos');

                // Listener con gestión de errores
                onSnapshot(colRef, (snapshot) => {
                    loading.style.display = 'none';
                    const events = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        events.push(data);
                    });
                    
                    // Regla 2: Ordenar en memoria
                    events.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

                    renderEvents(events);
                }, (error) => {
                    console.error("Error en snapshot:", error);
                    loading.innerText = "Error de permisos: Asegúrate de que las reglas de Firestore permitan el acceso.";
                });
            });
        };

        function renderEvents(events) {
            contentDiarias.innerHTML = '';
            contentLiga.innerHTML = '';

            if (events.length === 0) {
                const emptyMsg = '<p class="text-center py-10 text-amber-900/30 italic text-sm">No hay registros todavía.</p>';
                contentDiarias.innerHTML = emptyMsg;
                contentLiga.innerHTML = emptyMsg;
                return;
            }

            events.forEach(ev => {
                const card = document.createElement('div');
                card.className = 'event-card';
                card.onclick = () => card.classList.toggle('expanded');
                
                let playersHtml = ev.players ? ev.players.map(p => `
                    <div class="player-row">
                        <div class="status-badge bg-${p.statusType || 'ascenso'}">${icons[p.statusType] || '⭐'}</div>
                        <div class="flex-1">
                            <h3 class="font-black text-xs uppercase">${p.name || 'Aldeano'}</h3>
                            <p class="text-[9px] font-bold uppercase ${p.statusType === 'ascenso' ? 'text-green-700' : 'text-red-700'}">${p.statusType || 'Estatus'}</p>
                            <p class="text-[10px] italic text-amber-900/70 leading-tight">${p.desc || ''}</p>
                        </div>
                    </div>
                `).join('') : '<p class="p-4 text-xs italic opacity-50">Sin detalles de jugadores.</p>';

                card.innerHTML = `
                    <div class="event-header" style="${ev.type === 'liga' ? 'background:#ca8a04' : ''}">
                        <div class="flex flex-col text-left">
                            <span class="text-[10px] font-bold opacity-70 uppercase tracking-tighter">${ev.date || 'Fecha'}</span>
                            <span class="font-black italic uppercase text-sm">${ev.title || 'Evento'}</span>
                        </div>
                        <span class="text-xs">▼</span>
                    </div>
                    <div class="event-body">${playersHtml}</div>
                `;

                if (ev.type === 'diaria') contentDiarias.appendChild(card);
                else contentLiga.appendChild(card);
            });
        }

        // Cambio de pestañas
        document.getElementById('btnDiarias').onclick = () => {
            document.getElementById('btnDiarias').classList.add('active');
            document.getElementById('btnLiga').classList.remove('active');
            contentDiarias.classList.remove('ocultar');
            contentLiga.classList.add('ocultar');
        };
        document.getElementById('btnLiga').onclick = () => {
            document.getElementById('btnLiga').classList.add('active');
            document.getElementById('btnDiarias').classList.remove('active');
            contentLiga.classList.remove('ocultar');
            contentDiarias.classList.add('ocultar');
        };

        start();