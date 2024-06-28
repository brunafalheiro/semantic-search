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

// Função para obter ordens de serviço
const getServiceOrder = async () => {
  const queryURL = 'http://localhost:7200/repositories/semantic-search?query=PREFIX%20%3A%20%3Chttp%3A%2F%2Fexample.org%2F%3E%20PREFIX%20ex%3A%20%3Chttp%3A%2F%2Fexample.org%2Fex%23%3E%20%20SELECT%20%3FordemServico%20%3Fcliente%20(GROUP_CONCAT(DISTINCT%20%3Fproduto%3B%20SEPARATOR%3D%22%2C%20%22)%20AS%20%3Fprodutos)%20%3Fvalor%20%3Fdesconto%20%3FcondicoesPagamento%20WHERE%20%7B%20%20%20%3FordemServico%20a%20%3AOrdemServico%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3AtemCliente%20%3Fcliente%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aprodutos%20%3Fproduto%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Avalor%20%3Fvalor%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Adesconto%20%3Fdesconto%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3AcondicoesPagamento%20%3FcondicoesPagamento%20.%20%7D%20GROUP%20BY%20%3FordemServico%20%3Fcliente%20%3Fvalor%20%3Fdesconto%20%3FcondicoesPagamento';
  const response = await fetchRequest(queryURL);
  return response.text();
};

// Função para formatar a ordem de serviço
const formatServiceOrder = (data) => {
  const lines = data.split("\n").slice(1, -1);
  const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
  
  return lines.map(line => {
    const [ordemServico, cliente, produtos, valor, desconto, condicoesPagamento] = line.split(regex);
    const produtosArray = produtos.replace(/^"|"$/g, '').split(", ");
    return { ordemServico, cliente, produtos: produtosArray, valor, desconto, condicoesPagamento };
  });
};

// Função para exibir imagens dos produtos
const displayProductImages = async (order) => {
  const serviceOrderList = document.getElementById('serviceOrderList');
  for (const produtoUri of order.produtos) {
    const query = `SELECT ?image WHERE { <${produtoUri}> dbo:thumbnail ?image . } LIMIT 1`;
    try {
      const data = await fetchDBpediaData(query);
      if (data.results.bindings.length > 0) {
        const imageUrl = data.results.bindings[0].image.value;
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.style.width = '200px';

        const orderElement = serviceOrderList.querySelector(`.order[data-ordem-servico="${order.ordemServico}"]`);
        orderElement?.appendChild(imgElement);
      }
    } catch (error) {
      console.error('Erro ao buscar imagem do produto:', produtoUri, error);
    }
  }
};

// Função para exibir ordens de serviço com imagens
const displayServiceOrdersWithImages = async () => {
  const data = await getServiceOrder();
  const serviceOrders = formatServiceOrder(data);
  const serviceOrderList = document.getElementById('serviceOrderList');
  serviceOrderList.innerHTML = ''; 

  serviceOrders.forEach(order => {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order');
    orderElement.setAttribute('data-ordem-servico', order.ordemServico);

    const orderHeader = document.createElement('div');
    orderHeader.classList.add('order-header');
    orderHeader.textContent = `Pedido: ${order.ordemServico}`;

    const orderBody = document.createElement('div');
    orderBody.classList.add('order-body');
    const orderDetails = `
      <p>Cliente: ${order.cliente}</p>
      <p>Produtos: ${order.produtos.join(', ')}</p>
      <p>Valor: ${order.valor}</p>
      <p>Desconto: ${order.desconto}</p>
      <p>Condições de Pagamento: ${order.condicoesPagamento}</p>
    `;
    orderBody.innerHTML = orderDetails;
    orderElement.appendChild(orderHeader);
    orderElement.appendChild(orderBody);
    serviceOrderList.appendChild(orderElement);

    displayProductImages(order);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  displayServiceOrdersWithImages();
  const backBtn = document.getElementById('back-btn');
  backBtn?.addEventListener('click', () => window.location.href = '../index.html');

  const addServiceOrderBtn = document.getElementById('add-service-order-btn');
  addServiceOrderBtn?.addEventListener('click', () => window.location.href = './create-service-order.html');
});