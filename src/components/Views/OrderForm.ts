import { ensureElement } from '../../utils/utils';
import { Form } from './Form';
import { IEvents } from '../base/Events';

export class OrderForm extends Form<unknown> {
  protected addressInput: HTMLInputElement;
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);
    this.addressInput = ensureElement<HTMLInputElement>('input[name=address]', this.formElement);
    this.cardButton = ensureElement<HTMLButtonElement>('button[name=card]', this.formElement);
    this.cashButton = ensureElement<HTMLButtonElement>('button[name=cash]', this.formElement);
    this.cardButton.addEventListener('click', () => {
      this.events.emit('payment:change', { payment: 'card' });
    });
    this.cashButton.addEventListener('click', () => {
      this.events.emit('payment:change', { payment: 'cash' });
    });
    this.addressInput.addEventListener('input', () => {
      this.events.emit('address:change', { address: this.addressInput.value });
    });
  }

  set payment(value: 'card' | 'cash' | null) {
    this.cardButton.classList.toggle('button_alt-active', value === 'card');
    this.cashButton.classList.toggle('button_alt-active', value === 'cash');
  }
}