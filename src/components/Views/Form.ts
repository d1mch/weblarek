import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export abstract class Form<T> extends Component<T> {
  protected formElement: HTMLFormElement;
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);
    this.formElement = container as HTMLFormElement;
    this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.formElement);
    this.errorsElement = ensureElement('.form__errors', this.formElement);

    this.formElement.addEventListener('submit', (event: Event) => {
      event.preventDefault();
      const formName = this.formElement.getAttribute('name');
      if (formName) {
        this.events.emit(`${formName}:submit`);
      }
    });
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }

  set errors(message: string) {
    this.errorsElement.textContent = message;
  }
}