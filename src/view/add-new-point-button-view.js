import AbstractView from '../framework/view/abstract-view.js';

function createTripInfoTemplate() {
  return '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type = "button"> New event</button>';
}

export default class AddNewPointButtonView extends AbstractView {

  get template() {
    return createTripInfoTemplate();
  }

}
