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
import { SuccessView } from './components/Views/SuccessView';
import { OrderForm } from './components/Views/OrderForm';
import { ContactsForm } from './components/Views/ContactsForm';
import { IProduct } from './types';


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
const previewClone = cloneTemplate(cardPreviewTemplate);
const preview = new CardPreview(previewClone, {
  onClick: () => events.emit('preview:toggle')
});

let orderForm: OrderForm | null = null;
let contactsForm: ContactsForm | null = null;


events.on('catalog:changed', () => {
  const products = catalog.getProducts();

  const cards = products.map(product => {
    const clone = cloneTemplate(cardCatalogTemplate);
    const card = new CardCatalog(clone, {
      onClick: () => catalog.setSelectedProduct(product)
    });

    return card.render(product);
  });

  gallery.render({ catalog: cards });
});


events.on('product:selected', () => {
  const product = catalog.getSelectedProduct();
  if (!product) return;

  const isInBasket = basket.hasItem(product.id);

  preview.buttonDisabled = product.price === null;
  preview.buttonText = product.price === null ? 'Недоступно' : isInBasket ? 'Удалить из корзины' 
    : 'В корзину';

  modal.open(
    preview.render(product)
  );
});

events.on('preview:toggle', () => {
  const product = catalog.getSelectedProduct();
  if (!product) return;

  if (basket.hasItem(product.id)) {
    basket.removeItem(product);
  } else {
    basket.addItem(product);
  }

  events.emit('product:selected');
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
      onClick: () => events.emit('basket:remove', product)
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

events.on('basket:remove', (product: IProduct) => {
  basket.removeItem(product);
});

events.on('buyer:changed', () => {
  const errors = buyer.validate();
  const data = buyer.getData();

  if (orderForm) {
    orderForm.payment = data.payment;
    orderForm.valid = !errors.payment && !errors.address;
    orderForm.errors = [
      errors.payment,
      errors.address
    ].filter(Boolean).join(', ');
  }

  if (contactsForm) {
    contactsForm.email = data.email;
    contactsForm.phone = data.phone;
    contactsForm.valid = !errors.email && !errors.phone;
    contactsForm.errors = [
      errors.email,
      errors.phone
    ].filter(Boolean).join(', ');
  }
});

events.on('order:start', () => {
  const clone = cloneTemplate(orderTemplate);
  orderForm = new OrderForm(events, clone);

  modal.open(orderForm.render());
  events.emit('buyer:changed');
});


events.on('order:submit', () => {
  const clone = cloneTemplate(contactsTemplate);
  contactsForm = new ContactsForm(events, clone); 

  modal.open(contactsForm.render());
  events.emit('buyer:changed');
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
  orderForm = null;
  contactsForm = null;
  
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
    const successView = new SuccessView(clone, events);

    modal.open(
      successView.render({
        total: response.total
      })
    );
  });
});

larekApi.getProducts()
  .then(products => {
    catalog.setProducts(products);
  })
  .catch(err => console.error(err));