import React, { useState } from 'react'
import SplitPane from 'react-split-pane'
import _ from 'lodash'
import { gql, useQuery, useMutation } from '@apollo/client'
import VerticalSplitIcon from '@material-ui/icons/VerticalSplit'
import HorizontalSplitIcon from '@material-ui/icons/HorizontalSplit'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import './styles.css'
import './SplitPaneComponent.css'
import { useAuth0 } from '@auth0/auth0-react'

let test1 = 'horizontal'

/*
 <button onClick={() => {test1 = "horizontal"; onChange()}}>Component {label} Horisontal</button>
    <button onClick={() => {test1 = "vertical"; onChange()}}>Component {label} Vertical</button>
    <button onClick={() => {onRemove()}}>Component {label} remove</button>
*/
const ComponentA = ({ label, onChange, onRemove }) => (
  <div className="box">
    <VerticalSplitIcon
      onClick={() => {
        test1 = 'vertical'
        onChange()
      }}
    ></VerticalSplitIcon>
    <HorizontalSplitIcon
      onClick={() => {
        test1 = 'horizontal'
        onChange()
      }}
    ></HorizontalSplitIcon>
    <HighlightOffIcon
      onClick={() => {
        onRemove()
      }}
    ></HighlightOffIcon>
  </div>
)

const SPLIT_QUERY = gql`
  query($tabId: Int, $email: String!) {
    splits(where: { tab: { tabId: $tabId, user: { email: $email } } }) {
      data
    }
  }
`
const REMOVE_SPLIT_MUTATION = gql`
  mutation($tabId: Int, $email: String!) {
    deleteSplits(where: { tab: { tabId: $tabId, user: { email: $email } } }) {
      nodesDeleted
    }
  }
`
const ADD_SPLIT_MUTATION = gql`
  mutation($data: String!, $tabId: Int, $email: String!) {
    createSplits(
      input: {
        data: $data
        tab: { connect: { where: { tabId: $tabId, user: { email: $email } } } }
      }
    ) {
      splits {
        data
        tab {
          tabId
          user {
            email
          }
        }
      }
    }
  }
`

function getNestedChildren(arr, parent) {
  var out = []
  for (var i in arr) {
    if (arr[i].parent === parent) {
      var children = getNestedChildren(arr, arr[i].id)

      if (children.length) {
        arr[i].children = children
      }
      out.push(arr[i])
    }
  }
  return out
}

const default_link = 'https://orange-band-3c39.ideacontest.workers.dev/'

function itemObject(item) {
  return {
    id: item.id,
    split: item.split,
    parent: item.parent || 0,
    value: item.value || 'https://orange-band-3c39.ideacontest.workers.dev/',
    src_link:
      item.src_link || 'https://orange-band-3c39.ideacontest.workers.dev/',
  }
}

var _rows = []
var isInit = false

var itemId = 1

export default function SplitPaneComponent(props) {
  const { user } = useAuth0()
  const [items, setItems] = useState(_rows)
  const [itemsTemp, setItemsTemp] = useState([])
  const [addTodo] = useMutation(REMOVE_SPLIT_MUTATION)
  const [addTodo1] = useMutation(ADD_SPLIT_MUTATION)
  const { loading, error, data } = useQuery(SPLIT_QUERY, {
    variables: {
      tabId: props.tabId,
      email: user.email,
    },
  })

  if (data) {
    if (isInit === false) {
      if (data.splits) {
        if (data.splits[0]) {
          console.log('_rows0 ' + data.splits[0].data)
          _rows = JSON.parse(data.splits[0].data)
          setItems(_rows)
          isInit = true
        }
        // isInit = true
      }
    }
  }

  console.log('_rows ' + _rows)

  //itemsTemp = [];
  //renderItem(items)

  const handleChange = (index_value, evt) => {
    //  const { items, itemsTemp } = this.state;
    //console.log("handle change 0")
    let _items = _.clone(items)
    let _itemsTemp = _.clone(itemsTemp)

    for (var i = _itemsTemp.length - 1; i >= 0; --i) {
      // console.log("tt " + i +);
      if (_itemsTemp[i].id == index_value) {
        _itemsTemp[i].value = evt.target.value
      }
    }

    _items = getNestedChildren(_itemsTemp, 0)
    // console.log("handle change 1")

    setItems(_items)
    setItemsTemp(_itemsTemp)
  }

  const handleSubmit = (index_value, evt) => {
    let _items = _.clone(items)
    let _itemsTemp = _.clone(itemsTemp)

    for (var i = _itemsTemp.length - 1; i >= 0; --i) {
      // console.log("tt " + i +);
      if (_itemsTemp[i].id == index_value) {
        _itemsTemp[i].src_link =
          default_link + '?CORSflare_upstream=' + _itemsTemp[i].value
        console.log('tt ' + _itemsTemp[i].src_link)
      }
    }

    _items = getNestedChildren(_itemsTemp, 0)

    setItems(_items)
    setItemsTemp(_itemsTemp)

    evt.preventDefault()
  }

  const onChange = function (item, splitValue) {
    console.log('item split ' + item.split)
    console.log('splitValue ' + splitValue)
    // const { items, itemsTemp } = this.state;
    let _items = _.clone(items)
    let _itemsTemp = _.clone(itemsTemp)
    // console.log("_itemsTemp", _itemsTemp);
    if (item) item.split = splitValue
    _itemsTemp.push(
      itemObject({
        id: itemId++,
        parent: item ? item.id : 0,
        split: splitValue,
      })
    )
    _itemsTemp.push(
      itemObject({
        id: itemId++,
        parent: item ? item.id : 0,
        split: splitValue,
      })
    )
    _items = getNestedChildren(_itemsTemp, 0)

    setItems(_items)
    setItemsTemp(_itemsTemp)
    addTodo({ variables: { email: user.email, tabId: props.tabId } })
    console.log('props ' + props.tabId)
    console.log('email ' + user.email)
    addTodo1({
      variables: {
        email: user.email,
        tabId: props.tabId,
        data: JSON.stringify(_items),
      },
    })
    // this.setState({ items: _items, itemsTemp: _itemsTemp });
  }

  const onRemove = function (index_value) {
    // const { items, itemsTemp } = this.state;
    let _items = _.clone(items)
    let _itemsTemp = _.clone(itemsTemp)
    const index = _items.indexOf(i)
    console.log('index ' + index + ' ' + index_value)
    let parent = 0
    for (var i = _itemsTemp.length - 1; i >= 0; --i) {
      // console.log("tt " + i +);
      if (_itemsTemp[i].id == index_value) {
        parent = _itemsTemp[i].parent
        console.log('+++++++++')
        _itemsTemp.splice(i, 1)
      }
    }
    if (parent) {
      for (i = _itemsTemp.length - 1; i >= 0; --i) {
        // console.log("tt " + i +);
        if (_itemsTemp[i].id == parent) {
          for (var j = _itemsTemp.length - 1; j >= 0; --j) {
            if (_itemsTemp[j].parent == parent) {
              console.log('-----------')
              _itemsTemp[j].id = _itemsTemp[i].id
              _itemsTemp[j].parent = _itemsTemp[i].parent
              _itemsTemp.splice(i, 1)
            }
          }
        }
      }
      itemId--
      itemId--
    }
    _items = getNestedChildren(_itemsTemp, 0)

    setItems(_items)
    setItemsTemp(_itemsTemp)
    //  this.setState({ items: _items, itemsTemp: _itemsTemp });
  }

  const renderItem = (items = [], split) => {
    console.log('render!', test1)
    console.log(items)
    let raw = (
      <div className="div_parent">
        <div className="div_block">
          <input
            type="text"
            value={default_link}
            onChange={(e) => handleChange(0, e)}
          />
          <input
            type="submit"
            value="Submit"
            onClick={(e) => handleSubmit(0, e)}
          />
          <ComponentA
            onChange={() => {
              split = test1
              onChange('', test1)
            }}
          />
        </div>
        <iframe key={''} src={default_link} width="100%" height="90%" />
      </div>
    )
    if (items.length > 0) {
      raw = (
        <SplitPane split={split} defaultSize="50%">
          {items.map((item, i) =>
            item.children && item.children.length > 0 ? (
              renderItem(item.children, item.split)
            ) : (
              <div className="div_parent">
                <div className="div_block">
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleChange(item.id, e)}
                  />
                  <input
                    type="submit"
                    value="Submit"
                    onClick={(e) => handleSubmit(item.id, e)}
                  />
                  <ComponentA
                    key={item.id}
                    onChange={() => {
                      split = test1
                      onChange(item, test1)
                    }}
                    onRemove={() => onRemove(item.id)}
                    label={item.id + ' ' + split}
                    height="10%"
                  />
                </div>

                <iframe
                  key={item.src_link}
                  src={item.src_link}
                  width="100%"
                  height="90%"
                />
              </div>
            )
          )}
        </SplitPane>
      )
    }
    return raw
  }
  return <div className="div_parent">{renderItem(items)}</div>
}
