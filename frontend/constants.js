if (process.env.NODE_ENV === 'production') {

}

const isDev = (process.env.NODE_ENV !== 'production')
const API_URL = isDev ? 'https://localhost:3000/v1' : 'https://localhost:3000/v1'
export default {
  isDevMode: (process.env.NODE_ENV !== 'production'),
  isMockMode: false,
  API_URL,
  BASE_URL: API_URL
}
