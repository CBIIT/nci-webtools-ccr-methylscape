import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Plot from "react-plotly.js";
import { useRecoilValue } from "recoil";
import { overviewState } from "./overview.state";
import cloneDeep from "lodash/cloneDeep";

export default function Info() {
  let { samples, studies, institutions, plot } = useRecoilValue(overviewState);
  const { data, layout, config } = plot;

  return (
    <div>
      <Row className="justify-content-center">
        <Col sm="auto" className="text-center">
          <div className="p-2">
            <img src="assets/images/samples-icon.svg" alt="samples icon" height="100px" width="100px" />
          </div>
          <div>
            <b className="text-primary">{samples.toLocaleString()}</b>
            <div className="fw-light text-muted">Samples</div>
          </div>
        </Col>
        <Col sm="auto" className="text-center">
          <div className="p-2">
            <img src="assets/images/studies-icon.svg" alt="studies icon" height="100px" width="100px" />
          </div>
          <div>
            <b className="text-primary">{studies.toLocaleString()}</b>
            <div className="fw-light text-muted">Studies</div>
          </div>
        </Col>
        <Col sm="auto" className="text-center">
          <div className="p-2">
            <img src="assets/images/institutions-icon.svg" alt="institutions icon" height="100px" width="100px" />
          </div>
          <div>
            <b className="text-primary">{institutions.toLocaleString()}</b>
            <div className="fw-light text-muted">Institutions</div>
          </div>
        </Col>
      </Row>
      <hr />
      <Row className="justify-content-center">
        <Col sm="auto">
          <Plot
            data={[...data]}
            layout={cloneDeep(layout)}
            config={cloneDeep(config)}
            className="w-100"
            style={{ height: "600px" }}
            useResizeHandler
          />
        </Col>
      </Row>
    </div>
  );
}
