import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface ISuccessView {
  total: number;
}

export class SuccessView extends Component<ISuccessView> {
  protected descriptionElement: HTMLElement;
  protected closeButton: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.descriptionElement = ensureElement(
      '.order-success__description',
      this.container
    );

    this.closeButton = ensureElement<HTMLButtonElement>(
      '.order-success__close',
      this.container
    );

    this.closeButton.addEventListener('click', () => {
      this.events.emit('modal:close');
    });
  }

  set total(value: number) {
    this.descriptionElement.textContent = `Списано ${value} синапсов`;
  }
}