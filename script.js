const waNumber = "6285798111205"; // Nomor WhatsApp Tujuan
let selectedProduct = "";
let selectedPriceNum = 0;
let cart = []; // Array Keranjang Belanja

// Database Akun Lokal Sederhana
let users = JSON.parse(localStorage.getItem('smk_muthia_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('smk_muthia_session')) || null;

// Keranjang disimpan per akun, jadi tidak hilang saat halaman di-refresh
function cartKey() {
  return `smk_muthia_cart_${currentUser ? currentUser.email : 'guest'}`;
}

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem(cartKey())) || [];
  } catch (e) {
    cart = [];
  }
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem(cartKey(), JSON.stringify(cart));
}

// Cek Sesi Login Ketika Pertama Kali Dibuka
window.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    showMainApp();
  } else {
    showAuthContainer();
  }
});

// Pindah Tampilan Antara Form Login & Register
function switchAuthMode(mode) {
  if (mode === 'register') {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
  } else {
    document.getElementById('registerCard').style.display = 'none';
    document.getElementById('loginCard').style.display = 'block';
  }
}

// Proses Registrasi Akun Baru
function handleRegister(event) {
  event.preventDefault();
  const nama = document.getElementById('regNama').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  // Cek apakah email/NISN sudah terdaftar
  const isExist = users.some(u => u.email === email);
  if (isExist) {
    alert("Email atau NISN ini sudah terdaftar. Silakan login!");
    return;
  }

  // Simpan User Baru
  const newUser = { nama, email, password };
  users.push(newUser);
  localStorage.setItem('smk_muthia_users', JSON.stringify(users));

  alert("Registrasi berhasil! Silakan masuk dengan akun Anda.");
  switchAuthMode('login');
  document.getElementById('registerForm').reset();
}

// Proses Login Akun
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const foundUser = users.find(u => u.email === email && u.password === password);

  if (foundUser || (email === 'admin' && password === '1234')) {
    currentUser = foundUser || { nama: 'Siswa SMK Muthia', email: 'admin' };
    localStorage.setItem('smk_muthia_session', JSON.stringify(currentUser));
    
    alert(`Selamat datang kembali, ${currentUser.nama}!`);
    showMainApp();
  } else {
    alert("Email/NISN atau Kata Sandi yang Anda masukkan salah!");
  }
}

// Tampilkan Aplikasi Utama setelah Login
function showMainApp() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  loadCart();
}

// Tampilkan Form Login jika Belum Login
function showAuthContainer() {
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('authContainer').style.display = 'block';
}

// Fungsi Logout (Keluar Akun)
function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
    localStorage.removeItem('smk_muthia_session');
    currentUser = null;
    cart = [];
    updateCartBadge();
    showAuthContainer();
  }
}

// Switch Halaman Navigasi Beranda
function switchTab(tabName) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

  document.getElementById(`sec-${tabName}`).classList.add('active');
  document.getElementById(`nav-${tabName}`).classList.add('active');
}

// Modal Detail Pemesanan Produk
function openOrderModal(productName, price) {
  selectedProduct = productName;
  selectedPriceNum = price;
  document.getElementById('modalProductName').innerText = `Pesan ${productName} (Rp. ${price.toLocaleString('id-ID')})`;
  document.getElementById('orderSize').value = 'M';
  document.getElementById('orderQty').value = 1;
  document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

// Modal Keranjang Belanja
function openCartModal() {
  renderCartItems();
  document.getElementById('cartModal').style.display = 'flex';
}

function closeCartModal() {
  document.getElementById('cartModal').style.display = 'none';
}

// Tambah Produk ke Keranjang
function addToCart() {
  const size = document.getElementById('orderSize').value;
  const qty = parseInt(document.getElementById('orderQty').value, 10);

  if (!qty || qty < 1) {
    alert("Jumlah beli minimal 1.");
    return;
  }

  const existingIndex = cart.findIndex(item => item.name === selectedProduct && item.size === size);

  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({
      name: selectedProduct,
      price: selectedPriceNum,
      size: size,
      qty: qty
    });
  }

  saveCart();
  updateCartBadge();
  closeOrderModal();
  alert(`${selectedProduct} (${size}) berhasil ditambahkan ke keranjang!`);
}

function updateCartBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCountBadge').innerText = totalCount;
}

function renderCartItems() {
  const listContainer = document.getElementById('cartItemsList');
  const totalPriceElem = document.getElementById('cartTotalPrice');

  if (cart.length === 0) {
    listContainer.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:20px 0;">Keranjang belanja masih kosong.</p>`;
    totalPriceElem.innerText = "Rp. 0";
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    html += `
      <div class="cart-item">
        <div>
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-sub">Ukuran: ${item.size} | @ Rp. ${item.price.toLocaleString('id-ID')}</div>
          <div class="cart-qty">
            <button type="button" class="cart-qty-btn" onclick="changeQty(${index}, -1)">−</button>
            <span>${item.qty}</span>
            <button type="button" class="cart-qty-btn" onclick="changeQty(${index}, 1)">+</button>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <strong>Rp. ${itemTotal.toLocaleString('id-ID')}</strong>
          <span class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></span>
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;
  totalPriceElem.innerText = `Rp. ${total.toLocaleString('id-ID')}`;
}

function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty < 1) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartItems();
}

// Beli Langsung (Kirim ke WhatsApp)
function sendDirectOrderToWA() {
  const size = document.getElementById('orderSize').value;
  const qty = parseInt(document.getElementById('orderQty').value, 10);
  if (!qty || qty < 1) {
    alert("Jumlah beli minimal 1.");
    return;
  }
  const totalHarga = (selectedPriceNum * qty).toLocaleString('id-ID');

  const pembeli = currentUser ? currentUser.nama : "Siswa SMK Muthia";

  const message = `Halo Koperasi Digital SMK Muthia,\n\nSaya *${pembeli}* ingin memesan produk berikut:\n- *Produk:* ${selectedProduct}\n- *Ukuran:* ${size}\n- *Jumlah:* ${qty} pcs\n- *Total Harga:* Rp. ${totalHarga}\n\nMohon konfirmasi pesanan saya. Terima kasih!`;

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(waLink, '_blank');
  closeOrderModal();
}

// Kirim Semua Isi Keranjang ke WhatsApp
function sendCartToWA() {
  if (cart.length === 0) {
    alert("Keranjang belanja Anda masih kosong!");
    return;
  }

  const pembeli = currentUser ? currentUser.nama : "Siswa SMK Muthia";
  let textList = "";
  let totalBiaya = 0;

  cart.forEach((item, i) => {
    const itemSubtotal = item.price * item.qty;
    totalBiaya += itemSubtotal;
    textList += `${i + 1}. *${item.name}* (Ukuran: ${item.size}) - ${item.qty} pcs = Rp. ${itemSubtotal.toLocaleString('id-ID')}\n`;
  });

  const message = `Halo Koperasi Digital SMK Muthia,\n\nSaya *${pembeli}* ingin memesan beberapa produk dari keranjang belanja:\n\n${textList}\n*Total Seluruhnya:* Rp. ${totalBiaya.toLocaleString('id-ID')}\n\nMohon diproses, terima kasih!`;

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(waLink, '_blank');
  closeCartModal();
}

// Form Hubungi Kami
function sendContactToWA(event) {
  event.preventDefault();
  const nama = document.getElementById('contactNama').value;
  const email = document.getElementById('contactEmail').value;
  const pesan = document.getElementById('contactPesan').value;

  const message = `Halo Koperasi Digital SMK Muthia,\n\nAda pesan baru dari formulir *Hubungi Kami*:\n- *Nama Lengkap:* ${nama}\n- *Email:* ${email}\n- *Pesan:* ${pesan}`;

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(waLink, '_blank');
}
