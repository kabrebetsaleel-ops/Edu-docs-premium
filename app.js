// 🔥 CONFIG FIREBASE - TES VRAIES CLÉS
const firebaseConfig = {
  apiKey: "AIzaSyCuFWrXl7A2PfoXiMSezgmnO-Ia_qR5z9o",
  authDomain: "betsaleel-docs.firebaseapp.com",
  projectId: "betsaleel-docs",
  storageBucket: "betsaleel-docs.firebasestorage.app",
  messagingSenderId: "553632456671",
  appId: "1:553632456671:web:3f38ccee6474b63f996e6a"
};

// ⚙️ CONFIG EMAILJS - TA VRAIE CLÉ
const EMAILJS_PUBLIC_KEY = "AUJu3pIpQ9VoyIKr6";
const EMAILJS_SERVICE_ID = "service_d72fojp"; 
const EMAILJS_TEMPLATE_ID = "template_7nnau28";
const ADMIN_PASS = "Betsaleel2026@";
const OM_NUMBER = "+226 06 62 57 15";

// Init
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
emailjs.init(EMAILJS_PUBLIC_KEY);

let cart = JSON.parse(localStorage.getItem('edudocs_cart') || '[]');
let allDocs = [];

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
const toast = (msg, type = 'success') => {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
};

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = $('#header');
  if (header) {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
});

// Rendu documents
async function renderDocs() {
  try {
    const docsRef = await db.collection('documents').orderBy('createdAt', 'desc').get();
    allDocs = docsRef.docs.map(d => ({ id: d.id, ...d.data() }));
    displayDocs(allDocs);
    $('#loadingDocs').style.display = 'none';
  } catch (err) {
    console.error(err);
    $('#loadingDocs').innerHTML = '<p class="empty">Impossible de charger les documents. Vérifie ta connexion.</p>';
  }
}

function displayDocs(docs) {
  const grid = $('#docsGrid');
  if (!grid) return;
  if (!docs.length) {
    grid.innerHTML = '<p class="empty" style="grid-column:1/-1">Aucun document ne correspond à ta recherche</p>';
    return;
  }
  grid.innerHTML = docs.map(d => `
    <div class="card">
      <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop'}" alt="${d.title}" loading="lazy">
      <div class="body">
        <span class="badge">${d.niveau} • ${d.matiere}</span>
        <h3>${d.title}</h3>
        <p>${d.description || 'Document pédagogique de qualité pour t’aider à progresser.'}</p>
        <div class="price-row">
          <div class="price">${money(d.price)}</div>
          <button class="btn" onclick="addToCart('${d.id}')">Ajouter +</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Recherche
$('#searchInput')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  const filtered = !q ? allDocs : allDocs.filter(d => 
    d.title.toLowerCase().includes(q) || 
    d.matiere.toLowerCase().includes(q) ||
    d.niveau.toLowerCase().includes(q) ||
    d.description?.toLowerCase().includes(q)
  );
  displayDocs(filtered);
});

// Panier
window.addToCart = async (id) => {
  const doc = await db.collection('documents').doc(id).get();
  const item = { id, ...doc.data() };
  if (!cart.find(c => c.id === id)) {
    cart.push(item);
    localStorage.setItem('edudocs_cart', JSON.stringify(cart));
    updateCartUI();
    toast('Document ajouté au panier !');
    $('#cartBtn').click();
  } else {
    toast('Ce document est déjà dans ton panier', 'error');
  }
};

function updateCartUI() {
  const cartCount = $('#cartCount');
  if (cartCount) {
    cartCount.textContent = cart.length;
    cartCount.style.animation = 'none';
    setTimeout(() => cartCount.style.animation = 'pop .3s', 10);
  }
  const total = cart.reduce((s, i) => s + i.price, 0);
  const cartTotal = $('#cartTotal');
  const cartTotal2 = $('#cartTotal2');
  if (cartTotal) cartTotal.textContent = money(total);
  if (cartTotal2) cartTotal2.textContent = money(total);
  const cartItems = $('#cartItems');
  if (cartItems) {
    cartItems.innerHTML = cart.length ? cart.map(i => `
      <div class="cart-item">
        <div>
          <strong>${i.title}</strong><br>
          <span style="color:var(--muted);font-size:14px">${i.niveau} • ${i.matiere}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-weight:700;font-size:16px">${money(i.price)}</span>
          <button class="icon-btn" onclick="removeFromCart('${i.id}')" title="Retirer">🗑️</button>
        </div>
      </div>
    `).join('') : '<p class="empty">Ton panier est vide</p>';
  }
}

window.removeFromCart = (id) => {
  cart = cart.filter(c => c.id !== id);
  localStorage.setItem('edudocs_cart', JSON.stringify(cart));
  updateCartUI();
  toast('Document retiré');
};

// Filtres
$$('.filter-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    const filtered = f === 'all' ? allDocs : allDocs.filter(d => d.niveau === f || d.matiere === f);
    displayDocs(filtered);
    $('#docs').scrollIntoView({behavior:'smooth',block:'start'});
  };
});

// Modals
$('#cartBtn')?.addEventListener('click', () => $('#cartModal').classList.add('show'));
$('#closeCart')?.addEventListener('click', () => $('#cartModal').classList.remove('show'));
$('#checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) return toast('Ton panier est vide', 'error');
  $('#cartModal').classList.remove('show');
  $('#checkoutModal').classList.add('show');
});
$('#closeCheckout')?.addEventListener('click', () => $('#checkoutModal').classList.remove('show'));
$('#closeSuccess')?.addEventListener('click', () => $('#successModal').classList.remove('show'));

// Fermer modal clic dehors
$$('.modal').forEach(m => m.addEventListener('click', e => {
  if (e.target === m) m.classList.remove('show');
}));

// Commande
$('#checkoutForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#submitOrder');
  btn.disabled = true;
  btn.innerHTML = 'Vérification en cours... <div class="spinner"></div>';
  try {
    const orderData = {
      nom: $('#clientName').value.trim(),
      email: $('#clientEmail').value.trim(),
      transactionId: $('#transactionId').value.trim(),
      telephone: $('#clientPhone').value.trim(),
      items: cart,
      total: cart.reduce((s, i) => s + i.price, 0),
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('orders').add(orderData);
    const listeHtml = cart.map(i => `
      <div style="margin-bottom:16px;padding:16px;background:#f8fafc;border-radius:12px;border-left:4px solid #4f46e5">
        <strong style="font-size:16px">${i.title}</strong><br>
        <span style="color:#64748b;font-size:14px">${i.niveau} • ${i.matiere}</span><br>
        <a href="https://drive.google.com/uc?export=download&id=${i.driveId}" style="color:#4f46e5;font-weight:600;text-decoration:none;margin-top:8px;display:inline-block">📥 Télécharger le PDF</a>
      </div>
    `).join('');
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: orderData.email,
      nom_client: orderData.nom,
      email_client: orderData.email,
      id_transaction: orderData.transactionId,
      total: money(orderData.total),
      liste_documents: listeHtml,
      om_number: OM_NUMBER
    });
    $('#checkoutModal').classList.remove('show');
    $('#successModal').classList.add('show');
    cart = [];
    localStorage.removeItem('edudocs_cart');
    updateCartUI();
    $('#checkoutForm').reset();
  } catch (err) {
    console.error(err);
    toast('Erreur lors de la commande : ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Confirmer et payer';
  }
});

// Admin
if (window.location.pathname.includes('admin')) {
  $('#adminLogin')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#adminPass').value === ADMIN_PASS) {
      $('#loginScreen').style.display = 'none';
      $('#adminDashboard').style.display = 'block';
      loadAdminDocs();
      loadAdminOrders();
      toast('Bienvenue dans l’admin !');
    } else {
      toast('Mot de passe incorrect', 'error');
    }
  });
  
  $('#logoutBtn')?.addEventListener('click', () => {
    $('#loginScreen').style.display = 'flex';
    $('#adminDashboard').style.display = 'none';
    $('#adminPass').value = '';
  });
  
  $('#docForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = 'Publication... <div class="spinner"></div>';
    try {
      await db.collection('documents').add({
        title: $('#docTitle').value.trim(),
        niveau: $('#docNiveau').value,
        matiere: $('#docMatiere').value,
        price: parseInt($('#docPrice').value),
        driveId: $('#docDriveId').value.trim(),
        description: $('#docDesc').value.trim(),
        imageUrl: $('#docImage').value.trim() || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      e.target.reset();
      loadAdminDocs();
      toast('Document publié avec succès !');
    } catch (err) {
      toast('Erreur : ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '🚀 Publier le document';
    }
  });
}

async function loadAdminDocs() {
  try {
    const docs = await db.collection('documents').orderBy('createdAt', 'desc').get();
    $('#docsCount').textContent = docs.size;
    const docsList = $('#docsList');
    if (docsList) {
      docsList.innerHTML = docs.size ? docs.docs.map(d => {
        const doc = d.data();
        return `
          <div class="item-row">
            <div>
              <strong>${doc.title}</strong> - ${money(doc.price)}<br>
              <span style="color:var(--muted);font-size:13px">${doc.niveau} • ${doc.matiere}</span>
            </div>
            <button class="btn danger" onclick="deleteDoc('${d.id}')">Supprimer</button>
          </div>
        `;
      }).join('') : '<p class="empty">Aucun document publié</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadAdminOrders() {
  try {
    const orders = await db.collection('orders').orderBy('createdAt', 'desc').limit(20).get();
    const ordersList = $('#ordersList');
    if (ordersList) {
      ordersList.innerHTML = orders.size ? orders.docs.map(o => {
        const ord = o.data();
        const date = ord.createdAt?.toDate().toLocaleString('fr-FR', {dateStyle:'short',timeStyle:'short'}) || '';
        return `
          <div class="item-row">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <strong>${ord.nom}</strong>
                <span class="badge">${money(ord.total)}</span>
              </div>
              <div style="font-size:13px;color:var(--muted);line-height:1.6">
                📧 ${ord.email}<br>
                💳 ${ord.transactionId}<br>
                🕐 ${date}
              </div>
            </div>
          </div>
        `;
      }).join('') : '<p class="empty">Aucune commande pour l’instant</p>';
    }
  } catch (err) {
    console.error(err);
  }
}

window.deleteDoc = async (id) => {
  if (confirm('Supprimer ce document définitivement ?')) {
    try {
      await db.collection('documents').doc(id).delete();
      loadAdminDocs();
      toast('Document supprimé');
    } catch (err) {
      toast('Erreur : ' + err.message, 'error');
    }
  }
};

// Init
renderDocs();
updateCartUI();