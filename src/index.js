document.addEventListener('DOMContentLoaded', function() {
  const clientsBtn = document.getElementById('clients-btn');
  if (clientsBtn) {
    clientsBtn.addEventListener('click', function() {
      window.location.href = './clients/clients.html';
    });
  }
  else {
    console.log('Elemento não encontrado');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const serviceOrderBtn = document.getElementById('service-order-btn');
  if (serviceOrderBtn) {
    serviceOrderBtn.addEventListener('click', function() {
      window.location.href = './service-order/service-order.html';
    });
  }
  else {
    console.log('Elemento não encontrado');
  }
});