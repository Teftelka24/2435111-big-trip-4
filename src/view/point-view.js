import dayjs from 'dayjs';
import Duration from 'dayjs/plugin/duration';
import AbstractView from '../framework/view/abstract-view.js';

dayjs.extend(Duration);

const DATE_FORMAT = 'DD MMM';
const TIME_FORMAT = 'HH:mm';
const MILLISECONDS_AMOUNT_IN_HOUR = 3600000;
const MILLISECONDS_AMOUNT_IN_DAY = 86400000;

const createPointTemplate = (point, offersByType, destinations) => {
  const { type, dateFrom, dateTo, basePrice, destination, offers, isFavorite } = point;

  const parsDateTo = dayjs(dateTo);
  const parsDateFrom = dayjs(dateFrom);

  const pointTypeOffer = offersByType.find((offer) => offer.type === type);
  const pointDestination = destinations.find((appointment) => destination === appointment.id);

  const createOffersTemplate = () => {
    if (!pointTypeOffer) {
      return '';
    }

    return pointTypeOffer.offers
      .filter((offer) => offers.includes(offer.id))
      .map((offer) => `<li class="event__offer">
                    <span class="event__offer-title">${offer.title}</span>
                    &plus;&euro;&nbsp;
                    <span class="event__offer-price">${offer.price}</span>
                  </li>`).join('');
  };

  const getEventDuration = (from, to) => {
    const eventDuration = to.diff(from);
    let durationFormat = 'DD[D] HH[H] mm[M]';

    if (eventDuration < MILLISECONDS_AMOUNT_IN_DAY) {
      durationFormat = 'HH[H] mm[M]';
    }
    if (eventDuration < MILLISECONDS_AMOUNT_IN_HOUR) {
      durationFormat = 'mm[M]';
    }

    return dayjs.duration(eventDuration).format(durationFormat);
  };

  return `<li class="trip-events__item">
  <div class="event">
    <time class="event__date" datetime="${dateFrom}">${parsDateFrom.format(DATE_FORMAT)}</time>
    <div class="event__type">
      <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
    </div>
    <h3 class="event__title">${type} ${pointDestination ? pointDestination.name : ''}</h3>
    <div class="event__schedule">
      <p class="event__time">
        <time class="event__start-time" datetime="${dateFrom}">${parsDateFrom.format(TIME_FORMAT)}</time>
        &mdash;
        <time class="event__end-time" datetime="${dateTo}">${parsDateTo.format(TIME_FORMAT)}</time>
      </p>
      <p class="event__duration">${getEventDuration(parsDateFrom, parsDateTo)}</p >
    </div >
    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
    </p>
    <h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
    ${createOffersTemplate()}
    </ul>
    <button class="event__favorite-btn ${isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
      <span class="visually-hidden">Add to favorite</span>
      <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
        <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
      </svg>
    </button>
    <button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>
  </div >
</li>`;
};

export default class PointView extends AbstractView {
  #point = null;
  #offersBytype = null;
  #destinations = null;

  #handleRollupButtonClick = null;
  #handleFavoriteClick = null;

  constructor({ point, offersByType, destinations, onRollupButtonClick, onFavoriteClick }) {
    super();

    this.#point = point;
    this.#offersBytype = offersByType;
    this.#destinations = destinations;

    this.#handleRollupButtonClick = onRollupButtonClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupButtonClickHandler);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createPointTemplate(this.#point, this.#offersBytype, this.#destinations);
  }

  #rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupButtonClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
