import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { gql, useQuery, useMutation } from '@apollo/client'

const SET_USER_MUTATION = gql`
  mutation($email: String!) {
    createUsers(input: { email: $email }) {
      users {
        email
      }
    }
  }
`
export default function UserAdd() {
  // alert("test1")
  console.log('user add')
  const { user } = useAuth0()

  //if (isAuthenticated){
  const [addTodo, { loading, error }] = useMutation(SET_USER_MUTATION)

  addTodo({ variables: { email: user.email } })
  if (loading) alert('load')
  if (error) alert('errr')

  //  alert("ok")
  // }
  return <br />
}
