import _ from 'lodash';

const initialState = {
  cart: []
};

const checkout = (state = initialState, action) => {
  switch (action.type) {
    case 'CHECKOUT_TOGGLE_CART': {
      const tmp = [...state.cart];
      const index = _.findIndex(tmp, ['id', action.item.id]);
      if (index>=0){
        tmp.splice(index,1);
      } else {
        tmp.push(action.item);
      }
      return {
        ...state,
        cart: tmp
      };
    }
    case 'CHECKOUT_RESET_CART': {
      return {
        ...state,
        cart: []
      };
    }
    default:
      return state;
  }
};

export default checkout;
