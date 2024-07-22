import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCategoryCombinations, setSelectedCategory } from '../../reducers/categoryReducer'

const CategoryDropdownMenu = ({ dhis2Url, username, password }) => {
  const dispatch = useDispatch()
  const { category, selectedCategory } = useSelector((state) => state.category)

  useEffect(() => {
    dispatch(fetchCategoryCombinations({ dhis2Url, username, password }))
  }, [dhis2Url, username, password, dispatch])

  const handleSelectCategory = (event) => {
    dispatch(setSelectedCategory(event.target.value))
  }

  return (
    <select
      id="categoryCombination"
      value={selectedCategory}
      onChange={handleSelectCategory}
      className="w-full px-4 py-2 border border-gray-700 rounded"
    >
      <option value="">Select Category Combination</option>
      {category?.map((combo) => (
        <option key={combo.id} value={combo.id}>
          {combo.displayName}
        </option>
      ))}
    </select>
  )
}

export default CategoryDropdownMenu
