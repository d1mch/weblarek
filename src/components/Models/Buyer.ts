import { IBuyer, TPayment, IOrderErrors} from '../../types';
import { IEvents } from '../base/Events';

export class Buyer {
    private payment: TPayment = null;
    private email: string = '';
    private phone: string = '';
    private address: string = '';

    constructor(private events: IEvents) {}

    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
        if (data.address !== undefined) this.address = data.address;
        this.events.emit('buyer:changed', this.getData());
    }

    getData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address
        };
    }

    clear(): void {
        this.payment = null;
        this.email = '';
        this.phone = '';
        this.address = '';
        this.events.emit('buyer:changed', this.getData());
    }

    validate(): IOrderErrors {
        const errors: Partial<Record<keyof IBuyer, string>> = {};

        if (!this.payment) {
            errors.payment = 'Не выбран способ оплаты';
        }

        if (!this.address.trim()) {
            errors.address = 'Не указан адрес';
        }

        if (!this.email.trim()) {
            errors.email = 'Введите email';
        }

        if (!this.phone.trim()) {
            errors.phone = 'Введите телефон';
        }

        return errors;
    }
}