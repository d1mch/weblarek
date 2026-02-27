import { IApi, IProduct, IProductsResponse, IOrderRequest, IOrderResponse } from '../types';

export class LarekApi {
    constructor(private api: IApi) {}

    async getProducts(): Promise<IProduct[]> {
        const response = await this.api.get<IProductsResponse>('/product/');
        return response.items;
    }

    async createOrder(order: IOrderRequest): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>('/order/', order);
    }
}