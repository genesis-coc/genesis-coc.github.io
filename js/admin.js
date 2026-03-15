
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBIO9an0ZFAMdvJNOuV_Mb6ulZzVego_N8",
            authDomain: "comentariosgeminis-coc.firebaseapp.com",
            projectId: "comentariosgeminis-coc",
            storageBucket: "comentariosgeminis-coc.firebasestorage.app",
            messagingSenderId: "227180378242",
            appId: "1:227180378242:web:7ab611322962fba91fdc9b"
        };

        // HASHES DE SEGURIDAD (SHA-256)
        const HASH_USER = "95d4e19c2fb1e4fedc46353980c29df606901d18ad4ae427112127cb63f656ec";
        const HASH_PASS = "26b6da417c77a7b76bea61259f2149e17762122915b77e8996e34ecec8f50f46";

        async function sha256(text) {
            const msgBuffer = new TextEncoder().encode(text);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const appId = 'genesis-coc';

        const loginSection = document.getElementById('loginSection');
        const adminForm = document.getElementById('adminForm');
        const customMsg = document.getElementById('customMsg');

        function showMsg(text, isError = false) {
            customMsg.innerText = text;
            customMsg.style.borderColor = isError ? '#b91c1c' : '#fcc200';
            customMsg.style.display = 'block';
            setTimeout(() => { customMsg.style.display = 'none'; }, 3000);
        }

        document.getElementById('loginBtn').onclick = async () => {
            const userText = document.getElementById('userInput').value;
            const passText = document.getElementById('passInput').value;

            const userHash = await sha256(userText);
            const passHash = await sha256(passText);

            if (userHash === HASH_USER && passHash === HASH_PASS) {
                loginSection.classList.add('ocultar');
                adminForm.classList.remove('ocultar');
                document.body.style.alignItems = "start";
                showMsg("¡Bienvenido, Líder!");
            } else {
                showMsg("Credenciales incorrectas", true);
            }
        };

        function createPlayerRow() {
            const div = document.createElement('div');
            div.className = "p-3 bg-white/80 rounded-xl border-2 border-amber-900/10 flex flex-col gap-2 relative";
            div.innerHTML = `
                <button class="absolute top-1 right-2 text-red-600 font-bold text-xs" onclick="this.parentElement.remove()">X</button>
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Nombre Jugador" class="p-2 rounded border text-sm font-bold pName">
                    <select class="p-2 rounded border font-bold text-xs pStatus">
                        <option value="ascenso">🏆 Ascenso</option>
                        <option value="penalizacion">💀 Penalización</option>
                        <option value="degradacion">⏳ Degradación</option>
                    </select>
                </div>
                <input type="text" placeholder="Motivo del estatus..." class="w-full p-2 rounded border text-[10px] pDesc">
            `;
            document.getElementById('playersList').appendChild(div);
        }

        document.getElementById('addPlayerBtn').onclick = createPlayerRow;
        createPlayerRow();

        document.getElementById('publishBtn').onclick = async () => {
            const type = document.getElementById('eventType').value;
            const date = document.getElementById('eventDate').value;
            const title = document.getElementById('eventTitle').value;

            if (!title || !date) return showMsg("Faltan datos del evento", true);

            const players = [];
            document.querySelectorAll('#playersList > div').forEach(row => {
                const name = row.querySelector('.pName').value.trim();
                if (name) {
                    players.push({
                        name: name,
                        statusType: row.querySelector('.pStatus').value,
                        desc: row.querySelector('.pDesc').value.trim()
                    });
                }
            });

            if (players.length === 0) return showMsg("Añade al menos un jugador", true);

            try {
                await signInAnonymously(auth);
                const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'estatus_eventos');
                
                await addDoc(colRef, {
                    type,
                    date,
                    title,
                    players,
                    createdAt: serverTimestamp(),
                    clave_secreta: "Genesis_Elite_2026"
                });

                showMsg("¡Bitácora actualizada con éxito!");
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                console.error(error);
                showMsg("Error de conexión", true);
            }
        };