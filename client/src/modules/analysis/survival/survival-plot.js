import { useRecoilValue } from "recoil";
import Plot from "react-plotly.js";
import Alert from "react-bootstrap/Alert";
import ReactTable from "../../components/table";
import { selectedPoints } from "../metadata/metadata-plot.state";
import { survivalDataSelector } from "../table/table.state";
import { getSurvivalPlot, getSummaryColumns } from "./survival-plot.utils";
import { warnings } from "./survival";
import GroupTabs from "../table/table-group-controls";
import GroupTables from "../table/table-groups";

export default function SurvivalPlot() {
  const selectedPointsValue = useRecoilValue(selectedPoints);
  const survivalData = useRecoilValue(survivalDataSelector);
  const survivalPlot = getSurvivalPlot(survivalData?.data);
  const summaryTableColumns = getSummaryColumns(survivalData?.summary);

  return (
    <>
      {(survivalData && (
        <>
          <GroupTabs />
          <GroupTables showTable={false} />
          {survivalData?.data?.length && (
            <div className="mb-4">
              <Plot {...survivalPlot} className="mw-100 w-100 h-100" useResizeHandler />
              {survivalData?.pValue[0]?.pval && (
                <div className="mb-2">
                  <strong>p-value: </strong>
                  {survivalData.pValue[0].pval}
                </div>
              )}
              <h3 className="h5">Number at Risk</h3>
              <ReactTable data={survivalData?.summary || []} columns={summaryTableColumns} />
            </div>
          )}
        </>
      )) || (
        <Alert variant="info">
          {selectedPointsValue.groups.flat().length > 0 ? warnings.noSurvivalData : warnings.noUserSelection}
        </Alert>
      )}
    </>
  );
}
