import PointListMessageView from '../view/point-list-empty-message-view.js';
import PointListView from '../view/point-list-view.js';
import { remove, render, RenderPosition } from '../framework/render.js';
import PointPresenter from './point-presenter.js';
import SortView from '../view/sort-view.js';
import { updateItem } from '../utils/common.js';
import { FilterType, SortType } from '../const.js';
import { sortByDay, sortByTime, sortByPrice, isPastEvent, isPresentEvent, isFutureEvent } from '../utils/point.js';
import FilterView from '../view/filter-view.js';
import { generateFilter } from '../mock/filter.js';

export default class ListPresenter {
  #listContainer = null;
  #filtersContainer = null;
  #pointsModel = null;

  #listComponent = new PointListView();
  #sortComponent = null;
  #filtersComponent = null;
  #listMessageComponent = null;

  #listPoints = [];
  #pointPresenter = new Map();
  #currentSortType = SortType.DAY;
  #currentFilterType = FilterType.EVERYTHING;
  #filteredPoints = [];

  constructor({ listContainer, filtersContainer, pointsModel }) {
    this.#listContainer = listContainer;
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#listPoints = [...this.#pointsModel.points];
    this.#filteredPoints = [...this.#pointsModel.points];

    this.#renderBoard();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#listComponent.element,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange
    });
    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #handlePointChange = (updatedPoint) => {
    this.#listPoints = updateItem(this.#listPoints, updatedPoint);
    this.#filteredPoints = updateItem(this.#filteredPoints, updatedPoint);
    this.#pointPresenter.get(updatedPoint.id).init(updatedPoint);
    this.#clearPointList();
    this.#renderList();
  };

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    this.#clearPointList();
    this.#renderList();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#currentFilterType === filterType) {
      return;
    }

    this.#filterPoints(filterType);
    this.#clearPointList();
    this.#renderList();
  };

  #renderFilters() {
    const filters = generateFilter(this.#listPoints);
    this.#filtersComponent = new FilterView({
      filters,
      onFilterChange: this.#handleFilterTypeChange
    });

    render(this.#filtersComponent, this.#filtersContainer);
  }

  #filterPoints(filterType) {
    switch (filterType) {
      case FilterType.PAST:
        this.#listPoints = this.#filteredPoints.filter(isPastEvent);
        break;
      case FilterType.PRESENT:
        this.#listPoints = this.#filteredPoints.filter(isPresentEvent);
        break;
      case FilterType.FUTURE:
        this.#listPoints = this.#filteredPoints.filter(isFutureEvent);
        break;
      default:
        this.#listPoints = this.#filteredPoints;
    }

    this.#currentFilterType = filterType;
  }

  #sortPoints(sortType) {
    switch (sortType) {
      case SortType.PRICE:
        this.#listPoints.sort(sortByPrice);
        break;
      case SortType.TIME:
        this.#listPoints.sort(sortByTime);
        break;
      default:
        this.#listPoints.sort(sortByDay);
    }

    this.#currentSortType = sortType;
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortTypeChange: this.#handleSortTypeChange
    });

    render(this.#sortComponent, this.#listContainer, RenderPosition.AFTERBEGIN);
  }

  #renderListMessage() {
    this.#listMessageComponent = new PointListMessageView(this.#currentFilterType);

    if (!this.#listPoints.length) {
      render(this.#listMessageComponent, this.#listComponent.element);
    }
  }

  #clearPointList() {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  }

  #renderList() {
    render(this.#listComponent, this.#listContainer);

    this.#filterPoints(this.#currentFilterType);

    if (this.#listPoints.length) {
      remove(this.#listMessageComponent);
      this.#sortPoints(this.#currentSortType);
      for (let i = 0; i < this.#listPoints.length; i++) {
        this.#renderPoint(this.#listPoints[i]);
      }
    } else {
      this.#renderListMessage();
    }
  }

  #renderBoard() {
    this.#renderSort();
    this.#renderFilters();
    this.#renderList();
  }
}
