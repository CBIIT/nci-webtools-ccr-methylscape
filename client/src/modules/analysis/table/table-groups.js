import { Tabs, Tab } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import ReactTable from "../../components/table";
import { selectedPoints } from "../metadata/metadata-plot.state";

export default function GroupTables({ showTable = true }) {
  const [groups, setGroups] = useRecoilState(selectedPoints);

  function handleSelect(e) {
    setGroups((state) => ({ ...state, selectedGroup: e }));
  }

  function getTimestamp(date = new Date()) {
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ].join("");
  }

  return (
    <Tabs id="controlled-tab-example" activeKey={groups.selectedGroup} onSelect={handleSelect} className="mb-3">
      {groups.groups?.map((group, i) => {
        const { data, columns, initialState } = group;
        const stateReducer = (newState, action) => {
          const actions = ["toggleHideColumn", "toggleSortBy", "setFilter", "gotoPage", "setPageSize"];
          if (actions.includes(action.type)) {
            setGroups((state) => {
              const newGroups = [...state.groups];
              newGroups[i] = { ...newGroups[i], initialState: newState };
              return { ...state, groups: newGroups };
            });
          }
          return newState;
        };

        return (
          <Tab key={`table_tab_${i}`} eventKey={`${i}`} title={`Group ${i + 1}`}>
            {showTable && data.length > 0 && (
              <ReactTable
                data={data}
                columns={columns}
                options={{ initialState, stateReducer }}
                customOptions={{
                  // hideColumns: true,
                  download: `Methylscape_GP${i + 1}_${getTimestamp()}.csv`,
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
