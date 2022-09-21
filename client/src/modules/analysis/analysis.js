import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import { useRecoilState } from "recoil";
import Overview from "./overview/overview";
import CopyNumber from "./copyNumber/copyNumber";
import Survival from "./survival/survival";
import Table from "./table/table";
import { MemoizedMetadata } from "./metadata/metadata";
import { analysisState } from "./analysis.state";

import "./analysis.scss";

export default function Analysis() {
  const [expand, setExpand] = useState(false);

  const [state, setState] = useRecoilState(analysisState);
  const mergeState = (newState) => setState((oldState) => ({ ...oldState, ...newState }));

  return (
    <Container fluid>
      <Row className="mt-3">
        <h1 className="text-white">Analysis</h1>
      </Row>
      <Row>
        <Col xl={expand ? 12 : 6} className="my-4">
          <Card className="h-100">
            <Card.Body>
              <MemoizedMetadata />
              <div className="d-flex justify-content-between p-1">
                <Button
                  size="sm"
                  variant="link"
                  title="Open in new tab"
                  aria-label="Open Metadata in new tab"
                  href="/metadata"
                  target="_blank">
                  <i className="bi bi-box-arrow-in-up-right" />
                  View Metadata
                </Button>
                <Button id="expandLayout" aria-label="Expand" onClick={() => setExpand(!expand)}>
                  {expand ? <i className="bi bi-fullscreen-exit" /> : <i className="bi bi-fullscreen" />}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={expand ? 12 : 6} className="my-4">
          <Card className="h-100">
            <Tabs
              activeKey={state.currentTab || "overview"}
              onSelect={(key) => mergeState({ currentTab: key })}
              className="mb-3">
              <Tab eventKey="overview" title="Overview">
                <Overview className="px-3" />
              </Tab>
              {/* <Tab eventKey="sampleQuality" title="QC">
                <SampleQuality className="px-3" />
              </Tab> */}
              <Tab eventKey="copyNumber" title="Copy number">
                <CopyNumber className="px-3" />
              </Tab>
              <Tab eventKey="table" title="Table">
                <Table className="px-3" />
              </Tab>
              <Tab eventKey="survival" title="Survival">
                <Survival className="px-3" />
              </Tab>
              {/* <Tab eventKey="promoterMethylation" title="MGMT/MLH1">
                <PromoterMethylation className="px-3" />
              </Tab>
              <Tab eventKey="cohortAnalysis" title="Cohort analysis">
                <CohortAnalysis className="px-3" />
              </Tab>
              <Tab eventKey="survival" title="Survival">
                <Survival className="px-3" />
              </Tab>
              <Tab eventKey="subgroupAnalysis" title="Subgroup analysis">
                <SubgroupAnalysis className="px-3" />
              </Tab>
              <Tab eventKey="methodology" title="Methodology">
                <Methodology className="px-3" />
              </Tab> */}
            </Tabs>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
