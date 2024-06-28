const post = async (url, data) => {
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

const insertClient = async (url) => {
  return await post(url);
}

async function addClient() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
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
  await insertClient(url);
  alert('Cliente adicionado com sucesso!');
  document.getElementById('formClient').reset();
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