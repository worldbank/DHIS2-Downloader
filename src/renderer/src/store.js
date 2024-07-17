import { configureStore } from '@reduxjs/toolkit'
import dateRangeReducer from './reducers/dateRangeReducer'
import authReducer from './reducers/authReducer'
import categoryReducer from './reducers/categoryReducer'
import statusReducer from './reducers/statusReducer'
import orgUnitReducer from './reducers/orgUnitReducer'
import dataElementsReducer from './reducers/dataElementsReducer'

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    status: statusReducer,
    dateRange: dateRangeReducer,
    dataElements: dataElementsReducer,
    orgUnit: orgUnitReducer
  }
})

export default store
