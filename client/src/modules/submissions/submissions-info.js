import { Container, Card, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function SubmissionsForm() {
  const navigate = useNavigate();

  return (
    <Container fluid="xxl">
      <h3 className="text-white mb-3">Submissions Info</h3>
      <Card className="bg-light p-3">
        <Card.Body>
          <Button className="p-0 mb-3" variant="link" onClick={() => navigate("/submissions/create")}>
            Return to Create Submission
          </Button>

          <h4>Metadata File</h4>
          <p>
            The Metadata file is used to describe info for the associated sample submissions. Metadata files can be
            provided in comma-separated (.csv) or Excel (.xlsx) formats.
          </p>
          <p>
            We've provided a CSV example and an Excel spreadsheet template for inputting metadata. You can use the
            template to fill in the metadata information for your sample files. In the provided template, only relevant
            cells are editable as column and parameter names are strictly parsed and may be read incorrectly by the
            classifier if modified. If you choose to create your own metadata file, ensure that the parameter and column
            names match our examples and templates.
          </p>
          <div className="mb-3">
            <div>
              <Button className="p-0" variant="link" href="/assets/data/Sample_metadata_example.csv" download>
                Download Metadata Example (CSV)
              </Button>
            </div>
            <div>
              <Button className="p-0" variant="link" href="/assets/data/Sample_metadata_template.xlsx" download>
                Download Metadata Template (Excel)
              </Button>
            </div>
          </div>
          <div>
            <h4>Data Type Formats</h4>
            <p>When entering your metadata, please ensure the values follow the formatting rules</p>
            <Table striped bordered responsive size="sm">
              <thead>
                <tr>
                  <th>[Header]</th>
                  <th>Description</th>
                  <th>Data format</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Investigator Name</td>
                  <td>Submitter's name (optional)</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Project Name</td>
                  <td>Name for the user project (optional)</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Experiment Name</td>
                  <td>Name for the user experiment (optional)</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>(optional)</td>
                  <td>MM-DD-YYYY</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>[Data]</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Sample_Name</td>
                  <td>mandatory</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Sample_Well</td>
                  <td>optional</td>
                  <td>96 well plate mappin - A01 … H12</td>
                </tr>
                <tr>
                  <td>Sample_Plate</td>
                  <td>optional</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Sample_Group</td>
                  <td>optional</td>
                  <td>450k/EPIC/EPICv2</td>
                </tr>
                <tr>
                  <td>Pool_ID</td>
                  <td>sample processing date, optional</td>
                  <td>MM-DD-YYYY</td>
                </tr>
                <tr>
                  <td>Sentrix_ID</td>
                  <td>mandatory</td>
                  <td>numeric, should match idat-file(s)</td>
                </tr>
                <tr>
                  <td>Sentrix_Position</td>
                  <td>mandatory</td>
                  <td>match idat-file(s)</td>
                </tr>
                <tr>
                  <td>Material_Type</td>
                  <td>optional</td>
                  <td>FFPE/Frozen/Fresh</td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>optional</td>
                  <td>Male/Female/Unknown</td>
                </tr>
                <tr>
                  <td>Surgical_Case</td>
                  <td>optional</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Diagnosis</td>
                  <td>mandatory</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Age</td>
                  <td>mandatory</td>
                  <td>integer</td>
                </tr>
                <tr>
                  <td>Notes</td>
                  <td>optional</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Tumor_Site</td>
                  <td>mandatory</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>PI_Collaborator</td>
                  <td>optional</td>
                  <td>PI name</td>
                </tr>
                <tr>
                  <td>Outside_ID</td>
                  <td>optional</td>
                  <td>free-text</td>
                </tr>
                <tr>
                  <td>Surgery_date</td>
                  <td>optional</td>
                  <td>MM-DD-YYYY</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <div>
            <h4>Example</h4>
            <Table bordered responsive size="sm">
              <thead>
                <tr>
                  <th>[Header]</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Investigator Name</td>
                  <td>firstName lastName</td>
                </tr>
                <tr>
                  <td>Project Name</td>
                  <td>My Project</td>
                </tr>
                <tr>
                  <td>Experiment Name</td>
                  <td>My Experiment</td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>9-25-2023</td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th>[Data]</th>
                </tr>
                <tr>
                  <th>Sample_Name</th>
                  <th>Sample_Well</th>
                  <th>Sample_Plate</th>
                  <th>Sample_Group</th>
                  <th>Pool_ID</th>
                  <th>Sentrix_ID</th>
                  <th>Sentrix_Position</th>
                  <th>Material_Type</th>
                  <th>Gender</th>
                  <th>Surgical_Case</th>
                  <th>Diagnosis</th>
                  <th>Age</th>
                  <th>Notes</th>
                  <th>Tumor_Site</th>
                  <th>PI_Collaborator</th>
                  <th>Outside_ID</th>
                  <th>Surgery_date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EY46</td>
                  <td>F02</td>
                  <td>Clinical Testing</td>
                  <td>EPIC</td>
                  <td>09-25-2023</td>
                  <td align="right">207534240050</td>
                  <td>R06C01</td>
                  <td>FFPE</td>
                  <td>Male</td>
                  <td>ST-23-7213</td>
                  <td>Diffuse Astrocytoma, Grade 2</td>
                  <td align="right">22</td>
                  <td>LYC</td>
                  <td>Brain, left cerebellar, biopsy</td>
                  <td>GAMPEL</td>
                  <td>US23-24243,D/1</td>
                  <td>08-25-2023</td>
                </tr>
                <tr>
                  <td>EY47</td>
                  <td>G02</td>
                  <td>Clinical Testing</td>
                  <td>EPIC</td>
                  <td>09-25-2023</td>
                  <td align="right">207534240050</td>
                  <td>R07C01</td>
                  <td>FFPE</td>
                  <td>Male</td>
                  <td>ST-23-7216</td>
                  <td>High-grade glioma</td>
                  <td align="right">23</td>
                  <td>LYC</td>
                  <td>Brain, 4th ventricular mass. excision</td>
                  <td>YONG</td>
                  <td>S23-15045,A1</td>
                  <td>08-28-2023</td>
                </tr>
                <tr>
                  <td>EY48</td>
                  <td>H02</td>
                  <td>Clinical Testing</td>
                  <td>EPIC</td>
                  <td>09-25-2023</td>
                  <td align="right">207534240050</td>
                  <td>R08C01</td>
                  <td>FFPE</td>
                  <td>Female</td>
                  <td>ST-23-7231</td>
                  <td>Glial neoplasm</td>
                  <td align="right">33</td>
                  <td>LYC</td>
                  <td>Brain, left stereotactic biopsy</td>
                  <td>HURTH</td>
                  <td>30-SP-23-3338,B1</td>
                  <td>03-30-2023</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
