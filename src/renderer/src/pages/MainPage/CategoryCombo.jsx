// eslint-disable-next-line react/prop-types
const CategoryDropdownMenu = ({ category, selectedCategory, handleSelectCategory }) => {
  return (
    <>
      <select
        id="categoryCombination"
        value={selectedCategory}
        onChange={handleSelectCategory}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
      >
        <option value="">Select Category Combination</option>
        {category?.map((combo) => (
          <option key={combo.id} value={combo.id}>
            {combo.displayName}
          </option>
        ))}
      </select>
    </>
  )
}

export default CategoryDropdownMenu
