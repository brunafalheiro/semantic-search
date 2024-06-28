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

const postRequest = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return response;
    } else {
      return Promise.reject(response);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

const getClientByPhone = async (phone) => {
  try {
    const query = `
    PREFIX rdf: <http://www.w3.com/1999/02/22-rdf-syntax-ns#>
    PREFIX ex: <http://example.com/>

    SELECT ?cliente
    WHERE {
      ?cliente rdf:type ex:Cliente ;
              ex:telefone ?telefone .
      FILTER (?telefone = "${phone}")
    }`

    const url = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(query)}`;
    const response = await fetchRequest(url);
    const responseText = await response.text();
    const lines = responseText.trim().split('\n');
    if (lines.length <= 1) {
      console.error('No client found');
      return null;
    }
    const clientUrl = lines.slice(1).map(line => line.trim())[0]; 
    return clientUrl;
  } catch (error) {
    return Promise.reject(error);
  }
}

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function formatDateToCustomString(date) {
  const pad = (num) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

const insertServiceOrder = async (data) => {
  try {
    const date = new Date();
    const formattedDate = formatDateToCustomString(date);
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX dbpedia: <http://dbpedia.org/resource/>
      PREFIX ex: <http://example.com/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      INSERT DATA { 
        ex:${generateRandomId(12)} rdf:type ex:OrdemServico ; 
          ex:cliente <${data.client}> ; 
          ex:produto <${data.product}> ; 
          ex:valor "${data.price}"^^xsd:decimal ; 
          ex:condicoesPagamento "${data.paymentOptions}" ; 
          ex:dataCriacao "${formattedDate}"^^xsd:dateTime .
    }`;


    const url = `http://localhost:7200/repositories/semantic-search/statements?update=${encodeURIComponent(query)}`
    const response = await postRequest(url);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const catalogStr = localStorage.getItem('allProducts');
  const catalogObj = JSON.parse(catalogStr);
  const productSelector = document.getElementById('product');

  // Populate the select element with options from the product catalog
  Object.values(catalogObj).forEach(product => {
    const option = document.createElement('option');
      option.value = product.product.value;
      option.textContent = `${product.label.value}`; 
      productSelector.appendChild(option);
  });

  // Add an event listener to log the selected product
  productSelector.addEventListener('change', function() {
    const selectedProduct = catalogObj.find(product => product.product.value === this.value);
    if (selectedProduct) {
      const selectedProducImage = selectedProduct.image.value;
      const productImageDiv = document.getElementById('productImage');
      const imgElement = document.createElement('img');
      imgElement.src = selectedProducImage;

      productImageDiv.innerHTML = '';
      productImageDiv.appendChild(imgElement);
    }
  });

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = './service-order.html';
    });
  }

  const addServiceOrderBtn = document.getElementById('add-service-order-btn');
  if (addServiceOrderBtn) {
    addServiceOrderBtn.addEventListener('click', async function() {
      const phone = document.getElementById('phone').value;
      const product = document.getElementById('product').value;
      const price = document.getElementById('price').value;
      const paymentOptions = document.getElementById('payment').value;

      if (!phone || !product || !price || !paymentOptions) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const client = await getClientByPhone(phone);
      if (!client) {
        alert('O cliente precisa estar cadastrado para associá-lo a um pedido.');
        return;
      }

      const creationDate = new Date().toISOString();
      const data = {client, product, price, paymentOptions, creationDate};
      const response = await insertServiceOrder(data);
      window.location.href = './service-order.html';
      if (response) alert('Pedido criado com sucesso!');
    });
  }
});

