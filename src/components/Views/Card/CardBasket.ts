import { ensureElement } from '../../../utils/utils';
import { Card } from './Card';
import { IProduct } from '../../../types';


export type TCardBasket = Pick<IProduct, 'title' | 'price'> & {
  index: number;
};


interface ICardBasketActions {
  onClick?: () => void;
}

export class CardBasket extends Card<TCardBasket> {
  protected buttonElement: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardBasketActions) {
    super(container);
    this.buttonElement = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
    if (actions?.onClick) {
      this.buttonElement.addEventListener('click', actions.onClick);
    }
  }
}