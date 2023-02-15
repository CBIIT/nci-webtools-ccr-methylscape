import { useState } from "react";
import classNames from "classnames";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useRecoilState } from "recoil";
import Overview from "./overview/overview";
import CopyNumber from "./copy-number/copy-number";
import Survival from "./survival/survival";
import Table from "./table/table";
import { MemoizedMetadata } from "./metadata/metadata";
import { analysisState } from "./analysis.state";

import "./analysis.scss";

export default function Analysis() {
  const [expand, setExpand] = useState([false, false]);
  const [state, setState] = useRecoilState(analysisState);
  const mergeState = (newState) => setState((oldState) => ({ ...oldState, ...newState }));

  function toggleExpand(index) {
    setExpand((oldState) => {
      // If expanded, collapse all. Otherwise, expand only the selected
      return oldState[index] ? oldState.map((s) => false) : oldState.map((s, i) => i === index);
    });
    dispatchEvent("resize");
  }

  function dispatchEvent(eventName = "resize", delay = 50) {
    setTimeout(() => {
      window.dispatchEvent(new Event(eventName));
    }, delay);
  }

  return (
    <Container fluid>
      <Row className="my-4">
        <Col>
          <h1 className="text-white">Analysis</h1>
        </Col>
      </Row>
      <Row>
        <Col xl={expand[0] ? 12 : 6} className={classNames("mb-4", expand[1] ? "d-xl-none" : "d-block")}>
          <Card className="h-100">
            <Card.Body>
              <OverlayTrigger
                overlay={<Tooltip id="expand-tooltip-0">{expand[0] ? "Collapse Panel" : "Expand Panel"}</Tooltip>}>
                <Button
                  size="sm"
                  id="expandLayout0"
                  aria-label="Expand"
                  onClick={() => toggleExpand(0)}
                  style={{ position: "absolute", right: 5, top: 5 }}
                  className="d-none d-xl-inline-block">
                  <i className={expand[0] ? "bi bi-fullscreen-exit" : "bi bi-fullscreen"} />
                </Button>
              </OverlayTrigger>
              <MemoizedMetadata />
              {/* <div className="d-flex justify-content-between p-1">
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
              </div> */}
            </Card.Body>
          </Card>
        </Col>
        <Col xl={expand[1] ? 12 : 6} className={classNames("mb-4", expand[0] ? "d-xl-none" : "d-block")}>
          <Card className="h-100">
            <OverlayTrigger
              overlay={<Tooltip id="expand-tooltip-1">{expand[1] ? "Collapse Panel" : "Expand Panel"}</Tooltip>}>
              <Button
                size="sm"
                id="expandLayout1"
                aria-label="Expand"
                onClick={() => toggleExpand(1)}
                style={{ position: "absolute", left: 5, top: 5 }}
                className="d-none d-xl-inline-block">
                <i className={expand[1] ? "bi bi-fullscreen-exit" : "bi bi-fullscreen"} />
              </Button>
            </OverlayTrigger>

            <Tabs
              activeKey={state.currentTab || "overview"}
              onSelect={(key) => mergeState({ currentTab: key })}
              className="mb-3 justify-content-center">
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
