import { configureStore } from '@reduxjs/toolkit'
import dateRangeReducer from './reducers/dateRangeReducer'
import authReducer from './reducers/authReducer'
import categoryReducer from './reducers/categoryReducer'
import statusReducer from './reducers/statusReducer'
import orgUnitReducer from './reducers/orgUnitReducer'
import dataElementsReducer from './reducers/dataElementsReducer'
import popUpRedcuer from './reducers/exportReducer'
import mouseReducer from './reducers/mouseReducer'

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    status: statusReducer,
    dateRange: dateRangeReducer,
    dataElements: dataElementsReducer,
    orgUnit: orgUnitReducer,
    popup: popUpRedcuer,
    mouse: mouseReducer
  }
})

export default store
