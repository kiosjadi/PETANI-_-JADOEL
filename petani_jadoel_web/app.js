const plantContainer = document.getElementById('plantContainer');
const searchInput = document.getElementById('searchInput');
const kategoriFilter = document.getElementById('kategoriFilter');
const mediaFilter = document.getElementById('mediaFilter');
const sortFilter = document.getElementById('sortFilter');

let plants = [];

fetch('petani_jadoel.json')
  .then(res => res.json())
  .then(data => {
    plants = data.tanaman;
    populateFilters();
    displayPlants(plants);
  }).catch(err => {
    plantContainer.innerHTML = '<p class="small">Gagal load data. Pastikan petani_jadoel.json ada di folder yang sama.</p>';
    console.error(err);
  });

function populateFilters(){
  const kategoriSet = new Set();
  const mediaSet = new Set();
  plants.forEach(p => {
    if(p.kategori) kategoriSet.add(p.kategori);
    if(Array.isArray(p.media_tanam)) p.media_tanam.forEach(m => mediaSet.add(m));
  });
  kategoriSet.forEach(k => kategoriFilter.innerHTML += `<option value="${k}">${k}</option>`);
  mediaSet.forEach(m => mediaFilter.innerHTML += `<option value="${m}">${m}</option>`);
}

function displayPlants(arr){
  plantContainer.innerHTML = '';
  if(arr.length === 0){
    plantContainer.innerHTML = '<p class="small">Tidak ada tanaman yang cocok.</p>';
    return;
  }
  arr.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    const imgSrc = 'images/placeholder.jpg';
    const hama = Array.isArray(p.hama_penyakit) ? p.hama_penyakit.join(', ') : p.hama_penyakit;
    const media = Array.isArray(p.media_tanam) ? p.media_tanam.join(', ') : p.media_tanam;
    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.nama}" />
      <h2>${p.nama}</h2>
      <p class="meta"><strong>Kategori:</strong> ${p.kategori}</p>
      <p class="meta"><strong>Media Tanam:</strong> ${media}</p>
      <p class="small"><strong>Panen:</strong> ${p.panen}</p>
      <p class="small"><strong>Hama:</strong> ${hama}</p>
      <p class="small"><strong>Tips:</strong> ${p.tips_perawatan}</p>
      <p class="petuah">"${p.petuah_leluhur}"</p>
    `;
    plantContainer.appendChild(card);
  });
}

function filterPlants(){
  const term = (searchInput.value || '').toLowerCase().trim();
  let filtered = plants.filter(p => {
    const name = (p.nama || '').toLowerCase();
    const kategori = (p.kategori || '').toLowerCase();
    const mediaList = Array.isArray(p.media_tanam) ? p.media_tanam.map(x=>x.toLowerCase()) : [];
    return (name.includes(term) || kategori.includes(term) || (p.tips_perawatan||'').toLowerCase().includes(term));
  });
  if(kategoriFilter.value) filtered = filtered.filter(p => p.kategori === kategoriFilter.value);
  if(mediaFilter.value) filtered = filtered.filter(p => Array.isArray(p.media_tanam) && p.media_tanam.includes(mediaFilter.value));
  if(sortFilter.value === 'panen'){
    // naive parse: extract first number
    filtered.sort((a,b)=>{
      const pa = parseFloat((a.panen||'0').replace(/[^0-9\.]/g,''))||9999;
      const pb = parseFloat((b.panen||'0').replace(/[^0-9\.]/g,''))||9999;
      return pa - pb;
    });
  } else {
    filtered.sort((a,b)=>(a.nama||'').localeCompare(b.nama||''));
  }
  displayPlants(filtered);
}

searchInput.addEventListener('input', filterPlants);
kategoriFilter.addEventListener('change', filterPlants);
mediaFilter.addEventListener('change', filterPlants);
sortFilter.addEventListener('change', filterPlants);
