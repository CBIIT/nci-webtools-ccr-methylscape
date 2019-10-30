import React from 'react';
import Highlighter from 'react-highlight-words';
import { Table, Input, Button, Form, Select, Icon } from 'antd';
import { DatePicker } from 'antd';
import fileSaver from 'file-saver';
import './Samples.css';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
class Samples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterSampleName: '',
      filterProject: props.filter.project,
      filterSentrixID: props.filter.experiment,
      filterSurgicalCase: '',
      filterGender: '',
      filterAge: '',
      filterDiagnosis: '',
      startDate: '',
      endDate: '',
      loading: true,
      pagination: {
        position: 'bottom',
        size: 'small',
        // pageSize: 15,
        showSizeChanger: true,
        itemRender: this.itemRender,
        showTotal: this.rangeFunction
      },
      rawData: props.data,
      data: [],
      filteredData: [],
      currSample: ''
    };
  }

  rangeFunction(total, range) {
    return (
      'Showing ' +
      range[0].toString() +
      ' to ' +
      range[1].toString() +
      ' of ' +
      total.toString() +
      ' items'
    );
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}>
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text == undefined ? '' : text.toString()}
      />
    )
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  async componentWillReceiveProps(nextProps) {
    if (nextProps.filter.project !== undefined) {
      this.setState({ filterProject: nextProps.filter.project }, () => {
        this.handleFilter();
      });
    }
    if (nextProps.filter.experiment !== undefined) {
      this.setState({ filterSentrixID: nextProps.filter.experiment }, () => {
        this.handleFilter();
      });
    }
  }

  async componentDidMount() {
    await this.createDataTable(this.state.rawData).then(
      this.setState({ loading: false })
    );
    this.handleFilter();
  }

  createDataTable = async rawData => {
    var sampleData = {};
    sampleData = rawData.map(sample => {
      sample.key = sample.id;
      var cp = sample.classifier_prediction;
      if (cp == null) {
        sample.family = '';
        sample.family_score = '';
        sample.class = '';
        sample.class_score = '';
      } else {
        sample.family = this.getMF(cp);
        sample.family_score = this.getMFScore(cp);
        sample.class = this.getMC(cp);
        sample.class_score = this.getMCScore(cp);
      }
      return sample;
    });
    sampleData = sampleData.filter(sample => {
      return sample.sample_name != null;
    });
    this.setState({ data: sampleData });
    this.setState({ filteredData: sampleData });
  };

  //Checks the dates from the form and and each date in the table
  //and sees if the date falls between the two days
  checkDates(date, s, e) {
    if (s == '' || e == '') {
      return true;
    }
    let start = s.split('-');
    let end = e.split('-');
    let check = date.split('/');

    let startDate = new Date(
      parseInt(start[0]),
      parseInt(start[1]),
      parseInt(start[2])
    );
    let endDate = new Date(
      parseInt(end[0]),
      parseInt(end[1]),
      parseInt(end[2])
    );
    let toCheck = new Date(
      parseInt(check[2]),
      parseInt(check[0]),
      parseInt(check[1])
    );

    return startDate <= toCheck && endDate >= toCheck;
  }
  handleFilter = () => {
    this.setState(
      {
        filteredData: this.state.data.filter(row => {
          return (
            row.project != null &&
            row.experiment != null &&
            row.sample_name
              .toLowerCase()
              .includes(this.state.filterSampleName.toLowerCase()) &&
            row.experiment.toLowerCase().includes(this.getExperimentFilter()) &&
            row.surgical_case
              .toLowerCase()
              .includes(this.state.filterSurgicalCase.toLowerCase()) &&
            row.gender
              .toLowerCase()
              .includes(this.state.filterGender.toLowerCase()) &&
            (row.age == this.state.filterAge.trim() ||
              this.state.filterAge.trim() == '' ||
              'unknown'.includes(this.state.filterAge.trim().toLowerCase())) &&
            row.diagnosis
              .toLowerCase()
              .includes(this.state.filterDiagnosis.toLowerCase()) &&
            this.checkDates(row.date, this.state.startDate, this.state.endDate)
          );
        })
      },
      this.setState({ loading: false })
    );
  };

  getExperimentFilter = () => {
    return this.state.filterSentrixID
      ? this.state.filterSentrixID.toLowerCase()
      : '';
  };

  getFilterProject = () => {
    return this.state.filterProject
      ? this.state.filterProject.toLowerCase()
      : '';
  };

  getMF = data => {
    //console.log(JSON.stringify(data));
    return Object.keys(data).length >= 2
      ? String(Object.keys(data['0'])[0]).substring(25)
      : '';
  };

  getMFScore = data => {
    return Object.values(data).length >= 2 ? Object.values(data['0']) : '';
  };

  getMC = data => {
    const size = Object.keys(data).length;
    if (size >= 2) {
      return Object.keys(data['1'])[0];
    } else if (size === 1) {
      return Object.keys(data['0'])[0];
    } else {
      return '';
    }
  };

  getMCScore = data => {
    const size = Object.keys(data).length;
    if (size >= 2) {
      return Object.values(data['1'])[0];
    } else if (size === 1) {
      return Object.values(data['0'])[0];
    } else {
      return '';
    }
  };

  handleReset = () => {
    this.setState(
      {
        filterProject: '',
        filterSentrixID: ''
      },
      () => {
        this.handleFilter();
      }
    );
  };

  async downloadFile(sampleId, file) {
    console.log('Sample: ' + sampleId);
    console.log('File: ' + file);
    const root =
      process.env.NODE_ENV === 'development'
        ? 'http://0.0.0.0:8290/'
        : window.location.pathname;

    try {
      let response = await fetch(`${root}getMethylScapeFile`, {
        method: 'POST',
        body: JSON.stringify({
          sampleId: sampleId,
          fileName: file
        })
      });
      let url = URL.createObjectURL(await response.blob());
      window.open(url, '_blank');
      URL.revokeObjectUrl(url);
    } catch (e) {
      console.log(e);
    }
    /*    }

      .then(res => {
        return res.blob();
      })
      .then(function(blob) { // (**)
        // fileSaver(blob, file);
        return URL.createObjectURL(blob);
      })
      .then(url => {
      })
      .catch(error => console.log(error));
      */
  }

  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a>&#60;</a>;
    }
    if (type === 'next') {
      return <a>&#62;</a>;
    }
    return <a>{current}</a>;
  }

  renderSummary(key) {
    if (key == '') {
      return <div />;
    }
    var found = [];
    let row = this.state.filteredData.filter(sample => {
      //console.log(sample.key);
      //console.log(key);
      //console.log(sample.key == key);
      //console.log(sample.project);
      if (sample.key == key) {
        found.push(sample);
      }
      return sample.key == key;
    });
    /*
    console.log(currRow);
    console.log(JSON.stringify(row));
    //console.log(row[0]);
    var c = row[0];
    console.log('filtered row', currRow.project);
    console.log(JSON.stringify(c));
    //console.log(c.project);
    console.log(JSON.stringify([{ Hello: 'World', testing: 'test' }]));
    console.log([{ Hello: 'World', testing: 'test' }][0]);
    console.log([{ Hello: 'World', testing: 'test' }][0].Hello);
    //let currRow = row;
*/
    if (found.length != 0) {
      var currRow = found[0];
      console.log('Prediction: ' + JSON.stringify(currRow));
      let columns = [
        {
          title: 'Header name',
          dataIndex: 'header_name',
          sorter: true,
          width: '50%',
          render: text => {
            return (
              <p style={{ 'padding-left': '70%', 'font-weight': 'bold' }}>
                {text}:
              </p>
            );
          }
          //defaultSortOrder: 'ascend',
        },
        {
          title: 'Value',
          dataIndex: 'value',
          width: '50%',
          // sorter: true,
          render: (text, row, index) => {
            if (text == 'View plot') {
              return (
                <a
                  style={{ 'padding-left': '20%' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.html')
                  }>
                  {text}
                </a>
              );
            }
            if (text == 'Download pdf') {
              return (
                <a
                  style={{ 'padding-left': '20%' }}
                  onClick={() =>
                    this.downloadFile(
                      currRow.id,
                      currRow.sample_name + '_NGS.pdf'
                    )
                  }>
                  {text}
                </a>
              );
            }
            if (text == 'Download image') {
              return (
                <a
                  style={{ 'padding-left': '20%' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.jpg')
                  }>
                  {text}
                </a>
              );
            }
            if (text == 'Download report') {
              return (
                <a
                  style={{ 'padding-left': '20%' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.report_file_name)
                  }>
                  {text}
                </a>
              );
            }
            return <p style={{ 'padding-left': '20%' }}>{text}</p>;
          }
        }
      ];
      console.log('$$$EXPERIMENT$$$' + currRow.experiment);
      let extraData = [
        {
          key: 'sample_name',
          header_name: 'Sample Name',
          value: currRow.sample_name
        },
        {
          key: 'project',
          header_name: 'Project',
          value: currRow.project
        },
        {
          key: 'experiment',
          header_name: 'Experiment',
          value: currRow.experiment
        },
        {
          key: 'date',
          header_name: 'Date',
          value: currRow.date
        },
        {
          key: 'surgical_case',
          header_name: 'Surgical Case',
          value: currRow.surgical_case
        },
        {
          key: 'gender',
          header_name: 'Gender',
          value: currRow.gender
        },
        {
          key: 'age',
          header_name: 'Age',
          value: currRow.age
        },
        {
          key: 'diagnosis',
          header_name: 'Diagnosis',
          value: currRow.diagnosis
        },
        {
          key: 'tumor_data',
          header_name: 'Tumor Data',
          value: currRow.tumor_data
        },
        {
          key: 'family',
          header_name: 'Methylation Family (MF)',
          value: currRow.family
        },
        {
          key: 'family_score',
          header_name: 'MF Calibrated Scores',
          value: currRow.family_score
        },
        {
          key: 'class',
          header_name: 'Methylation Class (MC)',
          value: currRow.class
        },
        {
          key: 'class_score',
          header_name: 'MF Calibrated Scores',
          value: currRow.class_score
        },
        {
          key: 'mgmt_prediction.Estimated',
          header_name: 'MGMT score',
          value:
            currRow.mgmt_prediction == null
              ? ''
              : currRow.mgmt_prediction.Estimated.toString()
        },
        {
          key: 't_SNE_plot',
          header_name: 't-SNE plot',
          value: 'View plot'
        },
        {
          key: 'General_report',
          header_name: 'Report',
          value: 'Download report'
        },
        {
          key: 'NGS_reports',
          header_name: 'NGS reports (pdf-files)',
          value: 'Download pdf'
        },
        {
          key: 'slide_image',
          header_name: 'Slide Image',
          value: 'Download image'
        },
        {
          key: 'notes',
          header_name: 'Notes',
          value: currRow.notes
        }
      ];
      let tableSettings = {
        loading: true,
        pagination: {
          position: 'bottom',
          size: 'small',
          // pageSize: 15,
          showSizeChanger: true,
          itemRender: this.itemRender,
          showTotal: this.rangeFunction
        },
        data: [],
        filteredData: []
      };
      //{...this.state}
      return (
        <div>
          <h2 style={{ 'text-align': 'center' }}>Sample Information</h2>
          <br />
          <Table
            showHeader={false}
            pagination={false}
            columns={columns}
            dataSource={extraData}
            onChange={this.handleTableChange}
            size="small"
            rowClassName={(record, index) => {
              //return index % 2 == 0 ? 'whiteBack' : 'grayBack';
              return 'whiteBack';
            }}
          />
        </div>
      );
    } else {
      return <div />;
    }
  }

  render() {
    const columns = [
      {
        title: 'Sample Name',
        dataIndex: 'sample_name',
        sorter: true,
        width: '12%',
        defaultSortOrder: 'ascend',
        ellipsis: true,
        sorter: (a, b) => a.sample_name.localeCompare(b.sample_name),
        ...this.getColumnSearchProps('sample_name')
      },
      {
        title: 'Project',
        dataIndex: 'project',
        sorter: true,
        width: '15%',
        ellipsis: true,
        sorter: (a, b) => a.project.localeCompare(b.project),
        ...this.getColumnSearchProps('project'),
        render: (text, record) => (
          <a
            // onClick={() =>
            //   this.props.changeTab('experiments', { project: record.project })
            onClick={() =>
              this.props.changeTab('projects', { project: record.project })
            }>
            {text}
          </a>
        )
      },
      {
        title: 'Experiment',
        dataIndex: 'experiment',
        sorter: true,
        width: '12%',
        ellipsis: true,
        sorter: (a, b) => a.experiment.localeCompare(b.experiment),
        ...this.getColumnSearchProps('experiment'),
        render: (text, record) => (
          <a
            // onClick={() =>
            //   this.props.changeTab('experiments', { project: record.project })
            onClick={() =>
              this.props.changeTab('experiments', {
                experiment: record.experiment
              })
            }>
            {text}
          </a>
        )
      },
      {
        title: 'Date',
        dataIndex: 'date',
        ellipsis: true,
        // sorter: true,
        ...this.getColumnSearchProps('date'),
        width: '8%'
      },
      {
        title: 'Surgical Case',
        dataIndex: 'surgical_case',
        sorter: true,
        ellipsis: true,
        sorter: (a, b) => a.surgical_case.localeCompare(b.surgical_case),
        ...this.getColumnSearchProps('surgical_case'),
        width: '10%'
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        sorter: true,
        ellipsis: true,
        sorter: (a, b) => a.gender.localeCompare(b.gender),
        ...this.getColumnSearchProps('gender'),
        width: '10%'
      },
      {
        title: 'Age',
        dataIndex: 'age',
        sorter: true,
        ellipsis: true,
        sorter: (a, b) => parseInt(a.age) > parseInt(b.age),
        ...this.getColumnSearchProps('age'),
        width: '10%'
      },
      {
        title: 'Diagnosis',
        dataIndex: 'diagnosis',
        sorter: true,
        ellipsis: 'true',
        sorter: (a, b) => a.diagnosis.localeCompare(b.diagnosis),
        ...this.getColumnSearchProps('diagnosis'),
        width: '23%',
        render: (text, record) => (
          <div>
            {text}
          </div>
        )
      }
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div style={{ 'padding-left': '30px', 'padding-right': '30px' }}>
        <div
          style={{
            'padding-left': '0',
            'padding-bottom': '0px',
            'padding-top': '15px'
          }}>
          <Form layout="inline">
            <Form.Item
              style={{
                width: '12%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterSampleName}
                onChange={e =>
                  this.setState({ filterSampleName: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '15%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterProject}
                onChange={e =>
                  this.setState({ filterProject: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '12%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterSentrixID}
                onChange={e =>
                  this.setState({ filterSentrixID: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '8%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <RangePicker
                onChange={(date, dateString) => {
                  this.setState(
                    { startDate: dateString[0], endDate: dateString[1] },
                    () => {
                      this.handleFilter();
                    }
                  );
                }}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '10%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterSurgicalCase}
                onChange={e =>
                  this.setState({ filterSurgicalCase: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '10%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterGender}
                onChange={e =>
                  this.setState({ filterGender: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '10%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterAge}
                onChange={e =>
                  this.setState({ filterAge: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
            <Form.Item
              style={{
                width: '23%',
                'padding-left': '8px',
                'padding-right': '30px',
                'margin-right': '0px'
              }}>
              <Input
                value={this.state.filterDiagnosis}
                onChange={e =>
                  this.setState({ filterDiagnosis: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />
            </Form.Item>
          </Form>
        </div>
        <div>
          <Table
            {...this.state}
            columns={columns}
            dataSource={this.state.filteredData}
            onChange={this.handleTableChange}
            size="small"
            ellipsis="true"
            rowClassName={(record, index) => {
              let selected =
                this.state.currSample == ''
                  ? ''
                  : record.key == this.state.currSample
                  ? 'testing'
                  : '';
              let coloring = index % 2 == 0 ? 'whiteBack' : 'grayBack';
              return selected == '' ? coloring : selected;
            }}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => {
                  this.setState({
                    currSample: record.key
                  });
                }
              };
            }}
          />
        </div>
        {this.renderSummary(this.state.currSample)}

        <br />
        <br />
      </div>
    );
  }
}
export default Samples;
