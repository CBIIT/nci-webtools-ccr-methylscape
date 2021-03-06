import React from 'react';
import { Alert, Tabs } from 'antd';
import Summary from './components/Summary';
import Experiments from './components/Experiments';
import Samples from './components/Samples';
import Projects from './components/Projects';
import Help from './components/Help';
import { Route, Link } from 'react-router-dom';
import {
  faChartPie,
  faClipboard,
  faVials,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import CountUp from 'react-countup';

const TabPane = Tabs.TabPane;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.current,
      data: [],
      filter: props.filter,
      scanCheck: true,
      showErrorAlert: false,
      projectSummery: '',
      current: props.current,
      windowWidth: document.body.clientWidth,
      timeout: false,
      alertMsg: 'Error',
      alertDesc: 'Failed to connect to table...',
      alertType: 'error',
    };
  }
  async componentWillReceiveProps(nextProps) {
    this.setState({ filter: nextProps.filter });
  }
  changeTab = (activeTab, filter = {}) => {
    if (activeTab == 'projects') {
      if (this.filter !== {}) {
        if (filter.project) {
          this.changeSummeryPorject(filter.project);
        }
      }
      this.props.changeTab(activeTab, {});
      this.setState({ activeTab });
    } else {
      if (this.filter !== {}) {
        this.setState({ filter });
        if (filter.project) {
          this.changeSummeryPorject(filter.project);
        }
      }
      this.props.changeTab(activeTab, filter);
      this.setState({ activeTab });
    }
  };

  changeSummeryPorject = (projectSummery) => {
    this.setState({ projectSummery });
  };

  successScan(data) {
    for (var key in data) {
      if (data[key]['experiment'] == null) {
        delete data[key];
      } else {
        data[key]['experiment'] = Number(
          data[key]['experiment']
        ).toLocaleString('fullwide', {
          useGrouping: false,
        });
      }
    }
    /*data = data.filter(row => {
      if (row.classifier_prediction) {
        return true;
      } else {
        console.log('NOT ON');
        console.log(JSON.stringify(row));
        return false;
      }
    });*/
    this.setState({
      data: data,
      scanCheck: false,
    });
  }

  async componentDidMount() {
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

    /*fetch(
      `https://i6y17nvg51.execute-api.us-east-1.amazonaws.com/TestStage/scanmethylscapetable`,
      { method: 'POST' }
    )*/
    fetch(`/scanMethylScapeTable`)
      .then((response) => response.json())
      .then((data) => {
        if (Object.entries(data).length) {
          this.successScan(data);
        } else {
          this.setState({
            alertMsg: 'Warning',
            alertDesc: 'No Samples Available',
            alertType: 'warning',
            showErrorAlert: true,
          });
        }
      })
      .catch((error) => {
        this.setState({
          alertMsg: 'Error',
          alertDesc: 'Failed to connect to table...',
          alertType: 'error',
          showErrorAlert: true,
        });
      });
  }

  getNumProjects() {
    let projects = [];
    this.state.data.forEach((element) => {
      if (!projects.includes(element.project)) {
        projects.push(element.project);
      }
    });
    return projects.length;
  }

  getNumExperiments() {
    let experiments = [];
    this.state.data.forEach((element) => {
      if (!experiments.includes(element.experiment)) {
        experiments.push(element.experiment);
      }
    });
    //console.log(JSON.stringify(experiments));
    return experiments.length;
  }

  getNumSamples() {
    let samples = [];
    //console.log(JSON.stringify(this.state.data));
    this.state.data.forEach((element) => {
      if (!samples.includes(element.sample_name)) {
        samples.push(element.sample_name);
        //console.log(element.sample_name)
      }
    });
    return samples.length;
  }

  renderTopHeader() {
    let numProjects = this.getNumProjects();
    let numExperiments = this.getNumExperiments();
    let numSamples = this.getNumSamples();

    if (this.state.windowWidth >= 685) {
      return (
        <div style={{ backgroundColor: '#f0f2f5' }}>
          <div
            style={{
              maxWidth: '1400px',
              margin: 'auto',
              paddingTop: '15px',
              paddingBottom: '15px',
            }}
          >
            <Link
              style={{ paddingLeft: '20px' }}
              onClick={() => {
                this.changeTab('projects', {
                  project: '',
                  experiment: '',
                });
              }}
            >
              <FontAwesomeIcon
                icon={faChartPie}
                style={{
                  color: 'black',
                  fontSize: '24px',
                  display: 'inline',
                }}
              />
              <CountUp
                style={{
                  paddingLeft: '5px',
                  marginBottom: '0px',
                  color: 'blue',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
                end={numProjects}
              />
              <h3
                style={{
                  paddingLeft: '0px',
                  marginBottom: '0px',
                  color: 'black',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
              >
                {' '}
                Projects
              </h3>
            </Link>
            <Link
              style={{ paddingLeft: '50px' }}
              onClick={() => {
                this.changeTab('experiments', {
                  project: '',
                  experiment: '',
                });
              }}
            >
              <FontAwesomeIcon
                icon={faVials}
                style={{
                  color: 'black',
                  fontSize: '24px',
                  display: 'inline',
                }}
              />
              <CountUp
                style={{
                  paddingLeft: '5px',
                  marginBottom: '0px',
                  color: 'blue',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
                end={numExperiments}
              >
                {numExperiments}{' '}
              </CountUp>
              <h3
                style={{
                  paddingLeft: '0px',
                  marginBottom: '0px',
                  color: 'black',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
              >
                {' '}
                Experiments
              </h3>
            </Link>
            <Link
              style={{ paddingLeft: '50px' }}
              onClick={() => {
                this.changeTab('samples', {
                  project: '',
                  experiment: '',
                });
              }}
            >
              <FontAwesomeIcon
                icon={faUserFriends}
                style={{
                  color: 'black',
                  fontSize: '24px',
                  display: 'inline',
                }}
              />
              <CountUp
                style={{
                  paddingLeft: '5px',
                  marginBottom: '0px',
                  color: 'blue',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
                end={numSamples}
              />
              <h3
                style={{
                  paddingLeft: '0px',
                  marginBottom: '0px',
                  color: 'black',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
              >
                {' '}
                Samples
              </h3>
            </Link>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ backgroundColor: '#f0f2f5' }}>
          <div
            style={{
              maxWidth: '1400px',
              margin: 'auto',
              paddingTop: '15px',
              paddingBottom: '15px',
            }}
          >
            <Link
              style={{ paddingLeft: '20px' }}
              onClick={() => {
                this.changeTab('projects', {
                  project: '',
                  experiment: '',
                });
              }}
            >
              <FontAwesomeIcon
                icon={faChartPie}
                style={{
                  color: 'black',
                  fontSize: '24px',
                  display: 'inline',
                }}
              />
              <CountUp
                style={{
                  paddingLeft: '5px',
                  marginBottom: '0px',
                  color: 'blue',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
                end={numProjects}
              />
            </Link>
            <Link
              style={{ paddingLeft: '30px' }}
              onClick={() => {
                this.changeTab('experiments', {
                  project: '',
                  experiment: '',
                });
              }}
            >
              <FontAwesomeIcon
                icon={faVials}
                style={{
                  color: 'black',
                  fontSize: '24px',
                  display: 'inline',
                }}
              />
              <CountUp
                style={{
                  paddingLeft: '5px',
                  marginBottom: '0px',
                  color: 'blue',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
                end={numExperiments}
              >
                {numExperiments}{' '}
              </CountUp>
            </Link>
            <Link
              style={{ paddingLeft: '30px' }}
              onClick={() => {
                this.changeTab('samples', {
                  project: '',
                  experiment: '',
                });
              }}
            >
              <FontAwesomeIcon
                icon={faUserFriends}
                style={{
                  color: 'black',
                  fontSize: '24px',
                  display: 'inline',
                }}
              />
              <CountUp
                style={{
                  paddingLeft: '5px',
                  marginBottom: '0px',
                  color: 'blue',
                  fontSize: '24px',
                  fontWeight: '200',
                  display: 'inline',
                }}
                end={numSamples}
              />
            </Link>
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {/* <PageHeader /> */}
        {this.renderTopHeader()}

        {this.state.showErrorAlert && (
          <Alert
            message={this.state.alertMsg}
            description={this.state.alertDesc}
            type={this.state.alertType}
            showIcon
          />
        )}

        <Tabs
          tabPosition="top"
          activeKey={this.props.current}
          onChange={this.changeTab}
          defaultActiveKey="projects"
        >
          <TabPane tab="Project" key="projects" disabled={this.state.scanCheck}>
            <Projects
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
              project={this.state.projectSummery}
              changeSummeryPorject={this.changeSummeryPorject}
            />
            <Summary
              data={this.state.data}
              project={this.state.projectSummery}
              changeSummeryPorject={this.changeSummeryPorject}
            />
          </TabPane>
          <TabPane
            tab="Experiments"
            key="experiments"
            disabled={this.state.scanCheck}
          >
            <Experiments
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
            />
          </TabPane>
          <TabPane tab="Samples" key="samples" disabled={this.state.scanCheck}>
            <Samples
              data={this.state.data}
              changeTab={this.changeTab}
              filter={this.state.filter}
            />
          </TabPane>
          <TabPane
            tab={
              <div>
                <p>Help!!!</p>
              </div>
            }
            key="help"
            disabled={this.state.scanCheck}
          >
            <Help />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(Home);
