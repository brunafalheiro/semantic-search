document.addEventListener('DOMContentLoaded', function() {
  const clientsBtn = document.getElementById('clients-btn');
  if (clientsBtn) {
    clientsBtn.addEventListener('click', function() {
      window.location.href = './clients/clients.html';
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const serviceOrderBtn = document.getElementById('service-order-btn');
  if (serviceOrderBtn) {
    serviceOrderBtn.addEventListener('click', function() {
      window.location.href = './service-order/service-order.html';
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const catalogBtn = document.getElementById('catalog-btn');
  if (catalogBtn) {
    catalogBtn.addEventListener('click', function() {
      window.location.href = './catalog/catalog.html';
    });
  }
});


// Função genérica para realizar requisições HTTP
const fetchRequest = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

const fetchDBpediaData = async (query) => {
  const baseURL = 'http://dbpedia.org/sparql';
  const url = `${baseURL}?query=${encodeURIComponent(query)}&format=json`;
  const response = await fetchRequest(url);
  return response.json();
};

document.addEventListener('DOMContentLoaded', function() {
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = '../index.html';
    });
  }
});

getCatalog = async () => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT DISTINCT ?product ?label ?image
    WHERE {
      ?product rdf:type ?type .
      ?product rdfs:label ?label .
      ?product dbo:thumbnail ?image .
      ?product dcterms:subject ?category .
      FILTER (?type IN (dbo:Food)) .
      FILTER (?category IN (
        <http://dbpedia.org/resource/Category:Cakes>,
        <http://dbpedia.org/resource/Category:Pies>,
        <http://dbpedia.org/resource/Category:Desserts>,
        <http://dbpedia.org/resource/Category:Baked_goods>,
        <http://dbpedia.org/resource/Category:Pastries>,
        <http://dbpedia.org/resource/Category:Chocolate>,
        <http://dbpedia.org/resource/Category:Candy>,
        <http://dbpedia.org/resource/Category:Ice_cream>,
        <http://dbpedia.org/resource/Category:Cookies>,
        <http://dbpedia.org/resource/Category:Puddings>,
        <http://dbpedia.org/resource/Category:Sweets>,
        <http://dbpedia.org/resource/Category:Confectionery>,
        <http://dbpedia.org/resource/Category:Baklava>,
        <http://dbpedia.org/resource/Category:Cheesecakes>,
        <http://dbpedia.org/resource/Category:Muffins>,
        <http://dbpedia.org/resource/Category:Doughnuts>,
        <http://dbpedia.org/resource/Category:Tarts>,
        <http://dbpedia.org/resource/Category:Brownies>,
        <http://dbpedia.org/resource/Category:Trifles>,
        <http://dbpedia.org/resource/Category:Flan>,
        <http://dbpedia.org/resource/Category:Cupcakes>
      )) .
      FILTER (lang(?label) = "pt")
    }
    LIMIT 100

  `;
  const data = await fetchDBpediaData(query);
  const allProducts = data.results.bindings;
  localStorage.setItem('allProducts', JSON.stringify(allProducts));
}

getCatalog();

