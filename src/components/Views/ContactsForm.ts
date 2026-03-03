import { ensureElement } from '../../utils/utils';
import { Form } from './Form';
import { IEvents } from '../base/Events';

export class ContactsForm extends Form<unknown> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;
  protected errorElement: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.emailInput = ensureElement<HTMLInputElement>('input[name=email]', this.formElement);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name=phone]', this.formElement);
    this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.formElement);
    this.errorElement = ensureElement<HTMLElement>('.form__errors', this.formElement);

    this.emailInput.addEventListener('input', () => {
      this.events.emit('email:change', { email: this.emailInput.value });
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit('phone:change', { phone: this.phoneInput.value });
    });
  }

  set email(value: string) {
    this.emailInput.value = value;
  }

  set phone(value: string) {
    this.phoneInput.value = value;
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }

  set errors(value: string) {
    this.errorElement.textContent = value;
  }
}