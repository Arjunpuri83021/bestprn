import CategoryPage from '../page'

export const revalidate = 60

export { generateMetadata } from '../page'

export default function CategoryPageWithNumber(props) {
  // Reuse logic from parent [slug]/page.js; Next will pass params with page
  return CategoryPage(props)
}
