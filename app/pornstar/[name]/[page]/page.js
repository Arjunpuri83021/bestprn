import PornstarPage from '../page'

export const revalidate = 60

export { generateMetadata } from '../page'

export default function PornstarPageWithNumber(props) {
  // Reuse logic from parent [name]/page.js; Next will pass params with page
  return PornstarPage(props)
}
