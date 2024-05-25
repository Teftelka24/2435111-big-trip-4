import AbstractView from '../framework/view/abstract-view.js';

const DEFAULT_FILTER = 'everything';

function createFilterTemplate(filters) {

  const renderFilter = filters.map((filter) =>
    `<div class="trip-filters__filter">
        <input id="filter-${filter.name}" class="trip-filters__filter-input  
              visually-hidden" type="radio" name="trip-filter" value="${filter.name}"
              ${filter.count === 0 ? 'disabled' : ''} ${filter.name === DEFAULT_FILTER ? 'checked' : ''}>
        <label class="trip-filters__filter-label" for="filter-${filter.name}" data-filter-type="${filter.name}" ${filter.count === 0 ? 'disabled' : ''}>${filter.name}</label>
    </div>`).join('');

  return `<form class="trip-filters" action="#" method="get">
        ${renderFilter}
        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>`;
}

export default class FilterView extends AbstractView {
  #filters = null;
  #handleFilterChange = null;

  constructor({ filters, onFilterChange }) {
    super();

    this.#filters = filters;
    this.#handleFilterChange = onFilterChange;
    this.element.addEventListener('click', this.#filterChangeHadler);
  }

  get template() {
    return createFilterTemplate(this.#filters);
  }

  #filterChangeHadler = (evt) => {
    if (evt.target.tagName !== 'LABEL' || evt.target.hasAttribute('disabled')) {
      return;
    }

    this.#handleFilterChange(evt.target.dataset.filterType);
  };
}
