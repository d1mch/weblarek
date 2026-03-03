import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class BasketView extends Component<unknown> {
  protected listElement: HTMLElement;
  protected totalElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(container);

    this.listElement = ensureElement('.basket__list', this.container);
    this.totalElement = ensureElement('.basket__price', this.container);
    this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', this.container);

    this.buttonElement.addEventListener('click', () => {
      events.emit('order:start');
    });
  }

  set items(items: HTMLElement[]) {
    this.listElement.replaceChildren(...items);
    this.buttonElement.disabled = items.length === 0;
  }

  set total(value: number) {
    this.totalElement.textContent = `${value} синапсов`;
  }
}