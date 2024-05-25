import { destinations, offersByType } from '../mock/point.js';
import dayjs from 'dayjs';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { POINT_TYPES } from '../mock/const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createEditPointTemplate(point) {
  const { type, dateFrom, dateTo, basePrice, destination, offers } = point;

  const pointTypeOffer = offersByType.find((offer) => offer.type === type);
  const pointDestination = destinations.find((appointment) => destination === appointment.id);

  let offersTemplate = '';
  if (pointTypeOffer) {
    offersTemplate = pointTypeOffer.offers
      .map((offer) => `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.title}-${offer.id}" type="checkbox" name="${offer.title}" data-offer-id="${offer.id}" ${offers.includes(offer.id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.title}-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`).join('');
  }

  let picturesTemplate = '';
  if (pointDestination.pictures) {
    picturesTemplate = `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${pointDestination.pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}"></img>`).join('')}
        </div>
      </div>
    `;
  }

  const destinationOptionsTemplate = destinations.map((element) => `<option value="${element.name}"></option>`).join('');

  const typeOptionsTemplate = POINT_TYPES.map((pointType) => `
    <div class="event__type-item">
      <input id="event-type-${pointType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${pointType}" ${pointType === type ? 'checked' : ''}>
      <label class="event__type-label  event__type-label--${pointType}" for="event-type-${pointType}-1">${pointType}</label>
    </div>`).join('');

  const parsDateTo = dayjs(dateTo);
  const parsDateFrom = dayjs(dateFrom);

  return `<li class="trip-events__item">
              <form class="event event--edit" action="#" method="post">
                <header class="event__header">
                  <div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                    </label>
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

                    <div class="event__type-list">
                      <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>
                        ${typeOptionsTemplate}
                      </fieldset>
                    </div>
                  </div>

                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                      ${type}
                    </label>
                    <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value=${pointDestination.name} list="destination-list-1" required>
                    <datalist id="destination-list-1">
                      ${destinationOptionsTemplate}
                    </datalist>
                  </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${parsDateFrom.format('DD/MM/YY HH:mm')}">
                    &mdash;
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${parsDateTo.format('DD/MM/YY HH:mm')}">
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                    </label>
                    <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value=${basePrice} required>
                  </div>

                  <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
                  <button class="event__reset-btn" type="reset">Delete</button>
                  <button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                  </button>
                </header>
                <section class="event__details">
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>

                    <div class="event__available-offers">
                      ${offersTemplate}
                    </div>
                  </section>

                  <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${pointDestination.description}</p>
                    ${picturesTemplate}
                  </section>
                </section>
              </form>
            </li>`;
}

export default class EditPointView extends AbstractStatefulView {
  #handleFormSubmit = null;
  #handleRollupButtonClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({ point, onFormSubmit, onRollupButtonClick }) {
    super();

    this._setState(EditPointView.parsePointToState(point));
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupButtonClick = onRollupButtonClick;

    this._restoreHandlers();
  }

  get template() {
    return createEditPointTemplate(this._state);
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  static parsePointToState = (point) => ({ ...point });

  static parseStateToPoint = (state) => ({ ...state });

  reset(point) {
    this.updateElement(EditPointView.parsePointToState(point));
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupButtonClickHandler);
    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#eventTypeToggleHandler);
    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#eventDestinationToggleHandler);
    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);
    this.element.querySelectorAll('.event__offer-selector input')
      .forEach((offer) => offer.addEventListener('change', this.#offersChangeHandler));

    this.#setDatePickerFrom();
    this.#setDatePickerTo();
  }

  #eventTypeToggleHandler = (evt) => {
    evt.preventDefault();

    this.updateElement({
      type: evt.target.value,
      offers: []
    });
  };

  #eventDestinationToggleHandler = (evt) => {
    evt.preventDefault();

    const selectedDestination = destinations.find((destination) => evt.target.value === destination.name);

    this.updateElement({
      destination: selectedDestination.id
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();

    this._setState({
      basePrice: evt.target.value
    });
  };

  #offersChangeHandler = (evt) => {
    evt.preventDefault();
    evt.target.toggleAttribute('checked');

    let selectedOffers = this._state.offers;

    if (evt.target.hasAttribute('checked')) {
      selectedOffers.push(+(evt.target.dataset.offerId));
    } else {
      selectedOffers = selectedOffers.filter((id) => id !== +(evt.target.dataset.offerId));
    }

    this._setState({
      offers: selectedOffers
    });
  };

  #dateFromChangeHadler = ([dateFrom]) => {
    this.updateElement({
      dateFrom: dateFrom
    });
  };

  #dateToChangeHadler = ([dateTo]) => {
    this.updateElement({
      dateTo: dateTo
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EditPointView.parseStateToPoint(this._state));
  };

  #rollupButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupButtonClick();
  };

  #setDatePickerFrom() {
    this.#datepickerFrom = flatpickr(
      this.element.querySelector('input[name=event-start-time]'),
      {
        dateFormat: 'j/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHadler,
        enableTime: true
      }
    );
  }

  #setDatePickerTo() {
    this.#datepickerTo = flatpickr(
      this.element.querySelector('input[name=event-end-time]'),
      {
        dateFormat: 'j/m/y H:i',
        defaultDate: this._state.dateTo,
        onChange: this.#dateToChangeHadler,
        enableTime: true
      }
    );
  }
}