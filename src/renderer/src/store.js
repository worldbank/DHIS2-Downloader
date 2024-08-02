import { configureStore } from '@reduxjs/toolkit'
import dateRangeReducer from './reducers/dateRangeReducer'
import authReducer from './reducers/authReducer'
import categoryReducer from './reducers/categoryReducer'
import statusReducer from './reducers/statusReducer'
import orgUnitReducer from './reducers/orgUnitReducer'
import dataElementsReducer from './reducers/dataElementsReducer'
import mouseReducer from './reducers/mouseReducer'
import modalReducer from './reducers/modalReducer'

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    status: statusReducer,
    modal: modalReducer,
    dateRange: dateRangeReducer,
    dataElements: dataElementsReducer,
    orgUnit: orgUnitReducer,
    mouse: mouseReducer
  }
})

export default store
