import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

import { Api } from './components/base/Api';
import { LarekApi } from './components/LarekApi';
import { EventEmitter } from './components/base/Events';


import { API_URL } from './utils/constants';
import { cloneTemplate } from './utils/utils';


import { Gallery } from './components/Views/Gallery';
import { CardCatalog } from './components/Views/Card/CardCatalog';
import { CardPreview } from './components/Views/Card/CardPreview';
import { CardBasket } from './components/Views/Card/CardBasket';
import { BasketView } from './components/Views/BasketView';
import { Header } from './components/Views/Header';
import { Modal } from './components/Views/Modal';
import { OrderForm } from './components/Views/OrderForm';
import { ContactsForm } from './components/Views/ContactsForm';


const events = new EventEmitter();

const catalog = new ProductCatalog(events);
const basket = new Basket(events);
const buyer = new Buyer(events);

const api = new Api(API_URL);
const larekApi = new LarekApi(api);

const gallery = new Gallery(document.querySelector('.gallery') as HTMLElement);
const modal = new Modal(document.querySelector('.modal') as HTMLElement);
const header = new Header(events, document.querySelector('.header') as HTMLElement);


const cardCatalogTemplate = document.querySelector<HTMLTemplateElement>('#card-catalog')!;
const cardPreviewTemplate = document.querySelector<HTMLTemplateElement>('#card-preview')!;
const basketTemplate = document.querySelector<HTMLTemplateElement>('#basket')!;
const cardBasketTemplate = document.querySelector<HTMLTemplateElement>('#card-basket')!;
const orderTemplate = document.querySelector<HTMLTemplateElement>('#order')!;
const contactsTemplate = document.querySelector<HTMLTemplateElement>('#contacts')!;
const successTemplate = document.querySelector<HTMLTemplateElement>('#success')!;

const basketClone = cloneTemplate(basketTemplate) as HTMLElement;
const basketView = new BasketView(events, basketClone);




events.on('catalog:changed', () => {
  const products = catalog.getProducts();

  const cards = products.map(product => {
    const clone = cloneTemplate(cardCatalogTemplate);
    const card = new CardCatalog(clone, {
      onClick: () => catalog.setSelectedProduct(product)
    });

    return card.render(product);
  });

  gallery.catalog = cards;
});


events.on('product:selected', () => {
  const product = catalog.getSelectedProduct();
  if (!product) return;

  const clone = cloneTemplate(cardPreviewTemplate);

  const preview = new CardPreview(clone, {
    onClick: () => {
      if (basket.hasItem(product.id)) {
        basket.removeItem(product);
        preview.buttonText = 'В корзину';
      } else {
        basket.addItem(product);
        preview.buttonText = 'Удалить из корзины';
      }
    }
  });

  if (product.price === null) {
    preview.buttonDisabled = true;
    preview.buttonText = 'Недоступно';
  } else if (basket.hasItem(product.id)) {
    preview.buttonText = 'Удалить из корзины';
  } else {
    preview.buttonText = 'В корзину';
  }

  modal.open(preview.render(product));
});


events.on('basket:open', () => {
  modal.open(basketView.render());
});

events.on('basket:changed', () => {
  header.counter = basket.getItemsCount();

  const products = basket.getItems();

  const elements = products.map((product, index) => {
    const clone = cloneTemplate(cardBasketTemplate);

    const card = new CardBasket(clone, {
      onClick: () => basket.removeItem(product)
    });

    return card.render({
      title: product.title,
      price: product.price,
      index: index + 1
    });
  });

  basketView.items = elements;
  basketView.total = basket.getTotalPrice();


});

events.on('buyer:changed', () => {

  const errorsOrder = buyer.validate('order');
  const errorsContacts = buyer.validate('contacts');

  if (document.querySelector('form[name="order"]')) {
    const form = document.querySelector('form[name="order"]') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const errorElement = form.querySelector('.form__errors') as HTMLElement;

    button.disabled = Object.keys(errorsOrder).length > 0;
    errorElement.textContent = Object.values(errorsOrder).join(', ');
  }

  if (document.querySelector('form[name="contacts"]')) {
    const form = document.querySelector('form[name="contacts"]') as HTMLFormElement;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const errorElement = form.querySelector('.form__errors') as HTMLElement;

    button.disabled = Object.keys(errorsContacts).length > 0;
    errorElement.textContent = Object.values(errorsContacts).join(', ');
  }
});

events.on('order:start', () => {
  const clone = cloneTemplate(orderTemplate);
  const orderForm = new OrderForm(events, clone);

  modal.open(orderForm.render());
});


events.on('order:submit', () => {
  const clone = cloneTemplate(contactsTemplate);
  const contactsForm = new ContactsForm(events, clone);

  modal.open(contactsForm.render());
});


events.on('payment:change', data => {
  buyer.setData(data);
});

events.on('address:change', data => {
  buyer.setData(data);
});

events.on('email:change', data => {
  buyer.setData(data);
});

events.on('phone:change', data => {
  buyer.setData(data);
});

events.on('modal:close', () => {
  modal.close();
});

events.on('contacts:submit', () => {
  const data = buyer.getData();
  
  larekApi.createOrder({
    ...data,
    items: basket.getItems().map(item => item.id),
    total: basket.getTotalPrice(),
  })
  .then(response => {
    basket.clear();
    buyer.clear();

    const clone = cloneTemplate(successTemplate);
    const description = clone.querySelector('.order-success__description') as HTMLElement;

    description.textContent = `Списано ${response.total} синапсов`;

    const closeButton = clone.querySelector('.order-success__close') as HTMLButtonElement;

  closeButton.addEventListener('click', () => {
    modal.close();
  });

    modal.open(clone);
  });
});

larekApi.getProducts()
  .then(products => {
    catalog.setProducts(products);
  })
  .catch(err => console.error(err));