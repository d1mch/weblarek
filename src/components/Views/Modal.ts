import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

export class Modal {
  private content: HTMLElement;
  private closeButton: HTMLButtonElement;

  constructor(private events: IEvents, private container: HTMLElement) {
    this.content = ensureElement('.modal__content', container);
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);

    // крестик
    this.closeButton.addEventListener('click', () => {this.events.emit('modal:close');});

    // клик вне окна
    container.addEventListener('click', (e) => {
      if (e.target === container) {
        this.events.emit('modal:close');
      }
    });
  }

  open(element: HTMLElement) {
    this.content.replaceChildren(element);
    this.container.classList.add('modal_active');
  }

  close() {
    this.container.classList.remove('modal_active');
    this.content.innerHTML = '';
  }
}