import { Tabs, Tab } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { tableForm, tableData } from "./table.state";
import ReactTable from "../../components/table";
import { selectedPoints } from "../metadata/metadata-plot.state";

export default function GroupTables({ showTable = true }) {
  const [formState, setState] = useRecoilState(tableForm);
  const setForm = (newState) => setState({ ...formState, ...newState });
  const tables = useRecoilValue(tableData);
  const umapPoints = useRecoilValue(selectedPoints);

  function handleSelect(e) {
    setForm({ group: e });
  }

  return (
    <Tabs id="controlled-tab-example" activeKey={formState.group} onSelect={handleSelect} className="mb-3">
      {umapPoints &&
        umapPoints.points.map((_, i) => {
          const { data, cols } = tables[i];
          return (
            <Tab key={`table_tab_${i}`} eventKey={`${i}`} title={`Group ${i + 1}`}>
              {showTable && data.length > 0 && (
                <ReactTable
                  data={data}
                  columns={cols}
                  options={{
                    initialState: {
                      hiddenColumns: cols.filter((col) => col.show === false).map((col) => col.accessor),
                    },
                  }}
                  customOptions={{
                    hideColumns: true,
                    download: `Group_${i + 1}_data.csv`,
                  }}
                />
              )}
              {showTable && !data.length && (
                <div className="d-flex bg-light" style={{ minHeight: "300px" }}>
                  <p className="mx-auto my-auto">
                    Use Box or Lasso Select in the UMAP plot to view details for multiple samples.
                  </p>
                </div>
              )}
            </Tab>
          );
        })}
    </Tabs>
  );
}
