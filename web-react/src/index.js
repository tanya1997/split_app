import React, { useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'

import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

const AppWithApollo = () => {
  const [accessToken, setAccessToken] = useState()
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0()

  const getAccessToken = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently()
      console.log(token)
      setAccessToken(token)
    } catch (err) {
      //loginWithRedirect()
    }
  }, [getAccessTokenSilently, loginWithRedirect])

  useEffect(() => {
    getAccessToken()
  }, [getAccessToken])

  const client = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_URI || '/graphql',
    cache: new InMemoryCache(),
    request: async (operation) => {
      if (accessToken) {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      }
    },
  })

  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  )
}

const Main = () => (
  <Auth0Provider
    domain="dev-mpu1t6ti.us.auth0.com"
    clientId="QiEfA3d6S2fuH9Yuv8FDPZQTHRZmo2eU"
    redirectUri={window.location.origin}
  >
    <AppWithApollo />
  </Auth0Provider>
)

ReactDOM.render(<Main />, document.getElementById('root'))
registerServiceWorker()
