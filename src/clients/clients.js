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
  const query = `
  PREFIX rdf: <http://www.w3.com/1999/02/22-rdf-syntax-ns#>
  PREFIX ex: <http://example.com/>

  SELECT ?cliente ?nome ?telefone ?endereco
  WHERE {
    ?cliente rdf:type ex:Cliente ;
            ex:nome ?nome ;
            ex:telefone ?telefone ;
            ex:endereco ?endereco .
  }`;
  const url = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(query)}`;
  return await request(url);
}

const formatClientDataToJson = (data) => {
  const clientsArray = data.split("\n").slice(1, -1);
  const json = clientsArray.map(client => {
    const [uri, name, phone, address] = client.split(',');
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

  const addClientBtn = document.getElementById('add-client-btn');
  if (addClientBtn) {
    addClientBtn.addEventListener('click', function() {
      window.location.href = './add-client.html';
    });
  }

  displayClients();
});
