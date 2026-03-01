import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

import { Api } from './components/base/Api';
import { LarekApi } from './components/LarekApi';

import { apiProducts } from './utils/data';
import { API_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';

import { Gallery } from './components/Views/Gallery';
import { CardCatalog } from './components/Views/Card/CardCatalog';
import { IProduct } from './types';
import { CardPreview } from './components/Views/Card/CardPreview';
import { Modal } from './components/Views/Modal';
import { Header } from './components/Views/Header';
import { CardBasket } from './components/Views/Card/CardBasket';
import { BasketView } from './components/Views/BasketView';


const events = new EventEmitter();

const catalog = new ProductCatalog(events);
const basket = new Basket(events);
const buyer = new Buyer(events);

const api = new Api(API_URL);
const larekApi = new LarekApi(api);

const galleryContainer = document.querySelector('.gallery') as HTMLElement;
const gallery = new Gallery(galleryContainer);

const modalContainer = document.querySelector('.modal') as HTMLElement;
const modal = new Modal(events, modalContainer);

const headerElement = document.querySelector('.header') as HTMLElement;
const header = new Header(events, headerElement);

function renderBasket() {
  const template = document
    .querySelector<HTMLTemplateElement>('#basket')!
    .content.cloneNode(true) as DocumentFragment;

  const basketElement = template.querySelector('.basket') as HTMLElement;
  const basketView = new BasketView(events, basketElement);

  const products = basket.getItems();

  const elements = products.map((product, index) => {
    const itemTemplate = document
      .querySelector<HTMLTemplateElement>('#card-basket')!
      .content.cloneNode(true) as DocumentFragment;

    const cardElement = itemTemplate.querySelector('.card') as HTMLElement;

    const card = new CardBasket(cardElement, {
      onClick: () => events.emit('basket:remove', product),
    });

    card.render({
      title: product.title,
      price: product.price,
      index: index + 1,
    });

    return cardElement;
  });

  basketView.items = elements;
  basketView.total = basket.getTotalPrice();

  modal.open(basketElement);
}


events.on('catalog:changed', () => {
  const products = catalog.getProducts();

  const cards = products.map(product => {
    const template = document.querySelector<HTMLTemplateElement>('#card-catalog')!
      .content.cloneNode(true) as HTMLElement;

    const cardElement = template.querySelector('.card') as HTMLElement;

    const card = new CardCatalog(cardElement, {
      onClick: () => {
        events.emit('card:selected', product);
      }
    });

    card.render(product);
    return cardElement;
  });

  gallery.render({ catalog: cards });
});


events.on('card:selected', (product: IProduct) => {
  catalog.setSelectedProduct(product);
});

events.on('product:selected', (product: IProduct) => {
  const template = document
    .querySelector<HTMLTemplateElement>('#card-preview')!
    .content.cloneNode(true) as DocumentFragment;

  const cardElement = template.querySelector('.card') as HTMLElement;

  const card = new CardPreview(cardElement, {
  onClick: () => {
    if (basket.hasItem(product.id)) {
      events.emit('product:remove', product);
    } else {
      events.emit('product:buy', product);
    }
  }
});

  card.render(product);

  if (product.price === null) {
    card.buttonText = 'Недоступно';
    card.buttonDisabled = true;
  } else if (basket.hasItem(product.id)) {
    card.buttonText = 'Удалить из корзины';
    card.buttonDisabled = false;
  } else {
    card.buttonText = 'В корзину';
    card.buttonDisabled = false;
  }

  modal.open(cardElement);
});

events.on('modal:close', () => {
  modal.close();
});

events.on('product:buy', (product: IProduct) => {
  basket.addItem(product);
  events.emit('product:selected', product);
});

events.on('product:remove', (product: IProduct) => {
  basket.removeItem(product);
  events.emit('product:selected', product);
});

events.on('basket:open', () => {
  renderBasket();
});

events.on('basket:changed', () => {
  header.counter = basket.getItemsCount();
});

events.on('basket:remove', (product: IProduct) => {
  basket.removeItem(product);
  renderBasket();
});


events.on('order:start', () => {
  const template = document
    .querySelector<HTMLTemplateElement>('#order')!
    .content.cloneNode(true) as DocumentFragment;

  const formElement = template.querySelector('form') as HTMLFormElement;

  const cardButton = formElement.querySelector('button[name="card"]') as HTMLButtonElement;
  const cashButton = formElement.querySelector('button[name="cash"]') as HTMLButtonElement;
  const addressInput = formElement.querySelector('input[name="address"]') as HTMLInputElement;
  const submitButton = formElement.querySelector('.order__button') as HTMLButtonElement;
  const errorElement = formElement.querySelector('.form__errors') as HTMLElement;

  function validate() {
    const data = buyer.getData();
    const errors: string[] = [];

    if (!data.payment) {
      errors.push('Выберите способ оплаты');
    }

    if (!data.address.trim()) {
      errors.push('Введите адрес');
    }

    errorElement.textContent = errors.join(', ');
    submitButton.disabled = errors.length > 0;
  }

  function selectPayment(type: 'card' | 'cash') {
    buyer.setData({ payment: type });

    cardButton.classList.toggle('button_alt-active', type === 'card');
    cashButton.classList.toggle('button_alt-active', type === 'cash');

    validate();
  }

  cardButton.addEventListener('click', () => selectPayment('card'));
  cashButton.addEventListener('click', () => selectPayment('cash'));

  addressInput.addEventListener('input', () => {
    buyer.setData({ address: addressInput.value });
    validate();
  });

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    events.emit('order:next');
  });

  validate();
  modal.open(formElement);
});

events.on('order:next', () => {
  const template = document
    .querySelector<HTMLTemplateElement>('#contacts')!
    .content.cloneNode(true) as DocumentFragment;

  const formElement = template.querySelector('form') as HTMLFormElement;

  const emailInput = formElement.querySelector('input[name="email"]') as HTMLInputElement;
  const phoneInput = formElement.querySelector('input[name="phone"]') as HTMLInputElement;
  const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  const errorElement = formElement.querySelector('.form__errors') as HTMLElement;

  function validate() {
    const data = buyer.getData();
    const errors: string[] = [];

    if (!data.email.trim()) {
      errors.push('Введите email');
    }

    if (!data.phone.trim()) {
      errors.push('Введите телефон');
    }

    errorElement.textContent = errors.join(', ');
    submitButton.disabled = errors.length > 0;
  }

  emailInput.addEventListener('input', () => {
    buyer.setData({ email: emailInput.value });
    validate();
  });

  phoneInput.addEventListener('input', () => {
    buyer.setData({ phone: phoneInput.value });
    validate();
  });

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    events.emit('order:submit');
  });

  validate();
  modal.open(formElement);
});


events.on('order:submit', () => {
  const data = buyer.getData();

  larekApi.createOrder({
    ...data,
    items: basket.getItems().map(item => item.id),
    total: basket.getTotalPrice(),
  })
  .then(response => {
    basket.clear();
    buyer.clear();

    const template = document
      .querySelector<HTMLTemplateElement>('#success')!
      .content.cloneNode(true) as DocumentFragment;

    const successElement = template.querySelector('.order-success') as HTMLElement;
    const description = successElement.querySelector('.order-success__description') as HTMLElement;
    const closeButton = successElement.querySelector('.order-success__close') as HTMLButtonElement;

    description.textContent = `Списано ${response.total} синапсов`;

    closeButton.addEventListener('click', () => {
      modal.close();
    });

    modal.open(successElement);
  })
  .catch(err => {
    console.error(err);
  });
});






larekApi.getProducts()
  .then(products => {
    catalog.setProducts(products);
  })
  .catch(err => console.error(err));