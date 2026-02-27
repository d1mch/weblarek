import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { Api } from './components/base/Api';
import { LarekApi } from './components/LarekApi';


const api = new Api(import.meta.env.VITE_API_ORIGIN);
const larekApi = new LarekApi(api);
const catalog = new ProductCatalog();

larekApi.getProducts()
  .then(products => {
    catalog.setProducts(products);
    console.log('Каталог с сервера:', catalog.getProducts());
  })
  .catch(error => {
    console.error('Ошибка загрузки товаров:', error);
  });