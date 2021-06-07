import React, { useState } from 'react'
import { AppBar, Tabs, Tab, Grid, Button } from '@material-ui/core'
import Add from '@material-ui/icons/Add'
import Close from '@material-ui/icons/Close'
import { makeStyles } from '@material-ui/styles'
import SplitPaneComponent from './SplitPaneComponent'
import SplitPane from 'react-split-pane'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import PropTypes from 'prop-types'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'
import CircularProgress from '@material-ui/core/CircularProgress'
import Badge from '@material-ui/core/Badge'
import MailIcon from '@material-ui/icons/Mail'
// I was stuck at deleting Tab, however, I found this thread from Rahul-RB on git
// https://gist.github.com/Rahul-RB/273dbb24faf411fa6cc37488e1af2415
// Since I am building an app with react hook only,
// I tried converting it to React Hooks and its works like this

const DELETE_TAB_MUTATION = gql`
  mutation($tabId: Int, $email: String!) {
    deleteTabs(where: { tabId: $tabId, user: { email: $email } }) {
      nodesDeleted
    }
  }
`

const GET_TABS_QUERY = gql`
  query($email: String!) {
    tabs(where: { user: { email: $email } }) {
      tabId
    }
  }
`
const ADD_TAB_MUTATION = gql`
  mutation($tabId: Int, $email: String!) {
    createTabs(
      input: { tabId: $tabId, user: { connect: { where: { email: $email } } } }
    ) {
      tabs {
        tabId
        user {
          email
        }
      }
    }
  }
`
var isInit = false

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      className="div_parent"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3} className="div_parent">
          <Typography className="div_parent">{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: '60px',
    width: '100%',
    backgroundColor: '#fff',
  },
  appBar: {
    color: 'inherit',
    backgroundColor: 'a09b87',
    '& .myTab': {
      backgroundColor: 'yellow',
      color: 'white',
    },
  },
}))
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}
const CustomTabsHook = () => {
  const classes = useStyles()
  const [addTodo] = useMutation(ADD_TAB_MUTATION)
  const [addTodo1] = useMutation(DELETE_TAB_MUTATION)
  const { user, isAuthenticated } = useAuth0()

  const [tabList, setTabList] = useState([
    {
      key: 0,
      id: 0,
    },
  ])

  const [tabValue, setTabValue] = useState(0)
  const handleTabChange = (event, value) => {
    setTabValue(value)
  }

  const addTab = () => {
    let id = tabList[tabList.length - 1].id + 1
    setTabList([...tabList, { key: id, id: id }])
    console.log('add tab')
    if (isInit === true)
      addTodo({ variables: { email: user.email, tabId: id } })
  }

  const deleteTab = (e) => {
    e.stopPropagation()

    if (tabList.length === 1) {
      return
    }
    let tabId = parseInt(e.target.id)
    let tabIDIndex = 0

    if (isInit === true) {
      addTodo1({ variables: { email: user.email, tabId } })
      console.log('delete_' + tabId)
    }

    let tabs = tabList.filter((value, index) => {
      if (value.id === tabId) {
        tabIDIndex = index
      }
      console.log('delete 1')
      return value.id !== tabId
    })

    let curValue = parseInt(tabValue)
    if (curValue === tabId) {
      if (tabIDIndex === 0) {
        curValue = tabList[tabIDIndex + 1].id
      } else {
        curValue = tabList[tabIDIndex - 1].id
      }
    }
    setTabValue(curValue)
    setTabList(tabs)
    //
  }

  const TabsChecker = () => {
    //  alert(user.email)

    if (isInit === false) {
      //alert(user.email)

      const { loading, error, data } = useQuery(GET_TABS_QUERY, {
        variables: {
          email: user.email,
        },
      })
      if (data) {
        if (isInit === false) {
          {
            data.tabs.map((n) => {
              let id = n.tabId
              console.log('add tab_' + id)

              setTabList((tabList) => [...tabList, { key: id, id: id }])
            })
          }
          isInit = true
        }
      }
    }
    return <br />
  }

  return (
    <div className="div_parent">
      <Grid container alignItems="center" justify="center">
        <Grid item xl={11} lg={11} md={11} sm={11} xs={11}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="simple tabs example"
          >
            {tabList.map((tab) => (
              <Tab
                key={tab.key.toString()}
                value={tab.id}
                label={'Node ' + tab.id}
                {...a11yProps(0)}
                icon={<Close id={tab.id} onClick={deleteTab} />}
                className="mytab"
              ></Tab>
            ))}
          </Tabs>
        </Grid>
        <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
          <Button variant="outlined" onClick={addTab}>
            <Add />
          </Button>
        </Grid>
      </Grid>
      <TabsChecker />
      <div className="div_parent_2">
        {tabList.map((tab) => (
          <TabPanel
            className="div_parent"
            value={tabValue}
            index={tab.id}
            key={tab.id}
          >
            {isAuthenticated && (
              <SplitPaneComponent className="div_parent" tabId={tab.id} />
            )}
          </TabPanel>
        ))}
      </div>
    </div>
  )
}

/*
      <TabPanel value={tabValue} index={0} className="div_parent">
  Item One
</TabPanel>
<TabPanel value={tabValue} index={1}>
  Item Two
</TabPanel>
<TabPanel value={tabValue} index={2}>
  Item Three
</TabPanel>
*/
export default CustomTabsHook
