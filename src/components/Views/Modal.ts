import { ensureElement } from '../../utils/utils';

export class Modal {
  private content: HTMLElement;
  private closeButton: HTMLButtonElement;

  constructor(private container: HTMLElement) {
    this.content = ensureElement('.modal__content', container);
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);

    // крестик
    this.closeButton.addEventListener('click', () => {this.close();});

    // клик вне окна
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
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