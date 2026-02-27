import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

import { Api } from './components/base/Api';
import { LarekApi } from './components/LarekApi';

import { apiProducts } from './utils/data';
import { API_URL } from './utils/constants';

const catalog = new ProductCatalog();
catalog.setProducts(apiProducts.items);
console.log('Все товары:', catalog.getProducts());

catalog.setSelectedProduct(apiProducts.items[0]);
console.log('Выбранный товар:', catalog.getSelectedProduct());

console.log('Получение по id:', catalog.getProductById(apiProducts.items[0].id));


const basket = new Basket();

basket.addItem(apiProducts.items[0]);
console.log('Корзина после добавления:', basket.getItems());
console.log('Сумма покупок:', basket.getTotalPrice());

basket.removeItem(apiProducts.items[0]);
console.log('Корзина после удаления:', basket.getItems());

basket.addItem(apiProducts.items[0]);
basket.clear();
console.log('Корзина после очистки:', basket.getItems());


const buyer = new Buyer();

buyer.setData({
  payment: 'card',
  email: 'test@mail.ru',
  phone: '+79999999999',
  address: 'Москва'
});

console.log('Данные покупателя:', buyer.getData());
console.log('Ошибки валидации:', buyer.validate());

const api = new Api(API_URL);
const larekApi = new LarekApi(api);


larekApi.getProducts()
  .then(products => {
    catalog.setProducts(products);
    console.log('Каталог с сервера:', catalog.getProducts());
  })
  .catch(error => {
    console.error('Ошибка загрузки товаров:', error);
  });