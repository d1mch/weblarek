import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class BasketView extends Component<unknown> {
  protected listElement: HTMLElement;
  protected totalElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;
  protected emptyElement: HTMLElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(container);
    this.listElement = ensureElement('.basket__list', this.container);
    this.totalElement = ensureElement('.basket__price', this.container);
    this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    this.emptyElement = document.createElement('p');
    this.emptyElement.textContent = 'Корзина пуста';
    this.emptyElement.classList.add('basket__empty');

    this.listElement.before(this.emptyElement);

    this.buttonElement.addEventListener('click', () => {events.emit('order:start');});
  }

  set items(items: HTMLElement[]) {
    this.listElement.replaceChildren(...items);
    const isEmpty = items.length === 0;
    this.emptyElement.style.display = isEmpty ? 'block' : 'none';
    this.buttonElement.disabled = isEmpty;
  }

  set total(value: number) {
    this.totalElement.textContent = `${value} синапсов`;
  }
}