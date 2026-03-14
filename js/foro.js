import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
 * 
 */
const firebaseConfig = {
    apiKey: "AIzaSyBIO9an0ZFAMdvJNOuV_Mb6ulZzVego_N8",
    authDomain: "comentariosgeminis-coc.firebaseapp.com",
    projectId: "comentariosgeminis-coc",
    storageBucket: "comentariosgeminis-coc.firebasestorage.app",
    messagingSenderId: "227180378242",
    appId: "1:227180378242:web:7ab611322962fba91fdc9b"
};

// Elementos del DOM
const loader = document.getElementById('loader');
const loaderContent = document.getElementById('loaderContent');
const commentsContainer = document.getElementById('commentsContainer');
const sendBtn = document.getElementById('sendBtn');
const userNameInput = document.getElementById('userName');
const commentTextInput = document.getElementById('commentText');

let currentUser = null;
let db = null;
let appId = null;

/**
 * Función de reintento con retroceso exponencial para operaciones críticas
 */
async function withRetry(fn, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try { return await fn(); }
        catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
}

/**
 * Inicialización de la aplicación y autenticación
 */
const init = async () => {
    try {
        // 1. Obtener configuración (variables inyectadas por el entorno)
        let config;
        try {
            config = typeof __firebase_config !== 'undefined'
                ? (typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config)
                : null;
        } catch (e) {
            throw new Error("Error al procesar la configuración de Firebase.");
        }

        if (!config) throw new Error("Configuración de Firebase no encontrada.");

        const app = initializeApp(config);
        const auth = getAuth(app);
        db = getFirestore(app);
        appId = typeof __app_id !== 'undefined' ? __app_id : 'genesis-coc';

        // 2. Autenticación antes de cualquier operación de base de datos
        await withRetry(async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        });

        // 3. Gestionar el estado del usuario y cargar datos
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                if (loader) loader.style.display = 'none';
                setupCommentsListener();
            }
        });

        // Configurar el evento de envío
        setupForm();

    } catch (err) {
        console.error("Fallo en la inicialización:", err);
        if (loaderContent) {
            loaderContent.innerHTML = `
                <div class="text-red-400 p-6 bg-black/50 rounded-2xl border-2 border-red-500">
                    <p class="mb-4 font-bold">Error de conexión</p>
                    <p class="text-xs font-sans mb-4">${err.message}</p>
                    <button onclick="location.reload()" class="bg-white text-red-600 px-6 py-2 rounded-xl coc-font uppercase italic text-sm shadow-lg">Reintentar</button>
                </div>
            `;
            loaderContent.classList.remove('animate-pulse');
        }
    }
};

/**
 * Escucha cambios en la colección de debate en tiempo real
 */
function setupCommentsListener() {
    if (!currentUser || !db) return;

    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'debate');

    onSnapshot(colRef, (snapshot) => {
        const comments = [];
        snapshot.forEach(doc => {
            comments.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar en memoria por fecha (más recientes primero)
        comments.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        renderComments(comments);
    }, (err) => {
        console.error("Error al leer comentarios:", err);
    });
}

/**
 * Renderiza la lista de comentarios en el contenedor
 */
function renderComments(comments) {
    if (!commentsContainer) return;

    commentsContainer.innerHTML = '';
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="text-white/60 text-center italic">El tablón está vacío. ¡Escribe el primer comentario!</p>';
        return;
    }

    comments.forEach(c => {
        const date = c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'Hace un momento';
        const div = document.createElement('div');
        div.className = 'comment-bubble p-4 mb-4';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2 border-b border-amber-900/10 pb-1">
                <span class="font-black text-amber-900 uppercase text-xs italic">${c.author || 'Aldeano'}</span>
                <span class="text-[10px] text-amber-800/60 font-bold">${date}</span>
            </div>
            <p class="text-amber-950 font-medium leading-tight text-sm">${c.text || ''}</p>
        `;
        commentsContainer.appendChild(div);
    });
}

/**
 * Configura la lógica del botón de envío
 */
function setupForm() {
    if (!sendBtn) return;

    sendBtn.onclick = async () => {
        if (!currentUser || !db) return;

        const author = userNameInput.value.trim();
        const text = commentTextInput.value.trim();

        if (!author || !text) return;

        sendBtn.disabled = true;
        sendBtn.innerText = 'Enviando...';

        try {
            const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'debate');
            await addDoc(colRef, {
                author: author,
                text: text,
                createdAt: serverTimestamp(),
                userId: currentUser.uid
            });
            commentTextInput.value = '';
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerText = 'Publicar Comentario';
        }
    };
}

// Iniciar la lógica de la página
init();