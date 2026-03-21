let carrinho = [];

// 1. Abre/Fecha o carrinho
function toggleCarrinho() {
  const lateral = document.getElementById("carrinho-lateral");
  const overlay = document.getElementById("carrinho-overlay");
  lateral.classList.toggle("aberto");
  overlay.classList.toggle("visivel");
}

// 2. Função para os botões de + e - nos cards
window.mudarQtd = function (botao, delta) {
  const input = botao.parentElement.querySelector(".input-qtd");
  let valorAtual = parseInt(input.value);
  let novoValor = valorAtual + delta;

  if (novoValor < 1) novoValor = 1;
  input.value = novoValor;
};

// 3. Capturar clique no botão "Adicionar"
document.querySelectorAll(".btn-add").forEach((botao) => {
  botao.addEventListener("click", () => {
    const nome = botao.getAttribute("data-nome");
    const preco = parseFloat(botao.getAttribute("data-preco"));

    // AQUI ESTÁ A MUDANÇA: Pegar o valor do input do card específico
    const card = botao.closest(".card");
    const input = card.querySelector(".input-qtd");
    const quantidade = parseInt(input.value);

    adicionarAoCarrinho(nome, preco, quantidade);

    // Ajusta o reset do visor: se for congelado ou bebida volta para 1, se não volta para 10
    if (
      nome.includes("Congelados") ||
      nome.includes("Refri") ||
      nome.includes("Guaraná") ||
      nome.includes("Salgadinhos Variados")
    ) {
      input.value = 1;
    } else {
      input.value = 1;
    }
  });
});

// 4. Adicionar à lista do carrinho
function adicionarAoCarrinho(nome, preco, quantidade) {
  // TRAVA DE SEGURANÇA INTELIGENTE
  // Se o nome tiver "Congelado", "Refri" ou "Suco", o mínimo é 1. Se não, é 10.
  let minimoParaEsteItem =
    nome.includes("Congelados") ||
    nome.includes("Refri") ||
    nome.includes("Guaraná") ||
    nome.includes("Salgadinhos Variados")
      ? 1
      : 1;

  if (quantidade < minimoParaEsteItem) {
    alert(`O pedido mínimo para ${nome} é de ${minimoParaEsteItem} unidades.`);
    return; // Para o código aqui
  }

  const itemExistente = carrinho.find((item) => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({ nome, preco, quantidade });
  }
  // ... restante do código

  atualizarInterface();

  // Abre o carrinho para mostrar que funcionou
  if (
    !document.getElementById("carrinho-lateral").classList.contains("aberto")
  ) {
    toggleCarrinho();
  }
}

// 5. Atualizar o visual do carrinho lateral
function atualizarInterface() {
  const containerItens = document.getElementById("itens-carrinho");
  const contadorTopo = document.getElementById("contador-carrinho");
  const valorTotal = document.getElementById("valor-total");

  containerItens.innerHTML = "";
  let total = 0;
  let qtdTotal = 0;

  carrinho.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    qtdTotal += item.quantidade;

    containerItens.innerHTML += `
            <div class="item-no-carrinho">
                <div class="info">
                    <strong>${item.nome}</strong>
                    <span>R$ ${item.preco.toFixed(2)}</span>
                </div>
                <div class="controles">
                    <button onclick="alterarQtdCarrinho(${index}, -1)">-</button>
                    
                    <span>${item.quantidade}</span>
                    
                    <button onclick="alterarQtdCarrinho(${index}, 1)">+</button>
                    
                    <button class="btn-remover" onclick="removerItem(${index})">🗑️</button>
                </div>
            </div>
        `;
  });

  if (carrinho.length === 0) {
    containerItens.innerHTML =
      '<p class="carrinho-vazio">Seu carrinho está vazio :(</p>';
  }

  contadorTopo.innerText = qtdTotal;
  valorTotal.innerText = `R$ ${total.toFixed(2)}`;
}

// 6. Alterar quantidade DENTRO do carrinho
window.alterarQtdCarrinho = function (index, delta) {
  let item = carrinho[index];
  let novaQuantidade = item.quantidade + delta;

  // DEFININDO O MÍNIMO:
  // Se no nome do item tiver "Congelados" ou "Refri", o min é 1. Caso contrário, é 10.
  let minimoPermitido =
    item.nome.includes("Guaraná") ||
    item.nome.includes("Congelados") ||
    item.nome.includes("Refri") ||
    item.nome.includes("Salgadinhos Variados")
      ? 1
      : 1;

  if (novaQuantidade < minimoPermitido) {
    if (
      confirm(
        `O pedido mínimo para este item é ${minimoPermitido}. Deseja removê-lo do carrinho?`,
      )
    ) {
      carrinho.splice(index, 1);
    }
  } else {
    item.quantidade = novaQuantidade;
  }

  atualizarInterface();
};

// 7. Enviar para o WhatsApp
// 7. Enviar para o WhatsApp com lógica de Entrega/Retirada
function finalizarPedido() {
  // --- REGRA DE QA ATUALIZADA ---
  let totalPopulares = 0;
  let temOutrosProdutos = false;

  carrinho.forEach((item) => {
    if (item.preco === 0.6) {
      totalPopulares += item.quantidade;
    } else {
      // Se o preço for diferente de 0.60, significa que é um Kit, Refri ou Congelado
      temOutrosProdutos = true;
    }
  });

  // A regra só bloqueia se:
  // 1. NÃO tem outros produtos (Kits/Refri)
  // 2. E a soma dos populares é maior que 0 mas menor que 10
  if (!temOutrosProdutos && totalPopulares > 0 && totalPopulares < 10) {
    alert(
      `Para pedidos apenas de salgadinhos de R$ 0,60, o mínimo é de 10 unidades. Se adicionar um Kit ou Bebida, você pode levar qualquer quantidade!`,
    );
    return;
  }
  // --- FIM DA REGRA ---
  const divDados = document.getElementById("dados-entrega");

  // Se o formulário estiver oculto, mostra ele primeiro
  if (divDados.style.display === "none") {
    divDados.style.display = "block";
    return;
  }

  // Pega os valores
  const nome = document.getElementById("nome-cliente").value;
  const horario = document.getElementById("horario-entrega").value;
  const tipoEntrega = document.querySelector(
    'input[name="tipo-entrega"]:checked',
  ).value;

  // Validação básica de QA
  if (!nome || !horario) {
    alert("Por favor, preencha seu nome e o horário desejado!");
    return;
  }

  let mensagem = `*Novo Pedido - Central Point Salgadinhos* 🥟%0A%0A`;
  mensagem += `*Cliente:* ${nome}%0A`;
  mensagem += `*Opção:* ${tipoEntrega === "entrega" ? "🛵 Entrega" : "🏪 Retirada no Local"}%0A`;
  mensagem += `*Horário:* ${horario}%0A%0A`;

  // Se for entrega, valida e adiciona o endereço
  if (tipoEntrega === "entrega") {
    const rua = document.getElementById("endereco-cliente").value;
    const bairro = document.getElementById("bairro-cliente").value;
    if (!rua || !bairro) {
      alert("Para entrega, informe a rua e o bairro!");
      return;
    }
    mensagem += `*Endereço:* ${rua}%0A`;
    mensagem += `*Bairro:* ${bairro}%0A%0A`;
  }

  mensagem += `*Itens do Pedido:*%0A`;
  let totalPedido = 0;

  carrinho.forEach((item) => {
    mensagem += `- ${item.quantidade}x ${item.nome} (R$ ${(item.preco * item.quantidade).toFixed(2)})%0A`;
    totalPedido += item.preco * item.quantidade;
  });

  mensagem += `%0A*Total: R$ ${totalPedido.toFixed(2)}*`;

  const telefone = "5521965295921";
  window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
}

// Função para esconder campos de endereço se for retirada
window.ajustarCampos = function (tipo) {
  const campos = document.getElementById("campos-endereco");
  campos.style.display = tipo === "retirada" ? "none" : "block";
};

window.removerItem = function (index) {
  carrinho.splice(index, 1); // Remove o item da lista
  atualizarInterface(); // Atualiza a tela
};

// Configura o clique no ícone do topo para abrir o carrinho
// Função que vigia o scroll da página
const observador = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revelar-ativo");
      }
    });
  },
  {
    threshold: 0.1, // Revela quando 10% da seção aparecer na tela
  },
);

// Manda o observador vigiar todos os elementos com a classe 'revelar'
document.querySelectorAll(".revelar").forEach((secao) => {
  observador.observe(secao);
});
