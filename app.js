// 🔥 CONFIG FIREBASE - MÊME PROJET
const firebaseConfig = {
  apiKey: "AIzaSyCuFWrXl7A2PfoXiMSezgmnO-Ia_qR5z9o",
  authDomain: "betsaleel-docs.firebaseapp.com",
  projectId: "betsaleel-docs",
  storageBucket: "betsaleel-docs.firebasestorage.app",
  messagingSenderId: "553632456671",
  appId: "1:553632456671:web:3f38ccee6474b63f996e6a"
};

// ⚙️ CONFIG
const EMAILJS_PUBLIC_KEY = "AUJu3pIpQ9VoyIKr6";
const EMAILJS_SERVICE_ID = "service_d72fojp"; 
const EMAILJS_TEMPLATE_ID = "template_7nnau28";
const ADMIN_PASS = "Betsaleel2026@";
const OM_NUMBER = "22606625715"; // Pour WhatsApp
const ADMIN_WHATSAPP = "22606625715"; // Ton numéro

// Init
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
emailjs.init(EMAILJS_PUBLIC_KEY);

let cart = JSON.parse(localStorage.getItem('edudocs_premium_cart') || '[]');
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

// Header scroll
window.addEventListener('scroll', () => {
  const header = $('#header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 20);
});

// Rendu documents
async function renderDocs() {
  try {
    const docsRef = await db.collection('documents').orderBy('createdAt', 'desc').get();
    allDocs = docsRef.docs.map(d => ({ id: d.id, ...d.data() }));
    displayDocs(allDocs);
    $('#loadingDocs')?.style.setProperty('display', 'none');
  } catch (err) {
    console.error('Firestore Error:', err);
    $('#loadingDocs').innerHTML = `<p class="empty">Erreur: ${err.message}<br>Vérifie les règles Firestore.</p>`;
  }
}

function displayDocs(docs) {
  const grid = $('#docsGrid');
  if (!grid) return;
  if (!docs.length) {
    grid.innerHTML = '<p class="empty" style="grid-column:1/-1">Aucun document. Ajoute-en via /admin.html</p>';
    return;
  }
  grid.innerHTML = docs.map(d => `
    <div class="card">
      <img src="${d.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600'}" alt="${d.title}" loading="lazy">
      <div class="body">
        <span class="badge">${d.niveau} • ${d.matiere}</span>
        <h3>${d.title}</h3>
        <p>${d.description || 'Document pédagogique de qualité.'}</p>
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
    d.niveau.toLowerCase().includes(q)
  );
  displayDocs(filtered);
});

// Panier
window.addToCart = async (id) => {
  try {
    const doc = await db.collection('documents').doc(id).get();
    if (!doc.exists) return toast('Document introuvable', 'error');
    const item = { id, ...doc.data() };
    if (!cart.find(c => c.id === id)) {
      cart.push(item);
      localStorage.setItem('edudocs_premium_cart', JSON.stringify(cart));
      updateCartUI();
      toast('Ajouté au panier !');
      $('#cartBtn')?.click();
    } else {
      toast('Déjà dans le panier', 'error');
    }
  } catch (err) {
    toast('Erreur: ' + err.message, 'error');
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
  $('#cartTotal')?.textContent = money(total);
  $('#cartTotal2')?.textContent = money(total);
  const cartItems = $('#cartItems');
  if (cartItems) {
    cartItems.innerHTML = cart.length ? cart.map(i => `
      <div class="cart-item">
        <div>
          <strong>${i.title}</strong><br>
          <span style="color:var(--muted);font-size:14px">${i.niveau} • ${i.matiere}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-weight:700">${money(i.price)}</span>
          <button class="icon-btn" onclick="removeFromCart('${i.id}')">🗑️</button>
        </div>
      </div>
    `).join('') : '<p class="empty">Ton panier est vide</p>';
  }
}

window.removeFromCart = (id) => {
  cart = cart.filter(c => c.id !== id);
  localStorage.setItem('edudocs_premium_cart', JSON.stringify(cart));
  updateCartUI();
  toast('Retiré du panier');
};

// Filtres
$$('.filter-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    const filtered = f === 'all' ? allDocs : allDocs.filter(d => d.niveau === f || d.matiere === f);
    displayDocs(filtered);
    $('#docs')?.scrollIntoView({behavior:'smooth'});
  };
});

// Modals
$('#cartBtn')?.addEventListener('click', () => $('#cartModal').classList.add('show'));
$('#closeCart')?.addEventListener('click', () => $('#cartModal').classList.remove('show'));
$('#checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) return toast('Panier vide', 'error');
  $('#cartModal').classList.remove('show');
  $('#checkoutModal').classList.add('show');
});
$('#closeCheckout')?.addEventListener('click', () => $('#checkoutModal').classList.remove('show'));
$('#closeSuccess')?.addEventListener('click', () => $('#successModal').classList.remove('show'));
$$('.modal').forEach(m => m.addEventListener('click', e => {
  if (e.target === m) m.classList.remove('show');
}));

// COMMANDE AVEC VALIDATION ADMIN
$('#checkoutForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#submitOrder');
  btn.disabled = true;
  btn.innerHTML = 'Enregistrement... <div class="spinner"></div>';
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
    
    const adminMsg = `🔔 COMMANDE EDU DOCS PREMIUM\n\n👤 ${orderData.nom}\n📧 ${orderData.email}\n📱 ${orderData.telephone}\n💳 ID: ${orderData.transactionId}\n💰 ${money(orderData.total)}\n\n📚 ${cart.length} doc(s)\n\nValide: ${window.location.origin}/admin.html`;
    
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMsg)}`, '_blank');
    
    $('#checkoutModal').classList.remove('show');
    $('#successModal').classList.add('show');
    cart = [];
    localStorage.removeItem('edudocs_premium_cart');
    updateCartUI();
    $('#checkoutForm').reset();
    
  } catch (err) {
    console.error(err);
    toast('Erreur: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Confirmer et payer';
  }
});

// ADMIN
if (window.location.pathname.includes('admin')) {
  $('#adminLogin')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#adminPass').value === ADMIN_PASS) {
      $('#loginScreen').style.display = 'none';
      $('#adminDashboard').style.display = 'block';
      loadAdminDocs();
      loadAdminOrders();
      toast('Bienvenue Admin !');
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
      toast('Document publié !');
    } catch (err) {
      toast('Erreur: ' + err.message, 'error');
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
    $('#docsList').innerHTML = docs.size ? docs.docs.map(d => {
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
    }).join('') : '<p class="empty">Aucun document</p>';
  } catch (err) { 
    console.error(err);
    toast('Erreur chargement docs', 'error');
  }
}

async function loadAdminOrders() {
  try {
    const orders = await db.collection('orders').orderBy('createdAt', 'desc').limit(20).get();
    $('#ordersList').innerHTML = orders.size ? orders.docs.map(o => {
      const ord = o.data();
      const date = ord.createdAt?.toDate().toLocaleString('fr-FR', {dateStyle:'short',timeStyle:'short'}) || '';
      const statusColor = ord.status === 'pending' ? '#f59e0b' : ord.status === 'validated' ? '#10b981' : '#ef4444';
      const statusText = ord.status === 'pending' ? 'En attente' : ord.status === 'validated' ? 'Validée' : 'Refusée';
      
      return `
        <div class="item-row" style="flex-direction:column;align-items:stretch;gap:12px">
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <strong>${ord.nom}</strong>
              <span class="badge" style="background:${statusColor};color:#fff">${statusText}</span>
            </div>
            <div style="font-size:13px;color:var(--muted);line-height:1.8">
              📧 ${ord.email}<br>
              📱 ${ord.telephone}<br>
              💳 ${ord.transactionId}<br>
              💰 ${money(ord.total)}<br>
              🕐 ${date}
            </div>
            <div style="margin-top:8px;font-size:13px">
              <strong>Documents:</strong><br>
              ${ord.items.map(i => `• ${i.title}`).join('<br>')}
            </div>
          </div>
          ${ord.status === 'pending' ? `
            <div style="display:flex;gap:8px">
              <button class="btn full" style="background:var(--success)" onclick="validateOrder('${o.id}')">✅ Valider & Envoyer</button>
              <button class="btn danger" onclick="rejectOrder('${o.id}')">❌</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('') : '<p class="empty">Aucune commande</p>';
  } catch (err) { 
    console.error(err);
    toast('Erreur chargement commandes', 'error');
  }
}

window.validateOrder = async (orderId) => {
  if (!confirm('Paiement Orange Money reçu ? Confirmer ?')) return;
  
  try {
    const orderDoc = await db.collection('orders').doc(orderId).get();
    const order = orderDoc.data();
    
    await db.collection('orders').doc(orderId).update({
      status: 'validated',
      validatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    const listeHtml = order.items.map(i => `
      <div style="margin-bottom:16px;padding:16px;background:#f8fafc;border-radius:12px;border-left:4px solid #4f46e5">
        <strong style="font-size:16px">${i.title}</strong><br>
        <span style="color:#64748b;font-size:14px">${i.niveau} • ${i.matiere}</span><br>
        <a href="https://drive.google.com/uc?export=download&id=${i.driveId}" style="color:#4f46e5;font-weight:600;text-decoration:none;margin-top:8px;display:inline-block">📥 Télécharger le PDF</a>
      </div>
    `).join('');
    
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: order.email,
      nom_client: order.nom,
      email_client: order.email,
      id_transaction: order.transactionId,
      total: money(order.total),
      liste_documents: listeHtml,
      om_number: OM_NUMBER
    });
    
    const waLinks = order.items.map(i => 
      `📄 ${i.title}\n🔗 https://drive.google.com/uc?export=download&id=${i.driveId}`
    ).join('\n\n');
    
    const waMessage = `🎉 Bonjour ${order.nom} !\n\nTon paiement de ${money(order.total)} est confirmé ✅\n\nVoici tes documents Edu Docs Premium :\n\n${waLinks}\n\nMerci pour ta confiance ! 💪`;
    
    const clientPhone = order.telephone.replace(/\D/g, '');
    window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(waMessage)}`, '_blank');
    
    toast('Commande validée ! Email + WhatsApp envoyés');
    loadAdminOrders();
    
  } catch (err) {
    console.error(err);
    toast('Erreur: ' + err.message, 'error');
  }
};

window.rejectOrder = async (orderId) => {
  if (!confirm('Refuser cette commande ?')) return;
  try {
    await db.collection('orders').doc(orderId).update({ status: 'rejected' });
    toast('Commande refusée');
    loadAdminOrders();
  } catch (err) {
    toast('Erreur: ' + err.message, 'error');
  }
};

window.deleteDoc = async (id) => {
  if (confirm('Supprimer ce document définitivement ?')) {
    try {
      await db.collection('documents').doc(id).delete();
      loadAdminDocs();
      toast('Document supprimé');
    } catch (err) {
      toast('Erreur: ' + err.message, 'error');
    }
  }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderDocs();
  updateCartUI();
});