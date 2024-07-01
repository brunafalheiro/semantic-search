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

async function addClient() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;

  const checkUserRegisteredQuery = `
    PREFIX rdf: <http://www.w3.com/1999/02/22-rdf-syntax-ns#>
    PREFIX ex: <http://example.com/>

    SELECT ?cliente
    WHERE {
      ?cliente rdf:type ex:Cliente ;
              ex:telefone ?telefone .
      FILTER (?telefone = "${phone}")
    }`;

  const checkUrl = `http://localhost:7200/repositories/semantic-search?query=${encodeURIComponent(checkUserRegisteredQuery)}`;
  const checkResponse = await request(checkUrl);
  const checkData = checkResponse.split('\n').length == 3; // 3 because the headers line
  if (checkData) {
    alert('Número de telefone já cadastrado.');
    return;
  }

  const query = `
    PREFIX rdf: <http://www.w3.com/1999/02/22-rdf-syntax-ns#>
    PREFIX ex: <http://example.com/>
    INSERT DATA {
      ex:${phone} rdf:type ex:Cliente ;
      ex:nome "${name}" ;
      ex:telefone "${phone}" ;
      ex:endereco "${address}" .
    }`;
  const url = `http://localhost:7200/repositories/semantic-search/statements?update=${encodeURIComponent(query)}`;
  await postRequest(url);
  document.getElementById('formClient').reset();
  window.location.href = './clients.html';
  alert('Cliente adicionado com sucesso!');
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('formClient');
  const backBtn = document.getElementById('back-btn');

  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      addClient();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = './clients.html';
    });
  }
});