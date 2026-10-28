// 1. Initialize Supabase
const supabaseUrl = 'https://okehpnsfcjbtweuejejs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZWhwbnNmY2pidHdldWVqZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDIyMjYsImV4cCI6MjEwODE3ODIyNn0.xJRSQeHtlqEOOYQsnim30FRgI2EaTsEYka0o6Iy7D_c';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const grid        = document.getElementById("productGrid");
const form        = document.getElementById("searchForm");
const input       = document.getElementById("searchInput");
const noResults   = document.getElementById("noResults");
const resultCount = document.getElementById("resultCount");

// Check if the logged-in user is an Admin
const userRole = localStorage.getItem('userRole');
const isAdmin = userRole ? userRole.toLowerCase() === 'admin' :true;

// Add this to see what it finds in the console
console.log("Current User Role:", userRole);
console.log("Is Admin?:", isAdmin);

// If they are an Admin, show the "Add Product" button
if (isAdmin) {
    document.getElementById('addProductBtn').style.display = 'inline-block';
}

let products = [];

// 2. Fetch data from Supabase
async function loadProducts() {
  const { data, error } = await supabaseClient.from('products').select('*');

  if (error) {
    console.error("Error loading products:", error);
    return;
  }

  // Mapped 'id' so we can edit specific rows
  products = data.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    image: item.image_url
  }));

  render(products);
}

// 3. Render Function
function render(list) {
  const sorted = [...list].sort((a, b) => {
    const catA = a.category.toLowerCase();
    const catB = b.category.toLowerCase();
    if (catA < catB) return -1;
    if (catA > catB) return 1;
    return a.name.localeCompare(b.name);
  });

  const grouped = sorted.reduce((acc, product) => {
    const cat = product.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  let htmlString = "";

  for (const category in grouped) {
    htmlString += `<h2 class="category-title">${category}</h2>`;
    htmlString += `<section class="product-grid">`;
    
    htmlString += grouped[category].map(p => `
      <article class="product-card">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
        <div class="card-body">
          <span class="product-category">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-price">
            ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(p.price)}
          </p>
          ${isAdmin ? `<button class="edit-btn" onclick="openModal(${p.id})">Edit</button>` : ''}
        </div>
      </article>
    `).join("");
    
    htmlString += `</section>`;
  }

  grid.innerHTML = htmlString;
  noResults.hidden = list.length > 0;
  resultCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"} found`;
}

// 4. Search logic
function search() {
  const q = input.value.trim().toLowerCase();
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) 
  );
  render(filtered);
}

form.addEventListener("submit", e => { e.preventDefault(); search(); });
input.addEventListener("input", search);

// 5. Modal Logic (Add / Edit)
const modal = document.getElementById("productModal");

function openModal(id = null) {
    if (!isAdmin) return; // Extra security check

    if (id) {
        // EDIT MODE
        const product = products.find(p => p.id === id);
        document.getElementById('modalTitle').innerText = "Edit Product";
        document.getElementById('productId').value = product.id;
        document.getElementById('pName').value = product.name;
        document.getElementById('pCategory').value = product.category;
        document.getElementById('pPrice').value = product.price;
        document.getElementById('pImage').value = product.image;
    } else {
        // ADD MODE
        document.getElementById('modalTitle').innerText = "Add New Product";
        document.getElementById('productId').value = ""; // Clear ID
        document.getElementById('pName').value = "";
        document.getElementById('pCategory').value = "";
        document.getElementById('pPrice').value = "";
        document.getElementById('pImage').value = "";
    }
    
    modal.style.display = "block";
}

function closeModal() {
    modal.style.display = "none";
}

// 6. Save Logic (Insert or Update)
async function saveProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('pName').value;
    const category = document.getElementById('pCategory').value;
    const price = parseFloat(document.getElementById('pPrice').value);
    const image = document.getElementById('pImage').value;

    if (!name || !category || isNaN(price) || !image) {
        alert("Please fill out all fields correctly.");
        return;
    }

    const productData = {
        name: name,
        category: category,
        price: price,
        image_url: image
    };

    if (id) {
        // UPDATE EXISTING
        const { error } = await supabaseClient.from('products').update(productData).eq('id', id);
        if (error) alert("Error updating: " + error.message);
        else { closeModal(); loadProducts(); }
    } else {
        // INSERT NEW
        const { error } = await supabaseClient.from('products').insert([productData]);
        if (error) alert("Error inserting: " + error.message);
        else { closeModal(); loadProducts(); }
    }
}

// 7. Navigation
function backBtnFunction() {
  window.location.href = "home.html";
}

// Start app
loadProducts();