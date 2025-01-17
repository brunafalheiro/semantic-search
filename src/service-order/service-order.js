// Função genérica para realizar requisições HTTP
const fetchRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Função para buscar dados da DBpedia
const fetchDBpediaData = async (query) => {
  const baseURL = 'http://dbpedia.org/sparql';
  const url = `${baseURL}?query=${encodeURIComponent(query)}&format=json`;
  const response = await fetchRequest(url);
  return response.json();
};

// Get service orders
const getServiceOrders = async () => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ex: <http://example.com/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?ordemServico (SAMPLE(?cliente) AS ?cliente) (SAMPLE(?produto) AS ?produto) (SAMPLE(?valor) AS ?valor) (SAMPLE(?condicoesPagamento) AS ?condicoesPagamento)
    WHERE { 
      ?ordemServico rdf:type ex:OrdemServico ; 
        ex:cliente ?cliente ; 
        ex:produto ?produto ; 
        ex:valor ?valor ; 
        ex:condicoesPagamento ?condicoesPagamento ; 
    } 
    GROUP BY ?ordemServico`;

  const queryURL = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(query)}`;
  const response = await fetchRequest(queryURL);
  const responseText = await response.text();
  return responseText;
};

// Get service orders by date
const getServiceOrdersByDate = async (selectedDate) => {
  const date = new Date(selectedDate); 
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate() + 1;
  
  const query = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX ex: <http://example.com/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  
  SELECT ?ordemServico (SAMPLE(?cliente) AS ?cliente) (SAMPLE(?produto) AS ?produto) (SAMPLE(?valor) AS ?valor) (SAMPLE(?condicoesPagamento) AS ?condicoesPagamento) (SAMPLE(?dataCriacao) AS ?dataCriacao) 
  WHERE { 
    ?ordemServico rdf:type ex:OrdemServico ; 
      ex:cliente ?cliente ; 
      ex:produto ?produto ; 
      ex:valor ?valor ; 
      ex:condicoesPagamento ?condicoesPagamento ; 
      ex:dataCriacao ?dataCriacao . 
    FILTER( year(?dataCriacao) = ${year} && month(?dataCriacao) = ${month} && day(?dataCriacao) = ${day} ) 
  } 
  GROUP BY ?ordemServico`;

  const queryURL = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(query)}`;
  const response = await fetchRequest(queryURL);
  const responseText = await response.text();
  return responseText;
};


const getServiceOrderByClient = async (clientURI) => {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX ex: <http://example.com/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?ordemServico (SAMPLE(?cliente) AS ?cliente) (SAMPLE(?produto) AS ?produto) (SAMPLE(?valor) AS ?valor) (SAMPLE(?condicoesPagamento) AS ?condicoesPagamento)
    WHERE { 
      ?ordemServico rdf:type ex:OrdemServico ; 
        ex:cliente ?cliente ; 
        ex:produto ?produto ; 
        ex:valor ?valor ; 
        ex:condicoesPagamento ?condicoesPagamento ; 
      FILTER(?cliente = <${clientURI}>)
    } 
    GROUP BY ?ordemServico`;

  const queryURL = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(query)}`;
  const response = await fetchRequest(queryURL);
  const responseText = await response.text();
  return responseText;
}

const getClientNameByURI = async (clientURI) => {
  const query = `
    PREFIX rdf: <http://www.w3.com/1999/02/22-rdf-syntax-ns#>
    PREFIX ex: <http://example.com/>

    SELECT ?nome
    WHERE {
      BIND (<${clientURI}> AS ?cliente)
      ?cliente rdf:type ex:Cliente ;
              ex:nome ?nome .
    }`;

    const queryURL = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(query)}`;
    const response = await fetchRequest(queryURL);
    const responseText = await response.text();
    const lines = responseText.split('\n');
    lines.shift();
    const modifiedText = lines.join('\n');
    return modifiedText;
};

const getClientURIByName = async (clientName) => {
  const query = `
  PREFIX rdf: <http://www.w3.com/1999/02/22-rdf-syntax-ns>
  PREFIX ex: <http://example.com/>

  SELECT ?cliente_uri
  WHERE {
    ?cliente_uri ex:nome ?nome .
    FILTER(contains(lcase(str(?nome)), lcase("${clientName}")))
  }`;

  const queryURL = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(query)}`;
  const response = await fetchRequest(queryURL);
  const responseText = await response.text();
  const text = responseText.split('\n').slice(1, -1);
  if (!text.length) return null;
  return text[0].trim();
};

// Função para formatar a ordem de serviço
const formatServiceOrder = (data) => {
  const lines = data.split("\n").slice(1, -1).reverse();
  const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
  
  return lines.map(line => {
    const [ordemServico, cliente, produtos, valor, condicoesPagamento] = line.split(regex);
    const produtosArray = produtos.replace(/^"|"$/g, '').split(", ");
    return { ordemServico, cliente, produtos: produtosArray, valor, condicoesPagamento };
  });
};

// Função para exibir imagens dos produtos
const displayProductData = async (order) => {
  const serviceOrderList = document.getElementById('serviceOrderList');
  for (const productUri of order.produtos) {
    // Modificada a query para buscar também o nome do produto
    const query = `
      SELECT ?name ?image WHERE { 
      <${productUri}> dbo:thumbnail ?image . 
      <${productUri}> rdfs:label ?name .
      FILTER (lang(?name) = "pt" || lang(?name) = "en")
    } LIMIT 1`
    
    try {
      const data = await fetchDBpediaData(query);
      if (data.results.bindings.length > 0) {
        const imageUrl = data.results.bindings[0].image.value;
        const productName = data.results.bindings[0].name.value; 

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.style.height = '200px';

        const orderElement = serviceOrderList.querySelector(`.order[data-ordem-servico="${order.ordemServico}"]`);
        if (orderElement) {
            const nameElement = orderElement.querySelector('.product-name');
            if (nameElement) {
                nameElement.textContent = `Produto: ${productName}`;
            }
            orderElement.appendChild(imgElement);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do produto:', productUri, error);
    }
  }
};


// Função para exibir ordens de serviço com imagens
const displayServiceOrder = async (loadedContent) => {
  var data = loadedContent ? loadedContent : await getServiceOrders();

  const serviceOrders = formatServiceOrder(data);
  const serviceOrderList = document.getElementById('serviceOrderList');
  serviceOrderList.innerHTML = '';

  for (const order of serviceOrders) {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order');
    orderElement.setAttribute('data-ordem-servico', order.ordemServico);

    const orderBody = document.createElement('div');
    orderBody.classList.add('order-body');
    const clientName = await getClientNameByURI(order.cliente);
    const orderDetails = `
      <p>Cliente: ${clientName}</p>
      <p class='product-name'>Produtos: ${order.produtos.join(', ')}</p>
      <p>Valor: ${order.valor}</p>
      <p>Condições de Pagamento: ${order.condicoesPagamento}</p>
    `;
    orderBody.innerHTML = orderDetails;
    orderElement.appendChild(orderBody);
    serviceOrderList.appendChild(orderElement);

    displayProductData(order);
  }
};


document.addEventListener('DOMContentLoaded', async () => {
  async function fetchAndDisplayServiceOrder({clientName, selectedDate}) {
    if (selectedDate) {
      const serviceOrder = await getServiceOrdersByDate(selectedDate);
      displayServiceOrder(serviceOrder);
      return;
    }

    if (!clientName) {
      displayServiceOrder();
      return;
    }

    const clientURI = await getClientURIByName(clientName);
    if (!clientURI) {
      displayServiceOrder();
      alert('Cliente não encontrado.');
    } else {
      const serviceOrder = await getServiceOrderByClient(clientURI);
      displayServiceOrder(serviceOrder);
    }
  }

  const url = window.location.href;
  const urlParams = new URLSearchParams(new URL(url).search);
  const clientNameFromURL = urlParams.get('clientName');

  // If there are action and clientName in the URL, use them to fetch and display service order.
  // Otherwise, display service order without parameters.
  if (clientNameFromURL) {
    await fetchAndDisplayServiceOrder({clientName: clientNameFromURL});
  } else {
    displayServiceOrder();
  }

  const backBtn = document.getElementById('back-btn');
  backBtn?.addEventListener('click', () => window.location.href = clientNameFromURL ? '../clients/clients.html' : '../index.html');

  const addServiceOrderBtn = document.getElementById('add-service-order-btn');
  addServiceOrderBtn?.addEventListener('click', () => window.location.href = './create-service-order.html');

  document.getElementById('searchBtn').addEventListener('click', async () => {
    const clientNameInput = document.getElementById('searchInput').value;
    document.getElementById('dateSearchInput').value = '';
    await fetchAndDisplayServiceOrder({clientName: clientNameInput});
  });
  
  document.getElementById('dateSearchInput').addEventListener('change', async () => {
    const selectedDate = document.getElementById('dateSearchInput').value;
    document.getElementById('searchInput').value = '';
    await fetchAndDisplayServiceOrder({selectedDate: selectedDate});
  });
});
