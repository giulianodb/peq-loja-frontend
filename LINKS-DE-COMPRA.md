# Links de compra (produto e cupom já no carrinho)

Dá para mandar um link que abre o checkout com o produto no carrinho e o cupom aplicado
(anúncios, WhatsApp, e-mail, redes sociais).

## Checkout da loja

```
https://SEU-SITE/checkout?produto=5&cupom=PROMO10
https://SEU-SITE/checkout?produto=5&qtd=2&cupom=PROMO10
```

| Parâmetro | O que é | Regras |
|---|---|---|
| `produto` | id do produto (o número que aparece na URL de edição no admin) | obrigatório; precisa estar **ativo** |
| `qtd` | quantidade | opcional, de 1 a 10; fora disso vira 1 |
| `cupom` | código do cupom | opcional; maiúsculas ou minúsculas, tanto faz |

O link **substitui** o carrinho da pessoa pelo produto do link. Depois de aberto, a URL fica só
com o cupom (recarregar a página não refaz o carrinho).

## Funil (checkout direto)

```
https://SEU-SITE/checkout/SLUG-DO-FUNIL?cupom=PROMO10
```

O produto vem do funil (com os bumps e o preço do funil); o link só acrescenta o cupom.

## O que acontece quando algo está errado

- Produto inexistente, inativo ou id inválido: a página diz "Este link de compra não está mais
  disponível" e leva à loja.
- Cupom inexistente, vencido, esgotado ou abaixo do valor mínimo: o produto entra no carrinho, o
  campo de cupom mostra o motivo, e a pessoa pode seguir sem ele.
- Cupom com limite por CPF: o link aplica o cupom sem saber o CPF; a conferência final acontece
  no pagamento, com o CPF digitado.

## Segurança

O link só **preenche** produto e cupom. O preço e o desconto são sempre calculados e validados no
servidor na hora do pagamento (`OrderService`), então editar a URL não dá desconto que o cupom
não permita.
