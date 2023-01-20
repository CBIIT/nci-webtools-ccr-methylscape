import { Row, Col } from "react-bootstrap";
import Plot from "react-plotly.js";
import { useRecoilValue } from "recoil";
import { selectedRow } from "./projects.state";
import { getGroupedCounts, getPiePlot, getHistogramPlot } from "./projects.utils";

export default function Summary() {
  const { selectedProject, data } = useRecoilValue(selectedRow);
  const methylationClassCounts = getGroupedCounts(data, (g) => g.CNSv12b6_subclass1?.split(":")[0] || "N/A");
  const genderCounts = getGroupedCounts(data, (g) => g.sex || "N/A");
  const ageData = data.map((d) => d.age);

  const methylationClassesPlot = getPiePlot(methylationClassCounts);
  const genderPlot = getPiePlot(genderCounts);
  const agePlot = getHistogramPlot(ageData, { layout: { xaxis: { title: "Age" }, yaxis: { title: "Count" } } });

  return (
    <div>
      {selectedProject && (
        <>
          <Row className="mb-5">
            <Col className="text-center">
              <h4>Project Summary: {selectedProject}</h4>
            </Col>
          </Row>
          <Row className="text-center">
            <Col lg="6" xxl="4" sm="12">
              <h5 className="mb-3">Methylation Classes</h5>
              <Plot className="w-100 mb-4" style={{ height: "400px" }} {...methylationClassesPlot} />
            </Col>
            <Col lg="6" xxl="4" sm="12">
              <h5 className="mb-3">Gender</h5>
              <Plot className="w-100 mb-4" style={{ height: "400px" }} {...genderPlot} />
            </Col>
            <Col lg="12" xxl="4" sm="12">
              <h5 className="mb-3">Age Distribution</h5>
              <Plot className="w-100 mb-4" style={{ height: "400px" }} {...agePlot} />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
