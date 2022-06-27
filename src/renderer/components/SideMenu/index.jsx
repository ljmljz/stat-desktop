import { Menu } from 'antd';
import { HashRouter, NavLink } from 'react-router-dom';
import {
    AppstoreOutlined,
    ContainerOutlined,
    DesktopOutlined,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
  } from '@ant-design/icons';

const getItem = (
    label,
    key,
    icon,
    children,
    type
  ) => {
    return {
      key,
      icon,
      children,
      label,
      type,
    }
}

export const SideMenu = (props) => {
    // let navigate = useNavigate()

    const items  = [
        getItem(<NavLink to='/main'>首页</NavLink>, '/main', <PieChartOutlined />),
        getItem(<NavLink to='/inSchool'>在校名单</NavLink>, '/inSchool', <DesktopOutlined />),
        getItem(<NavLink to='/outSchool'>未返校名单</NavLink>, '/outSchool', <ContainerOutlined />),
        getItem(<NavLink to='/outShenzhen'>今日离深名单</NavLink>, '/outShenzhen', <ContainerOutlined />),
        getItem(<NavLink to='/allStudents'>全部学生</NavLink>, '/allStudents', <ContainerOutlined />)
    ]

    const handleMenuClick = ({ item, key, keyPath, domEvent }) => {
        // navigate(key)
    }

    return (
        <div>
            <div style={{height: 64, lineHeight: '64px', fontWeight: 'bold', fontSize: '20px', textAlign: 'center', color: '#fff'}}>人员统计</div>
                <Menu
                    defaultSelectedKeys={['/main']}
                    mode="inline"
                    theme="dark"
                    inlineCollapsed={false}
                    items={items}
                    onClick={handleMenuClick}
                />
        </div>
    )
}