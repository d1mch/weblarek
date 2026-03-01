import { ensureElement } from '../../../utils/utils';
import { Card } from './Card';
import { IProduct } from '../../../types';
import { categoryMap } from '../../../utils/constants';
import { CDN_URL } from '../../../utils/constants';

export type TCardCatalog = Pick<IProduct, 'title' | 'price' | 'image' | 'category'>;

interface ICardActions {
  onClick?: () => void;
}

export class CardCatalog extends Card<TCardCatalog> {
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
    this.imageElement = ensureElement<HTMLImageElement>('.card__image',this.container);
    this.categoryElement = ensureElement('.card__category', this.container);

    if (actions?.onClick) {
      this.container.addEventListener('click', actions.onClick);
    }
  }

  set image(value: string) {
    this.setImage(this.imageElement, `${CDN_URL}${value}`, this.titleElement.textContent || '');
  }

  set category(value: string) {
    this.categoryElement.textContent = value;
    Object.values(categoryMap).forEach(className => {this.categoryElement.classList.remove(className);});
    const className = categoryMap[value as keyof typeof categoryMap];
    if (className) {
      this.categoryElement.classList.add(className);
    }
  }
}