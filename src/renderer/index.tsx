import 'antd/dist/antd.css'
import ReactDom from 'react-dom'
import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

import { WindowStoreProvider } from './store'
// import { AppRoutes } from './routes'
import { Layout } from 'antd'
import { SideMenu } from './components/SideMenu'

import './styles/globals.sass'
import { MainRoutes } from './routes/main'

const { Sider, Header, Footer, Content } = Layout

ReactDom.render(
  <React.StrictMode>
    <WindowStoreProvider>
      <Router>
        <Layout>
          <Sider>
            <SideMenu />
          </Sider>
          <Layout>
            <Header>Header</Header>
            <Content>
              {/* <AppRoutes /> */}
              <MainRoutes />
            </Content>
            {/* <Footer>Footer</Footer> */}
          </Layout>
        </Layout>
      </Router>
    </WindowStoreProvider>
  </React.StrictMode>,
  document.querySelector('app')
)
