const searchProducts = () => {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const catalogStr = localStorage.getItem('allProducts');
  const catalogObj = JSON.parse(catalogStr) || {};

  const filteredProducts = Object.values(catalogObj).filter(obj =>
    obj.label.value.toLowerCase().includes(searchValue)
  );

  showCatalog(filteredProducts);
};

showCatalog = async (filteredProducts = null) => {
  const catalogStr = localStorage.getItem('allProducts');
  const catalogObj = JSON.parse(catalogStr) || {};

  const productsToShow = filteredProducts || Object.values(catalogObj);
  const catalogElement = document.getElementById('catalog');
  catalogElement.innerHTML = '';

  productsToShow.forEach(obj => {
    const catalogElement = document.getElementById('catalog');
    const container = document.createElement('div');
    container.className = 'product-container';
    const loadingDiv = document.createElement('div');
    const loading = document.createElement('span');
    loadingDiv.appendChild(loading);
    loading.textContent = 'Loading...';
    loading.className = 'loading';
    container.appendChild(loadingDiv);
  
    const img = document.createElement('img');
    img.src = obj.image.value;
    img.alt = obj.label.value;
    img.style.display = 'none';
  
    img.onload = () => {
      loading.remove();
      img.style.display = 'block';
    };

    img.onerror = () => {
      loadingDiv.style.height = '200px';
      loadingDiv.style.display = 'flex';
      loadingDiv.style.flexDirection = 'column';
      loadingDiv.style.justifyContent = 'center'; 
      loadingDiv.style.alignContent = 'center'; 
      loading.textContent = 'Imagem não encontrada';
    }

    const label = document.createElement('p');
    label.textContent = obj.label.value;
  
    const link = document.createElement('a');
    link.href = obj.product.value;
    link.textContent = 'View Product';
    link.target = '_blank';
  
    container.appendChild(img);
    container.appendChild(label);
    container.appendChild(link);
  
    catalogElement.appendChild(container);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = '../index.html';
    });
  }

  showCatalog();
});

