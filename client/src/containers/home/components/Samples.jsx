import React from 'react';
import Highlighter from 'react-highlight-words';
import { Table, Input, Button, Form, Select, Icon, Modal } from 'antd';
import { DatePicker } from 'antd';
import fileSaver from 'file-saver';
import './Samples.css';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import Cookies from 'js-cookie';

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
        defaultPageSize: 25,
        pageSizeOptions: ['10', '25', '50', '100'],
        showSizeChanger: true,
        itemRender: this.itemRender,
        showTotal: this.rangeFunction,
      },
      rawData: props.data,
      data: [],
      filteredData: [],
      currSample: '',
      expandedRowKeys: [],
      filePopUp: false,
      iFrame: false,
    };
  }

  //For pagination
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

  getMonth(element) {
    let months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    for (let i = 0; i < months.length; i++) {
      if (months[i] == element) {
        return i;
      }
    }
    return 0;
  }

  compareDates(a, b) {
    let datea = a.date;
    let dateb = b.date;
    let converted1 = new Date();
    let converted2 = new Date();
    if (datea.includes('-')) {
      let date1 = datea.split('-');
      converted1 = new Date(2019, this.getMonth(date1[1]), parseInt(date1[0]));
    } else {
      let date1 = datea.split('/');
      converted2 = new Date(
        parseInt(date1[2]),
        parseInt(date1[0]),
        parseInt(date1[1])
      );
    }
    if (dateb.includes('-')) {
      let date2 = dateb.split('-');
      converted2 = new Date(2019, this.getMonth(date2[1]), parseInt(date2[0]));
    } else {
      let date2 = dateb.split('/');
      converted2 = new Date(
        parseInt(date2[2]),
        parseInt(date2[0]),
        parseInt(date2[1])
      );
    }
    return converted1 > converted2;
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
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
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text == undefined ? '' : text.toString()}
      />
    ),
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  async componentWillReceiveProps(nextProps) {
    if (nextProps.filter.project !== undefined) {
      this.setState(
        {
          filterProject: nextProps.filter.project,
          filterSampleName: '',
          filterSurgicalCase: '',
          filterGender: '',
          filterAge: '',
          filterDiagnosis: '',
          startDate: '',
          endDate: '',
          currSample: '',
          expandedRowKeys: [],
        },
        () => {
          this.handleFilter();
        }
      );
    }
    if (nextProps.filter.experiment !== undefined) {
      this.setState(
        {
          filterSentrixID: nextProps.filter.experiment,
          filterSampleName: '',
          filterSurgicalCase: '',
          filterGender: '',
          filterAge: '',
          filterDiagnosis: '',
          startDate: '',
          endDate: '',
          currSample: '',
          expandedRowKeys: [],
        },
        () => {
          this.handleFilter();
        }
      );
    }
  }

  fix508() {
    const hiddenTabs = document.querySelectorAll(
      'div.ant-tabs-tabpane.ant-tabs-tabpane-inactive'
    );
    const activeTab = document.querySelector(
      'div.ant-tabs-tabpane.ant-tabs-tabpane-active'
    );
    const expandHeader = document.querySelector('th.ant-table-expand-icon-th');

    for (let tab of hiddenTabs) {
      tab.style.visibility = 'hidden';
    }

    activeTab.style.visibility = 'visible';
    expandHeader.innerHTML = '<span style="display: none;">Expand Row</span>';
  }

  async componentDidMount() {
    await this.createDataTable(this.state.rawData).then(
      this.setState({ loading: false })
    );
    this.handleFilter();
    var elements = document.getElementsByClassName('ant-calendar-picker-input');
    for (var i = 0; i < elements.length; i++) {
      elements[i].setAttribute('aria-label', 'Date Filter');
    }

    this.fix508();
  }

  async componentDidUpdate() {
    var elements = document.getElementsByClassName('ant-calendar-picker-input');
    for (var i = 0; i < elements.length; i++) {
      elements[i].setAttribute('aria-label', 'Date Filter');
    }

    this.fix508();
  }

  //Updates the data based on the rawData passed in
  createDataTable = async (rawData) => {
    var sampleData = {};
    sampleData = rawData.map((sample) => {
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
    sampleData = sampleData.filter((sample) => {
      return sample.sample_name != null;
    });
    this.setState({ data: sampleData });
    this.setState({ filteredData: sampleData });
  };

  //Checks the dates from the form and and each date in the table
  //and sees if the date falls between the two days
  checkDates(date, s) {
    if (s == '') {
      return true;
    }
    if (date == null) {
      return false;
    }
    let start = s.split('-');
    //let end = e.split('-');
    let check = date.split('/');
    let startDate = new Date(
      parseInt(start[2]),
      parseInt(start[0]) - 1,
      parseInt(start[1])
    );
    /*let endDate = new Date(
      parseInt(end[2]),
      parseInt(end[0]),
      parseInt(end[1])
    );*/
    let toCheck = new Date(
      parseInt(check[2]),
      parseInt(check[0]) - 1,
      parseInt(check[1])
    );
    //console.log(JSON.stringify(start))
    //console.log(JSON.stringify(check))
    return (
      parseInt(start[2]) == parseInt(check[2]) &&
      parseInt(start[1]) == parseInt(check[1]) &&
      parseInt(start[0]) == parseInt(check[0])
    );
  }

  //As each search bar is updated, the handlefilter function is called
  //The function changes the filteredData, which is what is portrayed in the table
  handleFilter = () => {
    //console.log(this.state.data);
    this.setState(
      {
        filteredData: this.state.data.filter((row) => {
          if (
            row.project != null &&
            row.project.toLowerCase().includes(this.getFilterProject()) &&
            row.experiment != null &&
            row.sample_name
              .toLowerCase()
              .includes(this.state.filterSampleName.toLowerCase()) &&
            row.experiment.toLowerCase().includes(this.getExperimentFilter()) &&
            row.surgical_case
              .toLowerCase()
              .includes(this.state.filterSurgicalCase.toLowerCase()) &&
            (row.gender.toLowerCase() ==
              this.state.filterGender.toLowerCase() ||
              this.state.filterGender == '') &&
            ((row.age == null && this.state.filterAge == '') ||
              row.age == this.state.filterAge.trim() ||
              this.state.filterAge.trim() == '' ||
              'unknown'.includes(this.state.filterAge.trim().toLowerCase())) &&
            ((row.diagnosis == null && this.state.filterDiagnosis == '') ||
              (row.diagnosis != null &&
                row.diagnosis
                  .toLowerCase()
                  .includes(this.state.filterDiagnosis.toLowerCase()))) &&
            this.checkDates(row.pool_id, this.state.startDate)
          ) {
            return true;
          } else {
            return false;
          }
        }),
      },
      this.setState({ loading: false })
    );
  };

  //Checks if the filterSentrixID exists, and returns the lowercase version
  getExperimentFilter = () => {
    return this.state.filterSentrixID
      ? this.state.filterSentrixID.toLowerCase()
      : '';
  };
  //Checks if the filterProject exists and returns the lowercase version
  getFilterProject = () => {
    return this.state.filterProject
      ? this.state.filterProject.toLowerCase()
      : '';
  };

  //returns the methylation family if it exists
  getMF = (data) => {
    //console.log(JSON.stringify(data));
    return Object.keys(data).length >= 2
      ? String(Object.keys(data['0'])[0]).substring(25)
      : '';
  };

  //returns the methylation family score if it exists
  getMFScore = (data) => {
    return Object.values(data).length >= 2 ? Object.values(data['0']) : '';
  };

  //returns the methylation class
  getMC = (data) => {
    const size = Object.keys(data).length;
    if (size >= 2) {
      return Object.keys(data['1'])[0];
    } else if (size === 1) {
      return Object.keys(data['0'])[0];
    } else {
      return '';
    }
  };

  //returns the methylation class score
  getMCScore = (data) => {
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
        filterSentrixID: '',
        filterSampleName: '',
        filterSurgicalCase: '',
        filterGender: '',
        filterAge: '',
        filterDiagnosis: '',
        startDate: '',
        endDate: '',
      },
      () => {
        this.handleFilter();
      }
    );
  };

  //Helper to download files from the s3 bucket
  async downloadFile(sampleId, file, retry = 3) {
    try {
      let response = await fetch(`/getMethylScapeFile`, {
        method: 'POST',
        body: JSON.stringify({
          sampleId: sampleId,
          fileName: file,
        }),
      });
      if (!response.ok) {
        this.setState({ filePopUp: true });
      } else {
        // check for siteminder redirect
        // if x-powered-by: express exists then return blob url
        // else repeat function
        if (response.headers.get('x-powered-by')) {
          const url = URL.createObjectURL(await response.blob());
          window.open(url, '_blank');
          URL.revokeObjectURL(url);
        } else {
          if (retry > 0) this.downloadFile(sampleId, file, retry - 1);
          else this.setState({ filePopUp: true });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  //Helper to download files from the s3 bucket
  async downloadQCIFile(sampleId, file, retry = 3) {
    if (!file) this.setState({ filePopUp: true });
    else {
      try {
        let response = await fetch(`/getMethylScapeFile`, {
          method: 'POST',
          body: JSON.stringify({
            sampleId: sampleId,
            fileName: file,
          }),
        });
        if (!response.ok) {
          this.setState({ filePopUp: true });
        } else {
          // check for siteminder redirect
          // if x-powered-by: express exists then open new tab
          // else repeat function
          if (response.headers.get('x-powered-by')) {
            window.open(`/#/qci/${sampleId}/${file}`, '_blank');
          } else {
            if (retry > 0) this.downloadQCIFile(sampleId, file, retry - 1);
            else this.setState({ filePopUp: true });
          }

          //let url = URL.createObjectURL(await response.blob());
          // window.open(
          //   `${root}getMethylScapeQCIFile?sampleId=` +
          //     sampleId +
          //     '&fileName=' +
          //     file,
          //   '_blank'
          // );
          //URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  //renders the items in the pagination
  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a>&#60;</a>;
    }
    if (type === 'next') {
      return <a>&#62;</a>;
    }
    return <a>{current}</a>;
  }

  expandedRowRender = (record, index, indent, expanded) => {
    var found = []; //Stores variable row that was selected

    let row = this.state.filteredData.filter((sample) => {
      if (sample.key == record.key) {
        found.push(sample);
      }
      return sample.key == record.key;
    });
    if (found.length > 0) {
      var currRow = found[0];

      let columns = [
        {
          title: 'Header name',
          dataIndex: 'header_name',
          sorter: true,
          width: '15%',
          render: (text) => {
            if (text && text.length)
              return (
                <p style={{ fontWeight: 'bold', marginBottom: '0px' }}>
                  {text}:
                </p>
              );
          },
          //defaultSortOrder: 'ascend',
        },
        {
          title: 'Value',
          dataIndex: 'value',
          width: '32%',
          // sorter: true,

          //Gives functionality to the rows with download links
          render: (text, row, index) => {
            //Should probably make these into indices in the future
            if (text == 'View plot') {
              return (
                <a
                  style={{ paddingLeft: '5%', marginBottom: '0px' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.html')
                  }
                >
                  {text}
                </a>
              );
            }
            if (text == 'Download pdf') {
              return (
                <a
                  style={{ paddingLeft: '5%', marginBottom: '0px' }}
                  onClick={() =>
                    this.downloadFile(
                      currRow.id,
                      currRow.sample_name + '_NGS.pdf'
                    )
                  }
                >
                  {text}
                </a>
              );
            }
            if (text == 'Download image') {
              return (
                <a
                  style={{ paddingLeft: '5%', marginBottom: '0px' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.jpg')
                  }
                >
                  {text}
                </a>
              );
            }
            if (text == 'Download report') {
              return (
                <a
                  style={{ paddingLeft: '5%', marginBottom: '0px' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.report_file_name)
                  }
                >
                  {text}
                </a>
              );
            }
            return (
              <p style={{ paddingLeft: '5%', marginBottom: '0px' }}>{text}</p>
            );
          },
        },
        {
          title: 'Header name',
          dataIndex: 'header_name2',
          sorter: true,
          width: '15%',
          render: (text) => {
            if (text && text.length)
              return (
                <p style={{ fontWeight: 'bold', marginBottom: '0px' }}>
                  {text}:
                </p>
              );
          },
          //defaultSortOrder: 'ascend',
        },
        {
          title: 'Value',
          dataIndex: 'value2',
          width: '33%',
          // sorter: true,

          //Gives functionality to the rows with download links
          render: (text, row, index) => {
            //Should probably make these into indices in the future
            if (index == 1) {
              return (
                <a
                  style={{
                    paddingLeft: '5%',
                    marginBottom: '0px',
                    paddingRight: '1%',
                  }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.html')
                  }
                >
                  {text}
                </a>
              );
            }
            if (index == 2) {
              return (
                <a
                  style={{
                    paddingLeft: '5%',
                    marginBottom: '0px',
                    paddingRight: '1%',
                  }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.report_file_name)
                  }
                >
                  {text}
                </a>
              );
            }
            if (index == 3) {
              return (
                <Button
                  type="link"
                  disabled={!currRow.xml_report}
                  style={{
                    height: 'auto',
                    color: currRow.xml_report ? '#0050d8' : 'rgba(0, 0, 0, 0.25)',
                    paddingLeft: '5%',
                    marginBottom: '0px',
                    paddingRight: '1%',
                  }}
                  onClick={() =>
                    this.downloadQCIFile(currRow.id, currRow.xml_report)
                  }
                >
                  {text}
                </Button>
              );
            }
            if (index == 4) {
              return (
                <a
                  style={{
                    paddingLeft: '5%',
                    marginBottom: '0px',
                    paddingRight: '1%',
                  }}
                  onClick={() =>
                    this.downloadFile(
                      currRow.id,
                      currRow.sample_name + '_NGS.pdf'
                    )
                  }
                >
                  {text}
                </a>
              );
            }
            if (index == 5) {
              return (
                <a
                  style={{
                    paddingLeft: '5%',
                    marginBottom: '0px',
                    paddingRight: '1%',
                  }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.jpg')
                  }
                >
                  {text}
                </a>
              );
            }
            return (
              <p
                style={{
                  paddingLeft: '5%',
                  marginBottom: '0px',
                  paddingRight: '1%',
                }}
              >
                {text}
              </p>
            );
          },
        },
      ];
      /*
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
        }*/
      //Defines the rows for the summary
      let extraData = [
        {
          key: 'diagnosis',
          header_name: 'Diagnosis',
          value: currRow.diagnosis,
          header_name2: 'Tumor Site',
          value2: currRow.tumor_data,
        },
        {
          key: 'tumor_data',
          header_name: 'Methylation Family (MF)',
          value: currRow.family,
          header_name2: 't-SNE plot',
          value2: 'View Plot',
        },
        {
          key: 'family',
          header_name: 'MF Calibrated Scores',
          value: currRow.family_score,
          header_name2: 'Methylation Report',
          value2: 'Download Report',
        },
        {
          key: 'family_score',
          header_name: 'Methylation Class (MC)',
          value: currRow.class,
          header_name2: 'QCI Report',
          value2: 'View Report',
        },
        {
          key: 'class',
          header_name: 'MC Calibrated Scores',
          value: currRow.class_score,

          header_name2: 'NGS Report (legacy)',
          value2: 'Download Report',
        },
        {
          key: 'class_score',
          header_name: 'MGMT score',
          value:
            currRow.mgmt_prediction == null
              ? ''
              : parseFloat(currRow.mgmt_prediction.Estimated).toFixed(3),
          header_name2: 'Slide Image',
          value2: 'Download Image',
        },
        {
          header_name: 'Notes',
          value: currRow.notes,
        },
      ];
      return (
        <div style={{ paddingBottom: '4px' }}>
          <Table
            style={{ marginLeft: '0px', marginRight: '0px' }}
            columns={columns}
            dataSource={extraData}
            pagination={false}
            showHeader={false}
            size="small"
          />
        </div>
      );
    }
    return <div />;
  };

  onTableRowExpand = (expanded, record) => {
    var keys = [];
    if (expanded) {
      keys.push(record.key);
    }

    this.setState({
      expandedRowKeys: keys,
      currSample: expanded ? record.id : '',
    });
  };

  //renders the summary for a sample when the sample is selected
  renderSummary(id) {
    if (id == '') {
      return <div />;
    }
    var found = []; //Stores variable row that was selected
    this.state.filteredData.forEach((sample) => {
      if (sample.id == id) {
        found.push(sample);
      }
    });
    /*
    let row = this.state.filteredData.filter(sample => {
      if (sample.key == key) {
        found.push(sample);
      }
      return sample.key == key;
    });*/

    if (found.length != 0) {
      var currRow = found[0];
      //2 columns, one for the key and one for the value
      let columns = [
        {
          title: 'Header name',
          dataIndex: 'header_name',
          sorter: true,
          width: '50%',
          render: (text) => {
            return (
              <p style={{ paddingLeft: '70%', fontWeight: 'bold' }}>{text}:</p>
            );
          },
          //defaultSortOrder: 'ascend',
        },
        {
          title: 'Value',
          dataIndex: 'value',
          width: '50%',
          // sorter: true,

          //Gives functionality to the rows with download links
          render: (text, row, index) => {
            //Should probably make these into indices in the future
            if (text == 'View plot') {
              return (
                <a
                  style={{ paddingLeft: '20%' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.html')
                  }
                >
                  {text}
                </a>
              );
            }
            if (text == 'Download pdf') {
              return (
                <a
                  style={{ paddingLeft: '20%' }}
                  onClick={() =>
                    this.downloadFile(
                      currRow.id,
                      currRow.sample_name + '_NGS.pdf'
                    )
                  }
                >
                  {text}
                </a>
              );
            }
            if (text == 'Download image') {
              return (
                <a
                  style={{ paddingLeft: '20%' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.sample_name + '.jpg')
                  }
                >
                  {text}
                </a>
              );
            }
            if (text == 'Download report') {
              return (
                <a
                  style={{ paddingLeft: '20%' }}
                  onClick={() =>
                    this.downloadFile(currRow.id, currRow.report_file_name)
                  }
                >
                  {text}
                </a>
              );
            }

            return <p style={{ paddingLeft: '20%' }}>{text}</p>;
          },
        },
      ];
      //Defines the rows for the summary
      let extraData = [
        {
          key: 'sample_name',
          header_name: 'Sample Name',
          value: currRow.sample_name,
        },
        {
          key: 'project',
          header_name: 'Project',
          value: currRow.project,
        },
        {
          key: 'experiment',
          header_name: 'Experiment',
          value: currRow.experiment,
        },
        {
          key: 'date',
          header_name: 'Date',
          value: currRow.date,
        },
        {
          key: 'surgical_case',
          header_name: 'Surgical Case',
          value: currRow.surgical_case,
        },
        {
          key: 'gender',
          header_name: 'Gender',
          value: currRow.gender,
        },
        {
          key: 'age',
          header_name: 'Age',
          value: currRow.age,
        },
        {
          key: 'diagnosis',
          header_name: 'Diagnosis',
          value: currRow.diagnosis,
        },
        {
          key: 'tumor_data',
          header_name: 'Tumor Data',
          value: currRow.tumor_data,
        },
        {
          key: 'family',
          header_name: 'Methylation Family (MF)',
          value: currRow.family,
        },
        {
          key: 'family_score',
          header_name: 'MF Calibrated Scores',
          value: currRow.family_score,
        },
        {
          key: 'class',
          header_name: 'Methylation Class (MC)',
          value: currRow.class,
        },
        {
          key: 'class_score',
          header_name: 'MF Calibrated Scores',
          value: currRow.class_score,
        },
        {
          key: 'mgmt_prediction.Estimated',
          header_name: 'MGMT score',
          value:
            currRow.mgmt_prediction == null
              ? ''
              : currRow.mgmt_prediction.Estimated.toFixed(3),
        },
        {
          key: 't_SNE_plot',
          header_name: 't-SNE plot',
          value: 'View plot',
        },
        {
          key: 'General_report',
          header_name: 'Report',
          value: 'Download report',
        },
        {
          key: 'NGS_reports',
          header_name: 'NGS reports (pdf-files)',
          value: 'Download report',
        },
        {
          key: 'slide_image',
          header_name: 'Slide Image',
          value: 'Download image',
        },
        {
          key: 'notes',
          header_name: 'Notes',
          value: currRow.notes,
        },
      ];

      // let tableSettings = {
      //   loading: true,
      //   pagination: {
      //     position: 'bottom',
      //     size: 'small',
      //     // pageSize: 15,
      //     defaultPageSize: 25,
      //     pageSizeOptions: ['10', '25', '50', '100'],
      //     showSizeChanger: true,
      //     itemRender: this.itemRender,
      //     showTotal: this.rangeFunction
      //   },
      //   data: [],
      //   filteredData: []
      // };
      return (
        <div>
          <h2 style={{ textAlign: 'center' }}>Sample Information</h2>
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

  renderPopUp() {
    if (this.state.filePopUp == true) {
      return (
        //<p>HELLO lqkwejbgvoiasudvnboiasulbjnalwegijabvidjbahpiduvjbawelkjbvasidlubjaldkvjwaebsvilubjva</p>
        /*
        footer={[
            <Button key="submit" type="primary" onClick={this.closePopup()}>
              close
            </Button>
          ]}*/

        <Modal
          title="File Does Not Exist"
          visible={this.state.filePopUp}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                this.setState({ filePopUp: false });
              }}
            >
              Ok
            </Button>,
          ]}
        >
          <p>The file you are looking for does not exist</p>
        </Modal>
      );
    }
    return <div />;
  }
  render() {
    //console.log(JSON.stringify(this.state.filteredData));
    const columns = [
      {
        title: 'Sample Name',
        dataIndex: 'sample_name',
        sorter: true,
        width: '12%',
        defaultSortOrder: 'ascend',
        ellipsis: true,
        sorter: (a, b) => a.sample_name.localeCompare(b.sample_name),
        render: (text, record) => <span>{text}</span>,
      },
      {
        title: 'Project',
        dataIndex: 'project',
        sorter: true,
        width: '15%',
        ellipsis: true,
        sorter: (a, b) => a.project.localeCompare(b.project),
        render: (text, record) => (
          <span
            className="linkSpan"
            // onClick={() =>
            //   this.props.changeTab('experiments', { project: record.project })
            onClick={() =>
              this.props.changeTab('projects', { project: record.project })
            }
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Experiment',
        dataIndex: 'experiment',
        sorter: true,
        width: '12%',
        ellipsis: true,
        sorter: (a, b) => a.experiment.localeCompare(b.experiment),
        render: (text, record) => (
          <span
            className="linkSpan"
            // onClick={() =>
            //   this.props.changeTab('experiments', { project: record.project })
            onClick={() =>
              this.props.changeTab('experiments', {
                experiment: record.experiment,
              })
            }
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Sample Date',
        //Should be this in the future, but for now all pool_ids are null
        //dataIndex:'pool_id'
        dataIndex: 'pool_id',
        ellipsis: true,
        sorter: (a, b) => this.compareDates(a, b),
        width: '8%',
        render: (text, record) => <span>{text}</span>,
      },
      {
        title: 'Surgical Case',
        dataIndex: 'surgical_case',
        sorter: true,
        ellipsis: true,
        sorter: (a, b) => a.surgical_case.localeCompare(b.surgical_case),
        width: '10%',
        render: (text, record) => <span>{text}</span>,
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        sorter: true,
        ellipsis: true,
        sorter: (a, b) => a.gender.localeCompare(b.gender),
        width: '9%',
        render: (text, record) => <span>{text}</span>,
      },
      {
        title: 'Age',
        dataIndex: 'age',
        ellipsis: true,
        sorter: (a, b) => {
          let aNew = 20000;
          let bNew = 20000;
          if (a.age != 'unknown') {
            aNew = parseInt(a.age);
          }
          if (b.age != 'unknown') {
            bNew = parseInt(b.age);
          }
          return aNew - bNew;
        },
        width: '7%',
        render: (text, record) => <span>{text}</span>,
      },
      {
        title: 'Diagnosis',
        dataIndex: 'diagnosis',
        sorter: true,
        ellipsis: true,
        sorter: (a, b) => a.diagnosis.localeCompare(b.diagnosis),
        width: '24%',
        render: (text, record) => <span>{text}</span>,
      },
    ];

    const Option = Select.Option;
    const InputGroup = Input.Group;

    return (
      <div className="page-overflow-box">
        <div
          style={{
            minWidth: '1400px',
            paddingLeft: '30px',
            paddingRight: '30px',
          }}
        >
          {this.renderPopUp()}
          <div
            style={{
              paddingLeft: '0px',
              paddingBottom: '0px',
              paddingTop: '15px',
              paddingRight: '0px',
            }}
          >
            <Form layout="inline">
              <Form.Item
                style={{
                  width: '3%',
                  paddingLeft: '0px',
                  paddingRight: '0px',
                  marginRight: '0px',
                }}
              />
              <Form.Item
                style={{
                  width: '12%',
                  paddingLeft: '8px',
                  paddingRight: '30px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Sample Filter Input"
                  value={this.state.filterSampleName}
                  onChange={(e) =>
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
                  paddingLeft: '8px',
                  paddingRight: '30px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Project Filter Input"
                  value={this.state.filterProject}
                  onChange={(e) =>
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
                  paddingLeft: '8px',
                  paddingRight: '30px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Experiment Filter Input"
                  value={this.state.filterSentrixID}
                  onChange={(e) =>
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
                  paddingLeft: '8px',
                  paddingRight: '30px',
                  marginRight: '0px',
                }}
              >
                <DatePicker
                  onChange={(date, dateString) => {
                    this.setState({ startDate: dateString }, () => {
                      this.handleFilter();
                    });
                  }}
                  format="MM-DD-YYYY"
                  value={
                    this.state.startDate == ''
                      ? ''
                      : moment(this.state.startDate, 'MM-DD-YYYY')
                  }
                  placeholder=""
                />
              </Form.Item>
              <Form.Item
                style={{
                  width: '10%',
                  paddingLeft: '8px',
                  paddingRight: '30px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="SurgicalCase Filter Input"
                  value={this.state.filterSurgicalCase}
                  onChange={(e) =>
                    this.setState(
                      { filterSurgicalCase: e.target.value },
                      () => {
                        this.handleFilter();
                      }
                    )
                  }
                  onPressEnter={this.handleFilter}
                />
              </Form.Item>
              <Form.Item
                style={{
                  width: '9%',
                  paddingLeft: '8px',
                  paddingRight: '0px',
                  marginRight: '0px',
                }}
              >
                {/*<Input
                value={this.state.filterGender}
                onChange={e =>
                  this.setState({ filterGender: e.target.value }, () => {
                    this.handleFilter();
                  })
                }
                onPressEnter={this.handleFilter}
              />*/}
                <Select
                  aria-label="Gender Filter Input"
                  onChange={(value) => {
                    this.setState({ filterGender: value }, () => {
                      this.handleFilter();
                    });
                  }}
                  value={this.state.filterGender}
                >
                  <Option value="">&nbsp;</Option>
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Unknown">Unknown</Option>
                </Select>
              </Form.Item>
              <Form.Item
                style={{
                  width: '7%',
                  paddingLeft: '8px',
                  paddingRight: '30px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Age Filter Input"
                  value={this.state.filterAge}
                  onChange={(e) =>
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
                  paddingLeft: '8px',
                  paddingRight: '30px',
                  marginRight: '0px',
                }}
              >
                <Input
                  aria-label="Diagnosis Filter Input"
                  value={this.state.filterDiagnosis}
                  onChange={(e) =>
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
            {/*rowClassName={(record, index) => {
              return this.state.currSample == '' ? '' : record.key == this.state.currSample ? 'testing' : '';
            }}*/}
            <Table
              {...this.state}
              columns={columns}
              dataSource={this.state.filteredData}
              onChange={this.handleTableChange}
              size="small"
              ellipsis="true"
              expandedRowRender={this.expandedRowRender}
              expandRowByClick={true}
              expandedRowKeys={this.state.expandedRowKeys}
              onExpand={this.onTableRowExpand}
              rowClassName={(record, index) => {
                /*let selected =
                this.state.currSample == ''
                  ? ''
                  : record.key == this.state.currSample
                  ? 'testing'
                  : '';*/
                let coloring = index % 2 == 0 ? 'whiteBack' : 'grayBack';
                //return selected == '' ? coloring : selected;
                return coloring;
              }}
              onRow={(record, rowIndex) => {
                return {
                  onClick: (event) => {
                    if (this.state.currSample == record.id) {
                      this.setState({
                        currSample: '',
                      });
                    } else {
                      this.setState({
                        currSample: record.id,
                      });
                    }
                  },
                };
              }}
            />
          </div>
          {/*Returns summary if something has been selected */}
          {/*this.renderSummary(this.state.currSample)*/}

          <br />
          <br />
          {/*<p>{JSON.stringify(this.state.data)}</p>*/}
        </div>
      </div>
    );
  }
}
export default Samples;
