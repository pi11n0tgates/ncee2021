import 'bootstrap/dist/css/bootstrap.min.css'
import '../style.css'
import React, { useState, useEffect } from 'react'
import { Alert, Form, FormControl, Button, ButtonGroup, Nav, Tab, Row, Col, Table, InputGroup, Dropdown, DropdownButton, ListGroup, Image, Card, CardGroup, CardDeck, Badge, Tabs, FormGroup, ListGroupItem } from 'react-bootstrap'
import { Navbar, NavDropdown, Breadcrumb, Pagination } from 'react-bootstrap'
import { BrowserRouter as Router, Switch, Route, Link, NavLink, Redirect, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import constants from '../utils/constants'
import SVG from '../utils/svg'
import { makePaginations } from './components/pagination'
import { timeStringConverter } from '../utils/util'
import { TopicCard, TopicList } from './components/topic'
import { PostCard, NewPostForm, PostList } from './components/post'
import { UserListItem, UserList, SignupForm, UserCard, toggleFollowService, UserAvatar, UserActivity, FollowButton, UserInteractInfo, NotificationList } from './components/user'
import { InstituteList } from './components/institute'
import axios from 'axios'
import { MsgAlert } from './components/msg'

const serverUrl = `http://${document.domain}:${constants.serverPort}`

const UserHeader = (props) => {
  const user = props.user
  const loginAs = JSON.parse(window.localStorage.getItem('user'))
  const history = useHistory()
  const [msg, setMsg] = useState({
    type: '',
    text: ''
  })

  return (
    <div className="mb-3">
      <MsgAlert msg={msg} />
      <Row>
        <Col xs="auto">
          <UserAvatar width={96} height={96} user={user} withModal />
        </Col>
        <Col className="pl-0">
          <Row>
            <Col>
              <Row>
                <Col>
                  <div>
                    <strong>
                      <big>{user.name}</big>
                    </strong>
                  </div>
                  <span className="text-info">@{user.username}</span>
                </Col>
              </Row>
              <Row className="text-muted">
                <Col xs={12} sm="auto" className="pr-0">
                  <small>
                    <SVG variant="location" className="mr-1" />
                    <span>
                      {constants.regions.find(r => r.region_id === user.region.province).region_name}, {constants.cities.find(c => c.city_id === user.region.city).city_name}
                    </span>
                  </small>
                </Col>
                <Col xs={12} sm="auto" className="pr-0">
                  <small>
                    <SVG variant="calendar" className="mr-1" />
                    <span>
                      {new Date(user.registeredDate).toLocaleDateString('zh', constants.shortDateOptions)} 加入
                    </span>
                  </small>
                </Col>
              </Row>
              <UserInteractInfo user={user} className="mt-2" onClick={(e) => { e.stopPropagation() }} />
            </Col>
            <Col xs="auto">
              <FollowButton
                user={user}
                variant="info"
                onFollow={setMsg} />
            </Col>
          </Row>
          {
            (user.about) ? (
              <Row className="mt-2">
                <Col style={{
                  maxHeight: '4.5rem',
                  overflowY: 'scroll',
                }}>
                  {user.about}
                </Col>
              </Row>
            ) : null
          }
        </Col>

      </Row>
    </div>
  )
}

const fetchUserService = async (username, port = constants.serverPort) => {
  const url = `http://${document.domain}:${constants.serverPort}/user/${username}/`
  const res = await axios.get(url)
  return res
}

const UserDetail = (props) => {
  const [user, setUser] = useState()
  const { url, path, params } = useRouteMatch()
  const [msg, setMsg] = useState({
    type: '',
    text: ''
  })
  const username = useParams().username
  const [loginAs, setLoginAs] = useState()
  //const [noticeCount, setNoticeCount] = useState(parseInt(window.localStorage.getItem('noticecount')))
  const [followedInstitutes, setFollowedInstitutes] = useState([])

  useEffect(async () => {
    setLoginAs(JSON.parse(window.localStorage.getItem('user')))

    try {
      const res = await fetchUserService(username)
      // hint: the setState can be proceed by a callback to synchronize the control of prevstate
      /*
      setUser((user) => {
        console.log(user)
        return res.data.user
      })
      */
      setUser(res.data.user)
      document.title = `${res.data.user.name} - ${constants.title.user} - ${constants.appName}`
    } catch (err) {
      setMsg({ type: 'danger', text: `找不到用户: ${username}` })
    }

  }, [username])

  useEffect(async () => {
    if (user) {
      const url = `http://${document.domain}:${constants.serverPort}/institute/following`
      const res = await axios.post(url, { user: user._id })
      console.log(res)
      setFollowedInstitutes([...res.data.institutes])
    }
  }, [user])
  /*
  useEffect(async () => {
    if (loginAs && user) {
      setInterval(() => {
        setNoticeCount(parseInt(window.localStorage.getItem('noticecount')))
      }, 5000)
    }
  }, [loginAs, user])
  */

  return (
    <>
      <MsgAlert msg={msg} />
      {
        (user) ? (
          <>
            <UserHeader user={user} />

            <Router>
              <Card className="mb-3">
                <Card.Header>
                  <Nav variant="tabs">
                    <Nav.Item>
                      <NavLink className="nav-link p-2" activeClassName="active" to={`activity`}>
                        动态
                      </NavLink>
                    </Nav.Item>
                    {
                      (loginAs && (loginAs._id === user._id)) ? (
                        <Nav.Item>
                          <NavLink className="nav-link p-2" activeClassName="active" to={`notifications`}>
                            消息
                            {
                              /*
                              (noticeCount > 0) ? (
                                <Badge variant="info" className="ml-1">
                                  {noticeCount}
                                </Badge>
                              ) : null
                              */
                            }
                          </NavLink>
                        </Nav.Item>
                      ) : null
                    }
                    <Nav.Item>
                      <NavLink className="nav-link p-2" activeClassName="active" to={`following`}>
                        关注中
                      </NavLink>
                    </Nav.Item>
                    <Nav.Item>
                      <NavLink className="nav-link p-2" activeClassName="active" to={`follower`}>
                        关注者
                      </NavLink>
                    </Nav.Item>
                    {
                      (loginAs && (loginAs._id === user._id)) ? (
                        <Nav.Item>
                          <NavLink className="nav-link p-2" activeClassName="active" to={`profile`}>
                            个人资料
                          </NavLink>
                        </Nav.Item>
                      ) : null
                    }
                  </Nav>
                </Card.Header>
                <Switch>
                  <Route path={`${url}`} exact={true}>
                    <Redirect to={`${url}/activity`} />
                  </Route>
                  <Route path={`${url}/activity`}>
                    <UserActivity user={user._id} />
                  </Route>
                  <Route path={`${url}/following`}>
                    <UserList users={user.following} />
                    <InstituteList institutes={followedInstitutes} className="mt-3" />
                  </Route>
                  <Route path={`${url}/follower`}>
                    <UserList users={user.follower} userPerPage={24} />
                  </Route>
                  <Route path={`${url}/notifications`}>
                    <NotificationList />
                  </Route>
                  <Route path={`${url}/profile`}>
                    <Card.Body>
                      <SignupForm modify />
                    </Card.Body>
                  </Route>
                </Switch>
              </Card>
            </Router>
          </>
        ) : null
      }
    </>
  )
}



const UserPage = (props) => {
  const history = useHistory();
  const username = useParams().username
  const [user, setUser] = useState()

  const { url, path, params } = useRouteMatch()

  return (
    <div className="container">
      {
        /*
        JSON.stringify({ url, path, params })
        */
      }
      <Router>
        <Switch>
          <Route path={`/user`} exact={true}>
            <div>
              hp of /user
            </div>
          </Route>
          <Route path={`/user/:username`}>
            <UserDetail />
          </Route>
        </Switch>
      </Router>

    </div>
  )
}

export default UserPage