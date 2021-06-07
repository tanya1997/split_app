import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { gql, useQuery, useMutation } from '@apollo/client'
//import UserAdd from './UserAdd'

const USERS_QUERY = gql`
  query($email: String!) {
    users(where: { email: $email }) {
      email
    }
  }
`
const SET_USER_MUTATION = gql`
  mutation($email: String!) {
    createUsers(input: { email: $email }) {
      users {
        email
      }
    }
  }
`

var isInit = false
const UserChecker = () => {
  //  alert(user.email)
  const { user, isAuthenticated } = useAuth0()
  if (isAuthenticated && isInit === false) {
    //alert(user.email)

    const { loading, error, data } = useQuery(USERS_QUERY, {
      variables: {
        email: user.email,
      },
    })
    const [addTodo] = useMutation(SET_USER_MUTATION)

    // if (loading) return null;
    // if (error) return `Error! ${error}`;

    //  alert(data.user.email)
    if (data) {
      if (data.users) {
        if (data.users[0]) {
          if (data.users[0].email) {
            console.log('data user + email ' + data.users[0].email)
          } else {
            console.log('data user ' + data.users[0])
            //  return <UserAdd/>
            addTodo({ variables: { email: user.email } })
            isInit = true
          }
        } else {
          console.log('data1 ' + data.users[0])
          addTodo({ variables: { email: user.email } })
          isInit = true
        }
      }
    }
  }
  return <br />
}

export default UserChecker
