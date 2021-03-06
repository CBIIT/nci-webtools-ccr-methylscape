import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import Home from '../home';
// import CNSProfiling from '../cnsprofiling';
// import Help from '../help';
// import ProjectPage from "../project"
// import Summary from '../home/components/Summary';
// import Experiments from '../home/components/Experiments';
// import Samples from '../home/components/Samples';
// import Projects from '../home/components/Projects';
import QCI from '../qci';
//import Help from '../home/components/Help'
import { Layout, Menu, PageHeader } from 'antd';
// import FooterContent from './components/footer';
import './index.css';
import {
  // faChartPie,
  // faClipboard,
  // faVials,
  // faUserFriends,
  faBars,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Router } from 'express';
const { Header, Content, Footer } = Layout;

class App extends React.Component {
  state = {
    current: 'projects',
    data: [],
    filter: {
      project: '',
      experiment: '',
    },
    scanCheck: true,
    showErrorAlert: false,
    projectSummery: '',
    windowWidth: document.body.clientWidth,
    mobileOpened: false,
    timeout: false,
  };
  handleClick = (e) => {
    this.setState({
      current: e.key,
      filter: {
        project: '',
        experiment: '',
      },
    });
  };

  componentDidMount() {
    window.addEventListener('resize', () => {
      clearTimeout(this.state.timeout);
      // start timing for event "completion"
      this.setState({
        timeout: setTimeout(() => {
          this.setState({ windowWidth: document.body.clientWidth }, () => {
            //console.log(this.state.windowWidth);
          });
        }, 250),
      });
    });
  }

  changeTab = (activeTab, filter = {}) => {
    this.setState({ current: activeTab, filter: filter });
    /*console.log(
      this.state.activeTab +
        ', ' +
        JSON.stringify(this.state.filter) +
        ', ' +
        JSON.stringify(this.state.data)
    );*/
  };

  renderMain() {
    return (
      <Home current={this.state.current} changeTab={this.changeTab} filter={this.state.filter} />
    );
  }

  get_num_projects() {
    //(this.state.data);
  }

  handleExpandHamburger = (e) => {
    this.setState({
      mobileOpened: !this.state.mobileOpened,
    });
  };

  getCurrentMobileHeader() {
    if (this.state.current == 'projects') {
      return 'Projects';
    }
    if (this.state.current == 'experiments') {
      return 'Experiments';
    }
    if (this.state.current == 'samples') {
      return 'Samples';
    }
    return 'Help';
  }

  renderNavbar() {
    const navLinkStyle = {
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
    };
    if (this.state.windowWidth >= 685) {
      return (
        <div
          style={{
            padding: '0px 0px',
            maxWidth: '1400px',
            width: '100%',
            marginRight: 'auto',
            marginLeft: 'auto',
          }}
        >
          <Menu
            onClick={this.handleClick}
            selectedKeys={[this.state.current]}
            theme="dark"
            mode="horizontal"
            style={{
              width: '100%',
              height: '40px',
              lineHeight: '40px',
              backgroundColor: '#005ea2',
            }}
          >
            {/* Home */}
            <Menu.Item key="projects" className="testMenu">
              <div>
                <Link style={navLinkStyle}>Projects</Link>
              </div>
            </Menu.Item>

            <Menu.Item className="testMenu" key="experiments">
              <Link style={navLinkStyle}>Experiments</Link>
            </Menu.Item>

            <Menu.Item key="samples" className="testMenu">
              <Link style={navLinkStyle}>Samples</Link>
            </Menu.Item>

            <Menu.Item key="help">
              <Link style={navLinkStyle}>Help</Link>
            </Menu.Item>
          </Menu>
        </div>
      );
    } else {
      if (this.state.mobileOpened == true) {
        return (
          <div
            style={{
              padding: '0px 0px',
              maxWidth: '1400px',
              width: '100%',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            <div style={{ height: '40px' }}>
              <div style={{ padding: '0px 50px', height: '40px' }}>
                <div
                  style={{
                    backgroundColor: 'steelblue',
                    height: '40px',
                    'line-height': '40px',
                    float: 'left',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  <p style={{ color: 'white' }}>{this.getCurrentMobileHeader()}</p>
                </div>
                <a
                  style={{
                    height: '40px',
                    'line-height': '40px',
                    float: 'right',
                  }}
                  onClick={this.handleExpandHamburger}
                >
                  <FontAwesomeIcon
                    icon={faBars}
                    style={{
                      paddingTop: '10px',
                      color: 'white',
                      fontSize: '30px',
                    }}
                  />
                </a>
              </div>
              <div style={{ backgroundColor: 'black' }}>
                <div className="mobileMenu" onClick={this.handleProjectClick}>
                  <p
                    style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      padding: '0px 0px',
                      margin: '0',
                      'line-height': '50px',
                    }}
                  >
                    Projects
                  </p>
                </div>
                <div className="mobileMenu" onClick={this.handleExperimentClick}>
                  <p
                    style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      padding: '0px 0px',
                      margin: '0',
                      'line-height': '50px',
                    }}
                  >
                    Experiments
                  </p>
                </div>
                <div className="mobileMenu" onClick={this.handleSampleClick}>
                  <p
                    style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      padding: '0px 0px',
                      margin: '0',
                      'line-height': '50px',
                    }}
                  >
                    Samples
                  </p>
                </div>
                <div className="mobileMenu" onClick={this.handleHelpClick}>
                  <p
                    style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      padding: '0px 0px',
                      margin: '0',
                      'line-height': '50px',
                    }}
                  >
                    Help
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div
            style={{
              padding: '0px 0px',
              maxWidth: '1400px',
              width: '100%',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            <div style={{ height: '40px' }}>
              <div style={{ padding: '0px 50px', height: '40px' }}>
                <div
                  style={{
                    backgroundColor: 'steelblue',
                    height: '40px',
                    'line-height': '40px',
                    float: 'left',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  <p style={{ color: 'white' }}>{this.getCurrentMobileHeader()}</p>
                </div>
                <a
                  style={{
                    height: '40px',
                    'line-height': '40px',
                    float: 'right',
                  }}
                  onClick={this.handleExpandHamburger}
                >
                  <FontAwesomeIcon
                    icon={faBars}
                    style={{
                      paddingTop: '10px',
                      color: 'white',
                      fontSize: '30px',
                    }}
                  />
                </a>
              </div>
            </div>
          </div>
        );
      }
    }
  }
  renderHeader() {
    if (this.state.windowWidth >= 1500) {
      return (
        <Header
          className="header"
          style={{
            height: 'auto',
            // theme: 'light',
            background: '#f0f2f5',
            // position: 'fixed',
            zIndex: 1,
            width: '100%',
            padding: '0',
          }}
        >
          <div
            style={{
              padding: '0 0px',
              maxWidth: '1400px',
              width: '100%',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            <a href="https://ccr.cancer.gov/" target="_blank">
              <img
                height="auto"
                className="logo"
                src="./assets/img/nci-ccr-logo.svg"
                alt="National Cancer Institute"
                width="80%"
                style={{ paddingTop: '20px' }}
              />
            </a>
          </div>
        </Header>
      );
    } else {
      return (
        <Header
          className="header"
          style={{
            height: 'auto',
            // theme: 'light',
            background: '#f0f2f5',
            // position: 'fixed',
            zIndex: 1,
            width: '100%',
            padding: '0 50px',
          }}
        >
          <div
            style={{
              padding: '0 0px',
              maxWidth: '1400px',
              width: '100%',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            <a href="https://ccr.cancer.gov/" target="_blank">
              <img
                height="auto"
                className="logo"
                src="./assets/img/nci-ccr-logo.svg"
                alt="National Cancer Institute"
                width="80%"
                style={{ paddingTop: '20px' }}
              />
            </a>
          </div>
        </Header>
      );
    }
  }

  handleProjectClick = (e) => {
    this.setState({
      current: 'projects',
      filter: {
        project: '',
        experiment: '',
      },
      mobileOpened: false,
    });
  };
  handleExperimentClick = (e) => {
    this.setState({
      current: 'experiments',
      filter: {
        project: '',
        experiment: '',
      },
      mobileOpened: false,
    });
  };
  handleSampleClick = (e) => {
    this.setState({
      current: 'samples',
      filter: {
        project: '',
        experiment: '',
      },
      mobileOpened: false,
    });
  };
  handleHelpClick = (e) => {
    this.setState({
      current: 'help',
      filter: {
        project: '',
        experiment: '',
      },
      mobileOpened: false,
    });
  };

  render() {
    /*console.log(
      this.state.activeTab +
        ', ' +
        JSON.stringify(this.state.filter) +
        ', ' +
        JSON.stringify(this.state.data)
    );*/
    let mainContent = this.renderMain();
    return (
      <div>
        <Layout>
          {this.renderHeader()}
          <div
            style={{
              padding: '0 0px',
              maxWidth: '1400px',
              width: '100%',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            <a
              href="https://ccrod.cancer.gov/confluence/display/CCRLP/NCI+COMPASS"
              target="_blank"
              style={{
                fontSize: '20px',
                paddingLeft: '115px',
                color: '#4f4f4f',
              }}
            >
              Laboratory of Pathology, NCI Compass
            </a>
          </div>

          {/* Header */}
          <Switch>
            <Route
              exact
              path="/"
              children={
                <Header
                  className="header"
                  style={{
                    height:
                      this.state.windowWidth < 685 && this.state.mobileOpened == true
                        ? '240px'
                        : '40px',
                    zIndex: 1,
                    width: '100%',
                    padding: '0 0px',
                    marginTop: '10px',
                    background: '#005ea2',
                  }}
                >
                  {this.renderNavbar()}
                </Header>
              }
            />
            <Route
              path="/qci/:id/:file"
              children={(props) => (
                <Header
                  className="header"
                  style={{
                    height:
                      this.state.windowWidth < 685 && this.state.mobileOpened == true
                        ? '240px'
                        : '40px',
                    zIndex: 1,
                    width: '100%',
                    padding: '0 0px',
                    marginTop: '10px',
                    background: 'steelblue',
                  }}
                >
                  <div
                    style={{
                      padding: '0px 0px',
                      maxWidth: '1400px',
                      width: '100%',
                      marginRight: 'auto',
                      marginLeft: 'auto',
                      lineHeight: '40px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    QCI Report - {props.match.params.id}
                  </div>
                </Header>
              )}
            ></Route>
          </Switch>

          <Content
            style={{
              padding: '0 0px',
              height: '100%',
              maxWidth: '1400px',
              width: '100%',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            <div
              style={{
                background: '#fff',
                minHeight: 380,
              }}
            >
              <Switch>
                <Route path="/qci/:id/:file" component={QCI} />
                <Route exact path="/" children={mainContent} />
              </Switch>

              {/* <Route exact path="/methylscape" component={Home} />
              <Route
                exact
                path="/methylscape/cns-profiling"
                component={CNSProfiling}
              />
              <Route exact path="/methylscape/help" component={Help} /> */}
            </div>
          </Content>

          {/* <Footer style={{ textAlign: 'center' }}>
            <FooterContent />
          </Footer> */}
        </Layout>
      </div>
    );
  }
}
export default App;
