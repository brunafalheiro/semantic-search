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

const getClients = async () => {
  const url = 'http://localhost:7200/repositories/semantic-search?query=PREFIX%20%3A%20%3Chttp%3A%2F%2Fwww.semanticweb.org%2Fbruna%2Fontologies%2F2024%2F5%2Funtitled-ontology-3%2F%3E%20PREFIX%20ex%3A%20%3Chttp%3A%2F%2Fexample.com%2F%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20%20SELECT%20%3Fnome%20%3Ftelefone%20%3Fendereco%20WHERE%20%7B%20%20%20%3Fcliente%20rdf%3Atype%20ex%3ACliente%20%3B%20%20%20%20%20%20%20%20%20%20%20ex%3Anome%20%3Fnome%20%3B%20%20%20%20%20%20%20%20%20%20%20%20ex%3Atelefone%20%3Ftelefone%20%3B%20%20%20%20%20%20%20%20%20%20%20%20ex%3Aendereco%20%3Fendereco%20.%20%7D';
  return await request(url);
}

const formatClientDataToJson = (data) => {
  const clientsArray = data.split("\n").slice(1, -1);
  const json = clientsArray.map(client => {
    const [name, phone, address] = client.split(',');
    return { name, phone, address };
  });

  return json;
}

const displayClients = async () => {
  const data = await getClients();
  const clientData = formatClientDataToJson(data);
  const clientsContainer = document.getElementById('clientsList');
  
  clientData.forEach(client => {
    const clientElement = document.createElement('div');
    clientElement.classList.add('client-card');
    clientElement.innerHTML = 
    `<div class="card-header">${client.name}</div>
      <div class="card-body">
        <p>Telefone: ${client.phone}</p>
        <p>Endereço: ${client.address}</p>
      </div>`;
    clientsContainer.appendChild(clientElement);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = '../index.html';
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const addClientBtn = document.getElementById('add-client-btn');
  if (addClientBtn) {
    addClientBtn.addEventListener('click', function() {
      window.location.href = './add-client.html';
    });
  }
});

displayClients();
