const request = async (url) => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      return response.text();
    } else {
      return Promise.reject(response);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

const fetchDBpediaData = async (query) => {
  const base_url = 'http://dbpedia.org/sparql';
  const url = `${base_url}?query=${encodeURIComponent(query)}&format=json`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      return response.json();
    } else {
      return Promise.reject(response);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

const getServiceOrder = async () => {
  const url = 'http://localhost:7200/repositories/semantic-search?query=PREFIX%20%3A%20%3Chttp%3A%2F%2Fexample.org%2F%3E%20PREFIX%20ex%3A%20%3Chttp%3A%2F%2Fexample.org%2Fex%23%3E%20%20SELECT%20%3FordemServico%20%3Fcliente%20(GROUP_CONCAT(DISTINCT%20%3Fproduto%3B%20SEPARATOR%3D%22%2C%20%22)%20AS%20%3Fprodutos)%20%3Fvalor%20%3Fdesconto%20%3FcondicoesPagamento%20WHERE%20%7B%20%20%20%3FordemServico%20a%20%3AOrdemServico%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3AtemCliente%20%3Fcliente%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Aprodutos%20%3Fproduto%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Avalor%20%3Fvalor%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Adesconto%20%3Fdesconto%20%3B%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3AcondicoesPagamento%20%3FcondicoesPagamento%20.%20%7D%20GROUP%20BY%20%3FordemServico%20%3Fcliente%20%3Fvalor%20%3Fdesconto%20%3FcondicoesPagamento';  
  return await request(url);
}

const formatServiceOrder = (data) => {
  const lines = data.split("\n").slice(1, -1);
  const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
  
  const json = lines.map(line => {
    const [ordemServico, cliente, produtos, valor, desconto, condicoesPagamento] = line.split(regex);
    // Split produtos by comma only if produtos is defined
    const produtosArray = produtos ? produtos.replace(/^"|"$/g, '').split(", ") : []; // Splitting by comma and space to get an array of produtos
    console.log({ ordemServico, cliente, produtos: produtosArray, valor, desconto, condicoesPagamento });
    return { ordemServico, cliente, produtos: produtosArray, valor, desconto, condicoesPagamento };
  });

  return json;
}

const displayProductImages = async (order) => {
  const serviceOrderList = document.getElementById('serviceOrderList');
  for (const produtoUri of order.produtos) {
    const query = `
      SELECT ?image WHERE {
        <${produtoUri}> dbo:thumbnail ?image .
      } LIMIT 1
    `;

    try {
      const data = await fetchDBpediaData(query);
      if (data.results.bindings.length > 0) {
        const imageUrl = data.results.bindings[0].image.value;
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = produtoUri.split('/').pop();
        imgElement.style.width = '100px';

        const orderElement = serviceOrderList.querySelector(`.order[data-ordem-servico="${order.ordemServico}"]`);
        if (orderElement) {
          orderElement.appendChild(imgElement);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar imagem do produto:', produtoUri, error);
    }
  }
};

const displayServiceOrdersWithImages = async () => {
  const data = await getServiceOrder();
  const serviceOrders = formatServiceOrder(data);
  const serviceOrderList = document.getElementById('serviceOrderList');
  serviceOrderList.innerHTML = ''; // Limpar conteúdo existente

  serviceOrders.forEach(order => {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order');
    orderElement.setAttribute('data-ordem-servico', order.ordemServico); // Adicionando atributo para identificação

    const orderHeader = document.createElement('div');
    orderHeader.classList.add('order-header');
    orderHeader.textContent = `Ordem de Serviço: ${order.ordemServico}`;

    const orderBody = document.createElement('div');
    orderBody.classList.add('order-body');
    const orderDetails = `
      <p>Cliente: ${order.cliente}</p>
      <p>Produtos: ${order.produtos.join(', ')}</p>
      <p>Valor: ${order.valor}</p>
      <p>Desconto: ${order.desconto}</p>
      <p>Condições de Pagamento: ${order.condicoesPagamento}</p>
    `;
    console.log(order.produtos)
    orderBody.innerHTML = orderDetails;
    orderElement.appendChild(orderHeader);
    orderElement.appendChild(orderBody);
    serviceOrderList.appendChild(orderElement);

    // Chamar a função para exibir as imagens dos produtos
    displayProductImages(order);
  });
};

displayServiceOrdersWithImages();

document.addEventListener('DOMContentLoaded', function() {
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = '../index.html';
    });
  }
});
