import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Avatar, Paper, Typography } from '@material-ui/core'
import classNames from 'classnames'

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <div>Loading ...</div>
  }

  return (
    isAuthenticated && (
      <Paper style={{ padding: '2px' }} className="box">
        <Avatar src={user.picture} alt={user.name}></Avatar>
        <Typography style={{ padding: '10px' }}>{user.name}</Typography>
      </Paper>
    )
  )
}
//<Typography>{user.email}</Typography>
export default Profile
